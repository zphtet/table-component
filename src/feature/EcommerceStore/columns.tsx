import type { EcommerceStore, StoreStatus } from "@/types/data.types";
import type { ColumnDef } from "@/types/table.types";

// The API sends dates as JSON strings, so wrap them in `new Date()` before formatting
const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const statusStyles: Record<StoreStatus, string> = {
    Active: "bg-green-100 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/40 dark:text-green-300 dark:ring-green-400/20",
    Inactive:
        "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
    Suspended:
        "bg-red-100 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-900/40 dark:text-red-300 dark:ring-red-400/20",
};

// Column ids match the API's sort fields, so a header click can be sent as `sort=<id>:<direction>`
export const storeColumns: ColumnDef<EcommerceStore>[] = [
    {
        id: "name",
        header: "Store",
        sortable: true,
        width: 150,
        dataKey: "name",
        pinned: "left",
        cellClassName: "font-medium",
    },

    {
        id: "owner",
        header: "Owner",
        sortable: true,
        width: 160,
        dataKey: "owner",
    },

    {
        id: "location",
        header: "Location",
        sortable: true,
        width: 140,
        dataKey: "location",
    },

    {
        id: "category",
        header: "Category",
        sortable: true,
        width: 140,
        dataKey: "category",
    },

    {
        id: "productCount",
        header: "Products",
        sortable: true,
        // align: "right",
        width: 110,
        dataKey: "productCount",
        cellClassName: "tabular-nums",
    },

    {
        id: "totalStockValue",
        header: "Stock value",
        sortable: true,
        // align: "right",
        width: 150,
        dataKey: "totalStockValue",
        cellClassName: "tabular-nums",
        cell: ({ value }) => currency.format(value),
    },

    {
        id: "createdAt",
        header: "Created",
        sortable: true,
        width: 130,
        dataKey: "createdAt",
        cell: ({ value }) => formatDate(new Date(value)),
    },

    {
        id: "status",
        header: "Status",
        sortable: true,
        width: 110,
        dataKey: "status",
        cell: ({ value }) => (
            <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[value]}`}
            >
                {value}
            </span>
        ),
    },
];
