import { QueryClient } from "@tanstack/react-query";

// One client for the whole app; it holds the query cache
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Treat fetched data as fresh for 5 minutes before refetching it in the background
            staleTime: 5 * 60 * 1000,
        },
    },
});
