import { ResolveCursorConnection } from "api-base";
import { gql, registerModule } from "../ez";

export const actionsTopicModule = registerModule(
  // This defines the types
  gql`
    extend type Query {
      "ActionsTopic Query"
      actionsTopic: ActionsTopicQueries!
    }

    type ActionsTopicQueries {
      allActionsByTopic(
        pagination: CursorConnectionArgs!
        input: ActionsTopicInput!
      ): ActionsByTopicConnection!

      allActionsByUser(
        pagination: CursorConnectionArgs!
        input: ActionsTopicInput!
      ): ActionsByUserConnection!
    }

    input ActionsTopicInput {
      projectId: Int!
      topicsIds: Int!
    }

    type ActionsByTopicConnection implements Connection {
      "Nodes of the current page"
      nodes: [AllTopicsReturn!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }
    type ActionsByUserConnection implements Connection {
      "Nodes of the current page"
      nodes: [AllActionsByUserReturn!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    type AllTopicsReturn {
      id: IntID!
      code: String!
      json: JSONObject!
      kcs: [KC!]!
      actions: [Action!]!
    }

    type AllActionsByContentReturn {
      id: IntID!
      code: String!
      kcs: [KC!]!
      json: JSONObject!
      actions: [Action!]!
    }

    type AllActionsByUserReturn {
      id: IntID!
      email: String!
      modelStates: JSON!
      actions: [Action!]!
    }

    "User entity"
    type User {
      "Unique numeric identifier"
      id: IntID!
    }

    type ActionVerb {
      "Unique numeric identifier"
      id: IntID!

      "Name of the verb"
      name: String!
    }

    "Content entity"
    type Content {
      "Unique numeric identifier"
      id: IntID!
    }

    type KC {
      "Unique numeric identifier"
      id: IntID!
    }

    "Topic entity"
    type Topic {
      "Unique numeric identifier"
      id: IntID!
    }

    type Action {
      "Unique numeric identifier"
      id: IntID!

      "Type of action"
      verb: ActionVerb!

      "Timestamp of the action, set by the action emitter"
      timestamp: Timestamp!

      "Arbitrary numeric result"
      result: Float

      "User that emitted the action"
      user: User

      "Related content"
      content: Content

      "Related topic"
      topic: Topic

      "Related KCs"
      kcs: [KC!]!

      "Arbitrary step identifier"
      stepID: ID

      "Arbitrary hint identifier"
      hintID: ID

      "Arbitrary numeric amount"
      amount: Float

      "Arbitrary string content detail"
      detail: String

      "Arbitrary JSON object data"
      extra: JSONObject

      "Timestamp of the action, set by the database on row creation"
      createdAt: DateTime!
    }
  `,
  {
    id: "ActionsTopic",
    dirname: import.meta.url,
    // This defines the resolvers associated with the defined types
    resolvers: {
      Query: {
        actionsTopic() {
          return {};
        },
      },
      ActionsTopicQueries: {
        allActionsByTopic(_root, { pagination, input }, { prisma }) {
          return ResolveCursorConnection(pagination, (connection) => {
            return prisma.content.findMany({
              ...connection,
              orderBy: {
                id: "asc",
              },
              where: {
                topics: {
                  some: {
                    id: input.topicsIds,
                  },
                },
              },
              include: {
                actions: {
                  where: {
                    user: {
                      projects: {
                        some: {
                          id: input.projectId,
                        },
                      },
                    },
                  },
                  select: {
                    id: true,
                    stepID: true,
                    user: {
                      select: {
                        id: true,
                        email: true,
                      },
                    },
                    verb: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                kcs: {
                  select: {
                    id: true,
                    code: true,
                    label: true,
                  },
                },
              },
            });
          });
        },
        allActionsByUser(_root, { pagination, input }, { prisma }) {
          return ResolveCursorConnection(pagination, (connection) => {
            return prisma.user.findMany({
              ...connection,
              where: {
                projects: {
                  some: {
                    id: input.projectId,
                  },
                },
              },
              include: {
                actions: {
                  where: {
                    topic: {
                      id: input.topicsIds,
                    },
                  },
                  select: {
                    id: true,
                    stepID: true,
                    verb: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                modelStates: {
                  take: 1,
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            });
          });
        },
      },
    },
  }
);
