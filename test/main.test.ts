import { getStitchedSchema } from "../packages/gateway/src/stitch";
import { CheckActionsCreationRetrieval } from "../packages/services/actions/test/test";
import { CheckContentCreationRetrieval } from "../packages/services/content/test/test";
import {
  CheckDomainCreationRetrieval,
  CheckDomainsOfProjects,
  CheckKCs,
  CheckTopicsCreationRetrieval,
} from "../packages/services/domain/test/test";
import {
  CheckProjectCreationRetrieval,
  CheckProjectFromContent,
  CheckProjectFromDomainAndTopic,
  CheckProjectFromUser,
} from "../packages/services/projects/test/test";
import { CheckServiceState } from "../packages/services/state/test/test";
import { CheckGroups, CheckUsers } from "../packages/services/users/test/test";
import {
  expectDeepEqual,
  GetTestClient,
  gql,
} from "../packages/testing/src/index";

export const TestStitchedSchema = async () => {
  const ActionService = GetTestClient({
    async prepare({ registerModule }) {
      const { actionModule, projectsModule } = await import(
        "../packages/services/actions/src/modules/index"
      );
      registerModule(actionModule);
      registerModule(projectsModule);
    },
  });

  const ContentService = GetTestClient({
    async prepare({ registerModule }) {
      const { contentModule, domainModule, projectModule } = await import(
        "../packages/services/content/src/modules/index"
      );
      registerModule(contentModule);
      registerModule(domainModule);
      registerModule(projectModule);
    },
  });

  const DomainService = GetTestClient({
    async prepare({ registerModule }) {
      const { contentModule, domainModule, projectModule, kcModule } =
        await import("../packages/services/domain/src/modules/index");

      registerModule(contentModule);
      registerModule(domainModule);
      registerModule(projectModule);
      registerModule(kcModule);
    },
  });

  const ProjectsService = GetTestClient({
    async prepare({ registerModule }) {
      const { contentModule, domainModule, projectsModule, usersModule } =
        await import("../packages/services/projects/src/modules/index");

      registerModule(contentModule);
      registerModule(domainModule);
      registerModule(projectsModule);
      registerModule(usersModule);
    },
  });

  const UsersService = GetTestClient({
    async prepare({ registerModule }) {
      const { usersModule, groupsModule, projectsModule } = await import(
        "../packages/services/users/src/modules/index"
      );

      registerModule(groupsModule);
      registerModule(usersModule);
      registerModule(projectsModule);
    },
  });

  const StateService = GetTestClient({
    async prepare({ registerModule }) {
      const { domainModule, stateModule, userModule } = await import(
        "../packages/services/state/src/modules/index"
      );

      registerModule(domainModule);
      registerModule(stateModule);
      registerModule(userModule);
    },
  });

  const stitchedSchema = await getStitchedSchema([
    {
      name: "actions",
      href: (await ActionService).endpoint,
    },
    {
      name: "content",
      href: (await ContentService).endpoint,
    },
    {
      name: "domain",
      href: (await DomainService).endpoint,
    },
    {
      name: "projects",
      href: (await ProjectsService).endpoint,
    },
    {
      name: "users",
      href: (await UsersService).endpoint,
    },
    {
      name: "state",
      href: (await StateService).endpoint,
    },
  ]);

  const GatewayClient = await GetTestClient({
    schema: stitchedSchema,
  });

  return {
    GatewayClient,
  };
};

describe("Gateway", () => {
  it("Gateway Hello World", async () => {
    const { GatewayClient } = await TestStitchedSchema();

    expectDeepEqual(
      await GatewayClient.query(
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

  it("actions", async () => {
    const { GatewayClient } = await TestStitchedSchema();

    await CheckActionsCreationRetrieval(GatewayClient);
  });

  it("content", async () => {
    const { GatewayClient } = await TestStitchedSchema();

    await CheckContentCreationRetrieval(GatewayClient);
  });

  describe("domain gateway", async () => {
    it("domain", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckDomainCreationRetrieval(GatewayClient);
    });
    it("topics", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckTopicsCreationRetrieval(GatewayClient);
    });

    it("projects", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckDomainsOfProjects(GatewayClient);
    });

    it("kcs", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckKCs(GatewayClient);
    });
  });

  describe("projects gateway", async () => {
    it("projects", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckProjectCreationRetrieval(GatewayClient);
    });

    it("content", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckProjectFromContent(GatewayClient);
    });
    it("domain", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckProjectFromDomainAndTopic(GatewayClient);
    });
    it("user", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckProjectFromUser(GatewayClient);
    });
  });

  describe("users gateway", async () => {
    it("users", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckUsers(GatewayClient);
    });

    it("groups", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckGroups(GatewayClient);
    });
  });

  describe("state gateway", async () => {
    it("state", async () => {
      const { GatewayClient } = await TestStitchedSchema();

      await CheckServiceState(GatewayClient);
    });
  });
});
