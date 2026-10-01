import type { ReactNode } from "react";

type BaseColumn = {
    id: string;
    header: React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;

    minWidth?: number;
    isWrapped?: boolean;
    align?: "left" | "center" | "right";
    isSortable?: boolean;
} & (
    | {
          pinned?: undefined;
          width?: number | string;
      }
    | {
          pinned: "left" | "right";
          width: number;
      }
);

/** Shows one field of the row */
export type DataColumn<T> = {
    [K in keyof T]-?: BaseColumn & {
        dataKey: K;
        cell?: (props: { row: T; value: T[K] }) => ReactNode;
    };
}[keyof T];

/** Has no field to read (e.g. row actions), so it must render its own cell */
export type ComputedColumn<T> = BaseColumn & {
    dataKey?: undefined;
    cell: (props: { row: T }) => ReactNode;
};

export type ColumnDef<T> = DataColumn<T> | ComputedColumn<T>;

export type TableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    ariaLabel: string;
    // pagination
    pagination?: PaginationProps;
    // sorting
    sorting?: SortingProps;
    // expansion
    expansion?: ExpansionProps;
    renderExpandedFn?: (args: { row: T }) => ReactNode;

    // for server side fetching props
    isLoading?: boolean;
    isError?: boolean;
    //    error state
    error?: Error | null;
    retryFn?: () => void;
    /** Replaces the default error message + retry button */
    renderErrorFn?: (args: { error: Error | null | undefined; retryFn?: () => void }) => ReactNode;
    renderEmptyFn?: () => ReactNode;
    /** Defaults to the page size, so the table doesn't jump when data arrives */
    skeletonRows?: number;

    // sticky header
    isHeaderSticky?: boolean;
    maxHeight?: number | string;
    // selections
    selection?: SelectionProps;
    getRowIdFn: (row: T) => SelectedId;
};

export type BasePagination = {
    page: number;
    size: number;
    /** Total number of rows across all pages */
    total: number;
};

/**
 * State that either the table owns or the parent controls; the same shape for pagination, sorting, selection and expansion.
 * With `changeFn` the parent controls it and the table shows `value`; without, `value` is only the starting value.
 */
export type Controlled<V> = {
    value?: V;
    changeFn?: (value: V) => void;
};

export type PaginationProps = Controlled<BasePagination> & {
    pageSizeOptions?: number[];
    isManual?: boolean;
};

// sorting types

export type Sort = {
    columnId: string;
    direction: "asc" | "desc";
};
export type SortingProps = Controlled<Sort[]> & {
    isMultiSort?: boolean;
    isManual?: boolean;
};

export type SelectedId = string | number;
export type SelectionProps = Controlled<SelectedId[]>;

/** Ids of the expanded rows */
export type ExpansionProps = Controlled<SelectedId[]>;
