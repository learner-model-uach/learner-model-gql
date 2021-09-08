import { useQuery, UseQueryOptions } from "react-query";
import { fetcher } from "../fetcher";
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

export type AdminMutations = {
  __typename?: "AdminMutations";
  assignProjectsToUsers: Array<User>;
  createContent: Content;
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

export type AdminMutationsCreateContentArgs = {
  data: CreateContent;
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
  content: Array<Content>;
  id: Scalars["IntID"];
  project: Project;
  topics: Array<Topic>;
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
  content: Array<Content>;
  domain: Domain;
  id: Scalars["IntID"];
  parent?: Maybe<Topic>;
  project: Project;
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

export enum UserRole {
  Admin = "ADMIN",
  User = "USER",
}

export type UsersConnection = {
  __typename?: "UsersConnection";
  nodes: Array<User>;
  pageInfo: PageInfo;
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  __typename?: "Query";
  currentUser?: Maybe<{
    __typename?: "User";
    id: string;
    email: string;
    name?: Maybe<string>;
    role: UserRole;
  }>;
};

export const CurrentUserDocument = `
    query currentUser {
  currentUser {
    id
    email
    name
    role
  }
}
    `;
export const useCurrentUserQuery = <TData = CurrentUserQuery, TError = unknown>(
  variables?: CurrentUserQueryVariables,
  options?: UseQueryOptions<CurrentUserQuery, TError, TData>
) =>
  useQuery<CurrentUserQuery, TError, TData>(
    variables === undefined ? ["currentUser"] : ["currentUser", variables],
    fetcher<CurrentUserQuery, CurrentUserQueryVariables>(
      CurrentUserDocument,
      variables
    ),
    options
  );
useCurrentUserQuery.document = CurrentUserDocument;

useCurrentUserQuery.getKey = (variables?: CurrentUserQueryVariables) =>
  variables === undefined ? ["currentUser"] : ["currentUser", variables];
