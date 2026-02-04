import { getNodeIdList } from "api-base";
import pMap from "p-map";
import { request } from "undici";
import { gql, registerModule, ResolveCursorConnection } from "../ez";

export const usersModule = registerModule(
  gql`
    "Possible roles of an authenticated user"
    enum UserRole {
      """
      Administrator of the system

      Most of the authorization logic is enabled
      """
      ADMIN

      "Default user role"
      USER
    }

    "User entity"
    type User {
      "Unique numeric identifier"
      id: IntID!

      "Email Address"
      email: String!

      "Name of person"
      name: String

      """
      Locked user authentication

      If set as "true", user won't be able to use the system
      """
      locked: Boolean!

      """
      Active flag

      By default it starts as "false", and the first time the user accesses the system, it's set as "true"
      """
      active: Boolean!

      "Date of latest user access"
      lastOnline: DateTime

      "Picture of user, set by external authentication service"
      picture: String

      """
      Tags associated with the user

      Tags can be used to categorize or filter
      """
      tags: [String!]!

      "List of email aliases"
      emailAliases: [String!]

      "User role, by default is USER"
      role: UserRole!

      "Date of creation"
      createdAt: DateTime!

      "Date of last update"
      updatedAt: DateTime!
    }

    "Paginated Users"
    type UsersConnection implements Connection {
      "Nodes of the current page"
      nodes: [User!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    "Filter all users of admin query"
    input AdminUsersFilter {
      """
      Filter by the specified tags

      If any of the user's tags matches any of the specified tags, the user is included
      """
      tags: [String!]
      """
      Filter by text search inside "email", "name", "tags" or "projects"
      """
      textSearch: String
    }

    "Admin User-Related Queries"
    type AdminUserQueries {
      """
      Get all the users currently in the system

      Pagination parameters are mandatory, but filters is optional, and therefore the search can be customized.
      """
      allUsers(
        pagination: CursorConnectionArgs!
        filters: AdminUsersFilter
      ): UsersConnection!
    }

    "User update input data"
    input UpdateUserInput {
      "Current user identifier"
      id: IntID!

      "Name of person"
      name: String

      "Role of user"
      role: UserRole!

      "Locked flag"
      locked: Boolean!

      "Projects associated with user"
      projectIds: [IntID!]!

      """
      Tags associated with the user

      Tags can be used to categorize or filter
      """
      tags: [String!]!
    }

    "Input for email aliases of a specific user email"
    input EmailAliasInput {
      "Email of user to have extra aliases"
      userEmail: EmailAddress!

      "List of email aliases"
      aliases: [EmailAddress!]!
    }

    "Input for creating a user in Auth0"
    input CreateAuth0UserInput {
      "User email address"
      email: EmailAddress!
      "User password"
      password: String!
    }

    "Result of creating a single Auth0 user"
    type Auth0UserCreationResult {
      "Email of the user"
      email: String!
      "Whether the user was created successfully"
      success: Boolean!
      "Error message if creation failed"
      error: String
      "The created user if successful"
      user: User
    }

    "Result of importing multiple Auth0 users"
    type ImportAuth0UsersResult {
      "Results for each user"
      results: [Auth0UserCreationResult!]!
      "Number of successfully created users"
      successCount: Int!
      "Number of failed user creations"
      failureCount: Int!
    }

    "Admin User-Related Queries"
    type AdminUserMutations {
      "Upsert specified users with specified projects"
      upsertUsersWithProjects(
        emails: [EmailAddress!]!
        projectsIds: [IntID!]!
        tags: [String!]
      ): [User!]!

      "Update an existent user entity"
      updateUser(data: UpdateUserInput!): User!

      "Set email aliases"
      setEmailAliases(list: [EmailAliasInput!]!): [User!]!

      "Test if Auth0 Management API credentials are valid"
      testAuth0Credentials(auth0Token: String!): Boolean!

      "Import users to Auth0 and local database"
      importAuth0Users(
        auth0Token: String!
        users: [CreateAuth0UserInput!]!
        projectIds: [IntID!]
        tags: [String!]
      ): ImportAuth0UsersResult!
    }

    extend type Query {
      """
      Admin related user queries, only authenticated users with the role "ADMIN" can access
      """
      adminUsers: AdminUserQueries!

      "Authenticated user information"
      currentUser: User

      """
      Get all the users associated with the specified identifiers

      The users data is guaranteed to follow the specified identifiers order

      If any of the specified identifiers is not found or forbidden, query fails
      """
      users(ids: [IntID!]!): [User!]!
    }

    extend type Mutation {
      """
      Admin related user mutations, only authenticated users with the role "ADMIN" can access
      """
      adminUsers: AdminUserMutations!
    }
  `,
  {
    id: "Users",
    dirname: import.meta.url,
    resolvers: {
      User: {
        active({ lastOnline }) {
          return lastOnline != null;
        },
        emailAliases({ id: userId }, _args, { dataloaders }) {
          return dataloaders.userEmailAliases.load({
            userId,
          });
        },
      },
      Mutation: {
        async adminUsers(_root, _args, { authorization }) {
          await authorization.expectAdmin;

          return {};
        },
      },
      Query: {
        async users(_root, { ids }, { prisma, authorization }) {
          return getNodeIdList(
            prisma.user.findMany({
              where: {
                id: {
                  in: ids,
                },
                projects: await authorization.expectSomeProjectsInPrismaFilter,
              },
            }),
            ids
          );
        },
        async adminUsers(_root, _args, { authorization }) {
          await authorization.expectAdmin;

          return {};
        },
        async currentUser(_root, _args, { UserPromise }) {
          const user = await UserPromise;

          if (user == null) return null;

          return user as Omit<typeof user, "groups">;
        },
      },
      AdminUserMutations: {
        async upsertUsersWithProjects(
          _root,
          { emails, projectsIds, tags },
          { prisma }
        ) {
          return pMap(
            emails,
            (email) => {
              return prisma.user.upsert({
                create: {
                  email,
                  projects: {
                    connect: projectsIds.map((id) => ({ id })),
                  },
                  tags: tags?.length
                    ? {
                        set: tags,
                      }
                    : undefined,
                },
                where: {
                  email,
                },
                update: {
                  projects: {
                    connect: projectsIds.map((id) => ({ id })),
                  },
                  tags: tags?.length
                    ? {
                        push: tags,
                      }
                    : undefined,
                },
              });
            },
            {
              concurrency: 4,
            }
          );
        },
        updateUser(
          _root,
          { data: { id, projectIds, tags, ...data } },
          { prisma }
        ) {
          return prisma.user.update({
            where: {
              id,
            },
            data: {
              ...data,
              projects: {
                set: projectIds.map((id) => ({ id })),
              },
              tags: {
                set: tags,
              },
            },
          });
        },
        async setEmailAliases(_root, { list }, { prisma }) {
          await prisma.user.createMany({
            data: list.map((value) => ({ email: value.userEmail })),
            skipDuplicates: true,
          });

          return pMap(
            list,
            async ({ userEmail, aliases }) => {
              return prisma.user.update({
                where: {
                  email: userEmail,
                },
                data: {
                  aliases: {
                    connectOrCreate: aliases.map((email) => {
                      return {
                        create: {
                          email,
                        },
                        where: {
                          email,
                        },
                      };
                    }),
                    deleteMany: {
                      NOT: {
                        email: {
                          in: aliases,
                        },
                      },
                    },
                  },
                },
              });
            },
            {
              concurrency: 4,
            }
          );
        },
        async testAuth0Credentials(_root, { auth0Token }) {
          const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
          if (!AUTH0_DOMAIN) {
            throw new Error("AUTH0_DOMAIN environment variable is not set");
          }

          const response = await request(
            `https://${AUTH0_DOMAIN}/api/v2/users?per_page=1`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          if (response.statusCode === 200) {
            return true;
          }

          if (response.statusCode === 401) {
            throw new Error("Invalid or expired Auth0 token");
          }

          if (response.statusCode === 403) {
            throw new Error(
              "Insufficient permissions. Required scopes: read:users"
            );
          }

          const body = (await response.body.json()) as { message?: string };
          throw new Error(
            body.message || `Auth0 API error: ${response.statusCode}`
          );
        },
        async importAuth0Users(
          _root,
          { auth0Token, users, projectIds, tags },
          { prisma }
        ) {
          const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
          if (!AUTH0_DOMAIN) {
            throw new Error("AUTH0_DOMAIN environment variable is not set");
          }

          const results = await pMap(
            users,
            async ({ email, password }) => {
              try {
                // Create user in Auth0
                const response = await request(
                  `https://${AUTH0_DOMAIN}/api/v2/users`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${auth0Token}`,
                    },
                    body: JSON.stringify({
                      connection: "Username-Password-Authentication",
                      email,
                      password,
                    }),
                  }
                );

                if (response.statusCode !== 201) {
                  const body = (await response.body.json()) as {
                    message?: string;
                    error?: string;
                  };
                  let errorMessage =
                    body.message ||
                    body.error ||
                    `Auth0 error: ${response.statusCode}`;

                  if (response.statusCode === 409) {
                    errorMessage = "User already exists in Auth0";
                  } else if (response.statusCode === 400) {
                    errorMessage =
                      body.message ||
                      "Invalid input (weak password or invalid email)";
                  } else if (response.statusCode === 401) {
                    errorMessage = "Invalid or expired Auth0 token";
                  } else if (response.statusCode === 403) {
                    errorMessage =
                      "Insufficient permissions. Required scopes: create:users";
                  } else if (response.statusCode === 429) {
                    errorMessage =
                      "Rate limit exceeded. Please wait and try again.";
                  }

                  return {
                    email,
                    success: false,
                    error: errorMessage,
                    user: null,
                  };
                }

                // Upsert user in local database
                const user = await prisma.user.upsert({
                  create: {
                    email,
                    projects: projectIds?.length
                      ? {
                          connect: projectIds.map((id) => ({ id })),
                        }
                      : undefined,
                    tags: tags?.length
                      ? {
                          set: tags,
                        }
                      : undefined,
                  },
                  where: {
                    email,
                  },
                  update: {
                    projects: projectIds?.length
                      ? {
                          connect: projectIds.map((id) => ({ id })),
                        }
                      : undefined,
                    tags: tags?.length
                      ? {
                          push: tags,
                        }
                      : undefined,
                  },
                });

                return {
                  email,
                  success: true,
                  error: null,
                  user,
                };
              } catch (error) {
                return {
                  email,
                  success: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Unknown error occurred",
                  user: null,
                };
              }
            },
            {
              concurrency: 2,
            }
          );

          const successCount = results.filter((r) => r.success).length;
          const failureCount = results.filter((r) => !r.success).length;

          return {
            results,
            successCount,
            failureCount,
          };
        },
      },
      AdminUserQueries: {
        allUsers(_root, { pagination, filters }, { prisma }) {
          return ResolveCursorConnection(pagination, (connection) => {
            return prisma.user.findMany({
              ...connection,
              where: filters
                ? {
                    tags: filters.tags
                      ? {
                          hasSome: filters.tags,
                        }
                      : undefined,
                    OR: filters.textSearch
                      ? [
                          {
                            email: {
                              contains: filters.textSearch,
                              mode: "insensitive",
                            },
                          },
                          {
                            name: {
                              contains: filters.textSearch,
                              mode: "insensitive",
                            },
                          },
                          {
                            tags: {
                              has: filters.textSearch,
                            },
                          },
                          {
                            projects: {
                              some: {
                                OR: [
                                  {
                                    code: {
                                      contains: filters.textSearch,
                                      mode: "insensitive",
                                    },
                                  },
                                  {
                                    label: {
                                      contains: filters.textSearch,
                                      mode: "insensitive",
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ]
                      : undefined,
                  }
                : undefined,
            });
          });
        },
      },
    },
  }
);
