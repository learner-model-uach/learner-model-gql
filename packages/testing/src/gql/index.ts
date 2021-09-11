/* eslint-disable */
import * as graphql from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n          query hello {\n            hello\n          }\n        ": graphql.HelloDocument,
    "\n            mutation CreateAction($data: ActionInput!) {\n              action(data: $data)\n            }\n          ": graphql.CreateActionDocument,
    "\n            query AllActions($pagination: CursorConnectionArgs!) {\n              adminActions {\n                allActions(pagination: $pagination) {\n                  nodes {\n                    verb {\n                      name\n                    }\n\n                    result\n                    user {\n                      id\n                    }\n                  }\n                  pageInfo {\n                    hasNextPage\n                  }\n                }\n              }\n            }\n          ": graphql.AllActionsDocument,
    "\n      query AllActions($pagination: CursorConnectionArgs!) {\n        adminActions {\n          allActions(pagination: $pagination) {\n            nodes {\n              verb {\n                name\n              }\n\n              result\n              user {\n                id\n              }\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    ": graphql.AllActionsDocument,
    "\n          query AllContent($pagination: CursorConnectionArgs!) {\n            adminContent {\n              allContent(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        ": graphql.AllContentDocument,
    "\n          mutation CreateContent($data: CreateContent!) {\n            adminContent {\n              createContent(data: $data) {\n                id\n                description\n                binaryBase64\n                json\n              }\n            }\n          }\n        ": graphql.CreateContentDocument,
    "\n          query ContentFromDomain(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            domains(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        ": graphql.ContentFromDomainDocument,
    "\n          query ContentFromTopic(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            topics(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        ": graphql.ContentFromTopicDocument,
    "\n      mutation CreateContent($data: CreateContent!) {\n        adminContent {\n          createContent(data: $data) {\n            id\n            description\n            binaryBase64\n            json\n          }\n        }\n      }\n    ": graphql.CreateContentDocument,
    "\n        query AllContent($pagination: CursorConnectionArgs!) {\n          adminContent {\n            allContent(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      ": graphql.AllContentDocument,
    "\n        query ContentFromDomain(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          domains(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      ": graphql.ContentFromDomainDocument,
    "\n        query ContentFromTopic(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          topics(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      ": graphql.ContentFromTopicDocument,
    "\n  fragment IsolatedDomainFields on Domain {\n    id\n    code\n    label\n  }\n": graphql.IsolatedDomainFieldsFragmentDoc,
    "\n  fragment IsolatedTopicFields on Topic {\n    id\n    code\n    label\n    domain {\n      id\n    }\n    parent {\n      id\n      domain {\n        id\n      }\n    }\n    childrens {\n      id\n      domain {\n        id\n      }\n    }\n  }\n": graphql.IsolatedTopicFieldsFragmentDoc,
    "\n      mutation CreateDomain($input: CreateDomain!) {\n        adminDomain {\n          createDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    ": graphql.CreateDomainDocument,
    "\n        query AllDomains($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allDomains(pagination: $pagination) {\n              nodes {\n                ...IsolatedDomainFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      ": graphql.AllDomainsDocument,
    "\n      mutation UpdateDomain($input: UpdateDomain!) {\n        adminDomain {\n          updateDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    ": graphql.UpdateDomainDocument,
    "\n      mutation CreateTopic($input: CreateTopic!) {\n        adminDomain {\n          createTopic(input: $input) {\n            ...IsolatedTopicFields\n          }\n        }\n      }\n    ": graphql.CreateTopicDocument,
    "\n      query AllTopics($pagination: CursorConnectionArgs!) {\n        adminDomain {\n          allTopics(pagination: $pagination) {\n            nodes {\n              ...IsolatedTopicFields\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    ": graphql.AllTopicsDocument,
    "\n        mutation UpdateTopic($input: UpdateTopic!) {\n          adminDomain {\n            updateTopic(input: $input) {\n              ...IsolatedTopicFields\n            }\n          }\n        }\n      ": graphql.UpdateTopicDocument,
    "\n        query AllTopics($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allTopics(pagination: $pagination) {\n              nodes {\n                ...IsolatedTopicFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      ": graphql.AllTopicsDocument,
    "\n      query DomainFromContent($ids: [IntID!]!) {\n        content(ids: $ids) {\n          id\n          domain {\n            id\n          }\n        }\n      }\n    ": graphql.DomainFromContentDocument,
    "\n      query DomainsFromProjects($ids: [IntID!]!) {\n        projects(ids: $ids) {\n          id\n          domains {\n            id\n          }\n        }\n      }\n    ": graphql.DomainsFromProjectsDocument,
};

