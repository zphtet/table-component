import type { ReactNode } from "react";

type BaseColumn = {
    id: string;
    header: React.ReactNode;
    headerClassName?: string;
    /** Exact column width (number = px, or any CSS length like "20%"). Omit to let the column fill leftover space. */
    width?: number | string;
    /** For columns without `width`: the narrowest (px) it may get before the table scrolls sideways. */
    minWidth?: number;
    /** Let cell content wrap onto multiple lines instead of truncating with "…". */
    wrap?: boolean;
    /** Sticks the column to that side when scrolling sideways. Needs `width` to line up. */
    pinned?: "left" | "right";
    align?: "left" | "center" | "right";
    sortable?: boolean;
};

export type ColumnDef<T> = {
    [K in keyof T]-?: BaseColumn & {
        dataKey: K;
        cell?: (props: { row: T; value: T[K] }) => ReactNode;
        cellClassName?: string;
    };
}[keyof T];

export type TableProps<T, K extends keyof T> = {
    columns: ColumnDef<T>[];
    data: T[];
    ariaLabel?: string;
    /** Renders the pagination bar under the table. The table shows `data` as-is, so pass only the current page's rows. */
    pagination?: PaginationProps;
    // sorting
    sorting?: SortingProps;

    // expansion
    expandKey?: keyof T;
    renderExpandUI?: (props: { value: T[K] }) => ReactNode;
};

export type BasePagination = {
    page: number;
    size: number;
    /** Total number of rows across all pages */
    total: number;
};

export type PaginationProps = {
    pagination: BasePagination;
    onChangeHandler?: (value: BasePagination) => void;
    pageSizeOptions?: number[];
};

export type PaginationComponentProps = {
    pagination: BasePagination;
    onSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
    pageSizeOptions?: number[];
};

export type UsePaginationOptions = Omit<PaginationProps, "pageSizeOptions">;

export type TableHeaderCellProps<T> = {
    column: ColumnDef<T>;
    onClickSort: (id: string) => void;
    sorts: Sort[];
};

export type TableRowProps<T, K extends keyof T> = {
    row: T;
    columns: ColumnDef<T>[];
    renderExpansion?: () => void;
    expandKey?: keyof T;
    renderExpandUI?: (props: { value: T[K] }) => ReactNode;
};

// sorting types

export type Sort = {
    columnId: string;
    direction: "asc" | "desc";
};
export type SortingProps = {
    sorts: Sort[];
    onChangeSort?: (sort: Sort[]) => void;
    isMultiple?: boolean;
};

export type UseSortingOptions = SortingProps;

export type UseTableOptions<T> = UsePaginationOptions &
    UseSortingOptions & {
        columns: ColumnDef<T>[];
        data: T[];
    };
