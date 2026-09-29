import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";

// Start MSW in development only; it's never included in the production build
async function enableMocking() {
    if (!import.meta.env.DEV) return;
    const { worker } = await import("./mocks/browser");
    // "bypass": let requests without a mock handler go to the network silently
    await worker.start({ onUnhandledFrame: "bypass" });
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                {/* Floating devtools panel; only rendered in development, removed from production builds */}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>,
    );
});
