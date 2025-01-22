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
    },
  }
);