export function gql(source: "\n          query hello {\n            hello\n          }\n        "): (typeof documents)["\n          query hello {\n            hello\n          }\n        "];
export function gql(source: "\n            mutation CreateAction($data: ActionInput!) {\n              action(data: $data)\n            }\n          "): (typeof documents)["\n            mutation CreateAction($data: ActionInput!) {\n              action(data: $data)\n            }\n          "];
export function gql(source: "\n            query AllActions($pagination: CursorConnectionArgs!) {\n              adminActions {\n                allActions(pagination: $pagination) {\n                  nodes {\n                    verb {\n                      name\n                    }\n\n                    result\n                    user {\n                      id\n                    }\n                  }\n                  pageInfo {\n                    hasNextPage\n                  }\n                }\n              }\n            }\n          "): (typeof documents)["\n            query AllActions($pagination: CursorConnectionArgs!) {\n              adminActions {\n                allActions(pagination: $pagination) {\n                  nodes {\n                    verb {\n                      name\n                    }\n\n                    result\n                    user {\n                      id\n                    }\n                  }\n                  pageInfo {\n                    hasNextPage\n                  }\n                }\n              }\n            }\n          "];
export function gql(source: "\n      query AllActions($pagination: CursorConnectionArgs!) {\n        adminActions {\n          allActions(pagination: $pagination) {\n            nodes {\n              verb {\n                name\n              }\n\n              result\n              user {\n                id\n              }\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      query AllActions($pagination: CursorConnectionArgs!) {\n        adminActions {\n          allActions(pagination: $pagination) {\n            nodes {\n              verb {\n                name\n              }\n\n              result\n              user {\n                id\n              }\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    "];
export function gql(source: "\n          query AllContent($pagination: CursorConnectionArgs!) {\n            adminContent {\n              allContent(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "): (typeof documents)["\n          query AllContent($pagination: CursorConnectionArgs!) {\n            adminContent {\n              allContent(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "];
export function gql(source: "\n          mutation CreateContent($data: CreateContent!) {\n            adminContent {\n              createContent(data: $data) {\n                id\n                description\n                binaryBase64\n                json\n              }\n            }\n          }\n        "): (typeof documents)["\n          mutation CreateContent($data: CreateContent!) {\n            adminContent {\n              createContent(data: $data) {\n                id\n                description\n                binaryBase64\n                json\n              }\n            }\n          }\n        "];
export function gql(source: "\n          query ContentFromDomain(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            domains(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "): (typeof documents)["\n          query ContentFromDomain(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            domains(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "];
export function gql(source: "\n          query ContentFromTopic(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            topics(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "): (typeof documents)["\n          query ContentFromTopic(\n            $ids: [IntID!]!\n            $pagination: CursorConnectionArgs!\n          ) {\n            topics(ids: $ids) {\n              id\n              content(pagination: $pagination) {\n                nodes {\n                  id\n                  description\n                  binaryBase64\n                  json\n                }\n                pageInfo {\n                  hasNextPage\n                }\n              }\n            }\n          }\n        "];
export function gql(source: "\n      mutation CreateContent($data: CreateContent!) {\n        adminContent {\n          createContent(data: $data) {\n            id\n            description\n            binaryBase64\n            json\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation CreateContent($data: CreateContent!) {\n        adminContent {\n          createContent(data: $data) {\n            id\n            description\n            binaryBase64\n            json\n          }\n        }\n      }\n    "];
export function gql(source: "\n        query AllContent($pagination: CursorConnectionArgs!) {\n          adminContent {\n            allContent(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "): (typeof documents)["\n        query AllContent($pagination: CursorConnectionArgs!) {\n          adminContent {\n            allContent(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "];
export function gql(source: "\n        query ContentFromDomain(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          domains(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "): (typeof documents)["\n        query ContentFromDomain(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          domains(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "];
export function gql(source: "\n        query ContentFromTopic(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          topics(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "): (typeof documents)["\n        query ContentFromTopic(\n          $ids: [IntID!]!\n          $pagination: CursorConnectionArgs!\n        ) {\n          topics(ids: $ids) {\n            id\n            content(pagination: $pagination) {\n              nodes {\n                id\n                description\n                binaryBase64\n                json\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "];
export function gql(source: "\n  fragment IsolatedDomainFields on Domain {\n    id\n    code\n    label\n  }\n"): (typeof documents)["\n  fragment IsolatedDomainFields on Domain {\n    id\n    code\n    label\n  }\n"];
export function gql(source: "\n  fragment IsolatedTopicFields on Topic {\n    id\n    code\n    label\n    domain {\n      id\n    }\n    parent {\n      id\n      domain {\n        id\n      }\n    }\n    childrens {\n      id\n      domain {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment IsolatedTopicFields on Topic {\n    id\n    code\n    label\n    domain {\n      id\n    }\n    parent {\n      id\n      domain {\n        id\n      }\n    }\n    childrens {\n      id\n      domain {\n        id\n      }\n    }\n  }\n"];
export function gql(source: "\n      mutation CreateDomain($input: CreateDomain!) {\n        adminDomain {\n          createDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation CreateDomain($input: CreateDomain!) {\n        adminDomain {\n          createDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    "];
export function gql(source: "\n        query AllDomains($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allDomains(pagination: $pagination) {\n              nodes {\n                ...IsolatedDomainFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "): (typeof documents)["\n        query AllDomains($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allDomains(pagination: $pagination) {\n              nodes {\n                ...IsolatedDomainFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "];
export function gql(source: "\n      mutation UpdateDomain($input: UpdateDomain!) {\n        adminDomain {\n          updateDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation UpdateDomain($input: UpdateDomain!) {\n        adminDomain {\n          updateDomain(input: $input) {\n            ...IsolatedDomainFields\n          }\n        }\n      }\n    "];
export function gql(source: "\n      mutation CreateTopic($input: CreateTopic!) {\n        adminDomain {\n          createTopic(input: $input) {\n            ...IsolatedTopicFields\n          }\n        }\n      }\n    "): (typeof documents)["\n      mutation CreateTopic($input: CreateTopic!) {\n        adminDomain {\n          createTopic(input: $input) {\n            ...IsolatedTopicFields\n          }\n        }\n      }\n    "];
export function gql(source: "\n      query AllTopics($pagination: CursorConnectionArgs!) {\n        adminDomain {\n          allTopics(pagination: $pagination) {\n            nodes {\n              ...IsolatedTopicFields\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      query AllTopics($pagination: CursorConnectionArgs!) {\n        adminDomain {\n          allTopics(pagination: $pagination) {\n            nodes {\n              ...IsolatedTopicFields\n            }\n            pageInfo {\n              hasNextPage\n            }\n          }\n        }\n      }\n    "];
export function gql(source: "\n        mutation UpdateTopic($input: UpdateTopic!) {\n          adminDomain {\n            updateTopic(input: $input) {\n              ...IsolatedTopicFields\n            }\n          }\n        }\n      "): (typeof documents)["\n        mutation UpdateTopic($input: UpdateTopic!) {\n          adminDomain {\n            updateTopic(input: $input) {\n              ...IsolatedTopicFields\n            }\n          }\n        }\n      "];
export function gql(source: "\n        query AllTopics($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allTopics(pagination: $pagination) {\n              nodes {\n                ...IsolatedTopicFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "): (typeof documents)["\n        query AllTopics($pagination: CursorConnectionArgs!) {\n          adminDomain {\n            allTopics(pagination: $pagination) {\n              nodes {\n                ...IsolatedTopicFields\n              }\n              pageInfo {\n                hasNextPage\n              }\n            }\n          }\n        }\n      "];
export function gql(source: "\n      query DomainFromContent($ids: [IntID!]!) {\n        content(ids: $ids) {\n          id\n          domain {\n            id\n          }\n        }\n      }\n    "): (typeof documents)["\n      query DomainFromContent($ids: [IntID!]!) {\n        content(ids: $ids) {\n          id\n          domain {\n            id\n          }\n        }\n      }\n    "];
export function gql(source: "\n      query DomainsFromProjects($ids: [IntID!]!) {\n        projects(ids: $ids) {\n          id\n          domains {\n            id\n          }\n        }\n      }\n    "): (typeof documents)["\n      query DomainsFromProjects($ids: [IntID!]!) {\n        projects(ids: $ids) {\n          id\n          domains {\n            id\n          }\n        }\n      }\n    "];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
