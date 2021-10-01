import type { EZContext } from "@graphql-ez/fastify";
import type { SubschemaConfig } from "@graphql-tools/delegate";
import type { AsyncExecutor } from "@graphql-tools/utils";
import { introspectSchema } from "@graphql-tools/wrap";
import type { ServiceName } from "api-base";
import { parse } from "content-type";
import type { DocumentNode } from "graphql";
import { print } from "graphql";
import merge from "lodash/fp/merge.js";
import { Client } from "undici";
import { servicesSubschemaConfig } from "./stitchConfig";

export type ServicesSubSchemasConfig = {
  [k in ServiceName]?: Partial<SubschemaConfig>;
};

async function getStreamJSON<T>(
  stream: import("stream").Readable,
  encoding: BufferEncoding
): Promise<T> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString(encoding || "utf-8"));
}

export type ServiceSchemaConfig = {
  name: ServiceName;
  href?: string;
  port?: number;
  config?: ServicesSubSchemasConfig;
};

const DocumentPrintCache = new WeakMap<DocumentNode, string>();

export const ServicesClients: Record<string, Client> = {};

if (typeof after !== "undefined") {
  after(() => {
    Promise.allSettled(Object.values(ServicesClients).map((v) => v.close()));
  });
}

export async function getServiceSchema({
  name,
  href,
  port,
  config = servicesSubschemaConfig,
}: ServiceSchemaConfig) {
  const serviceUrl =
    href ||
    `http://127.0.0.1:${
      port ||
      (() => {
        throw Error(`Missing port for service ${name}`);
      })()
    }`;

  const client = (ServicesClients[serviceUrl] ||= new Client(serviceUrl, {
    pipelining: 10,
  }));

  const remoteExecutor: AsyncExecutor<Partial<EZContext>> =
    async function remoteExecutor({ document, variables, context }) {
      let query = DocumentPrintCache.get(document);

      if (query == null) {
        query = print(document);
        DocumentPrintCache.set(document, query);
      }

      const authorization = context?.request?.headers.authorization;

      const { body, headers } = await client.request({
        path: "/graphql",
        body: JSON.stringify({ query, variables }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization,
        },
      });

      if (!headers["content-type"]) throw Error("No content-type specified!");

      const { type, parameters } = parse(headers["content-type"]);

      if (type === "application/json")
        return getStreamJSON(
          body,
          (parameters["charset"] as BufferEncoding) || "utf-8"
        );

      throw Error(
        "Unexpected content-type, expected 'application/json', received: " +
          type
      );
    };

  const serviceSubschema: SubschemaConfig = {
    schema: await introspectSchema(remoteExecutor),
    executor: remoteExecutor,
    batch: true,
    ...merge(
      {
        batch: true,
      } as Partial<SubschemaConfig>,
      config[name]
    ),
    // subscriber: remoteSubscriber,
  };

  return serviceSubschema;
}
