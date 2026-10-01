import {
    DEFAULT_PAGINATION,
    Table,
    type BasePagination,
    type SelectedId,
    type Sort,
} from "@/components/Table";
import { storeColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, retryUnlessClientError } from "@/lib/fetchJson";
import type { PaginatedResponse } from "@/types/api.types";
import type { EcommerceStore } from "@/types/data.types";
import { useState } from "react";
import { StockTable } from "./stock/Stock";
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
                retryFn={refetch}
                isError={isError}
                error={error}
                ariaLabel="Ecommerce Stores"
                columns={storeColumns}
                data={data?.data || []}
                pagination={{
                    value: { ...pagination, ...data?.pagination },
                    changeFn: setPagination,
                    pageSizeOptions: [5, 10, 20, 50],
                    isManual: true
                }}

                sorting={{
                    value: sorts,
                    changeFn: setSorts,
                    isManual: true,
                }}

                renderExpandedFn={({ row }) => {
                    return <StockTable id={row.id} />
                }}
                getRowIdFn={(row) => row.id}

                selection={{
                    value: selectedIds,
                    changeFn: setSelectedIds
                }}
            />
        </div>
    </div>
}
