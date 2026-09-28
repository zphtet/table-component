import type { BasePagination } from "./table.types";

/**
 * Shape of every paginated list endpoint.
 * Dates arrive as ISO strings (JSON has no Date type), so convert them after fetching.
 */
export type PaginatedResponse<T> = {
    data: T[];
    pagination: BasePagination;
};

export type ApiError = {
    message: string;
};

/**
 * Query params accepted by list endpoints:
 * - `page`: 1-based, default 1
 * - `size`: rows per page, 1–100, default 10
 * - `sort`: `field:direction`, comma-separated or repeated, first one wins
 *   e.g. `?sort=instructor:asc,time:desc` or `?sort=instructor:asc&sort=time:desc`
 */
export type ListParams = {
    page?: number;
    size?: number;
    sort?: string;
};
