import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string;
  /** ID that parses as non-negative integer, serializes to string, and can be passed as string or number */
  IntID: string;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: Record<string, unknown>;
  /** Integers that will have a value of 0 or more. */
  NonNegativeInt: number;
  /** The javascript `Date` as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: number;
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: string;
  /** Represents NULL values */
  Void: void | undefined | null;
};

export type Action = {
  __typename?: "Action";
  activity: ActionActivity;
  id: Scalars["IntID"];
  result?: Maybe<Scalars["Float"]>;
  timestamp: Scalars["Timestamp"];
  user?: Maybe<User>;
  verb: ActionVerb;
};

export type ActionActivity = {
  __typename?: "ActionActivity";
  amount?: Maybe<Scalars["Float"]>;
  content?: Maybe<Content>;
  detail?: Maybe<Scalars["String"]>;
  extra?: Maybe<Scalars["JSONObject"]>;
  hintID?: Maybe<Scalars["ID"]>;
  id: Scalars["IntID"];
  stepID?: Maybe<Scalars["ID"]>;
  topic?: Maybe<Topic>;
};

export type ActionActivityInput = {
  amount?: Maybe<Scalars["Float"]>;
  contentID?: Maybe<Scalars["IntID"]>;
  detail?: Maybe<Scalars["String"]>;
  extra?: Maybe<Scalars["JSONObject"]>;
  hintID?: Maybe<Scalars["ID"]>;
  stepID?: Maybe<Scalars["ID"]>;
  topicID?: Maybe<Scalars["IntID"]>;
};

export type ActionInput = {
  activity: ActionActivityInput;
  projectId: Scalars["IntID"];
  timestamp: Scalars["Timestamp"];
  verbName: Scalars["String"];
};

export type ActionVerb = {
  __typename?: "ActionVerb";
  id: Scalars["IntID"];
  name: Scalars["String"];
};

export type ActionsConnection = {
  __typename?: "ActionsConnection";
  nodes: Array<Action>;
  pageInfo: PageInfo;
};

export type AdminActionQueries = {
  __typename?: "AdminActionQueries";
  allActions: ActionsConnection;
};

export type AdminActionQueriesAllActionsArgs = {
  pagination: CursorConnectionArgs;
};

export type AdminContentMutations = {
  __typename?: "AdminContentMutations";
  createContent: Content;
};

export type AdminContentMutationsCreateContentArgs = {
  data: CreateContent;
};

export type AdminContentQueries = {
  __typename?: "AdminContentQueries";
  allContent: ContentConnection;
};

export type AdminContentQueriesAllContentArgs = {
  pagination: CursorConnectionArgs;
};

export type AdminMutations = {
  __typename?: "AdminMutations";
  assignProjectsToUsers: Array<User>;
  createDomain: Domain;
  createProject: Project;
  createTopic: Topic;
  unassignProjectsToUsers: Array<User>;
  updateTopic: Topic;
};

export type AdminMutationsAssignProjectsToUsersArgs = {
  projectIds: Array<Scalars["IntID"]>;
  userIds: Array<Scalars["IntID"]>;
};

export type AdminMutationsCreateDomainArgs = {
  input: CreateDomain;
};

export type AdminMutationsCreateProjectArgs = {
  data: CreateProject;
};

export type AdminMutationsCreateTopicArgs = {
  input: CreateTopic;
};

export type AdminMutationsUnassignProjectsToUsersArgs = {
  projectIds: Array<Scalars["IntID"]>;
  userIds: Array<Scalars["IntID"]>;
};

export type AdminMutationsUpdateTopicArgs = {
  input: UpdateTopic;
};

export type AdminQueries = {
  __typename?: "AdminQueries";
  allDomains: DomainsConnection;
  allProjects: Array<Project>;
  allTopics: TopicsConnection;
  allUsers: UsersConnection;
};

export type AdminQueriesAllDomainsArgs = {
  pagination: CursorConnectionArgs;
};

export type AdminQueriesAllTopicsArgs = {
  pagination: CursorConnectionArgs;
};

export type AdminQueriesAllUsersArgs = {
  pagination: CursorConnectionArgs;
};

export type Connection = {
  pageInfo?: Maybe<PageInfo>;
};

export type Content = {
  __typename?: "Content";
  binaryBase64?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  description: Scalars["String"];
  domain: Domain;
  id: Scalars["IntID"];
  json?: Maybe<Scalars["JSONObject"]>;
  project: Project;
  updatedAt: Scalars["DateTime"];
  url?: Maybe<Scalars["String"]>;
};

export type ContentConnection = Connection & {
  __typename?: "ContentConnection";
  nodes: Array<Content>;
  pageInfo: PageInfo;
};

