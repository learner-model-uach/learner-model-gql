import { useLatestRef } from "@chakra-ui/react";
import {
  AdminKCsFilter,
  AllKCsBaseQueryVariables,
  getKey,
  gql,
  useGQLInfiniteQuery,
} from "graph";
import { keyBy, uniqBy } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useImmer } from "use-immer";
import {
  AsyncSelectProps,
  OptionValue,
  Select,
  SelectRefType,
} from "../components/AsyncSelect";

export const AllKCsBaseDoc = gql(/* GraphQL */ `
  query AllKCsBase(
    $pagination: CursorConnectionArgs!
    $filters: AdminKCsFilter!
  ) {
    adminDomain {
      allKCs(pagination: $pagination, filters: $filters) {
        nodes {
          id
          code
          label
        }
        ...Pagination
      }
    }
  }
`);

export interface KCsBaseOptions {
  initialKcsFilter: AdminKCsFilter;
  limit: number;
}

export const useKCsBase = ({ initialKcsFilter, limit }: KCsBaseOptions) => {
  const [kcsFilter, produceKCsFilter] =
    useImmer<AdminKCsFilter>(initialKcsFilter);
  const { hasNextPage, fetchNextPage, isFetching, data, isLoading } =
    useGQLInfiniteQuery(
      AllKCsBaseDoc,
      (pageParam) => {
        return {
          pagination: {
            first: 50,
            after: pageParam,
          },
          filters: kcsFilter,
        };
      },
      {
        getNextPageParam({
          adminDomain: {
            allKCs: {
              pageInfo: { hasNextPage, endCursor },
            },
          },
        }) {
          return hasNextPage ? endCursor : null;
        },
        staleTime: 5000,
        queryKey: getKey(AllKCsBaseDoc, {
          filters: kcsFilter,
        } as AllKCsBaseQueryVariables),
      }
    );

  const kcs = useMemo(() => {
    const kcs: Record<
      string,
      {
        id: string;
        code: string;
        label: string;
      }
    > = {};

    for (const kc of data?.pages.flatMap((v) => v.adminDomain.allKCs.nodes) ||
      []) {
      kcs[kc.id] = kc;
    }

    return Object.values(kcs);
  }, [data, hasNextPage]);

  const kcsAmount = useLatestRef(kcs.length);

  useEffect(() => {
    if (isFetching) return;

    if (hasNextPage && kcsAmount.current < limit) {
      fetchNextPage().catch(console.error);
    }
  }, [hasNextPage, fetchNextPage, isFetching, kcsAmount, limit]);

  const asOptions = useMemo(() => {
    return kcs.map(({ id, label, code }) => {
      return {
        label: kcOptionLabel({ label, code }),
        value: id,
      };
    });
  }, [kcs]);

  return {
    kcs,
    isFetching,
    isLoading,
    asOptions,
    kcsFilter,
    produceKCsFilter,
  };
};

export const kcOptionLabel = ({
  code,
  label,
}: {
  code: string;
  label: string;
}) => `${code} | ${label}`;

export const useSelectSingleKC = ({
  state,
  selectProps,
  kcsBase,
}: {
  state?: [OptionValue | null, (value: OptionValue | null) => void];
  selectProps?: Partial<AsyncSelectProps>;
  kcsBase: KCsBaseOptions;
}) => {
  const { isFetching, isLoading, asOptions, kcsFilter, produceKCsFilter } =
    useKCsBase(kcsBase);

  const selectRef = useRef<SelectRefType>(null);

  const [selectedKC, setSelectedKC] =
    state || useState<OptionValue | null>(null);

  const selectSingleKCComponent = useMemo(() => {
    return (
      <Select
        isLoading={isFetching}
        options={asOptions}
        onChange={(selected) => {
          setSelectedKC(selected || null);
        }}
        value={selectedKC}
        placeholder="Search a KC"
        selectRef={selectRef}
        inputValue={kcsFilter.textSearch || ""}
        onInputChange={(v) => {
          produceKCsFilter((draft) => {
            draft.textSearch = v;
          });
        }}
        {...selectProps}
      />
    );
  }, [
    isLoading,
    isFetching,
    asOptions,
    selectedKC,
    selectProps,
    kcsFilter,
    produceKCsFilter,
  ]);

  return {
    selectedKC,
    setSelectedKC,
    selectSingleKCComponent,
    kcsFilter,
    produceKCsFilter,
    selectRef,
  };
};

export const useSelectMultiKCs = ({
  state,
  selectProps,
  kcsBase,
}: {
  state?: [OptionValue[], (value: OptionValue[]) => void];
  selectProps?: Partial<AsyncSelectProps>;
  kcsBase: KCsBaseOptions;
}) => {
  const { isFetching, isLoading, asOptions, kcsFilter, produceKCsFilter, kcs } =
    useKCsBase(kcsBase);

  const selectRef = useRef<SelectRefType>(null);

  const [selectedKCs, setSelectedKCs] = state || useState<OptionValue[]>([]);

  const optionsByCode = useMemo(() => {
    const kcsById = keyBy(kcs, (v) => v.id);

    const accOptionsByCode: Record<string, (typeof asOptions)[number]> = {};

    for (const option of asOptions) {
      const kc = kcsById[option.value];

      if (!kc) continue;

      accOptionsByCode[kc.code.toLowerCase()] = option;
    }

    return accOptionsByCode;
  }, [asOptions, kcs]);

  const selectMultiKCComponent = useMemo(() => {
    return (
      <Select
        isLoading={isFetching}
        options={asOptions}
        onChange={(selected) => {
          setSelectedKCs(selected || []);
        }}
        isMulti
        value={selectedKCs}
        placeholder="Search a KC"
        selectRef={selectRef}
        inputValue={kcsFilter.textSearch || ""}
        onInputChange={(newInputValue) => {
          if (newInputValue.endsWith(" ")) {
            const inputSplit = newInputValue.split(/,( )?/g);

            const optionsToAdd: OptionValue[] = [];

            for (const inputValue of inputSplit) {
              if (!inputValue) continue;

              const optionFromCodeLowercase =
                optionsByCode[inputValue.trim().toLowerCase()];

              if (!optionFromCodeLowercase) continue;

              optionsToAdd.push(optionFromCodeLowercase);
            }

            if (optionsToAdd.length) {
              setSelectedKCs(
                uniqBy([...selectedKCs, ...optionsToAdd], (v) => v.value)
              );
            }
          }

          produceKCsFilter((draft) => {
            draft.textSearch = newInputValue;
          });
        }}
        {...selectProps}
      />
    );
  }, [
    isLoading,
    isFetching,
    asOptions,
    selectedKCs,
    selectProps,
    kcsFilter,
    produceKCsFilter,
    optionsByCode,
  ]);

  return {
    selectedKCs,
    setSelectedKCs,
    selectMultiKCComponent,
    kcsFilter,
    produceKCsFilter,
    selectRef,
    isFetching,
    isLoading,
  };
};
