import type { Stock, StockStatus } from "@/types/data.types";
import type { ColumnDef } from "@/components/Table";

// The API sends dates as JSON strings, so wrap them in `new Date()` before formatting
const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const stockStatusStyles: Record<StockStatus, string> = {
    "In Stock":
        "bg-green-100 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/40 dark:text-green-300 dark:ring-green-400/20",
    "Low Stock":
        "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-400/20",
    "Out of Stock":
        "bg-red-100 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-900/40 dark:text-red-300 dark:ring-red-400/20",
    Discontinued:
        "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
};

// Column ids match the API's sort fields, so a header click can be sent as `sort=<id>:<direction>`
export const stockColumns: ColumnDef<Stock>[] = [
    {
        id: "productName",
        header: "Product",
        isSortable: true,
        minWidth: 200,
        dataKey: "productName",
        cellClassName: "font-medium",
    },

    {
        id: "sku",
        header: "SKU",
        isSortable: true,
        width: 120,
        dataKey: "sku",
        cellClassName: "font-mono text-xs",
    },

    {
        id: "category",
        header: "Category",
        isSortable: true,
        width: 130,
        dataKey: "category",
    },

    {
        id: "price",
        header: "Price",
        isSortable: true,
        align: "right",
        width: 110,
        dataKey: "price",
        cellClassName: "tabular-nums",
        cell: ({ value }) => currency.format(value),
    },

    {
        id: "quantity",
        header: "Qty",
        isSortable: true,
        align: "right",
        width: 90,
        dataKey: "quantity",
        cellClassName: "tabular-nums",
    },

    {
        id: "status",
        header: "Status",
        isSortable: true,
        width: 130,
        dataKey: "status",
        cell: ({ value }) => (
            <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${stockStatusStyles[value]}`}
            >
                {value}
            </span>
        ),
    },

    {
        id: "updatedAt",
        header: "Updated",
        isSortable: true,
        width: 130,
        dataKey: "updatedAt",
        cell: ({ value }) => (
            <div>
                <div>{formatDate(new Date(value))}</div>
                <div className="text-xs text-gray-500">{formatTime(new Date(value))}</div>
            </div>
        ),
    },
];
