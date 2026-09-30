import type { ReactNode } from "react";
import type { ColumnDef, LeadingColumn, PinInfo, Pins, Sort } from "@/types/table.types";

const formatValue = (value: unknown): ReactNode => {
    if (value == null) return "—";
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

export const renderCell = <T extends object>(col: ColumnDef<T>, row: T): ReactNode => {
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

/** Compares two cell values ascending: numbers and dates by value, strings naturally ("Room 2" < "Room 10"), case-insensitive. */
const compareValues = (a: unknown, b: unknown) => {
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === "number" && typeof b === "number") return a - b;
    if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Sorts a copy of `rows` by each sort in order: the first sort wins, later ones break ties.
 * Empty values (null/undefined) always go last, whatever the direction.
 */
export const sortRows = <T extends object>(rows: T[], sorts: Sort[], columns: ColumnDef<T>[]) => {
    const active = sorts
        .map((sort) => ({ sort, col: columns.find((col) => col.id === sort.columnId) }))
        .filter((item): item is { sort: Sort; col: ColumnDef<T> } => item.col != null);
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
export const SELECT_COLUMN_WIDTH = 44;
export const EXPAND_COLUMN_ID = "__expand";
export const EXPAND_COLUMN_WIDTH = 40;

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

/**
 * Solid backgrounds for pinned cells, so scrolled columns don't show through. They match the
 * translucent row colors as they look over the table's own background.
 */
export const pinnedBg = {
    header: "bg-gray-50 dark:bg-gray-900",
    body: "bg-white dark:bg-gray-950",
    // Row hover / expanded: gray-50/80 over white, gray-900/40 over gray-950
    tint: "bg-gray-50 dark:bg-[color-mix(in_oklab,var(--color-gray-900)_40%,var(--color-gray-950))]",
    hoverTint:
        "group-hover/row:bg-gray-50 dark:group-hover/row:bg-[color-mix(in_oklab,var(--color-gray-900)_40%,var(--color-gray-950))]",
} as const;
