import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  List,
  ListIcon,
  ListItem,
  Select,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  AdminUsersQuery,
  EmailAliasInput,
  gql,
  useGQLMutation,
  useGQLQuery,
  UserInfoFragment,
  UserRole,
} from "graph";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCloudUploadAlt, FaUsers } from "react-icons/fa";
import {
  MdCheck,
  MdClose,
  MdEdit,
  MdError,
  MdExpandLess,
  MdExpandMore,
  MdInfo,
  MdLock,
  MdLockOpen,
  MdSave,
} from "react-icons/md";
import { proxy, ref, useSnapshot } from "valtio";
import type { OptionValue, SelectRefType } from "../components/AsyncSelect";
import { useAuth, withAdminAuth } from "../components/Auth";
import {
  DataTable,
  getDateRow,
  useDebouncedDataTableSearchValue,
} from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { useTagsSelect } from "../components/TagsSelect";
import { useCursorPagination } from "../hooks/pagination";
import { projectOptionLabel, useSelectMultiProjects } from "../hooks/projects";
import { queryClient } from "../rqClient";

gql(/* GraphQL */ `
  fragment UserInfo on User {
    __typename
    id
    email
    name
    active
    lastOnline
    createdAt
    role
    updatedAt
    locked
    tags
    projects {
      id
      code
      label
    }
    emailAliases
  }
`);

const AdminUsers = gql(/* GraphQL */ `
  query AdminUsers(
    $pagination: CursorConnectionArgs!
    $filters: AdminUsersFilter
  ) {
    adminUsers {
      allUsers(pagination: $pagination, filters: $filters) {
        nodes {
          ...UserInfo
        }
        ...Pagination
      }
    }
  }
`);

const UsersState = proxy<
  Record<
    string,
    {
      isEditing?: boolean;
      selectedProjects: Array<OptionValue>;
      tagsRef: {
        current: SelectRefType | null;
      };
      nameRef: { current: string };
    } & UserInfoFragment
  >
>({});

const emptyList: [] = [];

function UpsertUsers() {
  const [text, setText] = useState("");

  const { selectMultiProjectComponent, selectedProjects } =
    useSelectMultiProjects();

  const { mutateAsync, isLoading } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation UpsertUsersWithProjects(
        $emails: [EmailAddress!]!
        $projectsIds: [IntID!]!
        $tags: [String!]!
      ) {
        adminUsers {
          upsertUsersWithProjects(
            emails: $emails
            projectsIds: $projectsIds
            tags: $tags
          ) {
            ...UserInfo
          }
        }
      }
    `),
    {
      async onSuccess() {
        await queryClient.invalidateQueries();
      },
    }
  );

  const emails = useMemo(() => {
    return Array.from(
      text
        .trim()
        .split(/\r\n|\n/g)
        .reduce<Array<string>>((acum, value) => {
          const email = value.trim();

          if (email) acum.push(email);

          return acum;
        }, [])
    );
  }, [text]);

  const tagsRef = useRef<SelectRefType>(null);

  const { tagsSelect } = useTagsSelect({
    tagsRef,
    defaultTags: emptyList,
  });

  return (
    <FormModal
      title="Upsert Users"
      onSubmit={async () => {
        if (!emails.length) return;

        await mutateAsync({
          emails,
          projectsIds: selectedProjects.map((v) => v.value),
          tags: tagsRef.current?.getValue().map((v) => v.value) || emptyList,
        });
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <FaUsers />,
      }}
      saveButton={{
        isDisabled: isLoading || !emails.length,
      }}
    >
      <FormControl>
        <FormLabel>Projects</FormLabel>
        {selectMultiProjectComponent}
      </FormControl>
      <FormControl>
        <FormLabel>Tags</FormLabel>
        {tagsSelect}
      </FormControl>
      <FormControl>
        <FormLabel>Users List</FormLabel>
        <Textarea
          value={text}
          onChange={(ev) => {
            setText(ev.target.value);
          }}
        />
        <FormHelperText>List of emails separated by a new line</FormHelperText>
      </FormControl>
    </FormModal>
  );
}

function EmailAliases() {
  const [text, setText] = useState("");

  const { mutateAsync, isLoading } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation SetEmailAliases($list: [EmailAliasInput!]!) {
        adminUsers {
          setEmailAliases(list: $list) {
            email
          }
        }
      }
    `),
    {
      async onSuccess() {
        await queryClient.invalidateQueries();
      },
    }
  );

  const list = useMemo<EmailAliasInput[]>(() => {
    return Array.from(
      text
        .trim()
        .split(/\r\n|\n/g)
        .reduce<Array<EmailAliasInput>>((acum, value) => {
          const row = value.trim();

          const [userEmail, ...aliases] = row.split(",").map((v) => v.trim());

          if (userEmail)
            acum.push({
              userEmail,
              aliases: aliases
                .map((alias) => alias.trim())
                .filter((alias) => !!alias.length),
            });

          return acum;
        }, [])
    );
  }, [text]);

  return (
    <FormModal
      title="Set email aliases"
      onSubmit={async () => {
        if (!list.length) return;

        await mutateAsync({
          list,
        });
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <FaUsers />,
      }}
      saveButton={{
        isDisabled: isLoading || !list.length,
      }}
      modalProps={{
        size: "6xl",
      }}
    >
      <FormControl>
        <FormLabel>Aliases List</FormLabel>
        <Textarea
          value={text}
          onChange={(ev) => {
            setText(ev.target.value);
          }}
        />
        <FormHelperText>
          List of emails separated by a new line, first email is target user,
          and each alias is separated by a comma after the first email. <br />
          <br />
          For example:
          <br />
          <br />{" "}
          <code>
            pablosaez1995@gmail.com, pablo.saez@hotmail.com, pablo.saez@uach.cl{" "}
            <br />
            mallium@gmail.com, jguerra@inf.uach.cl
          </code>
          <br />
          <br />
          The email <b>pablosaez1995@gmail.com</b> has the aliases
          <b>
            <i> pablo.saez@hotmail.com </i>
          </b>
          and{" "}
          <b>
            <i>pablo.saez@uach.cl</i>
          </b>
          , <br />
          and <b>mallium@gmail.com</b> has the alias{" "}
          <b>
            <i>jguerra@inf.uach.cl</i>
          </b>
        </FormHelperText>
      </FormControl>
    </FormModal>
  );
}

