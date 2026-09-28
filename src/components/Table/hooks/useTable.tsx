import type { UseTableOptions } from "@/types/table.types";
import { sortRows } from "../utils";
import { usePagination } from "./usePagination";
import { useSorting } from "./useSorting";

export const useTable = <T extends object>(props: UseTableOptions<T>) => {
    const {
        columns,
        data,
        pagination,
        onChangeHandler,
        manualPagination = false,
        sorts,
        onChangeSort,
        isMultiple,
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
    // Sort the full data first, then slice, so sorting applies across all pages
    const sortedRows = sortRows(data, sorting ?? [], columns);
    // Server-side paging: `data` is already the current page, so slicing it again would empty page 2+
    const rows = manualPagination ? sortedRows : sortedRows.slice(start, start + size);

    return {
        rows,
        pagination: paginationState,
        setPage,
        setSize,
        sorting,
        onClickSort,
    };
};
