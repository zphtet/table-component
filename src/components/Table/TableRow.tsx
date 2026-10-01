import type { TableRowProps } from "@/types/table.types";
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
} from "./utils";
import { useState } from "react";

export const TableRow = <T extends object, K extends keyof T>({
    row,
    columns,
    pins,
    renderExpandUI,
    onSelectCallback,
    isEnableSelect,
    getRowId,
    isChecked,
}: TableRowProps<T, K>) => {
    const [show, setShow] = useState(false);
    // Render the panel on first open, then keep it mounted so closing can animate
    const [hasOpened, setHasOpened] = useState(false);
    const hasExpand = Boolean(renderExpandUI);

    const toggle = () => {
        setShow((prev) => !prev);
        setHasOpened(true);
    };

    // Pinned cells need a solid background that follows the row's hover / expanded color
    const pinnedCellBg = show ? pinnedBg.tint : cn(pinnedBg.body, pinnedBg.hoverTint);
    const selectPin = pins.get(SELECT_COLUMN_ID);
    const expandPin = pins.get(EXPAND_COLUMN_ID);
    // The expand panel spans every column, the built-in ones included
    const columnCount = columns.length + (isEnableSelect ? 1 : 0) + (hasExpand ? 1 : 0);

    return (
        <>
            <tr
                className={cn(

                    "group/row border-t border-gray-100 transition-colors first:border-t-0 hover:bg-gray-50/80 dark:border-gray-800/70 dark:hover:bg-gray-900/40",
                    show && "bg-gray-50/80 dark:bg-gray-900/40",
                )}
            >
                {isEnableSelect && (
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
                            onChange={() => onSelectCallback?.(getRowId(row))}
                            type="checkbox"
                            aria-label={`Select ${getRowId(row)}`}
                            checked={isChecked}
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
                            aria-expanded={show}
                            aria-label={show ? `Collapse ${getRowId(row)}` : `Expand ${getRowId(row)}`}
                            onClick={toggle}
                            className={cn(
                                "inline-flex size-6 cursor-pointer items-center justify-center rounded-md align-middle text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                focusRing,
                            )}
                        >
                            <LuChevronRight
                                aria-hidden
                                className={cn(
                                    "size-4 transition-transform duration-200",
                                    show && "rotate-90",
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
                                col.wrap ? "break-words" : "truncate *:truncate",
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
                <tr aria-hidden={!show}>
                    <td colSpan={columnCount} className="p-0">

                        <div
                            className={cn(
                                "sticky left-0 grid w-[100cqw] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                                show ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                            )}
                        >
                            <div className="min-h-0 overflow-hidden" inert={!show}>
                                <div
                                    className={cn(
                                        "bg-gray-50/80 pt-1 pr-4 pb-4 pl-10 text-gray-900 transition-opacity duration-300 dark:bg-gray-900/40 dark:text-gray-100",
                                        show ? "opacity-100" : "opacity-0",
                                    )}
                                >
                                    {hasOpened && renderExpandUI?.({ row })}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
