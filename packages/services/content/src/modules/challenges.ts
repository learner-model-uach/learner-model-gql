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
      Project of the challenge
      """
      project: Project!

      """
      Project ID
      """
      projectId: IntID!

      """
      End date of the challenge
      """
      endDate: DateTime

      """
      Topics of the challenge
      """
      topics: [Topic!]!

      """
      Content of the challenge
      """
      content: [Content!]!

      """
      Groups of the challenge
      """
      groups: [Group!]!
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
      "End date of the challenge"
      endDate: DateTime
      "Topics of the challenge"
      topicsIds: [IntID!]
      "Content of the challenge"
      contentIds: [IntID!]
      "Groups of the challenge"
      groupsIds: [IntID!]
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
    }
  `,
  {
    resolvers: {
      Query: {
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
              endDate: data.endDate,
              topics: data.topicsIds?.length
                ? { connect: data.topicsIds?.map((id) => ({ id })) }
                : undefined,
              content: data.contentIds?.length
                ? { connect: data.contentIds?.map((id) => ({ id })) }
                : undefined,
              groups: data.groupsIds?.length
                ? { connect: data.groupsIds?.map((id) => ({ id })) }
                : undefined,
            },
          });
        },
        async updateChallenge(_root, { id, data }, { prisma, authorization }) {
          await authorization.expectAdmin;
          return prisma.challenge.update({
            where: { id },
            data: {
              projectId: data.projectId,
              code: data.code,
              title: data.title,
              description: data.description,
              tags: data.tags ?? [],
              endDate: data.endDate,
              content: { set: data.contentIds?.map((id) => ({ id })) || [] },
              groups: {
                set: data.groupsIds?.map((id) => ({ id })) || [],
              },
              topics: {
                set: data.topicsIds?.map((id) => ({ id })) || [],
              },
            },
          });
        },
      },
    },
  }
);
