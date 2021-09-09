import { BuildContextArgs, CreateApp, InferContext } from "@graphql-ez/fastify";
import { ezAltairIDE } from "@graphql-ez/plugin-altair/static";
import { CodegenOptions, ezCodegen } from "@graphql-ez/plugin-codegen";
import { ezGraphQLModules } from "@graphql-ez/plugin-modules";
import { ezScalars } from "@graphql-ez/plugin-scalars";
import { ezSchema } from "@graphql-ez/plugin-schema";
import { ezVoyager } from "@graphql-ez/plugin-voyager";
import { ezWebSockets } from "@graphql-ez/plugin-websockets";
import { GetDBUser, prisma, pubSub } from "db";
import { Auth0Verify, Authorization, GetAuth0User } from "./auth";
import { ConnectionTypes } from "./connection";
import { IntID } from "./customScalars";

export * from "@graphql-ez/fastify";
export * from "common-api";
export * from "db";
export * from "../../services/list";
export * from "./auth";
export * from "./casters";
export * from "./connection";
export * from "./logger";

async function buildContext({ fastify }: BuildContextArgs) {
  const { Auth0UserPromise } = GetAuth0User(fastify?.request);

  const { UserPromise } = GetDBUser(Auth0UserPromise);

  const authorization = Authorization(UserPromise);

  return {
    UserPromise,
    Auth0UserPromise,
    prisma,
    authorization,
    pubSub,
  };
}

declare module "graphql-ez" {
  interface EZContext extends InferContext<typeof buildContext> {}
}

export const codegenOptions: CodegenOptions = {
  config: {
    scalars: {
      DateTime: "string | Date",
      ID: "string | number",
      IntID: "number",
      NonNegativeInt: "number",
      Timestamp: "Date",
      Void: "unknown",
      URL: "string",
    },
    deepPartialResolvers: true,
    enumsAsTypes: true,
  },
};

export const ezServicePreset = CreateApp({
  cors: true,
  ez: {
    plugins: [
      ezAltairIDE(),
      ezWebSockets(),
      ezSchema(),
      ezCodegen(codegenOptions),
      ezGraphQLModules(),
      ezScalars(
        {
          DateTime: 1,
          Timestamp: 1,
          JSONObject: 1,
          NonNegativeInt: 1,
          Void: 1,
          URL: 1,
        },
        {
          IntID,
        }
      ),
      ezVoyager(),
      {
        name: "LearnerModelGQL",
        compatibilityList: ["fastify"],
        onPreBuild(ctx) {
          ctx.appBuilder.registerModule(ConnectionTypes);
        },
        onIntegrationRegister(_ctx, integrationCtx) {
          integrationCtx.fastify!.register(Auth0Verify);
        },
      },
    ],
  },
  buildContext,
}).asPreset;