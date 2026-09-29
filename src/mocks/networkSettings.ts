/**
 * Settings for simulating network conditions in the mock API.
 *
 * MSW runs request handlers on the page (not inside the service worker), so the handlers and the
 * header's controls share this one module. It imports nothing from MSW or faker, so the header can
 * use it without pulling those in. Saved to localStorage so a reload keeps the same conditions.
 */

export type Latency = "instant" | "realistic" | "slow" | "very-slow";
/** How often requests fail */
export type ErrorMode = "off" | "random" | "always";
/** How a failing request fails: an HTTP status with a `{ message }` body, or no response at all */
export type ErrorType = 400 | 404 | 500 | "network";
export type Endpoint = "classes" | "attendees";
export type Target = "all" | Endpoint;

export type NetworkSettings = {
    latency: Latency;
    errorMode: ErrorMode;
    errorType: ErrorType;
    /** Return an empty list (total 0) instead of real data */
    empty: boolean;
    /** Which endpoints the latency, error and empty settings apply to */
    target: Target;
};

export const defaultNetworkSettings: NetworkSettings = {
    latency: "realistic",
    errorMode: "off",
    errorType: 500,
    empty: false,
    target: "all",
};

/** Share of requests that fail in "random" error mode */
export const RANDOM_FAILURE_RATE = 0.3;

const STORAGE_KEY = "mock-network-settings";

const load = (): NetworkSettings => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return defaultNetworkSettings;
        const parsed = { ...defaultNetworkSettings, ...JSON.parse(saved) };
        // Older saves had "network" as an error mode; it's an error type now
        if (parsed.errorMode === "network") {
            parsed.errorMode = "always";
            parsed.errorType = "network";
        }
        return parsed;
    } catch {
        // Storage can be unavailable (private mode, blocked site data); fall back to defaults
        return defaultNetworkSettings;
    }
};

let settings = load();
const listeners = new Set<() => void>();

export const getNetworkSettings = () => settings;

export const setNetworkSettings = (patch: Partial<NetworkSettings>) => {
    // A new object each time, so React's useSyncExternalStore sees the change
    settings = { ...settings, ...patch };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Not saved, but still applies for this page load
    }
    listeners.forEach((listener) => listener());
};

export const resetNetworkSettings = () => setNetworkSettings(defaultNetworkSettings);

export const subscribeNetworkSettings = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const isDefaultNetworkSettings = (value: NetworkSettings) =>
    (Object.keys(defaultNetworkSettings) as (keyof NetworkSettings)[]).every(
        (key) =>
            // The error type has no effect (and is hidden) while errors are off
            (key === "errorType" && value.errorMode === "off") ||
            value[key] === defaultNetworkSettings[key],
    );

/** Whether the settings apply to this endpoint */
export const affects = (value: NetworkSettings, endpoint: Endpoint) =>
    value.target === "all" || value.target === endpoint;
