import Table from "@/components/Table/Table"
import { useQuery } from "@tanstack/react-query"
import { stockColumns } from "./columns"
import { fetchJson } from "@/lib/fetchJson"
import type { Stock } from "@/types/data.types"
import type { PaginatedResponse } from "@/types/api.types"
import { useState } from "react"
import { DEFAULT_PAGINATION } from "@/lib/constant"



export const StockTable = ({ id }: { id: string | number }) => {

    const [pagination, setPaginaton] = useState({ ...DEFAULT_PAGINATION, size: 3 })

    const { isLoading, isError, data, refetch } = useQuery({
        queryKey: ["stocks", id, { ...pagination }],
        queryFn: () => {
            const params = new URLSearchParams({
                page: String(pagination.page),
                size: String(pagination.size),
            });
            return fetchJson<PaginatedResponse<Stock>>(`/api/stores/${encodeURIComponent(id)}/stocks?${params}`)
        }
    })

    console.log("data from stock table", data)

    return <Table
        ariaLabel="Stocks Table"
        columns={stockColumns}
        data={data?.data || []}
        isError={isError}
        isLoading={isLoading}
        onRetry={refetch}
        pagination={{
            pagination: { ...pagination, ...data?.pagination },
            pageSizeOptions: [3, 5, 10],
            onChangeHandler: setPaginaton,
            manual: true
        }}
    />

}