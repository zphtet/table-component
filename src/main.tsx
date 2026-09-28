import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

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
            <App />
        </StrictMode>,
    );
});
