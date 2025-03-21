import { getNodeIdList, Prisma } from "api-base";
import { gql, registerModule } from "../ez";

export const pollsModule = registerModule(
  gql`
    extend type Poll {
      "Unique identifier"
      id: IntID!

      "Unique code"
      code: String!

      "Title of the poll"
      title: String!
      "Description of the poll"
      description: String

      "Project of the poll"
      project: Project!
      "ID of the project of the poll"
      projectId: IntID!

      "Items of the poll"
      items: [PollItem!]!

      "Tags of the poll"
      tags: [String!]!

      "Date of creation"
      createdAt: DateTime!
      "Date of last update"
      updatedAt: DateTime!

      "Enabled status of the poll"
      enabled: Boolean!
    }

    """
    Poll Item
    """
    type PollItem {
      "Unique identifier"
      id: IntID!

      "Index of the item in the poll"
      index: Int!

      "ID of the poll of the item"
      pollId: IntID!

      "Content of the item"
      content: JSON!

      "Tags of the item"
      tags: [String!]!

      "Date of creation"
      createdAt: DateTime!
      "Date of last update"
      updatedAt: DateTime!
    }

    extend type Query {
      """
      Get a poll by either its code or id
      """
      poll(code: String, id: IntID): Poll

      """
      Get all polls
      """
      polls(ids: [IntID!]!): [Poll!]!
      """
      Get all active polls based on the project id and if any matching tags are found
      """
      activePolls(projectId: IntID!, tags: [String!]!): [Poll!]
    }

    """
    Input for creating or updating a poll
    """
    input PollInput {
      "Unique code for the poll"
      code: String!
      "Title of the poll"
      title: String!
      "Description of the poll"
      description: String
      "Project ID"
      projectId: IntID!
      "Items of the poll"
      items: [PollItemInput!]!
      "Tags for the poll"
      tags: [String!]
      "Enabled status of the poll"
      enabled: Boolean! = true
    }

    """
    Input for creating or updating a poll item
    """
    input PollItemInput {
      "Content of the poll item"
      content: JSON!
      "Tags for the poll item"
      tags: [String!]
    }

    extend type AdminActionMutations {
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
        async activePolls(
          _root,
          { projectId, tags },
          { prisma, authorization }
        ) {
          await authorization.expectAllowedUserProject(projectId, {
            checkExists: true,
          });

          return await prisma.poll.findMany({
            where: {
              projectId,
              tags: {
                hasSome: tags,
              },
              enabled: true,
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
        async poll(_root, { code, id }, { prisma, authorization }) {
          if (!code && !id) {
            throw new Error("Either code or id must be provided");
          }
          return await prisma.poll.findFirst({
            where: {
              code: code ?? undefined,
              id: id ?? undefined,
              projectId: await authorization.expectProjectsInPrismaFilter,
            },
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
      AdminActionMutations: {
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
                    content: item.content as Prisma.InputJsonValue,
                    tags: item.tags || [],
                  })),
                },
              },
              tags: data.tags || [],
              enabled: data.enabled,
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
                    content: item.content as Prisma.InputJsonValue,
                    tags: item.tags || [],
                  })),
                },
              },
              projectId: data.projectId,
            },
          });
        },
      },
      Poll: {
        items({ id }, _args, { prisma }) {
          return prisma.poll
            .findUniqueOrThrow({
              where: {
                id,
              },
            })
            .items();
        },
      },
    },
  }
);
