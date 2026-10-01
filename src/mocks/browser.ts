import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

const ACTIVATE_TIMEOUT_MS = 1000;

/**
 * Tells the mock service worker to handle this tab's requests again, and resolves once it confirms.
 *
 * The worker keeps the tabs it mocks for in memory only. The browser stops an idle worker after about
 * 30s, and in a background tab MSW's 5s keep-alive ping gets throttled, so the worker can be stopped
 * while you're away. It then starts again with no tabs on its list and lets every request through to
 * the dev server, which answers `/api/...` with index.html. Sending the same "MOCK_ACTIVATE" message
 * `worker.start()` sends puts this tab back on the list; it's harmless when the worker never stopped.
 */
export const reactivateMocking = () =>
    new Promise<void>((resolve) => {
        const serviceWorker = navigator.serviceWorker;
        if (!serviceWorker?.controller) return resolve();

        const done = () => {
            clearTimeout(timeout);
            serviceWorker.removeEventListener("message", onMessage);
            resolve();
        };
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type !== "MOCKING_ENABLED") return;
            // The worker waits for a reply on this port before it finishes handling the message
            event.ports[0]?.postMessage(null);
            done();
        };
        // Don't hold up requests for long if the worker never answers
        const timeout = setTimeout(done, ACTIVATE_TIMEOUT_MS);

        serviceWorker.addEventListener("message", onMessage);
        serviceWorker.controller.postMessage("MOCK_ACTIVATE");
    });
