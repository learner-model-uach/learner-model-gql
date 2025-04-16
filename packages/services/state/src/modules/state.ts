import crypto from "crypto";
import { gql, ModelStateConnection, registerModule } from "../ez";

export const stateModule = registerModule(
  gql`
    extend type Query {
      """
      Admin related state queries, only authenticated users with the role "ADMIN" can access
      """
      adminState: AdminStateQueries!

      "Anonymized model state of a group"
      groupModelStates(
        "Code of the project where the model state is classified under"
        projectCode: String!
        "Unique numeric identifier of the group that holds the users"
        groupId: IntID!
        "Optional user identifier to filter out the model state of the specified user"
        currentUserId: IntID

        "Take the first n elements. Default is 25"
        take: NonNegativeInt! = 25
        "Skip the first n elements"
        skip: NonNegativeInt! = 0
      ): [AnonymizedModelState!]!
    }

    "Order Model States"
    input ModelStateOrderBy {
      """
      Order the model states ascendingly or descendingly

      Following the cursor pagination's nature, ordering by "id" which should follow the state creation date

      By default the states are ordered descendingly, showing the newer states first
      """
      id: ORDER_BY = DESC
    }

    "Filter model states data"
    input ModelStateFilter {
      """
      Filter by the specified types

      If the state's type matches any of the specified types, the state is included
      """
      type: [String!]

      """
      Filter by the specified creators

      If the states's creator matches any of the specified creators, the state is included
      """
      creators: [String!]
    }

    "Admin State-Related Queries"
    type AdminStateQueries {
      """
      Get all the model states currently in the system

      Pagination parameters are mandatory, but filters and orderBy are optional, and therefore the search can be customized.
      """
      allModelStates(input: ModelStateConnectionInput!): ModelStateConnection!

      """
      Get all the model states creators currently in the system
      """
      allModelStateCreators(
        pagination: CursorConnectionArgs!
      ): ModelStateCreatorConnection!

      """
      Get all the model statestypes currently in the system
      """
      allModelStateTypes(
        pagination: CursorConnectionArgs!
      ): ModelStateTypeConnection!
    }

    "Creators of Model States"
    type ModelStateCreator {
      "Unique numeric identifier"
      id: IntID!

      name: String!

      "Date of creation"
      createdAt: DateTime!

      "Date of last update"
      updatedAt: DateTime!
    }

    "Types/Categories of Model States"
    type ModelStateType {
      "Unique numeric identifier"
      id: IntID!

      "Name of the model type"
      name: String!

      "Date of creation"
      createdAt: DateTime!

      "Date of last update"
      updatedAt: DateTime!
    }

    "Paginated Model State Creators"
    type ModelStateCreatorConnection implements Connection {
      "Nodes of the current page"
      nodes: [ModelStateCreator!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    "Paginated Model State Types"
    type ModelStateTypeConnection implements Connection {
      "Nodes of the current page"
      nodes: [ModelStateType!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    "Pagination parameters of Model States"
    input ModelStateConnectionInput {
      "Pagination-specific parameters"
      pagination: CursorConnectionArgs!

      "Customize order, by default it orders descendingly by id"
      orderBy: ModelStateOrderBy

      "Customize search/filter parameters"
      filters: ModelStateFilter
    }

    "Paginated Model States"
    type ModelStateConnection implements Connection {
      "Nodes of the current page"
      nodes: [ModelState!]!

      "Pagination related information"
      pageInfo: PageInfo!
    }

    "Model State Entity"
    type ModelState {
      "Unique numeric identifier"
      id: IntID!

      "Type / Category of model state"
      type: String

      "Creator of model state"
      creator: String!

      "Arbitrary JSON Data"
      json: JSON!

      "Date of creation"
      createdAt: DateTime!

      "Date of last update"
      updatedAt: DateTime!
    }

    "Anonymized Model State Entity"
    type AnonymizedModelState {
      "Unique anonimized user hash identifier"
      userUniqueHash: String!

      "Date of creation"
      createdAt: DateTime!
      "Creator of model state"
      creator: String!
      "Domain associated with Model State"
      domain: Domain!
      "Unique numeric identifier"
      id: IntID!
      "Arbitrary JSON Data"
      json: JSON!
      "Type / Category of model state"
      type: String
      "Date of last update"
      updatedAt: DateTime!
    }
  `,
  {
    resolvers: {
      Query: {
        async adminState(_root, _args, { authorization }) {
          await authorization.expectAdmin;

          return {};
        },
        async groupModelStates(
          _root,
          { groupId, projectCode, currentUserId, skip, take },
          { authorization, prisma }
        ) {
          const user = await authorization.expectUser;
          const checkProject =
            await authorization.expectProjectsIdInPrismaFilter;

          const states = await prisma.modelState.findMany({
            where: {
              user: {
                OR: [
                  {
                    id: user.id,
                  },
                  {
                    groups: {
                      some: {
                        AND: [
                          { id: groupId },
                          {
                            projects: {
                              some: checkProject
                                ? {
                                    AND: [
                                      {
                                        code: projectCode,
                                      },
                                      checkProject,
                                    ],
                                  }
                                : {
                                    code: projectCode,
                                  },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              userId:
                currentUserId != null
                  ? {
                      not: currentUserId,
                    }
                  : undefined,
            },
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
            skip,
            take,
            distinct: ["userId"],
            orderBy: [
              {
                createdAt: "desc",
              },
              {
                user: {
                  id: "asc",
                },
              },
            ],
          });

          return states.map((state) => {
            return {
              ...state,
              userUniqueHash: crypto
                .createHash("sha1")
                .update(state.user.email)
                .digest("hex"),
            };
          });
        },
      },
      AdminStateQueries: {
        allModelStates(_root, { input }) {
          return ModelStateConnection(input);
        },
        allModelStateCreators(
          _root,
          { pagination },
          { prisma, ResolveCursorConnection }
        ) {
          return ResolveCursorConnection(pagination, async (connection) => {
            return prisma.modelStateCreator.findMany(connection);
          });
        },
        allModelStateTypes(
          _root,
          { pagination },
          { prisma, ResolveCursorConnection }
        ) {
          return ResolveCursorConnection(pagination, (connection) => {
            return prisma.modelStateType.findMany(connection);
          });
        },
      },
    },
  }
);
