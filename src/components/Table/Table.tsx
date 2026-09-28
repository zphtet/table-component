import type { BasePagination, ColumnDef, TableProps } from "@/types/table.types";
import { LuInbox } from "react-icons/lu";
import { Pagination } from "./Pagination";
import { TableHeaderCell } from "./TableHeaderCell";
import { TableRow } from "./TableRow";
import { useTable } from "./hooks/useTable";
import { toCss } from "./utils";
import { TableSkeleton } from "./TableSkeleton";

/** Sum of fixed widths + flexible columns' minWidths, so the table scrolls instead of squashing columns. */
const getTableMinWidth = <T,>(columns: ColumnDef<T>[]) => {
    const parts = columns
        .map((col) =>
            col.width != null
                ? toCss(col.width)
                : col.minWidth != null
                  ? toCss(col.minWidth)
                  : null,
        )
        .filter((part): part is string => part != null);
    return parts.length ? `calc(${parts.join(" + ")})` : undefined;
};

const Table = <T extends object, K extends keyof T>(props: TableProps<T, K>) => {
    const {
        ariaLabel,
        columns,
        data,
        pagination,
        sorting: sortingProps,
        expandKey,
        renderExpandUI,
        isLoading,
        isError,
        onRetry,
        renderError,
        skeletonRows,
    } = props;

    const {
        rows,
        pagination: paginationState,
        setPage,
        setSize,
        sorting,
        onClickSort,
    } = useTable({
        columns,
        data,
        // pagination
        pagination: pagination?.pagination as BasePagination,
        onChangeHandler: pagination?.onChangeHandler,
        manualPagination: pagination?.manual,
        // sorting
        sorts: sortingProps?.sorts ?? [],
        onChangeSort: sortingProps?.onChangeSort,
        isMultiple: sortingProps?.isMultiple,
    });

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="w-full overflow-x-auto">
                <table
                    aria-busy={isLoading}
                    aria-label={ariaLabel}
                    className="w-full table-fixed border-collapse text-sm"
                    style={{ minWidth: getTableMinWidth(columns) }}
                >
                    <colgroup>
                        {columns.map((col) => (
                            <col
                                key={col.id}
                                style={{ width: col.width != null ? toCss(col.width) : undefined }}
                            />
                        ))}
                    </colgroup>

                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/50">
                            {columns.map((col) => (
                                <TableHeaderCell
                                    onClickSort={onClickSort}
                                    key={col.id}
                                    sorts={sorting}
                                    column={col}
                                />
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && <TableSkeleton columns={columns} rows={skeletonRows} />}
                        {rows.map((row, rowIndex) => {
                            const rowKey = "id" in row ? String(row.id) : rowIndex;
                            return (
                                <TableRow
                                    key={rowKey}
                                    row={row}
                                    columns={columns}
                                    expandKey={expandKey}
                                    renderExpandUI={renderExpandUI}
                                />
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="h-32 px-3 py-6">
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                        <LuInbox
                                            aria-hidden
                                            className="size-6 text-gray-400 dark:text-gray-500"
                                        />
                                        <p className="text-sm">No data found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && (
                <Pagination
                    pagination={paginationState}
                    onPageChange={setPage}
                    onSizeChange={setSize}
                    pageSizeOptions={pagination?.pageSizeOptions}
                />
            )}
        </div>
    );
};

export default Table;
