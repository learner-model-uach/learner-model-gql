import {
  CreateUser,
  expectDeepEqual,
  GetTestClient,
  gql,
  MockAuthUser,
  SetEmailAliasesDocument,
} from "testing";

import {
  groupsModule,
  projectsModule,
  usersModule,
} from "../src/modules/index";
import { CheckGroups, CheckUsers } from "./test";

const UsersClient = () => {
  return GetTestClient({
    prepare({ registerModule }) {
      registerModule(groupsModule);
      registerModule(usersModule);
      registerModule(projectsModule);
    },
  });
};

gql(/* GraphQL */ `
  mutation SetEmailAliases($list: [EmailAliasInput!]!) {
    adminUsers {
      setEmailAliases(list: $list) {
        email
      }
    }
  }
`);

describe("Users service", () => {
  it("hello world", async () => {
    const { query } = await UsersClient();

    expectDeepEqual(
      await query(
        gql(/* GraphQL */ `
          query hello {
            hello
          }
        `)
      ),
      {
        data: {
          hello: "Hello World!",
        },
      }
    );
  });

  it("users creation & retrieval", async () => {
    const testClient = await UsersClient();

    await CheckUsers(testClient);
  });

  it("groups", async () => {
    const testClient = await UsersClient();

    await CheckGroups(testClient);
  });

  it.only("setEmailAliases", async () => {
    const { assertedQuery } = await UsersClient();

    const { authUser } = await CreateUser({
      role: "ADMIN",
    });
    MockAuthUser.user = authUser;

    {
      const {
        adminUsers: { setEmailAliases },
      } = await assertedQuery(SetEmailAliasesDocument, {
        variables: {
          list: [
            {
              userEmail: "test@gmail.com",
              aliases: ["alias1@gmail.com", "alias2@gmail.com"],
            },
            {
              userEmail: "test2@gmail.com",
              aliases: ["foo@gmail.com"],
            },
          ],
        },
      });

      expectDeepEqual(setEmailAliases, [
        {
          email: "test@gmail.com",
        },
        {
          email: "test2@gmail.com",
        },
      ]);
    }

    {
      const {
        adminUsers: { setEmailAliases },
      } = await assertedQuery(SetEmailAliasesDocument, {
        variables: {
          list: [
            {
              userEmail: "test@gmail.com",
              aliases: ["alias1@gmail.com"],
            },
            {
              userEmail: "test2@gmail.com",
              aliases: ["foo@gmail.com"],
            },
          ],
        },
      });

      expectDeepEqual(setEmailAliases, [
        {
          email: "test@gmail.com",
        },
        {
          email: "test2@gmail.com",
        },
      ]);
    }
  });
});