export type CreateContent = {
  binaryBase64?: Maybe<Scalars["String"]>;
  description: Scalars["String"];
  domainId: Scalars["IntID"];
  json?: Maybe<Scalars["JSONObject"]>;
  projectId: Scalars["IntID"];
  topicId?: Maybe<Scalars["IntID"]>;
  url?: Maybe<Scalars["String"]>;
};

export type CreateDomain = {
  code: Scalars["String"];
  label: Scalars["String"];
  projectId: Scalars["IntID"];
};

export type CreateProject = {
  code: Scalars["String"];
  label: Scalars["String"];
};

export type CreateTopic = {
  code: Scalars["String"];
  domainId: Scalars["IntID"];
  label: Scalars["String"];
  parentTopicId?: Maybe<Scalars["IntID"]>;
  projectId: Scalars["IntID"];
};

export type CursorConnectionArgs = {
  after?: Maybe<Scalars["IntID"]>;
  before?: Maybe<Scalars["IntID"]>;
  first?: Maybe<Scalars["NonNegativeInt"]>;
  last?: Maybe<Scalars["NonNegativeInt"]>;
};

export type Domain = {
  __typename?: "Domain";
  content: ContentConnection;
  id: Scalars["IntID"];
  project: Project;
  topics: Array<Topic>;
};

export type DomainContentArgs = {
  pagination: CursorConnectionArgs;
};

export type DomainsConnection = Connection & {
  __typename?: "DomainsConnection";
  nodes: Array<Domain>;
  pageInfo?: Maybe<PageInfo>;
};

export type Group = {
  __typename?: "Group";
  code: Scalars["String"];
  id: Scalars["IntID"];
  label: Scalars["String"];
  projects: Array<Project>;
  users: Array<User>;
};

export type Mutation = {
  __typename?: "Mutation";
  action?: Maybe<Scalars["Void"]>;
  admin: AdminMutations;
  adminContent: AdminContentMutations;
};

export type MutationActionArgs = {
  data: ActionInput;
};

export type Node = {
  id: Scalars["IntID"];
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]>;
  hasNextPage: Scalars["Boolean"];
  hasPreviousPage: Scalars["Boolean"];
  startCursor?: Maybe<Scalars["String"]>;
};

export type Project = {
  __typename?: "Project";
  code: Scalars["String"];
  domains: Array<Domain>;
  id: Scalars["IntID"];
  label: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  admin: AdminQueries;
  adminActions: AdminActionQueries;
  adminContent: AdminContentQueries;
  content: Array<Content>;
  currentUser?: Maybe<User>;
  domains: Array<Domain>;
  hello: Scalars["String"];
  projects: Array<Project>;
  topics: Array<Topic>;
};

export type QueryContentArgs = {
  ids: Array<Scalars["IntID"]>;
};

export type QueryDomainsArgs = {
  ids: Array<Scalars["IntID"]>;
};

export type QueryProjectsArgs = {
  ids: Array<Scalars["IntID"]>;
};

export type QueryTopicsArgs = {
  ids: Array<Scalars["IntID"]>;
};

export type Subscription = {
  __typename?: "Subscription";
  hello: Scalars["String"];
};

export type Topic = {
  __typename?: "Topic";
  childrens: Array<Topic>;
  content: ContentConnection;
  domain: Domain;
  id: Scalars["IntID"];
  parent?: Maybe<Topic>;
  project: Project;
};

export type TopicContentArgs = {
  pagination: CursorConnectionArgs;
};

export type TopicsConnection = Connection & {
  __typename?: "TopicsConnection";
  nodes: Array<Topic>;
  pageInfo?: Maybe<PageInfo>;
};

export type UpdateTopic = {
  code: Scalars["String"];
  domainId: Scalars["IntID"];
  id: Scalars["IntID"];
  label: Scalars["String"];
  parentTopicId?: Maybe<Scalars["IntID"]>;
  projectId: Scalars["IntID"];
};

export type User = {
  __typename?: "User";
  active: Scalars["Boolean"];
  createdAt: Scalars["DateTime"];
  email: Scalars["String"];
  enabled: Scalars["Boolean"];
  groups: Array<Group>;
  id: Scalars["IntID"];
  lastOnline?: Maybe<Scalars["DateTime"]>;
  locked: Scalars["Boolean"];
  name?: Maybe<Scalars["String"]>;
  projects: Array<Project>;
  role: UserRole;
  updatedAt: Scalars["DateTime"];
};

