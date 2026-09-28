import type { ReactNode } from "react";
import type { ColumnDef, Sort } from "@/types/table.types";

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

export const alignClass = { left: "text-left", center: "text-center", right: "text-right" } as const;

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
