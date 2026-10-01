import { useQuery } from "@tanstack/react-query";
import Table from "@/components/Table/Table";
import { columns } from "../Demo/columns";
import { fetchJson, retryUnlessClientError } from "@/lib/fetchJson";
import type { PaginatedResponse } from "@/types/api.types";
import type { FitnessClass } from "@/types/data.types";
import type { SelectedId, Sort } from "@/types/table.types";
import { useState } from "react";
import { Attendee } from "./Attendee";
import { DEFAULT_PAGINATION } from "@/lib/constant";
/** `[{ columnId: "name", direction: "asc" }, …]` → `"name:asc,…"`, the API's `sort` format */
const toSortParam = (sorts: Sort[]) =>
    sorts.map(({ columnId, direction }) => `${columnId}:${direction}`).join(",");

export const ServerSideDemo = () => {
    // page and size are ours; total comes from the server response
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [sorts, setSorts] = useState<Sort[]>([]);
    const [selectedIds, setSelectedIds] = useState<[] | SelectedId[]>([]);

    const { data, isLoading, refetch, isError, error } = useQuery({
        // A new page, size or sort is a new query, so it gets fetched (and cached) separately.
        // TanStack Query compares keys by value, so the sorts array can go in as-is.
        queryKey: ["classes", { ...pagination, sorts }],
        queryFn: () => {
            const params = new URLSearchParams({
                page: String(pagination.page),
                size: String(pagination.size),
            });
            if (sorts.length) params.set("sort", toSortParam(sorts));
            // e.g. /api/classes?page=1&size=10&sort=instructor%3Aasc%2Ctime%3Adesc
            // Throws on network errors and 4xx/5xx, so the backend's message ends up in `error`
            return fetchJson<PaginatedResponse<FitnessClass>>(`/api/classes?${params}`);
        },
        retry: retryUnlessClientError,
    });

    return (
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Classes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paged and sorted by the mock API. Use the Network panel to simulate slow or
                    failing requests.
                </p>
            </div>

            <Table
                ariaLabel="Server Side Classes Table"
                data={data?.data || []}
                columns={columns}
                isError={isError}
                error={error}
                isLoading={isLoading}
                onRetry={refetch}
                skeletonRows={pagination?.size}
                pagination={{
                    pagination: { ...pagination, total: data?.pagination.total ?? 0 },
                    onChangeHandler: setPagination,
                    pageSizeOptions: [5, 10, 20],
                    manual: true,
                }}

                sorting={{
                    sorts: sorts,
                    onChangeSort: (sorts: Sort[]) => {
                        setSorts(sorts);
                        // A new order makes the current page meaningless, so start from page 1
                        setPagination((prev) => ({ ...prev, page: 1 }));
                    },
                    manual: true,
                }}

                renderExpandUI={({ row }) => {
                    return <Attendee id={row.id || ""} />;
                }}

                // row selecti

                selection={{
                    selectedIds: selectedIds,
                    onChangeSelect: (ids: SelectedId[]) => {
                        setSelectedIds(ids);
                    },
                }}

                getRowId={(row) => row.id}
            />
        </div>
    );
};
