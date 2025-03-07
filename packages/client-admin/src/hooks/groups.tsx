import { AllGroupsBaseQuery, gql, useGQLInfiniteQuery } from "graph";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AsyncSelect, OptionValue } from "../components/AsyncSelect";

export type GroupInfo =
  AllGroupsBaseQuery["adminUsers"]["allGroups"]["nodes"][number];

export const useGroupsBase = () => {
  const { hasNextPage, fetchNextPage, isFetching, data, isLoading } =
    useGQLInfiniteQuery(
      gql(/* GraphQL */ `
        query AllGroupsBase($pagination: CursorConnectionArgs!) {
          adminUsers {
            allGroups(pagination: $pagination) {
              nodes {
                id
                code
                label
              }
              ...Pagination
            }
          }
        }
      `),
      (after) => {
        return {
          pagination: {
            first: 50,
            after,
          },
        };
      },
      {
        getNextPageParam({
          adminUsers: {
            allGroups: {
              pageInfo: { hasNextPage, endCursor },
            },
          },
        }) {
          return hasNextPage ? endCursor : null;
        },
        staleTime: 5000,
      }
    );

  useEffect(() => {
    if (isFetching) return;

    if (hasNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [hasNextPage, fetchNextPage, isFetching]);

  const groups = useMemo(() => {
    const groups: Record<string, GroupInfo> = {};

    for (const group of data?.pages.flatMap(
      (v) => v.adminUsers.allGroups.nodes
    ) || []) {
      groups[group.id] = group;
    }

    return Object.values(groups);
  }, [data]);

  const asOptions = useMemo(() => {
    return groups.map(({ id, label, code }) => {
      return {
        label: groupOptionLabel({ code, label }),
        value: id,
      };
    });
  }, [groups]);

  const filteredOptions = useCallback(
    async (input: string) => {
      return input
        ? asOptions.filter((v) => v.label.includes(input))
        : asOptions;
    },
    [asOptions]
  );

  return {
    groups,
    isFetching,
    isLoading,
    asOptions,
    filteredOptions,
  };
};

export const groupOptionLabel = ({
  code,
  label,
}: {
  code: string;
  label: string;
}) => `${code} | ${label}`;

export const useSelectSingleGroup = () => {
  const { isFetching, isLoading, filteredOptions, asOptions } = useGroupsBase();

  const [selectedGroup, setSelectedGroup] = useState<OptionValue | null>(null);

  const selectSingleGroupComponent = useMemo(() => {
    return (
      <AsyncSelect
        key={isLoading ? -1 : asOptions.length}
        isLoading={isFetching}
        loadOptions={filteredOptions}
        onChange={(selected) => {
          setSelectedGroup(selected || null);
        }}
        value={selectedGroup}
        placeholder="Search a group"
      />
    );
  }, [filteredOptions, isLoading, isFetching, asOptions, selectedGroup]);

  return {
    selectedGroup,
    selectSingleGroupComponent,
    setSelectedGroup,
  };
};

export const useSelectMultiGroups = () => {
  const { isFetching, isLoading, filteredOptions, asOptions } = useGroupsBase();

  const [selectedGroups, setSelectedGroups] = useState<OptionValue[]>([]);

  const selectMultiGroupComponent = useMemo(() => {
    return (
      <AsyncSelect
        key={isLoading ? -1 : asOptions.length}
        isLoading={isFetching}
        loadOptions={filteredOptions}
        onChange={(selected) => {
          setSelectedGroups(selected || []);
        }}
        isMulti
        value={selectedGroups}
        placeholder="Search a group"
      />
    );
  }, [filteredOptions, isLoading, isFetching, asOptions, selectedGroups]);

  return {
    selectedGroups,
    selectMultiGroupComponent,
    setSelectedGroups,
  };
};
