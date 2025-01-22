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
    },
  }
);
