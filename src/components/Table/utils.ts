import type { CSSProperties, ReactNode } from "react";
import type { BasePagination, ColumnDef, ComputedColumn, DataColumn, Sort } from "./types";

export type PinInfo = {
    style: CSSProperties;
    side: "left" | "right";
    isEdge: boolean;
};

export type Pins = Map<string, PinInfo>;

/** A built-in column the table puts before the data columns: the row checkbox or the expand chevron */
export type LeadingColumn = { id: string; width: number };

export const DEFAULT_PAGINATION: BasePagination = { page: 1, size: 10, total: 0 };

const formatValue = (value: unknown): ReactNode => {
    if (value == null) return "—";
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const isComputedColumn = <T>(col: ColumnDef<T>): col is ComputedColumn<T> =>
    col.dataKey === undefined;

export const renderCell = <T extends object>(col: ColumnDef<T>, row: T): ReactNode => {
    if (isComputedColumn(col)) return col.cell({ row });
    const value = row[col.dataKey];
    if (col.cell) {
        return col.cell({ row, value });
    }
    return formatValue(value);
};

export const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

export const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
} as const;

export const toCss = (size: number | string) => (typeof size === "number" ? `${size}px` : size);

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Compares two cell values ascending: numbers and dates by value, strings naturally ("Room 2" < "Room 10"), case-insensitive. */
const compareValues = (a: unknown, b: unknown) => {
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === "number" && typeof b === "number") return a - b;
    if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
    return collator.compare(String(a), String(b));
};

export const sortRows = <T extends object>(rows: T[], sorts: Sort[], columns: ColumnDef<T>[]) => {
    const active = sorts
        .map((sort) => ({ sort, col: columns.find((col) => col.id === sort.columnId) }))
        // Computed columns have no field to compare, so client-side sorting skips them
        .filter(
            (item): item is { sort: Sort; col: DataColumn<T> } =>
                item.col != null && !isComputedColumn(item.col),
        );
    if (!active.length) return rows;

    return [...rows].sort((rowA, rowB) => {
        for (const { sort, col } of active) {
            const a = rowA[col.dataKey];
            const b = rowB[col.dataKey];
            if (a == null || b == null) {
                if (a == null && b == null) continue;
                return a == null ? 1 : -1;
            }
            const result = compareValues(a, b);
            if (result !== 0) return sort.direction === "asc" ? result : -result;
        }
        return 0;
    });
};

/** Keyboard focus ring. Inset, so it isn't clipped inside truncating (overflow-hidden) cells. */
export const focusRing =
    "outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500";

/** Left-pinned first, right-pinned last; order within each group is kept */
export const orderColumns = <T>(columns: ColumnDef<T>[]) => [
    ...columns.filter((col) => col.pinned === "left"),
    ...columns.filter((col) => !col.pinned),
    ...columns.filter((col) => col.pinned === "right"),
];

// Built-in columns before the data columns. The ids can't clash with a data column's id.
export const SELECT_COLUMN_ID = "__select";
// Just wider than the checkbox (16px) and the chevron button (24px)
export const SELECT_COLUMN_WIDTH = 32;
export const EXPAND_COLUMN_ID = "__expand";
export const EXPAND_COLUMN_WIDTH = 28;

/** Offset per pinned column = widths of the pinned columns between it and its edge */
export const getPinInfo = <T>(columns: ColumnDef<T>[], leadingColumns: LeadingColumn[] = []) => {
    const info: Pins = new Map();
    const left = columns.filter((col) => col.pinned === "left");
    const right = columns.filter((col) => col.pinned === "right").reverse();

    let offset = 0;
    // With left-pinned data columns, the built-in columns before them stick too; otherwise the
    // checkbox and chevron would scroll away underneath the pinned columns
    if (left.length) {
        leadingColumns.forEach((col) => {
            info.set(col.id, { style: { left: offset }, side: "left", isEdge: false });
            offset += col.width;
        });
    }
    left.forEach((col, i) => {
        info.set(col.id, { style: { left: offset }, side: "left", isEdge: i === left.length - 1 });
        offset += col.width as number;
    });
    offset = 0;
    right.forEach((col, i) => {
        info.set(col.id, {
            style: { right: offset },
            side: "right",
            isEdge: i === right.length - 1,
        });
        offset += col.width as number;
    });
    return info;
};

/** Sticky + a divider line on the edge that faces the scrolling columns */
export const pinClass = (pin: PinInfo | undefined) =>
    pin &&
    cn(
        "sticky z-[1]",
        pin.isEdge &&
            pin.side === "left" &&
            "shadow-[inset_-1px_0_0_var(--color-gray-200)] dark:shadow-[inset_-1px_0_0_var(--color-gray-800)]",
        pin.isEdge &&
            pin.side === "right" &&
            "shadow-[inset_1px_0_0_var(--color-gray-200)] dark:shadow-[inset_1px_0_0_var(--color-gray-800)]",
    );

export const pinnedBg = {
    header: "bg-gray-50 dark:bg-gray-900",
    body: "bg-white dark:bg-gray-950",
    // Row hover / expanded: gray-50/80 over white, gray-900/40 over gray-950
    tint: "bg-gray-50 dark:bg-[color-mix(in_oklab,var(--color-gray-900)_40%,var(--color-gray-950))]",
    hoverTint:
        "group-hover/row:bg-gray-50 dark:group-hover/row:bg-[color-mix(in_oklab,var(--color-gray-900)_40%,var(--color-gray-950))]",
} as const;
