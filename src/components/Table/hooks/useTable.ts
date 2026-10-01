import type {
    ColumnDef,
    ExpansionProps,
    PaginationProps,
    SelectedId,
    SelectionProps,
    SortingProps,
} from "../types";
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

    const { page, size } = paginationState;
    const start = (page - 1) * size;
    // Each flag only skips its own step, so sorting and paging can each run on the client or the server.
    // Server-side sorting: `data` already arrives in order, so sorting it again could reorder it wrongly
    // Client-side: sort the full data first, then slice, so sorting applies across all pages
    const sortedRows = sorting.isManual ? data : sortRows(data, sorts, columns);
    // Server-side paging: `data` is already the current page, so slicing it again would empty page 2+
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
        ...selectionState,
        ...expansionState,
    };
};
