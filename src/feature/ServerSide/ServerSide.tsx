import { useQuery } from "@tanstack/react-query";
import Table from "@/components/Table/Table";
import { columns } from "../Demo/columns";
import type { BasePagination, Sort } from "@/types/table.types";
import { useState } from "react";
import { Attendee } from "./Attendee";
/** `[{ columnId: "name", direction: "asc" }, …]` → `"name:asc,…"`, the API's `sort` format */
const toSortParam = (sorts: Sort[]) =>
    sorts.map(({ columnId, direction }) => `${columnId}:${direction}`).join(",");

export const ServerSideDemo = () => {
    // page and size are ours; total comes from the server response
    const [pagination, setPagination] = useState({ page: 1, size: 10 });
    const [sorts, setSorts] = useState<Sort[]>([]);

    const { data, isLoading, refetch, isError } = useQuery({
        // A new page, size or sort is a new query, so it gets fetched (and cached) separately.
        // TanStack Query compares keys by value, so the sorts array can go in as-is.
        queryKey: ["classes", { ...pagination, sorts }],
        queryFn: async () => {
            try {
                const params = new URLSearchParams({
                    page: String(pagination.page),
                    size: String(pagination.size),
                });
                if (sorts.length) params.set("sort", toSortParam(sorts));
                // e.g. /api/classes?page=1&size=10&sort=instructor%3Aasc%2Ctime%3Adesc
                const res = await fetch(`/api/classes?${params}`);
                // fetch only rejects on network errors, so turn 4xx/5xx responses into errors too;
                // otherwise the error body ({ message }) would be used as data and crash the render
                if (!res.ok) throw new Error(`Failed to load classes (${res.status})`);
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

                sorting={{
                    sorts: sorts,
                    onChangeSort: (sorts: Sort[]) => {
                        setSorts(sorts);
                        // A new order makes the current page meaningless, so start from page 1
                        setPagination((prev) => ({ ...prev, page: 1 }));
                    },
                    manual: true,
                }}

                expandKey="id"
                renderExpandUI={(value) => {
                    return <Attendee id={(value.value as string) || ""} />;
                }}
            />
        </div>
    );
};
