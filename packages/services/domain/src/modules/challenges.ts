import { gql, registerModule } from "../ez";

export const challengesModule = registerModule(
  gql`
    type Challenge {
      "ID of the challenge"
      id: IntID!

      """
      Topics of the challenge
      """
      topics: [Topic!]!
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
        topics({ id }, _args, { prisma }) {
          return prisma.challenge
            .findUniqueOrThrow({
              where: {
                id,
              },
            })
            .topics();
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
