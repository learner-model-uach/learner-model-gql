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
  `,
  {
    resolvers: {
      Challenge: {
        groups({ id }, _args, { prisma }) {
          return prisma.challenge.findUniqueOrThrow({ where: { id } }).groups();
        },
      },
    },
  }
);
