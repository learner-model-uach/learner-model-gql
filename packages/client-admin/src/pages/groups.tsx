import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { formatSpanish } from "common";
import { gql, GroupInfoFragment, useGQLMutation, useGQLQuery } from "graph";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaUserMinus, FaUserPlus, FaUsers } from "react-icons/fa";
import { IoIosEye } from "react-icons/io";
import {
  MdAdd,
  MdCheck,
  MdClose,
  MdDoneOutline,
  MdEdit,
  MdSave,
} from "react-icons/md";
import { proxy, ref, useSnapshot } from "valtio";
import type { SelectRefType } from "../components/AsyncSelect";
import { withAdminAuth } from "../components/Auth";
import { Card } from "../components/Card/Card";
import { CardContent } from "../components/Card/CardContent";
import { CardHeader } from "../components/Card/CardHeader";
import { Property } from "../components/Card/Property";
import { DataTable, getDateRow } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { useTagsSelect } from "../components/TagsSelect";
import { useSelectMultiGroups, useSelectSingleGroup } from "../hooks/groups";
import { useCursorPagination } from "../hooks/pagination";
import { projectOptionLabel, useSelectMultiProjects } from "../hooks/projects";
import { queryClient } from "../rqClient";

gql(/* GraphQL */ `
  fragment GroupInfo on Group {
    id
    code
    label
    updatedAt
    createdAt
    tags
    flags {
      id
      readProjectActions
      readProjectModelStates
    }
    projects {
      id
      code
      label
    }
    users {
      id
      email
      name
      role
      active
      lastOnline
    }
  }
`);

const AdminGroups = gql(/* GraphQL */ `
  query AllGroups($pagination: CursorConnectionArgs!) {
    adminUsers {
      allGroups(pagination: $pagination) {
        nodes {
          ...GroupInfo
        }
        ...Pagination
      }
    }
  }
`);

