import type {
    ColumnDef,
    ExpansionProps,
    PaginationProps,
    SelectedId,
    SelectionProps,
    SortingProps,
} from "../types";
import { useDeferredValue, useMemo } from "react";
import { sortRows } from "../utils";
import { useExpansion } from "./useExpansion";
import { usePagination } from "./usePagination";
import { useSorting } from "./useSorting";
import { useSelection } from "./useSelection";

type UseTableOptions<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    pagination?: PaginationProps;
    sorting?: SortingProps;
    selection?: SelectionProps;
    expansion?: ExpansionProps;
    getRowIdFn?: (row: T) => SelectedId;
};

export const useTable = <T extends object>(props: UseTableOptions<T>) => {
    const {
        columns,
        data,
        pagination = {},
        sorting = {},
        selection = {},
        expansion = {},
        getRowIdFn,
    } = props;

    const { pagination: paginationState, setPage, setSize } = usePagination(pagination);
    const { sorts, toggleSort } = useSorting(sorting);
    const rowSorts = useDeferredValue(sorts);
    const isSorting = sorts !== rowSorts;

    const { page, size } = paginationState;
    const start = (page - 1) * size;

    const sortedRows = useMemo(
        () => (sorting.isManual ? data : sortRows(data, rowSorts, columns)),
        [data, rowSorts, columns, sorting.isManual],
    );

    const rows = pagination.isManual ? sortedRows : sortedRows.slice(start, start + size);

    // After `rows`: select all / deselect all act on the rows of the current page
    const pageIds = getRowIdFn ? rows.map(getRowIdFn) : [];
    const selectionState = useSelection({ ...selection, pageIds });
    const expansionState = useExpansion(expansion);

    return {
        rows,
        pagination: paginationState,
        setPage,
        setSize,
        sorts,
        toggleSort,
        isSorting,
        ...selectionState,
        ...expansionState,
    };
};
