import type { BasePagination, ColumnDef, LeadingColumn, TableProps } from "@/types/table.types";
import { LuCircleAlert, LuInbox } from "react-icons/lu";
import { Pagination } from "./Pagination";
import { TableHeaderCell } from "./TableHeaderCell";
import { TableRow } from "./TableRow";
import { useTable } from "./hooks/useTable";
import {
    cn,
    EXPAND_COLUMN_ID,
    EXPAND_COLUMN_WIDTH,
    getPinInfo,
    orderColumns,
    pinClass,
    pinnedBg,
    SELECT_COLUMN_ID,
    SELECT_COLUMN_WIDTH,
    toCss,
} from "./utils";
import { TableSkeleton } from "./TableSkeleton";
import { useMemo } from "react";

/** Sum of fixed widths + flexible columns' minWidths, so the table scrolls instead of squashing columns. */
const getTableMinWidth = <T,>(columns: ColumnDef<T>[], leadingColumns: LeadingColumn[]) => {
    const parts = [
        ...leadingColumns.map((col) => toCss(col.width)),
        ...columns.map((col) =>
            col.width != null
                ? toCss(col.width)
                : col.minWidth != null
                    ? toCss(col.minWidth)
                    : null,
        ),
    ].filter((part): part is string => part != null);
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
        error,
        onRetry,
        renderError,
        skeletonRows,
        renderEmpty,
        stickyHeader,
        maxHeight,
        selection: selectionProps,
        getRowId,
    } = props;

    const isEnableSelect = Boolean(selectionProps);
    const hasExpand = expandKey != null && renderExpandUI != null;

    const orderedColumns = useMemo(() => orderColumns(columns), [columns]);
    // Built-in narrow columns before the data: checkbox, then expand chevron
    const leadingColumns = useMemo<LeadingColumn[]>(
        () => [
            ...(isEnableSelect ? [{ id: SELECT_COLUMN_ID, width: SELECT_COLUMN_WIDTH }] : []),
            ...(hasExpand ? [{ id: EXPAND_COLUMN_ID, width: EXPAND_COLUMN_WIDTH }] : []),
        ],
        [isEnableSelect, hasExpand],
    );
    const pins = useMemo(
        () => getPinInfo(orderedColumns, leadingColumns),
        [orderedColumns, leadingColumns],
    );
    const selectPin = pins.get(SELECT_COLUMN_ID);
    const expandPin = pins.get(EXPAND_COLUMN_ID);
    const {
        rows,
        pagination: paginationState,
        setPage,
        setSize,
        sorting,
        onClickSort,
        selection,
        toggleCheck,
        isAlreadyChecked,
        toggleAll,
        isAllSelected,
        isSomeSelected,
    } = useTable({
        columns: orderedColumns,
        data,
        // pagination
        pagination: pagination?.pagination as BasePagination,
        onChangeHandler: pagination?.onChangeHandler,
        manualPagination: pagination?.manual,
        // sorting
        sorts: sortingProps?.sorts ?? [],
        onChangeSort: sortingProps?.onChangeSort,
        isMultiple: sortingProps?.isMultiple,
        manualSorting: sortingProps?.manual,

        // selection
        selectedIds: selectionProps?.selectedIds,
        onChangeSelect: selectionProps?.onChangeSelect,
        getRowId,
    });

    // The built-in columns count too, so full-width rows (error, empty) span them
    const columnCount = orderedColumns.length + leadingColumns.length;


    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div
                role="region"
                tabIndex={0}
                className={cn("w-full overflow-x-auto", maxHeight != null && "overflow-y-auto")}
                style={{
                    maxHeight: maxHeight != null ? toCss(maxHeight) : undefined,
                }}
            >
                {/* create export btn that */}
                <table
                    aria-busy={isLoading}
                    aria-label={ariaLabel}
                    className="w-full table-fixed border-collapse text-sm"
                    style={{
                        minWidth: getTableMinWidth(orderedColumns, leadingColumns),
                    }}
                >
                    <colgroup>
                        {leadingColumns.map((col) => (
                            <col key={col.id} style={{ width: col.width }} />
                        ))}
                        {orderedColumns.map((col) => (
                            <col
                                key={col.id}
                                style={{ width: col.width != null ? toCss(col.width) : undefined }}
                            />
                        ))}
                    </colgroup>

                    {/* z-10: above pinned body cells (z-[1]) scrolling underneath */}
                    <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                            {isEnableSelect && (
                                <th
                                    scope="col"
                                    style={selectPin?.style}
                                    className={cn(
                                        "px-0 text-center align-middle",
                                        pinClass(selectPin),
                                        selectPin && pinnedBg.header,
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        aria-label="Select all rows on this page"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected;
                                        }}
                                        onChange={toggleAll}
                                        disabled={isLoading || isError || rows.length === 0}
                                    />
                                </th>
                            )}
                            {hasExpand && (
                                <th
                                    scope="col"
                                    style={expandPin?.style}
                                    className={cn(
                                        pinClass(expandPin),
                                        expandPin && pinnedBg.header,
                                    )}
                                >
                                    {/* No visible label, but screen readers still get a column name */}
                                    <span className="sr-only">Expand</span>
                                </th>
                            )}
                            {orderedColumns.map((col) => (
                                <TableHeaderCell
                                    onClickSort={onClickSort}
                                    key={col.id}
                                    sorts={sorting}
                                    column={col}
                                    pin={pins.get(col.id)}
                                />
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <TableSkeleton
                                columns={orderedColumns}
                                leadingColumns={leadingColumns}
                                pins={pins}
                                rows={skeletonRows}
                            />
                        )}
                        {!isLoading && isError && (
                            <tr>
                                <td colSpan={columnCount} className="h-32 px-3 py-6">
                                    {renderError ? (
                                        renderError(error, onRetry)
                                    ) : (
                                        <div
                                            role="alert"
                                            className="flex flex-col items-center justify-center gap-2 text-center"
                                        >
                                            <LuCircleAlert
                                                aria-hidden
                                                className="size-6 text-red-500 dark:text-red-400"
                                            />
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {error?.message || "Something went wrong"}
                                            </p>
                                            {onRetry && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRetry()}
                                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                        {/* A failed refetch keeps the previous data in the query, so hide it: the error replaces the rows */}
                        {!isError && (
                            <>
                                {rows.map((row, rowIndex) => {
                                    const rowKey = "id" in row ? String(row.id) : rowIndex;
                                    return (
                                        <TableRow
                                            key={rowKey}
                                            row={row}
                                            isEnableSelect={isEnableSelect}
                                            isChecked={
                                                getRowId ? isAlreadyChecked(getRowId(row)) : false
                                            }
                                            columns={orderedColumns}
                                            pins={pins}
                                            expandKey={expandKey}
                                            renderExpandUI={renderExpandUI}
                                            onSelectCallback={toggleCheck}
                                            getRowId={getRowId!}
                                        />
                                    );
                                })}
                            </>
                        )}
                        {!isLoading && !isError && rows.length === 0 && (
                            <>
                                {renderEmpty?.() || (
                                    <tr>
                                        <td colSpan={columnCount} className="h-32 px-3 py-6">
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
                            </>
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