function CreateGroup() {
  const { mutateAsync } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation CreateGroup($data: CreateGroupInput!) {
        adminUsers {
          createGroup(data: $data) {
            id
            label
            code
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

  const codeRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const { selectMultiProjectComponent, selectedProjects } =
    useSelectMultiProjects();
  return (
    <FormModal
      title="Create Group"
      onSubmit={async () => {
        if (!codeRef.current?.value || !labelRef.current?.value)
          throw Error("All fields are required");

        await mutateAsync({
          data: {
            projectIds: selectedProjects.map((v) => v.value),
            code: codeRef.current.value,
            label: labelRef.current.value,
            tags: [],
          },
        });

        queryClient.invalidateQueries();

        codeRef.current.value = "";
        labelRef.current.value = "";
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <MdAdd />,
      }}
    >
      <FormControl>
        <FormLabel>Associated Projects</FormLabel>

        {selectMultiProjectComponent}
      </FormControl>
      <FormControl id="code" isRequired>
        <FormLabel>Code</FormLabel>
        <Input type="text" ref={codeRef} />
        <FormHelperText>
          Unique Code not intended to be showed to the users
        </FormHelperText>
      </FormControl>
      <FormControl id="label" isRequired>
        <FormLabel>Label</FormLabel>
        <Input type="text" ref={labelRef} />
        <FormHelperText>Human readable label</FormHelperText>
      </FormControl>
    </FormModal>
  );
}

function GroupsUsers({
  users,
  code,
  label,
}: {
  users: GroupInfoFragment["users"][number][];
  code: string;
  label: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        leftIcon={<IoIosEye />}
        onClick={onOpen}
        colorScheme="facebook"
        isDisabled={users.length === 0}
      >
        {users.length}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {label} - {code}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {users.map(({ id, email, name, role, active, lastOnline }) => {
              return (
                <Card key={id} margin="0.5em !important">
                  <CardHeader title={email} />
                  <CardContent>
                    <Property label="ID" value={id} />
                    {name && <Property label="Nombre" value={name} />}
                    <Property label="Rol" value={role} />
                    <Property
                      label="Activo"
                      value={active ? <MdCheck /> : <MdClose />}
                    />
                    <Property
                      label="Última conexión"
                      value={
                        lastOnline
                          ? formatSpanish(new Date(lastOnline), "PPpp")
                          : "---"
                      }
                    />
                  </CardContent>
                </Card>
              );
            })}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function AssignGroupsUsers() {
  const [text, setText] = useState("");

  const { selectMultiGroupComponent, selectedGroups, setSelectedGroups } =
    useSelectMultiGroups();
  const { mutateAsync } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation SetUserGroups(
        $usersEmails: [EmailAddress!]!
        $groupIds: [IntID!]!
      ) {
        adminUsers {
          setUserGroups(usersEmails: $usersEmails, groupIds: $groupIds) {
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

  return (
    <FormModal
      title="Assigns Users to Groups"
      onSubmit={async () => {
        if (!selectedGroups.length) return;

        await mutateAsync({
          groupIds: selectedGroups.map((v) => v.value),
          usersEmails: emails,
        });

        setSelectedGroups([]);
        setText("");
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <FaUsers />,
      }}
      saveButton={{
        isDisabled: !selectedGroups.length,
      }}
    >
      <FormControl isRequired>
        <FormLabel>Groups</FormLabel>
        {selectMultiGroupComponent}
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

function AddUsersToGroups() {
  const [text, setText] = useState("");

  const { selectSingleGroupComponent, selectedGroup, setSelectedGroup } =
    useSelectSingleGroup();
  const { mutateAsync } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation AddUserToGroups(
        $usersEmails: [EmailAddress!]!
        $groupId: IntID!
      ) {
        adminUsers {
          addUserGroups(groupId: $groupId, usersEmails: $usersEmails) {
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

  return (
    <FormModal
      title="Add Users to Group"
      onSubmit={async () => {
        if (!selectedGroup) return;

        await mutateAsync({
          groupId: selectedGroup.value,
          usersEmails: emails,
        });

        setSelectedGroup(null);
        setText("");
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <FaUserPlus />,
      }}
      saveButton={{
        isDisabled: !selectedGroup,
      }}
    >
      <FormControl isRequired>
        <FormLabel>Group</FormLabel>
        {selectSingleGroupComponent}
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

function RemoveUsersFromGroups() {
  const [text, setText] = useState("");

  const { selectSingleGroupComponent, selectedGroup, setSelectedGroup } =
    useSelectSingleGroup();
  const { mutateAsync } = useGQLMutation(
    gql(/* GraphQL */ `
      mutation RemoveUsersFromGroups(
        $usersEmails: [EmailAddress!]!
        $groupId: IntID!
      ) {
        adminUsers {
          removeUserGroups(groupId: $groupId, usersEmails: $usersEmails) {
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

  return (
    <FormModal
      title="Remove Users from Group"
      onSubmit={async () => {
        if (!selectedGroup) return;

        await mutateAsync({
          groupId: selectedGroup.value,
          usersEmails: emails,
        });

        setSelectedGroup(null);
        setText("");
      }}
      triggerButton={{
        colorScheme: "facebook",
        leftIcon: <FaUserMinus />,
      }}
      saveButton={{
        isDisabled: !selectedGroup,
      }}
    >
      <FormControl isRequired>
        <FormLabel>Group</FormLabel>
        {selectSingleGroupComponent}
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

const GroupsState = proxy<
  Record<
    string,
    GroupInfoFragment & {
      isEditing?: boolean;
      labelRef: { current: string };
      codeRef: { current: string };
      selectedProjects: Array<{ label: string; value: string }>;
      tagsRef: {
        current: SelectRefType | null;
      };
    }
  >
>({});

export default withAdminAuth(function GroupsPage() {
  const { pagination, prevPage, nextPage, pageInfo, resetPagination } =
    useCursorPagination();
  const { data } = useGQLQuery(AdminGroups, { pagination });
  pageInfo.current = data?.adminUsers.allGroups.pageInfo;

  useEffect(() => {
    for (const group of data?.adminUsers.allGroups.nodes || []) {
      const isEditing = GroupsState[group.id]?.isEditing;
      if (isEditing) continue;
      Object.assign(
        (GroupsState[group.id] ||= {
          ...group,
          codeRef: ref({ current: group.code }),
          labelRef: ref({ current: group.label }),
          selectedProjects: group.projects.map(({ code, label, id }) => {
            return {
              label: projectOptionLabel({ code, label }),
              value: id,
            };
          }),
          tagsRef: ref({
            current: null,
          }),
          isEditing: false,
        }),
        group
      );
    }
  }, [data]);

  const groupsState = useSnapshot(GroupsState);

  const updateGroup = useGQLMutation(
    gql(/* GraphQL */ `
      mutation UpdateGroup($data: UpdateGroupInput!) {
        adminUsers {
          updateGroup(data: $data) {
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

  return (
    <VStack>
      <CreateGroup />
      <AssignGroupsUsers />
      <AddUsersToGroups />
      <RemoveUsersFromGroups />
      <DataTable<GroupInfoFragment>
        data={data?.adminUsers.allGroups.nodes || []}
        prevPage={prevPage}
        nextPage={nextPage}
        resetPagination={resetPagination}
        minH="80vh"
        columns={[
          {
            Header: "ID",
            accessor: "id",
          },
          {
            Header: "Code",
            accessor: "code",
            Cell({
              value,
              row: {
                original: { id },
              },
            }) {
              const groupState = groupsState[id];

              if (!groupState) return value;

              if (groupState.isEditing) {
                const ref = GroupsState[id]!.codeRef;
                return (
                  <Input
                    isDisabled={updateGroup.isLoading}
                    defaultValue={ref.current}
                    onChange={(ev) => {
                      ref.current = ev.target.value;
                    }}
                    colorScheme="facebook"
                    borderColor="blackAlpha.500"
                    width="20ch"
                  />
                );
              }

              return value;
            },
          },
          {
            Header: "Label",
            accessor: "label",
            Cell({
              value,
              row: {
                original: { id },
              },
            }) {
              const groupState = groupsState[id];

              if (!groupState) return value;

              if (groupState.isEditing) {
                const ref = GroupsState[id]!.labelRef;

                return (
                  <Input
                    isDisabled={updateGroup.isLoading}
                    defaultValue={ref.current}
                    onChange={(ev) => {
                      ref.current = ev.target.value;
                    }}
                    colorScheme="facebook"
                    borderColor="blackAlpha.500"
                    width="20ch"
                  />
                );
              }

              return value;
            },
          },
          {
            id: "tags",
            Header: "Tags",
            accessor: "id",
            Cell({
              row: {
                original: { id, tags },
              },
            }) {
              const state = GroupsState[id];

              if (state?.isEditing) {
                const { tagsSelect } = useTagsSelect({
                  tagsRef: state.tagsRef,
                  defaultTags: tags,
                });

                return tagsSelect;
              }
              return tags.join(" | ") || "-";
            },
          },
          {
            id: "projects",
            Header: "Projects",
            accessor: "id",
            Cell({
              row: {
                original: { id },
              },
            }) {
              const groupState = groupsState[id];

              if (!groupState) return null;

              const { selectMultiProjectComponent } = useSelectMultiProjects({
                state: [
                  groupState.selectedProjects,
                  (value) => {
                    GroupsState[id]!.selectedProjects = value;
                  },
                ],
                selectProps: {
                  isDisabled: updateGroup.isLoading || !groupState.isEditing,
                },
              });

              return selectMultiProjectComponent;
            },
          },
          {
            id: "users",
            Header: "Users",
            accessor: "id",
            Cell({
              row: {
                original: { users, label, code },
              },
            }) {
              return <GroupsUsers users={users} label={label} code={code} />;
            },
          },
          {
            id: "readProjectActions",
            Header: "Read Project Actions",
            accessor: "id",
            Cell({
              row: {
                original: {
                  id,
                  flags: { readProjectActions },
                },
              },
            }) {
              const state = GroupsState[id];

              if (state?.isEditing) {
                return (
                  <Checkbox
                    colorScheme="green"
                    isChecked={state.flags.readProjectActions}
                    onChange={() => {
                      state.flags.readProjectActions =
                        !state.flags.readProjectActions;
                    }}
                    borderColor="#555"
                  />
                );
              }

              return readProjectActions ? <MdDoneOutline /> : <MdClose />;
            },
          },
          {
            id: "readProjectModelStates",
            Header: "Read Project Model States",
            accessor: "id",
            Cell({
              row: {
                original: {
                  id,
                  flags: { readProjectModelStates },
                },
              },
            }) {
              const state = GroupsState[id];

              if (state?.isEditing) {
                return (
                  <Checkbox
                    colorScheme="green"
                    isChecked={state.flags.readProjectModelStates}
                    onChange={() => {
                      state.flags.readProjectModelStates =
                        !state.flags.readProjectModelStates;
                    }}
                    borderColor="#555"
                  />
                );
              }

              return readProjectModelStates ? <MdDoneOutline /> : <MdClose />;
            },
          },
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
              const groupState = groupsState[id];

              if (!groupState) return null;

              const {
                isEditing,
                codeRef,
                labelRef,
                selectedProjects,
                tagsRef,
                flags: { readProjectActions, readProjectModelStates },
              } = groupState;

              return (
                <IconButton
                  aria-label="Edit"
                  colorScheme="blue"
                  isLoading={
                    updateGroup.isLoading &&
                    updateGroup.variables?.data.id === id
                  }
                  isDisabled={updateGroup.isLoading}
                  onClick={() => {
                    const tagsRefList =
                      tagsRef.current?.getValue().map((v) => v.value) || [];
                    if (
                      isEditing &&
                      (readProjectActions !==
                        original.flags.readProjectActions ||
                        readProjectModelStates !==
                          original.flags.readProjectModelStates ||
                        original.code !== codeRef.current ||
                        original.label !== labelRef.current ||
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
                      updateGroup
                        .mutateAsync({
                          data: {
                            id,
                            code: codeRef.current,
                            label: labelRef.current,
                            projectIds: selectedProjects.map((v) => v.value),
                            tags: tagsRefList,
                            flags: {
                              readProjectActions,
                              readProjectModelStates,
                            },
                          },
                        })
                        .then(() => {
                          GroupsState[id]!.isEditing = false;
                        })
                        .catch(console.error);
                    } else {
                      GroupsState[id]!.isEditing = !isEditing;
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
