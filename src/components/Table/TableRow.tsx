import type { ColumnDef, SelectedId } from "./types";
import type { ReactNode } from "react";
import { LuChevronRight } from "react-icons/lu";
import {
    alignClass,
    cn,
    EXPAND_COLUMN_ID,
    focusRing,
    pinClass,
    pinnedBg,
    renderCell,
    SELECT_COLUMN_ID,
    type Pins,
} from "./utils";
import { useState } from "react";

type TableRowProps<T> = {
    row: T;
    columns: ColumnDef<T>[];
    /** Every column, the built-in ones included; the expand panel spans them all */
    columnCount: number;
    pins: Pins;
    renderExpandedFn?: (args: { row: T }) => ReactNode;
    isSelectable?: boolean;
    toggleSelectFn?: (id: SelectedId) => void;
    getRowIdFn: (row: T) => SelectedId;
    isSelected?: boolean;
    isExpanded?: boolean;
    toggleExpandFn?: (id: SelectedId) => void;
};

export const TableRow = <T extends object>({
    row,
    columns,
    columnCount,
    pins,
    renderExpandedFn,
    toggleSelectFn,
    isSelectable,
    getRowIdFn,
    isSelected,
    isExpanded = false,
    toggleExpandFn,
}: TableRowProps<T>) => {
    const rowId = getRowIdFn(row);
    // Render the panel on first open, then keep it mounted so closing can animate
    const [hasExpanded, setHasExpanded] = useState(isExpanded);
    if (isExpanded && !hasExpanded) setHasExpanded(true);
    const hasExpand = Boolean(renderExpandedFn);

    // Pinned cells need a solid background that follows the row's hover / expanded color
    const pinnedCellBg = isExpanded ? pinnedBg.tint : cn(pinnedBg.body, pinnedBg.hoverTint);
    const selectPin = pins.get(SELECT_COLUMN_ID);
    const expandPin = pins.get(EXPAND_COLUMN_ID);

    return (
        <>
            <tr
                className={cn(

                    "group/row border-t border-gray-100 transition-colors first:border-t-0 hover:bg-gray-50/80 dark:border-gray-800/70 dark:hover:bg-gray-900/40",
                    isExpanded && "bg-gray-50/80 dark:bg-gray-900/40",
                )}
            >
                {isSelectable && (
                    <td
                        style={selectPin?.style}
                        className={cn(
                            "px-0 text-center align-middle",
                            pinClass(selectPin),
                            selectPin && pinnedCellBg,
                        )}
                    >
                        <input
                            // onChange, not onClick: React expects it on a controlled (`checked`) input
                            onChange={() => toggleSelectFn?.(rowId)}
                            type="checkbox"
                            aria-label={`Select ${rowId}`}
                            checked={isSelected}
                        />
                    </td>
                )}

                {hasExpand && (
                    <td
                        style={expandPin?.style}
                        className={cn(
                            "px-0 text-center align-middle",
                            pinClass(expandPin),
                            expandPin && pinnedCellBg,
                        )}
                    >
                        <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? `Collapse ${rowId}` : `Expand ${rowId}`}
                            onClick={() => toggleExpandFn?.(rowId)}
                            className={cn(
                                "inline-flex size-6 cursor-pointer items-center justify-center rounded-md align-middle text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                focusRing,
                            )}
                        >
                            <LuChevronRight
                                aria-hidden
                                className={cn(
                                    "size-4 transition-transform duration-200",
                                    isExpanded && "rotate-90",
                                )}
                            />
                        </button>
                    </td>
                )}

                {columns.map((col, colIndex) => {
                    const content = renderCell(col, row);
                    const pin = pins.get(col.id);
                    return (
                        <td
                            key={col.id}
                            style={pin?.style}
                            className={cn(
                                "px-4 py-3 align-middle text-gray-700 dark:text-gray-300",
                                pinClass(pin),
                                pin && pinnedCellBg,
                                colIndex === 0 && "text-gray-900 dark:text-gray-100",
                                // `*:truncate` also truncates direct child elements a custom `cell` renders
                                col.isWrapped ? "break-words" : "truncate *:truncate",
                                alignClass[col.align ?? "left"],
                                col.cellClassName,
                            )}
                        >
                            {content}
                        </td>
                    );
                })}
            </tr>
            {hasExpand && (
                <tr aria-hidden={!isExpanded}>
                    <td colSpan={columnCount} className="p-0">

                        <div
                            className={cn(
                                "sticky left-0 grid w-[100cqw] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                            )}
                        >
                            <div className="min-h-0 overflow-hidden" inert={!isExpanded}>
                                <div
                                    className={cn(
                                        "bg-gray-50/80 pt-1 pr-4 pb-4 pl-10 text-gray-900 transition-opacity duration-300 dark:bg-gray-900/40 dark:text-gray-100",
                                        isExpanded ? "opacity-100" : "opacity-0",
                                    )}
                                >
                                    {hasExpanded && renderExpandedFn?.({ row })}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
