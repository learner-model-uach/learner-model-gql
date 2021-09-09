import {
  AllActionsDocument,
  CreateActionDocument,
  CreateProject,
  CreateUser,
  deepEqual,
  expectDeepEqual,
  generate,
  GetTestClient,
  HelloDocument,
  MockAuthUser,
  prisma,
  TestClient,
} from "testing";
import { actionModule } from "../src/modules";

export async function CheckActionsCreationRetrieval({
  query,
  mutation,
}: Pick<TestClient, "query" | "mutation">) {
  await prisma.$queryRaw`TRUNCATE "Action" CASCADE;`;

  const { project, projectId } = await CreateProject();

  const { authUser, userId } = await CreateUser({ project });

  const verbName = generate();

  MockAuthUser.user = authUser;

  {
    const data = await mutation(CreateActionDocument, {
      variables: {
        data: {
          activity: {},
          projectId,
          timestamp: Date.now(),
          verbName,
        },
      },
    });

    expectDeepEqual(data, {
      data: {
        action: null,
      },
    });
  }

  const actions = await query(AllActionsDocument, {
    variables: {
      pagination: {
        first: 20,
      },
    },
  });

  expectDeepEqual(actions, {
    data: {
      adminActions: {
        allActions: {
          nodes: [
            {
              verb: {
                name: verbName,
              },
              user: {
                id: userId,
              },
              result: null,
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    },
  });
}

describe("Actions service", () => {
  it("Hello World", async () => {
    const { query } = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(actionModule);
      },
    });

    expectDeepEqual(await query(HelloDocument), {
      data: {
        hello: "Hello World!",
      },
    });
  });

  it("actions creation and retrieval", async () => {
    const { mutation, query } = await GetTestClient({
      prepare({ registerModule }) {
        registerModule(actionModule);
      },
    });

    await CheckActionsCreationRetrieval({
      mutation,
      query,
    });
  });

  describe("authorization", async () => {
    it("create actions without user", async () => {
      const { mutation } = await GetTestClient({
        prepare({ registerModule }) {
          registerModule(actionModule);
        },
      });

      deepEqual(
        await mutation(CreateActionDocument, {
          variables: {
            data: {
              activity: {},
              projectId: "55",
              timestamp: Date.now(),
              verbName: "zxczx",
            },
          },
        }),
        {
          data: {
            action: null,
          },
          errors: [
            {
              locations: [
                {
                  column: 3,
                  line: 2,
                },
              ],
              message: "Forbidden!",
              path: ["action"],
            },
          ],
        }
      );
    });

    it("create actions on not assigned project", async () => {
      const { mutation } = await GetTestClient({
        prepare({ registerModule }) {
          registerModule(actionModule);
        },
      });

      const { authUser } = await CreateUser();

      MockAuthUser.user = authUser;

      deepEqual(
        await mutation(CreateActionDocument, {
          variables: {
            data: {
              activity: {},
              projectId: "55",
              timestamp: Date.now(),
              verbName: "zxczx",
            },
          },
        }),
        {
          data: {
            action: null,
          },
          errors: [
            {
              locations: [
                {
                  column: 3,
                  line: 2,
                },
              ],
              message: "Forbidden Project!",
              path: ["action"],
            },
          ],
        }
      );
    });

    it("get actions not possible if not admin", async () => {
      const { query } = await GetTestClient({
        prepare({ registerModule }) {
          registerModule(actionModule);
        },
      });

      const { authUser } = await CreateUser({ role: "USER" });

      MockAuthUser.user = authUser;

      deepEqual(
        await query(AllActionsDocument, {
          variables: {
            pagination: {
              first: 10,
            },
          },
        }),
        {
          data: null,
          errors: [
            {
              locations: [
                {
                  column: 3,
                  line: 2,
                },
              ],
              message: "Forbidden",
              path: ["adminActions"],
            },
          ],
        }
      );
    });
  });
});