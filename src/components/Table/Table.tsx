import type { ColumnDef, TableProps } from "./types";
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
    type LeadingColumn,
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

export const Table = <T extends object>(props: TableProps<T>) => {
    const {
        ariaLabel,
        columns,
        data,
        pagination,
        sorting,
        expansion,
        // expandKey,
        renderExpandedFn,
        isLoading,
        isError,
        error,
        retryFn,
        renderErrorFn,
        skeletonRows,
        renderEmptyFn,
        isHeaderSticky,
        maxHeight,
        selection,
        getRowIdFn,
    } = props;

    const isSelectable = Boolean(selection);
    const hasExpand = Boolean(renderExpandedFn)

    const orderedColumns = useMemo(() => orderColumns(columns), [columns]);
    // Built-in narrow columns before the data: checkbox, then expand chevron
    const leadingColumns = useMemo<LeadingColumn[]>(
        () => [
            ...(isSelectable ? [{ id: SELECT_COLUMN_ID, width: SELECT_COLUMN_WIDTH }] : []),
            ...(hasExpand ? [{ id: EXPAND_COLUMN_ID, width: EXPAND_COLUMN_WIDTH }] : []),
        ],
        [isSelectable, hasExpand],
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
        sorts,
        toggleSort,
        toggleSelect,
        isSelected,
        toggleAll,
        isAllSelected,
        isSomeSelected,
        isExpanded,
        toggleExpand,
        isSorting,
    } = useTable({
        columns: orderedColumns,
        data,
        pagination,
        sorting,
        selection,
        expansion,
        getRowIdFn,
    });

    // The built-in columns count too, so full-width rows (error, empty) span them
    const columnCount = orderedColumns.length + leadingColumns.length;


    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div
                role="region"
                tabIndex={0}
                className={cn(
                    "@container w-full overflow-x-auto overscroll-x-contain",
                    maxHeight != null && "overflow-y-auto",
                )}
                style={{
                    maxHeight: maxHeight != null ? toCss(maxHeight) : undefined,
                }}
            >
                {/* create export btn that */}
                <table
                    aria-busy={isLoading || isSorting}
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
                    <thead className={cn(isHeaderSticky && "sticky top-0 z-10")}>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                            {isSelectable && (
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
                                    toggleSortFn={toggleSort}
                                    key={col.id}
                                    sorts={sorts}
                                    column={col}
                                    pin={pins.get(col.id)}
                                />
                            ))}
                        </tr>
                    </thead>

                    {/* Dimmed while a client-side sort catches up with the header */}
                    <tbody className={cn("transition-opacity", isSorting && "opacity-60")}>
                        {isLoading && (
                            <TableSkeleton
                                columns={orderedColumns}
                                leadingColumns={leadingColumns}
                                pins={pins}
                                rows={skeletonRows ?? paginationState.size}
                            />
                        )}
                        {!isLoading && isError && (
                            <tr>
                                <td colSpan={columnCount} className="h-32 px-3 py-6">
                                    {renderErrorFn ? (
                                        renderErrorFn({ error, retryFn })
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
                                            {retryFn && (
                                                <button
                                                    type="button"
                                                    onClick={() => retryFn()}
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
                                {rows.map((row) => {
                                    const rowKey = getRowIdFn(row)
                                    return (
                                        <TableRow
                                            key={rowKey}
                                            row={row}
                                            isSelectable={isSelectable}
                                            isSelected={isSelected(rowKey)}
                                            columns={orderedColumns}
                                            columnCount={columnCount}
                                            pins={pins}
                                            renderExpandedFn={renderExpandedFn}
                                            toggleSelectFn={toggleSelect}
                                            isExpanded={isExpanded(rowKey)}
                                            toggleExpandFn={toggleExpand}
                                            getRowIdFn={getRowIdFn}
                                        />
                                    );
                                })}
                            </>
                        )}
                        {!isLoading && !isError && rows.length === 0 && (
                            <>
                                {renderEmptyFn?.() || (
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
                    pageChangeFn={setPage}
                    sizeChangeFn={setSize}
                    pageSizeOptions={pagination?.pageSizeOptions}
                />
            )}
        </div>
    );
};

