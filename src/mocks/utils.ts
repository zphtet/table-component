import { delay, HttpResponse } from "msw";
import type { PaginatedResponse } from "@/types/api.types";
import type { Sort } from "@/components/Table";
import {
    affects,
    getNetworkSettings,
    RANDOM_FAILURE_RATE,
    type Endpoint,
    type ErrorType,
    type Latency,
} from "./networkSettings";

const errorMessages: Record<Exclude<ErrorType, "network">, (endpoint: Endpoint) => string> = {
    400: (endpoint) => `Simulated bad request: invalid query for ${endpoint}`,
    404: (endpoint) => `Simulated not found: ${endpoint} doesn't exist`,
    500: () => "Simulated server error",
};

const latencyMs: Record<Exclude<Latency, "realistic">, number> = {
    instant: 0,
    slow: 1500,
    "very-slow": 5000,
};

/**
 * Applies the header's network settings to a request: waits for the chosen latency, then returns a
 * failure response if the request should fail. Returns `undefined` when the handler should go on.
 * Endpoints the settings don't target get the default realistic latency and never fail.
 */
export const simulateNetwork = async (endpoint: Endpoint): Promise<Response | undefined> => {
    const settings = getNetworkSettings();
    if (!affects(settings, endpoint)) {
        await delay();
        return;
    }

    // `delay()` with no argument is MSW's realistic 100–400ms
    await (settings.latency === "realistic" ? delay() : delay(latencyMs[settings.latency]));

    const fails =
        settings.errorMode === "always" ||
        (settings.errorMode === "random" && Math.random() < RANDOM_FAILURE_RATE);
    if (!fails) return;

    // Like a dropped connection: fetch rejects with a TypeError instead of getting a response
    if (settings.errorType === "network") return HttpResponse.error();

    return HttpResponse.json(
        {
            message: `${errorMessages[settings.errorType](endpoint)} (turn it off in the header's Network panel)`,
        },
        { status: settings.errorType },
    );
};

/** Whether the header's "Empty results" setting applies to this endpoint */
export const shouldReturnEmpty = (endpoint: Endpoint) => {
    const settings = getNetworkSettings();
    return settings.empty && affects(settings, endpoint);
};

const DEFAULT_SIZE = 10;
const MAX_SIZE = 100;

type ListQuery<Field extends string> = {
    page: number;
    size: number;
    sorts: { field: Field; direction: Sort["direction"] }[];
};

/** Reads `page`, `size` and `sort` from the URL. Returns an error message for invalid values. */
export const parseListQuery = <Field extends string>(
    url: URL,
    sortableFields: readonly Field[],
): ListQuery<Field> | { error: string } => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const size = Number(url.searchParams.get("size") ?? DEFAULT_SIZE);
    if (!Number.isInteger(page) || page < 1) return { error: "`page` must be a positive integer" };
    if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
        return { error: `\`size\` must be an integer from 1 to ${MAX_SIZE}` };
    }

    const sorts: ListQuery<Field>["sorts"] = [];
    const rawSorts = url.searchParams
        .getAll("sort")
        .flatMap((value) => value.split(","))
        .filter(Boolean);
    for (const raw of rawSorts) {
        const [field, direction = "asc"] = raw.split(":");
        if (!sortableFields.includes(field as Field)) {
            return {
                error: `Can't sort by "${field}". Sortable fields: ${sortableFields.join(", ")}`,
            };
        }
        if (direction !== "asc" && direction !== "desc") {
            return { error: `Sort direction for "${field}" must be "asc" or "desc"` };
        }
        sorts.push({ field: field as Field, direction });
    }

    return { page, size, sorts };
};

const compareValues = (a: unknown, b: unknown) => {
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Sorts a copy by each field in order (first wins, later ones break ties). Ends with `id` so the
 * order is always the same, which keeps pages from overlapping or skipping rows.
 */
export const sortItems = <T extends { id: string }>(
    items: T[],
    sorts: { field: keyof T; direction: Sort["direction"] }[],
): T[] =>
    [...items].sort((rowA, rowB) => {
        for (const { field, direction } of sorts) {
            const a = rowA[field];
            const b = rowB[field];
            if (a == null || b == null) {
                if (a == null && b == null) continue;
                return a == null ? 1 : -1; // empty values last
            }
            const result = compareValues(a, b);
            if (result !== 0) return direction === "asc" ? result : -result;
        }
        return rowA.id.localeCompare(rowB.id);
    });

export const paginate = <T>(items: T[], page: number, size: number): PaginatedResponse<T> => ({
    data: items.slice((page - 1) * size, page * size),
    pagination: { page, size, total: items.length },
});
