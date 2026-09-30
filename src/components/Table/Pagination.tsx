import type { PaginationComponentProps } from "@/types/table.types";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { focusRing } from "./utils";

type PageItem = number | "ellipsis";

/** First, last, and the pages next to the current one; gaps become "…" (a gap of exactly one page shows that page instead). */
const getPageItems = (page: number, pageCount: number): PageItem[] => {
    const pages = [...new Set([1, page - 1, page, page + 1, pageCount])]
        .filter((p) => p >= 1 && p <= pageCount)
        .sort((a, b) => a - b);

    const items: PageItem[] = [];
    pages.forEach((p, i) => {
        const prev = pages[i - 1];
        if (prev != null && p - prev === 2) items.push(prev + 1);
        else if (prev != null && p - prev > 2) items.push("ellipsis");
        items.push(p);
    });
    return items;
};

const buttonClass = `inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-md border px-2.5 text-sm transition-colors disabled:cursor-not-allowed ${focusRing}`;
const idleClass =
    "border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-gray-50 disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:text-gray-700";
const activeClass =
    "border-gray-900 bg-gray-900 font-medium text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900";

export const Pagination = ({
    pagination,
    onPageChange,
    onSizeChange,
    pageSizeOptions = [10, 20, 50],
}: PaginationComponentProps) => {
    const { page, size, total } = pagination;
    const pageCount = Math.max(1, Math.ceil(total / size));
    const start = total === 0 ? 0 : (page - 1) * size + 1;
    const end = Math.min(page * size, total);

    const goTo = (next: number) => onPageChange?.(Math.min(Math.max(next, 1), pageCount));

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <div className="flex items-center gap-4">
                <p className="tabular-nums">
                    Showing{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {start}–{end}
                    </span>{" "}
                    of <span className="font-medium text-gray-900 dark:text-gray-100">{total}</span>
                </p>

                {onSizeChange && (
                    <label className="flex items-center gap-2">
                        Rows per page
                        <select
                            value={size}
                            onChange={(e) => {
                                onSizeChange(Number(e.target.value));
                            }}
                            className={`h-8 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-gray-900 shadow-xs dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 ${focusRing}`}
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <nav aria-label="Pagination" className="flex items-center gap-1">
                <button
                    type="button"
                    className={`${buttonClass} ${idleClass}`}
                    disabled={page <= 1}
                    aria-disabled={page <= 1}
                    onClick={() => goTo(page - 1)}
                >
                    <LuChevronLeft aria-hidden className="size-4" />
                    Prev
                </button>

                {getPageItems(page, pageCount).map((item, i) =>
                    item === "ellipsis" ? (
                        <span key={`ellipsis-${i}`} aria-hidden className="px-2 text-gray-500">
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            aria-current={item === page ? "page" : undefined}
                            aria-label={`Page ${item}`}
                            className={`${buttonClass} ${item === page ? activeClass : idleClass}`}
                            onClick={() => goTo(item)}
                        >
                            {item}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    className={`${buttonClass} ${idleClass}`}
                    disabled={page >= pageCount}
                    aria-disabled={page >= pageCount}
                    onClick={() => goTo(page + 1)}
                >
                    Next
                    <LuChevronRight aria-hidden className="size-4" />
                </button>
            </nav>
        </div>
    );
};
