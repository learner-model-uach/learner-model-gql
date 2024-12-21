import { getNodeIdList } from "api-base";
import { gql, registerModule } from "../ez";

export const pollsModule = registerModule(
  gql`
    """
    Poll
    """
    type Poll {
      id: IntID!

      title: String!
      description: String

      project: Project!
      projectId: IntID!

      items: [PollItem!]!

      tags: [String!]!

      createdAt: DateTime!
      updatedAt: DateTime!
    }

    """
    Poll Item
    """
    type PollItem {
      id: IntID!

      index: Int!

      poll: Poll!
      pollId: IntID!

      content: JSON!

      tags: [String!]!

      createdAt: DateTime!
      updatedAt: DateTime!
    }

    extend type Query {
      """
      Get a poll by its code
      """
      pollByCode(code: String!): Poll

      """
      Get a poll by its id
      """
      pollById(id: IntID!): Poll

      """
      Get all polls
      """
      polls(ids: [IntID!]!): [Poll!]!
    }

    input PollInput {
      code: String!
      title: String!
      description: String
      projectId: IntID!
      items: [PollItemInput!]!
      tags: [String!]
      enabled: Boolean! = true
    }

    input PollItemInput {
      content: JSON!
      tags: [String!]
    }

    extend type Mutation {
      """
      Create a poll
      """
      createPoll(data: PollInput!, projectId: IntID!): Poll!

      """
      Update a poll
      """
      updatePoll(id: IntID!, data: PollInput!): Poll!
    }
  `,
  {
    resolvers: {
      Query: {
        async pollByCode(_root, { code }, { prisma, authorization }) {
          const user = await authorization.expectUser;
          return await prisma.poll.findFirst({
            where: {
              code,
              projectId: {
                in: user.projects.map((p) => p.id),
              },
            },
          });
        },
        async pollById(_root, { id }, { prisma, authorization }) {
          const user = await authorization.expectUser;
          return await prisma.poll.findFirst({
            where: { id, projectId: { in: user.projects.map((p) => p.id) } },
          });
        },
        async polls(_root, { ids }, { prisma, authorization }) {
          return getNodeIdList(
            prisma.poll.findMany({
              where: {
                id: {
                  in: ids,
                },
                projectId: await authorization.expectProjectsInPrismaFilter,
              },
            }),
            ids
          );
        },
      },
      Mutation: {
        async createPoll(
          _root,
          { data, projectId },
          { prisma, authorization }
        ) {
          await authorization.expectAdmin;
          return await prisma.poll.create({
            data: {
              code: data.code,
              title: data.title,
              description: data.description,
              projectId,
              items: {
                createMany: {
                  data: data.items.map((item, index) => ({
                    index,
                    content: item.content as any,
                    tags: item.tags || [],
                  })),
                },
              },
            },
          });
        },
        async updatePoll(_root, { id, data }, { prisma, authorization }) {
          await authorization.expectAdmin;
          return await prisma.poll.update({
            where: { id },
            data: {
              code: data.code,
              title: data.title,
              description: data.description,
              enabled: data.enabled,
              tags: data.tags || [],
              items: {
                deleteMany: {},
                createMany: {
                  data: data.items.map((item, index) => ({
                    index,
                    content: item.content as any,
                    tags: item.tags || [],
                  })),
                },
              },
            },
          });
        },
      },
    },
  }
);
