import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Table from "@/components/Table/Table";
import type { PaginatedResponse } from "@/types/api.types";
import type { Attendee as AttendeeRow } from "@/types/data.types";
import type { BasePagination, Sort } from "@/types/table.types";
import { attendeeColumns } from "../Demo/attendee/columns";

/** `[{ columnId: "name", direction: "asc" }, …]` → `"name:asc,…"`, the API's `sort` format */
const toSortParam = (sorts: Sort[]) =>
    sorts.map(({ columnId, direction }) => `${columnId}:${direction}`).join(",");

// What the API sends: same as Attendee, but JSON turns the Date into an ISO string
type AttendeeResponse = PaginatedResponse<Omit<AttendeeRow, "bookedAt"> & { bookedAt: string }>;

type AttendeeProps = {
    /** The parent class's id, e.g. "fc-001" */
    id: string;
};

/** Attendees of one class, paged and sorted by the server. */
export const Attendee = ({ id }: AttendeeProps) => {
    // page and size are ours; total comes from the server response
    const [pagination, setPagination] = useState({ page: 1, size: 5 });
    const [sorts, setSorts] = useState<Sort[]>([]);

    const { data, isLoading, isError, refetch } = useQuery({
        // Scoped under the class, so each class caches its own attendee pages
        queryKey: ["classes", id, "attendees", { ...pagination, sorts }],
        queryFn: async (): Promise<PaginatedResponse<AttendeeRow>> => {
            const params = new URLSearchParams({
                page: String(pagination.page),
                size: String(pagination.size),
            });
            if (sorts.length) params.set("sort", toSortParam(sorts));

            const res = await fetch(`/api/classes/${encodeURIComponent(id)}/attendees?${params}`);
            // fetch only rejects on network errors, so turn 404/400 responses into errors too
            if (!res.ok) throw new Error(`Failed to load attendees (${res.status})`);
            const body: AttendeeResponse = await res.json();
            return {
                ...body,
                data: body.data.map((a) => ({ ...a, bookedAt: new Date(a.bookedAt) })),
            };
        },
        // Keep showing the current page while the next one loads
        // placeholderData: keepPreviousData,
        enabled: Boolean(id),
    });

    return (
        <Table
            ariaLabel={`Attendees of class ${id}`}
            columns={attendeeColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            skeletonRows={pagination.size}
            pagination={{
                pagination: { ...pagination, total: data?.pagination.total ?? 0 },
                onChangeHandler: ({ page, size }: BasePagination) => setPagination({ page, size }),
                pageSizeOptions: [5, 10, 25],
                manual: true,
            }}
            sorting={{
                sorts,
                onChangeSort: (next: Sort[]) => {
                    setSorts(next);
                    // A new order makes the current page meaningless, so start from page 1
                    setPagination((prev) => ({ ...prev, page: 1 }));
                },
                manual: true,
            }}
        />
    );
};
