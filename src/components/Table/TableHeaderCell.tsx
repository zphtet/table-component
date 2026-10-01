import type { ColumnDef, Sort } from "./types";
import { LuArrowDown, LuArrowUp, LuChevronsUpDown } from "react-icons/lu";
import { alignClass, cn, focusRing, pinClass, pinnedBg, type PinInfo } from "./utils";

type TableHeaderCellProps<T> = {
    column: ColumnDef<T>;
    pin?: PinInfo;
    toggleSortFn: (id: string) => void;
    sorts: Sort[];
};

const ariaSort = { asc: "ascending", desc: "descending" } as const;

const SortIcon = ({ direction }: { direction: Sort["direction"] | undefined }) => {
    if (direction === "asc") return <LuArrowUp aria-hidden className="size-3.5 shrink-0" />;
    if (direction === "desc") return <LuArrowDown aria-hidden className="size-3.5 shrink-0" />;
    // Unsorted: faint until the header is hovered
    return (
        <LuChevronsUpDown
            aria-hidden
            className="size-3.5 shrink-0 opacity-30 transition-opacity group-hover:opacity-100"
        />
    );
};

export const TableHeaderCell = <T extends object>({
    column,
    pin,
    toggleSortFn,
    sorts,
}: TableHeaderCellProps<T>) => {
    const currentDirection = sorts.find((item) => item.columnId === column.id)?.direction;

    return (
        <th
            scope="col"
            aria-sort={
                column.isSortable
                    ? currentDirection
                        ? ariaSort[currentDirection]
                        : "none"
                    : undefined
            }
            style={pin?.style}
            className={cn(
                "h-10 truncate px-4 align-middle text-xs font-medium text-gray-500 dark:text-gray-400",
                alignClass[column.align ?? "left"],
                pinClass(pin),
                pin && pinnedBg.header,
                column.headerClassName,
            )}
        >
            {column.isSortable ? (
                <button
                    type="button"
                    onClick={() => toggleSortFn?.(column.id)}
                    className={cn(
                        "group -mx-1 inline-flex max-w-[calc(100%+0.5rem)] cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-gray-900 dark:hover:text-gray-100",
                        // Right-aligned columns put the icon on the left so the labels line up with the numbers
                        column.align === "right" && "flex-row-reverse",
                        currentDirection && "text-gray-900 dark:text-gray-100",
                        focusRing,
                    )}
                >
                    <span className="truncate">{column.header}</span>
                    <SortIcon direction={currentDirection} />
                </button>
            ) : (
                column.header
            )}
        </th>
    );
};
