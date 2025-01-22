import { getNodeIdList } from "api-base/src/utils";
import { gql, registerModule } from "../ez";

export const challengesModule = registerModule(
  gql`
    type Group {
      """
      ID of the group
      """
      id: IntID!
    }

    """
    A challenge
    """
    type Challenge {
      """
      ID of the challenge
      """
      id: IntID!

      """
      Unique code for the challenge
      """
      code: String!

      """
      Tags for the challenge
      """
      tags: [String!]!

      """
      Title of the challenge
      """
      title: String!

      """
      Description of the challenge
      """
      description: String

      """
      Date of creation
      """
      createdAt: DateTime!

      """
      Date of last update
      """
      updatedAt: DateTime!

      """
      Project ID
      """
      projectId: IntID!

      """
      Start date of the challenge
      """
      startDate: DateTime

      """
      End date of the challenge
      """
      endDate: DateTime

      """
      Enabled status of the challenge
      """
      enabled: Boolean!
    }

    """
    Input for creating or updating a challenge
    """
    input ChallengeInput {
      "Unique code for the challenge"
      code: String!
      "Title of the challenge"
      title: String!
      "Description of the challenge"
      description: String
      "Project ID"
      projectId: IntID!
      "Tags for the challenge"
      tags: [String!]
      "Start date of the challenge"
      startDate: DateTime
      "End date of the challenge"
      endDate: DateTime
      "Topics of the challenge"
      topicsIds: [IntID!]
      "Content of the challenge"
      contentIds: [IntID!]
      "Groups of the challenge"
      groupsIds: [IntID!]
      "Enabled status of the challenge"
      enabled: Boolean! = true
    }

    extend type AdminContentMutations {
      """
      Create a challenge
      """
      createChallenge(data: ChallengeInput!): Challenge!

      """
      Update a challenge
      """
      updateChallenge(id: IntID!, data: ChallengeInput!): Challenge!
    }

    extend type Query {
      """
      Get a challenge by either its ID or code
      """
      challenge(code: String, id: IntID): Challenge

      """
      Get challenges by their IDs
      """
      challenges(ids: [IntID!]!): [Challenge!]!

      """
      Get all active challenges based on the project id and any authenticated user group
      """
      activeChallenges(projectId: IntID!): [Challenge!]!
    }
  `,
  {
    resolvers: {
      Query: {
        async activeChallenges(
          _root,
          { projectId },
          { prisma, authorization }
        ) {
          return prisma.challenge.findMany({
            where: {
              projectId,
              groups: {
                some: {
                  users: {
                    some: {
                      id: await authorization.expectUser.then((v) => v.id),
                    },
                  },
                },
              },
              enabled: true,

              AND: [
                {
                  AND: [
                    {
                      startDate: {
                        not: null,
                      },
                    },
                    {
                      startDate: {
                        lte: new Date(),
                      },
                    },
                  ],
                },
              ],
            },
            orderBy: [
              {
                createdAt: "desc",
              },
              {
                id: "desc",
              },
            ],
          });
        },
        async challenge(_root, { code, id }, { prisma, authorization }) {
          if (!code && !id) {
            throw new Error("Either code or id must be provided");
          }

          return prisma.challenge.findFirst({
            where: {
              code: code ?? undefined,
              id: id ?? undefined,
              projectId: await authorization.expectProjectsInPrismaFilter,
            },
          });
        },

        async challenges(_root, { ids }, { prisma, authorization }) {
          return getNodeIdList(
            prisma.challenge.findMany({
              where: {
                id: { in: ids },
                projectId: await authorization.expectProjectsInPrismaFilter,
              },
            }),
            ids
          );
        },
      },
      AdminContentMutations: {
        async createChallenge(_root, { data }, { prisma, authorization }) {
          await authorization.expectAdmin;

          return prisma.challenge.create({
            data: {
              projectId: data.projectId,
              code: data.code,
              title: data.title,
              description: data.description,
              tags: data.tags ?? [],
              startDate: data.startDate ?? null,
              endDate: data.endDate ?? null,
              topics: data.topicsIds?.length
                ? { connect: data.topicsIds?.map((id) => ({ id })) }
                : undefined,
              content: data.contentIds?.length
                ? { connect: data.contentIds?.map((id) => ({ id })) }
                : undefined,
              groups: data.groupsIds?.length
                ? { connect: data.groupsIds?.map((id) => ({ id })) }
                : undefined,
              enabled: data.enabled,
            },
          });
        },
        async updateChallenge(_root, { id, data }, { prisma, authorization }) {
          await authorization.expectAdmin;

          const [existing, content, groups, topics] = await Promise.all([
            prisma.challenge.findUnique({
              where: { id },
              select: {
                content: {
                  select: {
                    id: true,
                  },
                },
                groups: {
                  select: {
                    id: true,
                  },
                },
                topics: {
                  select: {
                    id: true,
                  },
                },
              },
            }),
            data.contentIds?.length
              ? prisma.content.findMany({
                  where: { id: { in: data.contentIds } },
                })
              : null,
            data.groupsIds?.length
              ? prisma.group.findMany({
                  where: { id: { in: data.groupsIds } },
                })
              : null,
            data.topicsIds?.length
              ? prisma.topic.findMany({
                  where: { id: { in: data.topicsIds } },
                })
              : null,
          ]);

          if (!existing) {
            throw new Error("Challenge not found");
          }

          if (data.contentIds && data.contentIds?.length !== content?.length) {
            throw new Error("Some content ids are invalid");
          }

          if (data.groupsIds && data.groupsIds?.length !== groups?.length) {
            throw new Error("Some group ids are invalid");
          }

          if (data.topicsIds && data.topicsIds?.length !== topics?.length) {
            throw new Error("Some topic ids are invalid");
          }

          return prisma.$transaction(async (prisma) => {
            await prisma.challenge.update({
              where: {
                id,
              },
              data: {
                content: {
                  disconnect: existing.content.map(({ id }) => ({ id })),
                },
                groups: {
                  disconnect: existing.groups.map(({ id }) => ({ id })),
                },
                topics: {
                  disconnect: existing.topics.map(({ id }) => ({ id })),
                },
              },
              select: null,
            });

            return prisma.challenge.update({
              where: { id },
              data: {
                projectId: data.projectId,
                code: data.code,
                title: data.title,
                description: data.description,
                tags: data.tags ?? [],
                startDate: data.startDate ?? null,
                endDate: data.endDate ?? null,
                content: content?.length
                  ? { connect: content?.map(({ id }) => ({ id })) }
                  : undefined,
                groups: groups?.length
                  ? { connect: groups?.map(({ id }) => ({ id })) }
                  : undefined,
                topics: topics?.length
                  ? { connect: topics?.map(({ id }) => ({ id })) }
                  : undefined,
                enabled: data.enabled,
              },
            });
          });
        },
      },
    },
  }
);
