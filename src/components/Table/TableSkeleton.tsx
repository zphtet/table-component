import type { TableSkeletonProps } from "@/types/table.types";
import { cn } from "./utils";

// Varied bar widths so the placeholder reads like real text instead of a grid of identical blocks
const barWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-2/5"];

// Line the bar up the same way the column's real content is aligned
const barAlign = { left: "", center: "mx-auto", right: "ml-auto" } as const;

/** Placeholder rows shown while data loads. Render inside the table's `<tbody>`. */
export const TableSkeleton = <T extends object>({ columns, rows = 5 }: TableSkeletonProps<T>) => {
    return (
        <>
            {Array.from({ length: rows }, (_, rowIndex) => (
                <tr
                    key={rowIndex}
                    aria-hidden
                    className="border-t border-gray-100 first:border-t-0 dark:border-gray-800/70"
                >
                    {columns.map((col, colIndex) => (
                        <td key={col.id} className="px-4 py-3 align-middle">
                            <div
                                className={cn(
                                    "h-4 animate-pulse rounded bg-gray-200 motion-reduce:animate-none dark:bg-gray-800",
                                    barWidths[(rowIndex + colIndex) % barWidths.length],
                                    barAlign[col.align ?? "left"],
                                )}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};
