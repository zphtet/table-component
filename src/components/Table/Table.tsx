import type { BasePagination, ColumnDef, SortingProps, TableProps } from "@/types/table.types";
import { Pagination } from "./Pagination";
import { TableHeaderCell } from "./TableHeaderCell";
import { TableRow } from "./TableRow";
import { usePagination } from "./hooks/usePagination";
import { sortRows, toCss } from "./utils";
import { useSorting } from "./hooks/useSorting";

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

const Table = <T extends object>(props: TableProps<T>) => {
    const { ariaLabel, columns, data, pagination } = props;
    const {
        pagination: newPagination,
        setPage,
        setSize,
    } = usePagination({
        pagination: pagination?.pagination as BasePagination,
        onChangeHandler: pagination?.onChangeHandler,
    });

    const { onClickSort, sorting } = useSorting(props?.sorting as SortingProps);

    console.log("sorting", sorting);

    const { page, size, total } = newPagination;
    const start = (page - 1) * size;
    const end = start + size;
    // Sort the full data first, then slice, so sorting applies across all pages
    const sortedRows = sortRows(data, sorting ?? [], columns);
    const updatedRows = sortedRows.slice(start, end);

    return (
        <div className="w-full">
            <div className="w-full overflow-x-auto">
                <table
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
                        <tr className="border-b border-gray-200 dark:border-gray-800">
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
                        {updatedRows.map((row, rowIndex) => {
                            const rowKey = "id" in row ? String(row.id) : rowIndex;
                            return <TableRow key={rowKey} row={row} columns={columns} />;
                        })}
                    </tbody>
                </table>
            </div>
            {pagination && (
                <Pagination
                    pagination={newPagination}
                    onPageChange={setPage}
                    onSizeChange={setSize}
                    pageSizeOptions={pagination?.pageSizeOptions}
                />
            )}
        </div>
    );
};

export default Table;
