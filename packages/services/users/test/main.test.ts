import {
  CreateUser,
  expectDeepEqual,
  GetTestClient,
  gql,
  MockAuthUser,
  SetEmailAliasesDocument,
  CurrentUserDocument,
  generate,
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
        emailAliases
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

  it("setEmailAliases", async () => {
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
          emailAliases: ["alias1@gmail.com", "alias2@gmail.com"],
        },
        {
          email: "test2@gmail.com",
          emailAliases: ["foo@gmail.com"],
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
          emailAliases: ["alias1@gmail.com"],
        },
        {
          email: "test2@gmail.com",
          emailAliases: ["foo@gmail.com"],
        },
      ]);
    }

    {
      const { currentUser } = await assertedQuery(CurrentUserDocument);

      expectDeepEqual(currentUser?.email, authUser.email);
    }

    MockAuthUser.user = {
      email: "test@gmail.com",
      sub: generate(),
    };

    {
      const { currentUser } = await assertedQuery(CurrentUserDocument);

      expectDeepEqual(currentUser?.email, "test@gmail.com");
    }

    MockAuthUser.user = {
      email: "foo@gmail.com",
      sub: generate(),
    };

    {
      const { currentUser } = await assertedQuery(CurrentUserDocument);

      expectDeepEqual(currentUser?.email, "test2@gmail.com");
    }

    MockAuthUser.user = {
      email: "alias1@gmail.com",
      sub: generate(),
    };

    {
      const { currentUser } = await assertedQuery(CurrentUserDocument);

      expectDeepEqual(currentUser?.email, "test@gmail.com");
    }
  });
});
