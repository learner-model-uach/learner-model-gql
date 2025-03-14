import { ResolveCursorConnection } from "api-base";
import { gql, registerModule } from "../ez";

export const actionsTopicModule = registerModule(
  // This defines the types
  gql`
    extend type Query {
      """
      This service retrieves all actions performed on the specified topics through the input.
      These actions are grouped by user and content.
      """
      actionsTopic: ActionsTopicQueries!
    }

    type ActionsTopicQueries {
      """
      Returns all actions performed, grouped by Content.
      Pagination parameters are used to control the number of returned results,
      making this parameter mandatory.
      """
      allActionsByContent(
        pagination: CursorConnectionArgs!
        input: ActionsTopicInput!
      ): ActionsByContentConnection!

      """
      Returns all actions performed, grouped by users.
      Pagination parameters are used to control the number of returned results,
      making this parameter mandatory.
      """
      allActionsByUser(
        pagination: CursorConnectionArgs!
        input: ActionsTopicInput!
      ): ActionsByUserConnection!
    }

    input ActionsTopicInput {
      "ID of the project."
      projectId: Int!
      "Array of topic IDs where the search will be performed."
      topicsIds: [Int!]!
      "Array of verbs to be used for action search."
      verbNames: [String!]!
      "Start interval for conducting the search."
      startDate: DateTime!
      "End interval for conducting the search."
      endDate: DateTime!
      "Array of group identifiers that will be used to filter the information corresponding to the users of those groups."
      groupIds: [Int!]
    }

    "Paginated ActionsByContent"
    type ActionsByContentConnection implements Connection {
      "Nodes of the current page"
      nodes: [AllActionsByContent!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }
    "Paginated ActionsByUser"
    type ActionsByUserConnection implements Connection {
      "Nodes of the current page"
      nodes: [AllActionsByUser!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    type AllActionsByContent {
      "Unique numeric identifier"
      id: IntID!
      "Unique string identifier"
      code: String!
      "Arbitrary JSON object data"
      json: JSONObject!
      "KCs associated with the content"
      kcs: [KC!]!
      "Actions performed on the content."
      actions: [Action!]!
    }

    type AllActionsByUser {
      "Unique numeric identifier"
      id: IntID!
      "Date of creation"
      createdAt: DateTime!
      "Email Address"
      email: String!
      "Model States associated with user"
      modelStates: JSON!
      "Actions performed by user"
      actions: [Action!]!
      "User role"
      role: String!
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
        allActionsByContent(_root, { pagination, input }, { prisma }) {
          return ResolveCursorConnection(pagination, (connection) => {
            return prisma.content.findMany({
              ...connection,
              orderBy: {
                id: "asc",
              },
              where: {
                topics: {
                  some: {
                    id: {
                      in: input.topicsIds,
                    },
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
                    verbName: {
                      in: input.verbNames,
                    },
                    createdAt: {
                      gte: input.startDate,
                      lte: input.endDate,
                    },
                  },
                  select: {
                    id: true,
                    stepID: true,
                    result: true,
                    user: {
                      select: {
                        id: true,
                        email: true,
                      },
                    },
                    verb: {
                      select: {
                        id: true,
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
                groups: input.groupIds
                  ? {
                      some: {
                        id: {
                          in: input.groupIds,
                        },
                      },
                    }
                  : undefined,
              },
              include: {
                actions: {
                  where: {
                    topic: {
                      id: {
                        in: input.topicsIds,
                      },
                    },
                    verbName: {
                      in: input.verbNames,
                    },
                    createdAt: {
                      gte: input.startDate,
                      lte: input.endDate,
                    },
                  },
                  include: {
                    verb: true,
                  },
                },
                modelStates: {
                  where: {
                    updatedAt: {
                      gte: input.startDate,
                      lte: input.endDate,
                    },
                  },
                  orderBy: {
                    updatedAt: "desc",
                  },
                  take: 1,
                },
              },
            });
          });
        },
      },
    },
  }
);
