import { gql, registerModule } from "../ez";

export const challengesModule = registerModule(
  gql`
    type Challenge {
      "ID of the challenge"
      id: IntID!

      """
      Groups of the challenge
      """
      groups: [Group!]!
    }

    extend type Query {
      """
      Get challenges by their IDs
      """
      challenges(ids: [IntID!]!): [Challenge!]!
    }
  `,
  {
    resolvers: {
      Challenge: {
        groups({ id }, _args, { prisma }) {
          return prisma.challenge.findUniqueOrThrow({ where: { id } }).groups();
        },
      },
      Query: {
        async challenges(_root, { ids }, { prisma, authorization }) {
          return prisma.challenge.findMany({
            where: {
              id: { in: ids },
              projectId: await authorization.expectProjectsInPrismaFilter,
            },
          });
        },
      },
    },
  }
);
