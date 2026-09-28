import type { Sort, TableHeaderCellProps } from "@/types/table.types";
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from "react-icons/lu";
import { alignClass, cn } from "./utils";

/** Each click cycles normal → asc → desc → normal. */

const SortIcon = ({ direction }: { direction: Sort["direction"] | undefined }) => {
    if (direction === "asc") return <LuArrowUp aria-hidden className="size-3.5 shrink-0" />;
    if (direction === "desc") return <LuArrowDown aria-hidden className="size-3.5 shrink-0" />;
    return <LuArrowUpDown aria-hidden className="size-3.5 shrink-0 opacity-40" />;
};

export const TableHeaderCell = <T extends object>({
    column,
    onClickSort,
    sorts,
}: TableHeaderCellProps<T>) => {
    const currentDirection = sorts.find((item) => item.columnId === column.id)?.direction;

    return (
        <th
            scope="col"
            className={cn(
                "truncate px-3 py-2 align-bottom text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400",
                alignClass[column.align ?? "left"],
                column.headerClassName,
            )}
        >
            {column.sortable ? (
                <button
                    type="button"
                    onClick={() => onClickSort?.(column.id)}
                    className="inline-flex max-w-full cursor-pointer items-center gap-1 uppercase hover:text-gray-900 dark:hover:text-gray-100"
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
