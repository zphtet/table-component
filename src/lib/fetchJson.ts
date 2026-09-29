import type { ApiError } from "@/types/api.types";

/** A response that came back with a 4xx/5xx status. `message` is the backend's own message when it sent one. */
export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/**
 * `fetch` + `res.json()` that throws on failure, so TanStack Query ends up in its error state:
 * - no response at all (offline, dropped connection) → `Error` with a network message
 * - 4xx/5xx → `HttpError` carrying the status and the backend's `{ message }`
 */
export const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
    let res: Response;
    try {
        res = await fetch(url, init);
    } catch {
        // fetch only rejects when no response arrived
        throw new Error("Network error. Check your connection and try again.");
    }

    if (!res.ok) {
        // Use the backend's { message }, with a fallback if the body isn't JSON
        const body = (await res.json().catch(() => null)) as Partial<ApiError> | null;
        throw new HttpError(res.status, body?.message ?? `Request failed (${res.status})`);
    }

    return res.json() as Promise<T>;
};

/** Retry network errors and 5xx up to 3 times; a 4xx will fail the same way again, so don't retry it. */
export const retryUnlessClientError = (failureCount: number, error: Error) =>
    !(error instanceof HttpError && error.status < 500) && failureCount < 3;
