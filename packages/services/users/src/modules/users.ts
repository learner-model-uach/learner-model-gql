import { getNodeIdList } from "api-base";
import bcryptjs from "bcryptjs";
import pMap from "p-map";
import { FormData, request } from "undici";
import { z } from "zod";
import { gql, registerModule, ResolveCursorConnection } from "../ez";

const Auth0ErrorBody = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
});

const Auth0Connections = z.array(
  z.object({ id: z.string(), name: z.string() })
);

const Auth0Job = z.object({
  id: z.string(),
  status: z.string(),
});

const Auth0JobStatus = z.object({
  id: z.string(),
  status: z.string(),
  summary: z
    .object({
      total: z.number(),
      inserted: z.number(),
      updated: z.number(),
      failed: z.number(),
    })
    .optional(),
});

const Auth0JobErrors = z.array(
  z.object({
    user: z.object({ email: z.string() }),
    errors: z.array(z.object({ code: z.string(), message: z.string() })),
  })
);

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

          // Test read:users scope
          const usersResponse = await request(
            `https://${AUTH0_DOMAIN}/api/v2/users?per_page=1`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          if (usersResponse.statusCode === 401) {
            throw new Error("Invalid or expired Auth0 token");
          }

          if (usersResponse.statusCode === 403) {
            throw new Error(
              "Insufficient permissions. Required scopes: read:users, create:users, read:connections"
            );
          }

          if (usersResponse.statusCode !== 200) {
            const body = Auth0ErrorBody.parse(await usersResponse.body.json());
            throw new Error(
              body.message || `Auth0 API error: ${usersResponse.statusCode}`
            );
          }

          // Test read:connections scope (needed for bulk import)
          const connResponse = await request(
            `https://${AUTH0_DOMAIN}/api/v2/connections?per_page=1`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          if (connResponse.statusCode === 403) {
            throw new Error(
              "Insufficient permissions. Missing scope: read:connections"
            );
          }

          return true;
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

          // 1. Fetch connection_id for Username-Password-Authentication
          const connectionsResponse = await request(
            `https://${AUTH0_DOMAIN}/api/v2/connections?name=Username-Password-Authentication`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          const connections = Auth0Connections.parse(
            await connectionsResponse.body.json()
          );

          if (!connections.length) {
            throw new Error(
              'Could not find connection "Username-Password-Authentication"'
            );
          }

          const connectionId = connections[0]!.id;

          // 2. Hash passwords with bcrypt and build JSON payload
          const usersPayload = users.map(({ email, password }) => ({
            email,
            email_verified: false,
            password_hash: bcryptjs.hashSync(password, 10),
          }));

          // 3. Submit bulk import job
          const formData = new FormData();
          const usersBlob = new Blob([JSON.stringify(usersPayload)], {
            type: "application/json",
          });
          formData.append("users", usersBlob, "users.json");
          formData.append("connection_id", connectionId);
          formData.append("upsert", "true");
          formData.append("send_completion_email", "false");

          const jobResponse = await request(
            `https://${AUTH0_DOMAIN}/api/v2/jobs/users-imports`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
              body: formData,
            }
          );

          if (jobResponse.statusCode !== 202) {
            const errorBody = Auth0ErrorBody.parse(
              await jobResponse.body.json()
            );
            throw new Error(
              errorBody.message ||
                `Auth0 bulk import failed: ${jobResponse.statusCode}`
            );
          }

          const job = Auth0Job.parse(await jobResponse.body.json());

          // 4. Poll for job completion
          const MAX_POLL_TIME_MS = 120_000;
          const POLL_INTERVAL_MS = 2_000;
          const startTime = Date.now();

          let jobStatus: z.infer<typeof Auth0JobStatus>;

          while (true) {
            if (Date.now() - startTime > MAX_POLL_TIME_MS) {
              throw new Error(
                `Auth0 import job ${job.id} timed out after ${
                  MAX_POLL_TIME_MS / 1000
                }s. Check Auth0 Dashboard for job status.`
              );
            }

            await new Promise((resolve) =>
              setTimeout(resolve, POLL_INTERVAL_MS)
            );

            const statusResponse = await request(
              `https://${AUTH0_DOMAIN}/api/v2/jobs/${job.id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${auth0Token}`,
                },
              }
            );

            jobStatus = Auth0JobStatus.parse(await statusResponse.body.json());

            if (
              jobStatus.status === "completed" ||
              jobStatus.status === "failed"
            ) {
              break;
            }
          }

          // 5. Fetch per-user errors
          const errorsResponse = await request(
            `https://${AUTH0_DOMAIN}/api/v2/jobs/${job.id}/errors`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          const jobErrors = Auth0JobErrors.parse(
            await errorsResponse.body.json()
          );

          const failedEmailsMap = new Map<string, string>();
          for (const error of jobErrors) {
            const email = error.user.email;
            const message = error.errors.map((e) => e.message).join("; ");
            failedEmailsMap.set(email, message);
          }

          // 6. Upsert successful users in local DB
          const successfulEmails = users
            .map((u) => u.email)
            .filter((email) => !failedEmailsMap.has(email));

          const upsertedUsers = await pMap(
            successfulEmails,
            async (email) => {
              return prisma.user.upsert({
                create: {
                  email,
                  projects: projectIds?.length
                    ? { connect: projectIds.map((id) => ({ id })) }
                    : undefined,
                  tags: tags?.length ? { set: tags } : undefined,
                },
                where: { email },
                update: {
                  projects: projectIds?.length
                    ? { connect: projectIds.map((id) => ({ id })) }
                    : undefined,
                  tags: tags?.length ? { push: tags } : undefined,
                },
              });
            },
            { concurrency: 4 }
          );

          const usersByEmail = new Map(upsertedUsers.map((u) => [u.email, u]));

          // 7. Assemble results
          const results = users.map(({ email }) => {
            const errorMessage = failedEmailsMap.get(email);
            if (errorMessage) {
              return { email, success: false, error: errorMessage, user: null };
            }
            return {
              email,
              success: true,
              error: null,
              user: usersByEmail.get(email) || null,
            };
          });

          const successCount = results.filter((r) => r.success).length;
          const failureCount = results.filter((r) => !r.success).length;

          return { results, successCount, failureCount };
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
