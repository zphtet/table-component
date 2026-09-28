import type { TableRowProps } from "@/types/table.types";
import { alignClass, cn, renderCell } from "./utils";

export const TableRow = <T extends object>({ row, columns }: TableRowProps<T>) => {
    return (
        <tr className="border-b border-gray-100 last:border-0 dark:border-gray-900">
            {columns.map((col) => {
                return (
                    <td
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
                );
            })}
        </tr>
    );
};