const TestAuth0Credentials = gql(/* GraphQL */ `
  mutation TestAuth0Credentials($auth0Token: String!) {
    adminUsers {
      testAuth0Credentials(auth0Token: $auth0Token)
    }
  }
`);

const ImportAuth0UsersMutation = gql(/* GraphQL */ `
  mutation ImportAuth0Users(
    $auth0Token: String!
    $users: [CreateAuth0UserInput!]!
    $projectIds: [IntID!]
    $tags: [String!]
  ) {
    adminUsers {
      importAuth0Users(
        auth0Token: $auth0Token
        users: $users
        projectIds: $projectIds
        tags: $tags
      ) {
        results {
          email
          success
          error
          user {
            ...UserInfo
          }
        }
        successCount
        failureCount
      }
    }
  }
`);

function ImportAuth0Users() {
  const [auth0Token, setAuth0Token] = useState("");
  const [usersText, setUsersText] = useState("");
  const [credentialsValid, setCredentialsValid] = useState<boolean | null>(
    null
  );
  const [showFailures, setShowFailures] = useState(false);
  const { isOpen: showInstructions, onToggle: toggleInstructions } =
    useDisclosure({ defaultIsOpen: true });

  const { selectMultiProjectComponent, selectedProjects } =
    useSelectMultiProjects();

  const tagsRef = useRef<SelectRefType>(null);

  const { tagsSelect } = useTagsSelect({
    tagsRef,
    defaultTags: emptyList,
  });

  const testCredentials = useGQLMutation(TestAuth0Credentials, {
    onSuccess(data) {
      setCredentialsValid(data.adminUsers.testAuth0Credentials);
    },
    onError() {
      setCredentialsValid(false);
    },
  });

  const importUsers = useGQLMutation(ImportAuth0UsersMutation, {
    async onSuccess() {
      await queryClient.invalidateQueries();
    },
  });

  const parsedUsers = useMemo(() => {
    return usersText
      .trim()
      .split(/\r\n|\n/g)
      .reduce<Array<{ email: string; password: string }>>((acum, line) => {
        const trimmed = line.trim();
        if (!trimmed) return acum;

        const [email, password] = trimmed.split(",").map((v) => v.trim());
        if (email && password) {
          acum.push({ email, password });
        }
        return acum;
      }, []);
  }, [usersText]);

  const failedResults =
    importUsers.data?.adminUsers.importAuth0Users.results.filter(
      (r) => !r.success
    ) || [];

  return (
    <FormModal
      title="Import Auth0 Users"
      onSubmit={async () => {
        if (!parsedUsers.length || !auth0Token) return;

        await importUsers.mutateAsync({
          auth0Token,
          users: parsedUsers,
          projectIds: selectedProjects.length
            ? selectedProjects.map((v) => v.value)
            : null,
          tags: tagsRef.current?.getValue().map((v) => v.value) || null,
        });
      }}
      triggerButton={{
        colorScheme: "teal",
        leftIcon: <FaCloudUploadAlt />,
      }}
      saveButton={{
        isDisabled:
          importUsers.isLoading ||
          !parsedUsers.length ||
          !auth0Token ||
          credentialsValid !== true,
        children: "Import Users",
      }}
      modalProps={{
        size: "4xl",
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Instructions - Collapsible */}
        <Box>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleInstructions}
            leftIcon={<MdInfo />}
            rightIcon={showInstructions ? <MdExpandLess /> : <MdExpandMore />}
            color="blue.600"
          >
            {showInstructions ? "Hide" : "Show"} Auth0 Setup Instructions
          </Button>
          <Collapse in={showInstructions}>
            <Alert status="info" mt={2}>
              <AlertDescription fontSize="sm">
                <List spacing={1}>
                  <ListItem>
                    1. Go to Auth0 Dashboard → APIs → Auth0 Management API → API
                    Explorer
                  </ListItem>
                  <ListItem>
                    2. Click "Create & Authorize a Test Application" (or use
                    existing M2M app)
                  </ListItem>
                  <ListItem>
                    3. Copy the token (valid for 24 hours). Required scopes:{" "}
                    <b>create:users</b>, <b>read:users</b>
                  </ListItem>
                </List>
                <Button
                  as={Link}
                  href="https://manage.auth0.com/dashboard/us/learner-model-gql/apis/management/explorer"
                  isExternal
                  size="xs"
                  colorScheme="blue"
                  mt={2}
                >
                  Open Auth0 Dashboard
                </Button>
              </AlertDescription>
            </Alert>
          </Collapse>
        </Box>

        {/* Auth0 Token - Compact inline validation */}
        <FormControl>
          <FormLabel mb={1}>Auth0 Management API Token</FormLabel>
          <InputGroup>
            <Input
              type="password"
              value={auth0Token}
              onChange={(ev) => {
                setAuth0Token(ev.target.value);
                setCredentialsValid(null);
              }}
              placeholder="Paste your Auth0 token here"
              pr="4.5rem"
              borderColor={
                credentialsValid === true
                  ? "green.500"
                  : credentialsValid === false
                  ? "red.500"
                  : undefined
              }
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                colorScheme={
                  credentialsValid === true
                    ? "green"
                    : credentialsValid === false
                    ? "red"
                    : "blue"
                }
                isLoading={testCredentials.isLoading}
                isDisabled={!auth0Token || testCredentials.isLoading}
                onClick={() => {
                  testCredentials.mutate({ auth0Token });
                }}
              >
                {credentialsValid === true ? (
                  <MdCheck />
                ) : credentialsValid === false ? (
                  <MdClose />
                ) : (
                  "Test"
                )}
              </Button>
            </InputRightElement>
          </InputGroup>
          {credentialsValid === false && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {testCredentials.error?.message || "Invalid credentials"}
            </Text>
          )}
        </FormControl>

        {/* Two-column layout for Users and Options */}
        <Grid templateColumns="1fr 1fr" gap={4}>
          {/* Users List - Left Column */}
          <GridItem>
            <FormControl h="100%">
              <FormLabel mb={1}>
                Users List{" "}
                {parsedUsers.length > 0 && (
                  <Text as="span" color="gray.500" fontWeight="normal">
                    ({parsedUsers.length} parsed)
                  </Text>
                )}
              </FormLabel>
              <Textarea
                value={usersText}
                onChange={(ev) => setUsersText(ev.target.value)}
                placeholder="email@example.com,password123&#10;another@example.com,securepass456"
                rows={5}
                fontFamily="mono"
                fontSize="sm"
              />
              <FormHelperText>
                Format: <code>email,password</code> (one per line)
              </FormHelperText>
            </FormControl>
          </GridItem>

          {/* Options - Right Column */}
          <GridItem>
            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel mb={1}>Projects (optional)</FormLabel>
                {selectMultiProjectComponent}
              </FormControl>
              <FormControl>
                <FormLabel mb={1}>Tags (optional)</FormLabel>
                {tagsSelect}
              </FormControl>
            </VStack>
          </GridItem>
        </Grid>

        {/* Results */}
        {importUsers.data && (
          <Alert
            status={
              importUsers.data.adminUsers.importAuth0Users.failureCount === 0
                ? "success"
                : importUsers.data.adminUsers.importAuth0Users.successCount ===
                  0
                ? "error"
                : "warning"
            }
          >
            <AlertIcon />
            <Box flex="1">
              <HStack justify="space-between">
                <Text>
                  <b>
                    {importUsers.data.adminUsers.importAuth0Users.successCount}
                  </b>{" "}
                  succeeded,{" "}
                  <b>
                    {importUsers.data.adminUsers.importAuth0Users.failureCount}
                  </b>{" "}
                  failed
                </Text>
                {failedResults.length > 0 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowFailures(!showFailures)}
                    rightIcon={
                      showFailures ? <MdExpandLess /> : <MdExpandMore />
                    }
                  >
                    {showFailures ? "Hide" : "Show"} failures
                  </Button>
                )}
              </HStack>
              <Collapse in={showFailures}>
                <List spacing={1} mt={2}>
                  {failedResults.map((result) => (
                    <ListItem key={result.email} fontSize="sm">
                      <ListIcon as={MdError} color="red.500" />
                      <b>{result.email}</b>: {result.error}
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          </Alert>
        )}
      </VStack>
    </FormModal>
  );
}

