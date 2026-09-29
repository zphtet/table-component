import type { TableRowProps } from "@/types/table.types";
import { LuChevronRight } from "react-icons/lu";
import { alignClass, cn, focusRing, pinClass, pinnedBg, renderCell } from "./utils";
import { useState } from "react";

export const TableRow = <T extends object, K extends keyof T>({
    row,
    columns,
    pins,
    expandKey,
    renderExpandUI,
    onSelectCallback,
    isEnableSelect,
    getRowId,
    isChecked,
}: TableRowProps<T, K>) => {
    const [show, setShow] = useState(false);
    // Render the panel on first open, then keep it mounted so closing can animate
    const [hasOpened, setHasOpened] = useState(false);
    const hasExpand = expandKey != null && renderExpandUI != null;

    const toggle = () => {
        setShow((prev) => !prev);
        setHasOpened(true);
    };

    return (
        <>
            <tr
                className={cn(
                    // Borders sit on top of each row, so the expand panel and the last row need no special casing
                    // group/row: pinned cells repeat the row's hover color on their solid background
                    "group/row border-t border-gray-100 transition-colors first:border-t-0 hover:bg-gray-50/80 dark:border-gray-800/70 dark:hover:bg-gray-900/40",
                    show && "bg-gray-50/80 dark:bg-gray-900/40",
                )}
            >
                {isEnableSelect && (
                    <td className="px-0 text-center align-middle">
                        <input
                            // onChange, not onClick: React expects it on a controlled (`checked`) input
                            onChange={() => onSelectCallback?.(getRowId(row))}
                            type="checkbox"
                            aria-label="Select row"
                            checked={isChecked}
                        />
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
                                pin &&
                                    (show ? pinnedBg.tint : cn(pinnedBg.body, pinnedBg.hoverTint)),
                                colIndex === 0 && "text-gray-900 dark:text-gray-100",
                                // `*:truncate` also truncates direct child elements a custom `cell` renders
                                col.wrap ? "break-words" : "truncate *:truncate",
                                alignClass[col.align ?? "left"],
                                col.cellClassName,
                            )}
                        >
                            {hasExpand && colIndex === 0 ? (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        aria-expanded={show}
                                        aria-label={show ? "Collapse row" : "Expand row"}
                                        onClick={toggle}
                                        className={cn(
                                            "-ml-1.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200",
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
                                    <div className="min-w-0 truncate">{content}</div>
                                </div>
                            ) : (
                                content
                            )}
                        </td>
                    );
                })}
            </tr>
            {hasExpand && (
                <tr aria-hidden={!show}>
                    <td colSpan={columns.length} className="p-0">
                        {/* Animating grid rows 0fr → 1fr lets the panel grow to its content's height */}
                        <div
                            className={cn(
                                "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
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
                                    {hasOpened && renderExpandUI({ value: row[expandKey] as T[K] })}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
