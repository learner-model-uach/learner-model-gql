import { MockAuthUser } from "api-base";
import {
  CreateDomain,
  CreateProject,
  CreateUser,
  expectDeepEqual,
  GetTestClient,
  gql,
  HelloDocument,
  prisma,
} from "testing";
import { contentModule, domainModule } from "../src/modules";
import { CheckContentCreationRetrieval } from "./test";

describe("Content service", () => {
  it("Hello World", async () => {
    const { query } = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(contentModule);
        registerModule(domainModule);
      },
    });

    expectDeepEqual(await query(HelloDocument), {
      data: {
        hello: "Hello World!",
      },
    });
  });

  it("create & retrieve content", async () => {
    const testClient = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(contentModule);
        registerModule(domainModule);
      },
    });

    await CheckContentCreationRetrieval(testClient);
  });

  it("admin authorization", async () => {
    const { query, mutation } = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(contentModule);
        registerModule(domainModule);
      },
    });

    {
      const result = await query(
        gql(/* GraphQL */ `
          query AllContent($pagination: CursorConnectionArgs!) {
            adminContent {
              allContent(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result.errors?.[0]?.message, "Forbidden!");
    }

    {
      const result = await mutation(
        gql(/* GraphQL */ `
          mutation CreateContent($data: CreateContent!) {
            adminContent {
              createContent(data: $data) {
                id
                description
                binaryBase64
                json
              }
            }
          }
        `),
        {
          variables: {
            data: {
              description: "asd",
              domainId: "123",
              projectId: "123",
            },
          },
        }
      );

      expectDeepEqual(result.errors?.[0]?.message, "Forbidden!");
    }
  });

  it("user authorization", async () => {
    const { query } = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(contentModule);
        registerModule(domainModule);
      },
    });

    withoutUser: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromDomain(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            domains(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: [],
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result.errors?.[0]?.message, "Forbidden!");
    }

    withoutUser: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromTopic(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            topics(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: [],
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result.errors?.[0]?.message, "Forbidden!");
    }

    const { project } = await CreateProject();
    const { domain, domainId } = await CreateDomain({
      project,
    });

    const { authUser, user } = await CreateUser({
      role: "USER",
      project,
    });

    MockAuthUser.user = authUser;

    withUserAllowedProject: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromDomain(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            domains(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: [domainId],
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result, {
        data: {
          domains: [
            {
              id: domainId,
              content: {
                nodes: [],
                pageInfo: {
                  hasNextPage: false,
                },
              },
            },
          ],
        },
      });
    }

    withUserAllowedProject: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromTopic(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            topics(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: domain.topics.map((v) => v.id.toString()),
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result, {
        data: {
          topics: [
            {
              id: domain.topics[0]?.id.toString()!,
              content: {
                nodes: [],
                pageInfo: {
                  hasNextPage: false,
                },
              },
            },
          ],
        },
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        projects: {
          set: [],
        },
      },
      select: null,
    });

    withUserWithoutAllowedProject: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromDomain(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            domains(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: [domainId],
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result, {
        data: {
          domains: [],
        },
      });
    }

    withUserWithoutAllowedProject: {
      const result = await query(
        gql(/* GraphQL */ `
          query ContentFromTopic(
            $ids: [IntID!]!
            $pagination: CursorConnectionArgs!
          ) {
            topics(ids: $ids) {
              id
              content(pagination: $pagination) {
                nodes {
                  id
                  description
                  binaryBase64
                  json
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          }
        `),
        {
          variables: {
            ids: domain.topics.map((v) => v.id.toString()),
            pagination: {
              first: 10,
            },
          },
        }
      );

      expectDeepEqual(result, {
        data: {
          topics: [],
        },
      });
    }
  });
});
