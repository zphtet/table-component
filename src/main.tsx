import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";

// There's no real backend: MSW serves the API in every build, so a deployed build works as a demo.
// Loaded lazily, so the mocks (and faker) live in their own chunk.
async function enableMocking() {
    const { worker, reactivateMocking } = await import("./mocks/browser");
    await worker.start({
        // "bypass": let requests without a mock handler go to the network silently
        onUnhandledFrame: "bypass",
        // Respect Vite's `base`, in case the app is deployed under a sub-path
        serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });

    // The browser may have stopped the mock worker while the tab was in the background (see
    // `reactivateMocking`). Turn mocking back on first, then let TanStack Query refetch on return.
    focusManager.setEventListener((handleFocus) => {
        const onVisibilityChange = async () => {
            if (document.visibilityState === "visible") await reactivateMocking();
            handleFocus();
        };
        window.addEventListener("visibilitychange", onVisibilityChange);
        return () => window.removeEventListener("visibilitychange", onVisibilityChange);
    });
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
