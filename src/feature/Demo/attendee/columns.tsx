import type { Attendee, BookingStatus } from "@/types/data.types";
import type { ColumnDef } from "@/types/table.types";

const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const bookingStatusStyles: Record<BookingStatus, string> = {
    Booked: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-400/20",
    "Checked-in":
        "bg-green-100 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/40 dark:text-green-300 dark:ring-green-400/20",
    Cancelled:
        "bg-red-100 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-900/40 dark:text-red-300 dark:ring-red-400/20",
    "No-show":
        "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
};

export const attendeeColumns: ColumnDef<Attendee>[] = [
    {
        id: "name",
        header: "Name",
        sortable: true,
        width: 180,
        dataKey: "name",
        cellClassName: "font-medium",
    },

    {
        id: "email",
        header: "Email",
        sortable: true,
        minWidth: 200,
        dataKey: "email",
        cell: ({ value }) => (
            <a
                href={`mailto:${value}`}
                title={value}
                className="text-gray-600 hover:underline dark:text-gray-400"
            >
                {value}
            </a>
        ),
    },

    {
        id: "paymentType",
        header: "Payment",
        sortable: true,
        width: 120,
        dataKey: "paymentType",
    },

    {
        id: "bookingStatus",
        header: "Status",
        sortable: true,
        width: 120,
        dataKey: "bookingStatus",
        cell: ({ value }) => (
            <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusStyles[value]}`}
            >
                {value}
            </span>
        ),
    },

    {
        id: "bookedAt",
        header: "Booked at",
        sortable: true,
        width: 130,
        dataKey: "bookedAt",
        cell: ({ value }) => (
            <div>
                <div>{formatDate(value)}</div>
                <div className="text-xs text-gray-500">{formatTime(value)}</div>
            </div>
        ),
    },
];
