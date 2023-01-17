import type { BuildContextArgs, InferContext } from "@graphql-ez/fastify";
import { prisma, pubSub } from "db";
import DataLoader from "dataloader";
import { Authorization, GetAuth0User, GetDBUser } from "./auth";
import { ResolveCursorConnection } from "./connection";
import {
  assertNotNumericCode,
  getIdsIntersection,
  getNodeIdList,
} from "./utils";

const dataloaders = () => {
  const userEmailAliases = new DataLoader(
    async (keys: readonly { userId: number }[]) => {
      const emailAliases = (
        await prisma.userEmailAlias.findMany({
          where: {
            userId: {
              in: keys.map((key) => key.userId),
            },
          },
          select: {
            userId: true,
            email: true,
          },
          orderBy: {
            email: "asc",
          },
        })
      ).reduce((acum: Record<string, string[]>, { email, userId }) => {
        (acum[userId] ||= []).push(email);
        return acum;
      }, {});
      return keys.map((key) => {
        return emailAliases[key.userId] || null;
      });
    },
    {
      cacheKeyFn(key) {
        return key.userId;
      },
    }
  );
  return {
    userEmailAliases,
  };
};

export async function buildContext({ fastify }: BuildContextArgs) {
  const Auth0UserPromise = GetAuth0User(fastify?.request);

  const UserPromise = GetDBUser(Auth0UserPromise);

  const authorization = Authorization(UserPromise);

  return {
    UserPromise,
    Auth0UserPromise,
    prisma,
    authorization,
    pubSub,
    ResolveCursorConnection,
    getNodeIdList,
    getIdsIntersection,
    assertNotNumericCode,
    dataloaders: dataloaders(),
  };
}

declare module "graphql-ez" {
  interface EZContext extends InferContext<typeof buildContext> {}
}