export const UserRole = {
  Admin: "ADMIN",
  User: "USER",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type UsersConnection = {
  __typename?: "UsersConnection";
  nodes: Array<User>;
  pageInfo: PageInfo;
};

export type CreateActionMutationVariables = Exact<{
  data: ActionInput;
}>;

export type CreateActionMutation = {
  __typename?: "Mutation";
  action?: Maybe<void | undefined | null>;
};

export type AllActionsQueryVariables = Exact<{
  pagination: CursorConnectionArgs;
}>;

export type AllActionsQuery = {
  __typename?: "Query";
  adminActions: {
    __typename?: "AdminActionQueries";
    allActions: {
      __typename?: "ActionsConnection";
      nodes: Array<{
        __typename?: "Action";
        result?: Maybe<number>;
        verb: { __typename?: "ActionVerb"; name: string };
        user?: Maybe<{ __typename?: "User"; id: string }>;
      }>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
    };
  };
};

export type CreateContentMutationVariables = Exact<{
  data: CreateContent;
}>;

export type CreateContentMutation = {
  __typename?: "Mutation";
  adminContent: {
    __typename?: "AdminContentMutations";
    createContent: {
      __typename?: "Content";
      id: string;
      description: string;
      binaryBase64?: Maybe<string>;
      json?: Maybe<Record<string, unknown>>;
    };
  };
};

export type AllContentQueryVariables = Exact<{
  pagination: CursorConnectionArgs;
}>;

export type AllContentQuery = {
  __typename?: "Query";
  adminContent: {
    __typename?: "AdminContentQueries";
    allContent: {
      __typename?: "ContentConnection";
      nodes: Array<{
        __typename?: "Content";
        id: string;
        description: string;
        binaryBase64?: Maybe<string>;
        json?: Maybe<Record<string, unknown>>;
      }>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
    };
  };
};

export type ContentFromDomainQueryVariables = Exact<{
  ids: Array<Scalars["IntID"]> | Scalars["IntID"];
  pagination: CursorConnectionArgs;
}>;

export type ContentFromDomainQuery = {
  __typename?: "Query";
  domains: Array<{
    __typename?: "Domain";
    id: string;
    content: {
      __typename?: "ContentConnection";
      nodes: Array<{
        __typename?: "Content";
        id: string;
        description: string;
        binaryBase64?: Maybe<string>;
        json?: Maybe<Record<string, unknown>>;
      }>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
    };
  }>;
};

export type ContentFromTopicQueryVariables = Exact<{
  ids: Array<Scalars["IntID"]> | Scalars["IntID"];
  pagination: CursorConnectionArgs;
}>;

export type ContentFromTopicQuery = {
  __typename?: "Query";
  topics: Array<{
    __typename?: "Topic";
    id: string;
    content: {
      __typename?: "ContentConnection";
      nodes: Array<{
        __typename?: "Content";
        id: string;
        description: string;
        binaryBase64?: Maybe<string>;
        json?: Maybe<Record<string, unknown>>;
      }>;
      pageInfo: { __typename?: "PageInfo"; hasNextPage: boolean };
    };
  }>;
};

export type HelloQueryVariables = Exact<{ [key: string]: never }>;

export type HelloQuery = { __typename?: "Query"; hello: string };

export const CreateActionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateAction" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "data" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ActionInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "action" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "data" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "data" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateActionMutation,
  CreateActionMutationVariables
>;
export const AllActionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AllActions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CursorConnectionArgs" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "allActions" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "verb" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "result" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllActionsQuery, AllActionsQueryVariables>;
export const CreateContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "data" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateContent" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminContent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createContent" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "data" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "data" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "binaryBase64" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "json" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateContentMutation,
  CreateContentMutationVariables
>;
export const AllContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AllContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CursorConnectionArgs" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminContent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "allContent" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "binaryBase64" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "json" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllContentQuery, AllContentQueryVariables>;
export const ContentFromDomainDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ContentFromDomain" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ids" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "IntID" },
                },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CursorConnectionArgs" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "domains" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ids" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "ids" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "content" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "binaryBase64" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "json" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ContentFromDomainQuery,
  ContentFromDomainQueryVariables
>;
export const ContentFromTopicDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ContentFromTopic" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ids" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "IntID" },
                },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pagination" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CursorConnectionArgs" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "topics" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ids" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "ids" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "content" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "pagination" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "pagination" },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "binaryBase64" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "json" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "hasNextPage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ContentFromTopicQuery,
  ContentFromTopicQueryVariables
>;
export const HelloDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "hello" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [{ kind: "Field", name: { kind: "Name", value: "hello" } }],
      },
    },
  ],
} as unknown as DocumentNode<HelloQuery, HelloQueryVariables>;