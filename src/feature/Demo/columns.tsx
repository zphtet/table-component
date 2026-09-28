import type { ClassStatus, FitnessClass } from "@/types/data.types";
import type { ColumnDef } from "@/types/table.types";

const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const statusStyles: Record<ClassStatus, string> = {
    Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Full: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export const columns: ColumnDef<FitnessClass>[] = [
    {
        id: "name",
        header: "Name",
        sortable: true,
        width: 200,
        dataKey: "name",
        pinned: "left",
        cellClassName: "font-medium",
    },

    {
        id: "instructor",
        header: "Instructor",
        sortable: true,
        width: 140,
        dataKey: "instructor",
    },

    {
        id: "room",
        header: "Room",
        sortable: true,
        width: 130,
        dataKey: "room",
    },

    {
        id: "startTime",
        header: "Start",
        sortable: true,
        width: 130,
        dataKey: "startTime",
        cell: ({ value }) => (
            <div>
                <div>{formatDate(value)}</div>
                <div className="text-xs text-gray-500">{formatTime(value)}</div>
            </div>
        ),
    },

    {
        id: "endTime",
        header: "End",
        sortable: true,
        width: 100,
        dataKey: "endTime",
        cell: ({ value }) => formatTime(value),
    },

    {
        id: "capacity",
        header: "Capacity",
        sortable: true,
        align: "right",
        width: 90,
        dataKey: "capacity",
        cellClassName: "tabular-nums",
    },

    {
        id: "attendeeCount",
        header: "Booked",
        sortable: true,
        align: "right",
        width: 90,
        dataKey: "attendeeCount",
        cellClassName: "tabular-nums",
        cell: ({ value, row }) => `${value} / ${row.capacity}`,
    },

    {
        id: "status",
        header: "Status",
        sortable: true,
        width: 110,
        dataKey: "status",
        cell: ({ value }) => (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[value]}`}>
                {value}
            </span>
        ),
    },

    {
        id: "attendees",
        header: "Attendees",
        minWidth: 100,
        dataKey: "attendees",
        cell: ({ value }) =>
            value && value.length > 0 ? (
                <span title={value.map((a) => a.name).join(", ")}>
                    {value.map((a) => a.name).join(", ")}
                </span>
            ) : (
                <span className="text-gray-400">No attendees</span>
            ),
    },
];
