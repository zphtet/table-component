import Table from "@/components/Table/Table";
import { storeColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, retryUnlessClientError } from "@/lib/fetchJson";
import type { PaginatedResponse } from "@/types/api.types";
import type { EcommerceStore } from "@/types/data.types";
import { useState } from "react";
import type { BasePagination, SelectedId, Sort } from "@/types/table.types";
import { StockTable } from "./stock/Stock";
import { DEFAULT_PAGINATION } from "@/lib/constant";
const toSortParam = (sorts: Sort[]) =>
    sorts.map(({ columnId, direction }) => `${columnId}:${direction}`).join(",");
export const EcommerceStoreDemo = () => {

    const [pagination, setPagination] = useState<BasePagination>(DEFAULT_PAGINATION)
    const [sorts, setSorts] = useState<Sort[] | []>([])
    const [selectedIds, setSelectedIds] = useState<SelectedId[]>([])
    const { isLoading, isError, error, data, refetch } = useQuery({
        queryKey: ['ecommerce-stores', { ...pagination, sorts }],
        queryFn: () => {
            const params = new URLSearchParams({
                page: String(pagination.page),
                size: String(pagination.size),
            });
            if (sorts.length > 0) params.set('sort', toSortParam(sorts))
            return fetchJson<PaginatedResponse<EcommerceStore>>(`/api/stores?${params}`)
        },
        retry: retryUnlessClientError,
    })

    return <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
        <div>
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Ecommerce Stores
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paged and sorted by the mock API. Use the Network panel to simulate slow or
                    failing requests.
                </p>
            </div>
            <Table
                isLoading={isLoading}
                onRetry={refetch}
                isError={isError}
                error={error}
                ariaLabel="Ecommerce Stores"
                columns={storeColumns}
                data={data?.data || []}
                skeletonRows={pagination?.size || 10}
                pagination={{
                    pagination: { ...pagination, ...data?.pagination },
                    onChangeHandler: setPagination,
                    pageSizeOptions: [5, 10, 20, 50],
                    manual: true
                }}

                sorting={{
                    sorts: sorts,
                    onChangeSort: setSorts,
                    manual: true,
                }}

                renderExpandUI={({ row }) => {
                    return <StockTable id={row.id} />
                }}
                getRowId={(row) => row.id}

                selection={{
                    selectedIds: selectedIds,
                    onChangeSelect: setSelectedIds
                }}
            />
        </div>
    </div>
}
