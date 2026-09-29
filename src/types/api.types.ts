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

export type ListParams = {
    page?: number;
    size?: number;
    sort?: string;
};