export default withAdminAuth(function UsersPage() {
  const { pagination, prevPage, nextPage, pageInfo, resetPagination } =
    useCursorPagination();

  const usersState = useSnapshot(UsersState);

  const textSearch = useDebouncedDataTableSearchValue();

  const { data } = useGQLQuery(AdminUsers, {
    pagination,
    filters: {
      textSearch,
    },
  });
  pageInfo.current = data?.adminUsers.allUsers.pageInfo;

  useEffect(() => {
    for (const user of data?.adminUsers.allUsers.nodes || []) {
      const isEditing = UsersState[user.id]?.isEditing;
      if (isEditing) continue;
      Object.assign(
        (UsersState[user.id] ||= {
          ...user,
          selectedProjects: user.projects.map((project) => ({
            value: project.id,
            label: projectOptionLabel(project),
          })),
          tagsRef: ref({
            current: null,
          }),
          nameRef: { current: user.name || "" },
        }),
        user
      );
    }
  }, [data]);

  const updateUser = useGQLMutation(
    gql(/* GraphQL */ `
      mutation UpdateUser($data: UpdateUserInput!) {
        adminUsers {
          updateUser(data: $data) {
            __typename
          }
        }
      }
    `),
    {
      async onSuccess() {
        await queryClient.invalidateQueries();
      },
    }
  );

  const { user: authUser } = useAuth();

  return (
    <VStack>
      <HStack>
        <UpsertUsers />
        <EmailAliases />
        <ImportAuth0Users />
      </HStack>
      <DataTable<AdminUsersQuery["adminUsers"]["allUsers"]["nodes"][number]>
        data={data?.adminUsers.allUsers.nodes || []}
        prevPage={prevPage}
        nextPage={nextPage}
        resetPagination={resetPagination}
        disableDefaultTextFilter
        columns={[
          {
            Header: "ID",
            accessor: "id",
          },
          {
            Header: "Email",
            accessor: "email",
          },
          {
            Header: "Name",
            accessor: "name",
            Cell({
              value,
              row: {
                original: { id },
              },
            }) {
              const userState = UsersState[id];

              if (userState?.isEditing) {
                const ref = userState.nameRef;
                return (
                  <Input
                    isDisabled={updateUser.isLoading}
                    defaultValue={ref.current}
                    onChange={(ev) => {
                      ref.current = ev.target.value;
                    }}
                    colorScheme="facebook"
                    borderColor="blackAlpha.500"
                    width="30ch"
                  />
                );
              }

              return value;
            },
          },
          {
            Header: "Active",
            accessor: "active",
            Cell({ value }) {
              return value ? <MdCheck /> : <MdClose />;
            },
          },
          {
            id: "role",
            Header: "Role",
            accessor: "id",
            Cell({ value }) {
              const userState = usersState[value];

              if (!userState) return null;

              const { isEditing, role, id } = userState;

              return isEditing ? (
                <Select
                  value={userState.role}
                  onChange={(ev) => {
                    UsersState[value]!.role =
                      ev.target.value === UserRole.Admin
                        ? UserRole.Admin
                        : UserRole.User;
                  }}
                  isDisabled={updateUser.isLoading || authUser?.id === id}
                  minW="13ch"
                >
                  <option value={UserRole.Admin}>ADMIN</option>
                  <option value={UserRole.User}>USER</option>
                </Select>
              ) : (
                role
              );
            },
          },
          {
            id: "locked",
            Header: "Locked",
            accessor: "id",
            Cell({ value }) {
              const userState = usersState[value];

              if (!userState) return null;

              const { isEditing, locked, id } = userState;
              return isEditing ? (
                <Switch
                  isChecked={userState.locked}
                  isDisabled={updateUser.isLoading || authUser?.id === id}
                  onChange={() => {
                    UsersState[value]!.locked = !locked;
                  }}
                />
              ) : locked ? (
                <MdLock />
              ) : (
                <MdLockOpen />
              );
            },
          },
          {
            id: "projects",
            Header: "Projects",
            accessor: "id",
            Cell({
              row: {
                original: { projects, id },
              },
            }) {
              const projectsCodes = projects.map((v) => v.code).join();

              const state = usersState[id];

              if (state?.isEditing) {
                const { selectMultiProjectComponent } = useSelectMultiProjects({
                  state: [
                    state.selectedProjects,
                    (value) => {
                      UsersState[id]!.selectedProjects = value;
                    },
                  ],
                  selectProps: {
                    isDisabled: updateUser.isLoading,
                  },
                });

                return selectMultiProjectComponent;
              }

              return projectsCodes;
            },
          },
          {
            id: "Tags",
            Header: "Tags",
            accessor: "id",
            Cell({
              row: {
                original: { id, tags },
              },
            }) {
              const state = UsersState[id];

              if (state?.isEditing) {
                const { tagsSelect } = useTagsSelect({
                  tagsRef: state.tagsRef,
                  defaultTags: tags,
                });

                return tagsSelect;
              }
              return tags.join(" | ");
            },
          },
          {
            id: "Email aliases",
            Header: "Email aliases",
            accessor: "emailAliases",
            Cell({
              row: {
                original: { emailAliases },
              },
            }) {
              return emailAliases?.join(" | ") || "";
            },
          },
          getDateRow({ id: "lastOnline", label: "Last Online" }),
          getDateRow({ id: "createdAt", label: "Created At" }),
          getDateRow({ id: "updatedAt", label: "Updated At" }),
          {
            id: "edit",
            Header: "Edit",
            defaultCanSort: false,
            defaultCanFilter: false,
            defaultCanGroupBy: false,
            accessor: "id",
            Cell({ value: id, row: { original } }) {
              const userState = UsersState[id];

              if (!userState) return null;

              const { isEditing, role, locked, selectedProjects, tagsRef } =
                userState;

              return (
                <IconButton
                  aria-label="Edit"
                  colorScheme="blue"
                  isLoading={
                    updateUser.isLoading && updateUser.variables?.data.id === id
                  }
                  isDisabled={updateUser.isLoading}
                  onClick={() => {
                    const tagsRefList =
                      tagsRef.current?.getValue().map((v) => v.value) || [];
                    if (
                      isEditing &&
                      (original.role !== role ||
                        original.locked !== locked ||
                        (original.name || "") !== userState.nameRef.current ||
                        original.projects
                          .map((v) => v.id)
                          .sort()
                          .join() !==
                          selectedProjects
                            .map((v) => v.value)
                            .sort()
                            .join() ||
                        original.tags.join() !== tagsRefList.join())
                    ) {
                      updateUser
                        .mutateAsync({
                          data: {
                            id,
                            role,
                            locked,
                            projectIds: selectedProjects.map((v) => v.value),
                            tags: tagsRefList,
                            name: userState.nameRef.current || null,
                          },
                        })
                        .then(() => {
                          UsersState[id]!.isEditing = false;
                        })
                        .catch(console.error);
                    } else {
                      UsersState[id]!.isEditing = !isEditing;
                    }
                  }}
                  icon={isEditing ? <MdSave /> : <MdEdit />}
                />
              );
            },
          },
        ]}
      />
    </VStack>
  );
});
