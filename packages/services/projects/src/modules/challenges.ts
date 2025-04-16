import { gql, registerModule } from "../ez";

export const challengesModule = registerModule(
  gql`
    type Challenge {
      "ID of the challenge"
      id: IntID!

      """
      Project of the challenge
      """
      project: Project!
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
        project({ id }, _args, { prisma }) {
          return prisma.challenge
            .findUniqueOrThrow({ where: { id } })
            .project();
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
