import type { CSSProperties, ReactNode } from "react";

type BaseColumn = {
    id: string;
    header: React.ReactNode;
    headerClassName?: string;
    /** For columns without `width`: the narrowest (px) it may get before the table scrolls sideways. */
    minWidth?: number;
    /** Let cell content wrap onto multiple lines instead of truncating with "…". */
    wrap?: boolean;
    align?: "left" | "center" | "right";
    sortable?: boolean;
} & (
    | {
          pinned?: undefined;
          /** Exact column width (number = px, or any CSS length like "20%"). Omit to let the column fill leftover space. */
          width?: number | string;
      }
    | {
          /** Sticks the column to that side when scrolling sideways. Pinned columns move to that edge of the table. */
          pinned: "left" | "right";
          /** Required in px: the sticky offsets of the pinned columns are sums of their widths */
          width: number;
      }
);

/** Where a pinned column sticks; see `getPinInfo` */
export type PinInfo = {
    /** `left` or `right` offset */
    style: CSSProperties;
    side: "left" | "right";
    /** The pinned column next to the scrolling ones, which draws the divider line */
    isEdge: boolean;
};

/** Pin info per column id; unpinned columns aren't in the map */
export type Pins = Map<string, PinInfo>;

/** A built-in column the table puts before the data columns: the row checkbox or the expand chevron */
export type LeadingColumn = { id: string; width: number };

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
    ariaLabel: string;
    /** Renders the pagination bar under the table and pages through `data` (see `manual` for server-side paging). */
    pagination?: PaginationProps;
    // sorting
    sorting?: SortingProps;

    // expansion
    // expandKey?: keyof T;
    renderExpandUI?: (props: { row: T }) => ReactNode;

    // for server side fetching props

    isLoading?: boolean;
    isError?: boolean;
    /** Shown in the error state; pass TanStack Query's `error` */
    error?: Error | null;
    onRetry?: () => void;
    /** Replaces the default error message + retry button */
    renderError?: (error: Error | null | undefined, retry?: () => void) => ReactNode;
    renderEmpty?: () => ReactNode;
    skeletonRows?: number;

    // stickyHeader

    stickyHeader?: boolean;
    maxHeight?: number | string;

    // selections
    selection?: SelectionProps;
    /** The id selection stores for a row, e.g. `(row) => row.id` */
    getRowId?: (row: T) => SelectedId;
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
    /**
     * Server-side paging: `data` is already the current page, so the table shows it as-is instead of
     * slicing it. Pair with `onChangeHandler` to fetch the new page, and pass the server's `total`.
     */
    manual?: boolean;
};

export type PaginationComponentProps = {
    pagination: BasePagination;
    onSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
    pageSizeOptions?: number[];
};

export type UsePaginationOptions = Omit<PaginationProps, "pageSizeOptions" | "manual">;

export type TableHeaderCellProps<T> = {
    column: ColumnDef<T>;
    pin?: PinInfo;
    onClickSort: (id: string) => void;
    sorts: Sort[];
};

export type TableSkeletonProps<T> = {
    columns: ColumnDef<T>[];
    leadingColumns: LeadingColumn[];
    pins: Pins;
    /** How many placeholder rows to show. Match the page size so the table doesn't jump when data arrives. */
    rows?: number;
};

export type TableRowProps<T, K extends keyof T> = {
    row: T;
    columns: ColumnDef<T>[];
    pins: Pins;
    renderExpansion?: () => void;
    // expandKey?: keyof T;
    renderExpandUI?: (props: { row: T }) => ReactNode;
    isEnableSelect?: boolean;
    onSelectCallback?: (id: SelectedId) => void;
    getRowId: (row: T) => SelectedId;
    isChecked?: boolean;
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
    manual?: boolean;
};

export type UseSortingOptions = SortingProps;

export type SelectedId = string | number;
export type SelectionProps = {
    selectedIds: SelectedId[];
    onChangeSelect?: (value: SelectedId[]) => void;
};

export type UseSelectionOptions = Partial<SelectionProps> & {
    /** Ids of the rows on the current page; select all / deselect all act on these */
    pageIds: SelectedId[];
};
export type UseTableOptions<T> = UsePaginationOptions &
    UseSortingOptions & {
        columns: ColumnDef<T>[];
        manualPagination?: boolean;
        manualSorting?: boolean;
        data: T[];
        getRowId?: (row: T) => SelectedId;
    } & Partial<SelectionProps>;
