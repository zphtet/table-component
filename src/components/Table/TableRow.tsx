import type { TableRowProps } from "@/types/table.types";
import { LuChevronRight } from "react-icons/lu";
import { alignClass, cn, renderCell } from "./utils";
import { useState } from "react";

export const TableRow = <T extends object, K extends keyof T>({
    row,
    columns,
    expandKey,
    renderExpandUI,
}: TableRowProps<T, K>) => {
    const [show, setShow] = useState(false);
    const hasExpand = expandKey != null && renderExpandUI != null;
    return (
        <>
            <tr
                className={cn(
                    "border-b border-gray-100 last:border-0 dark:border-gray-900",
                    // Drop the divider between a row and its expanded panel so they read as one block
                    show && "border-b-0",
                )}
            >
                {columns.map((col, colIndex) => {
                    const content = renderCell(col, row);
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
                            {hasExpand && colIndex === 0 ? (
                                <div className="flex items-start gap-1">
                                    <button
                                        type="button"
                                        aria-expanded={show}
                                        aria-label={show ? "Collapse row" : "Expand row"}
                                        onClick={() => setShow(!show)}
                                        className="-ml-1 shrink-0 cursor-pointer rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                    >
                                        <LuChevronRight
                                            aria-hidden
                                            className={cn("size-4 transition-transform", show && "rotate-90")}
                                        />
                                    </button>
                                    <div className="min-w-0 truncate">{content}</div>
                                </div>
                            ) : (
                                content
                            )}
                        </td>
                    );
                })}
            </tr>
            {hasExpand && show && (
                <tr className="border-b border-gray-100 bg-gray-50 last:border-0 dark:border-gray-900 dark:bg-gray-900/50">
                    <td colSpan={columns.length} className="px-3 py-3 text-gray-900 dark:text-gray-100">
                        {renderExpandUI({ value: row[expandKey] as T[K] })}
                    </td>
                </tr>
            )}
        </>
    );
};
