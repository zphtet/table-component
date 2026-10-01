import type { UseTableOptions } from "@/types/table.types";
import { sortRows } from "../utils";
import { usePagination } from "./usePagination";
import { useSorting } from "./useSorting";
import { useSelection } from "./useSelection";

export const useTable = <T extends object>(props: UseTableOptions<T>) => {
    const {
        columns,
        data,
        pagination,
        onChangeHandler,
        manualPagination = false,
        manualSorting = false,
        sorts,
        onChangeSort,
        isMultiple,
        selectedIds,
        onChangeSelect,
        getRowId,
    } = props;

    const {
        pagination: paginationState,
        setPage,
        setSize,
    } = usePagination({
        pagination,
        onChangeHandler,
    });
    const { sorting, onClickSort } = useSorting({ sorts, onChangeSort, isMultiple });

    const { page, size } = paginationState;
    const start = (page - 1) * size;
    // Each flag only skips its own step, so sorting and paging can each run on the client or the server.
    // Server-side sorting: `data` already arrives in order, so sorting it again could reorder it wrongly
    // Client-side: sort the full data first, then slice, so sorting applies across all pages
    const sortedRows = manualSorting ? data : sortRows(data, sorting ?? [], columns);
    // Server-side paging: `data` is already the current page, so slicing it again would empty page 2+
    const rows = manualPagination ? sortedRows : sortedRows.slice(start, start + size);

    // After `rows`: select all / deselect all act on the rows of the current page
    const pageIds = getRowId ? rows.map(getRowId) : [];
    const selection = useSelection({ selectedIds, onChangeSelect, pageIds });

    return {
        rows,
        pagination: paginationState,
        setPage,
        setSize,
        sorting,
        onClickSort,
        ...selection,
    };
};
