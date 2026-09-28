import type { ReactNode } from "react";
import type { ColumnDef, TableProps } from "@/types/table.types";

const formatValue = (value: unknown): ReactNode => {
    if (value == null) return "—";
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const renderCell = <T extends object>(col: ColumnDef<T>, row: T): ReactNode => {
    const value = row[col.dataKey];
    if (col.cell) {
        return col.cell({ row, value });
    }
    return formatValue(value);
};

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

const alignClass = { left: "text-left", center: "text-center", right: "text-right" } as const;

const toCss = (size: number | string) => (typeof size === "number" ? `${size}px` : size);

/** Sum of fixed widths + flexible columns' minWidths, so the table scrolls instead of squashing columns. */
const getTableMinWidth = <T,>(columns: ColumnDef<T>[]) => {
    const parts = columns
        .map((col) => (col.width != null ? toCss(col.width) : col.minWidth != null ? toCss(col.minWidth) : null))
        .filter((part): part is string => part != null);
    return parts.length ? `calc(${parts.join(" + ")})` : undefined;
};

const Table = <T extends object>(props: TableProps<T>) => {
    const { ariaLabel, columns, data } = props;

    console.log("tableColumnsMinWidth ,", getTableMinWidth(columns))
    return <div className="w-full overflow-x-auto">
        <table
            aria-label={ariaLabel}
            className="w-full table-fixed border-collapse text-sm"
            style={{ minWidth: getTableMinWidth(columns) }}
        >
            <colgroup>
                {
                    columns.map((col) => (
                        <col key={col.id} style={{ width: col.width != null ? toCss(col.width) : undefined }} />
                    ))
                }
            </colgroup>

            <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                    {
                        columns.map((col) => {
                            return <th
                                key={col.id}
                                scope="col"
                                className={cn(
                                    "truncate px-3 py-2 align-bottom text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400",
                                    alignClass[col.align ?? "left"],
                                    col.headerClassName,
                                )}
                            >
                                {col.header}
                            </th>
                        })
                    }
                </tr>
            </thead>

            <tbody>
                {
                    data.map((row, rowIndex) => {
                        const rowKey = "id" in row ? String(row.id) : rowIndex;
                        return <tr key={rowKey} className="border-b border-gray-100 last:border-0 dark:border-gray-900">
                            {
                                columns.map((col) => {
                                    return <td
                                        key={col.id}
                                        className={cn(
                                            "px-3 py-2 align-top text-gray-900 dark:text-gray-100",
                                            // `*:truncate` also truncates direct child elements a custom `cell` renders
                                            col.wrap ? "break-words" : "truncate *:truncate",
                                            alignClass[col.align ?? "left"],
                                            col.cellClassName,
                                        )}
                                    >
                                        {renderCell(col, row)}
                                    </td>
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
    </div>
}

export default Table;
