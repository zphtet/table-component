import { useQuery } from "@tanstack/react-query";
import Table from "@/components/Table/Table";
import { columns } from "../Demo/columns";
import type { BasePagination } from "@/types/table.types";
import { useState } from "react";
export const ServerSideDemo = () => {
    // page and size are ours; total comes from the server response
    const [pagination, setPagination] = useState({ page: 1, size: 10 });

    const { data, isLoading, refetch, isError } = useQuery({
        // A new page or size is a new query, so it gets fetched (and cached) separately
        queryKey: ["classes", pagination.page, pagination.size],
        queryFn: async () => {
            try {
                const res = await fetch(
                    `/api/classes?page=${pagination.page}&size=${pagination.size}`,
                );
                const data = await res.json();
                return data;
            } catch (e) {
                throw new Error();
            }
        },
    });

    console.log("classess data", data);
    return (
        <div className="mx-auto max-w-11/12">
            <Table
                key={"serverside-classes"}
                data={data?.data || []}
                columns={columns}
                isError={isError}
                isLoading={isLoading}
                onRetry={refetch}
                skeletonRows={pagination?.size}
                pagination={{
                    pagination: { ...pagination, total: data?.pagination.total ?? 0 },
                    onChangeHandler: ({ page, size }: BasePagination) =>
                        setPagination({ page, size }),
                    pageSizeOptions: [5, 10, 20],
                    manual: true,
                }}

                // sorting={{
                //     sorts: [],

                // }}
            />
        </div>
    );
};
