import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LuActivity, LuRotateCcw, LuX } from "react-icons/lu";
import { cn, focusRing } from "@/components/Table/utils";
import {
    getNetworkSettings,
    isDefaultNetworkSettings,
    RANDOM_FAILURE_RATE,
    resetNetworkSettings,
    setNetworkSettings,
    subscribeNetworkSettings,
    type ErrorMode,
    type ErrorType,
    type Latency,
    type NetworkSettings,
    type Target,
} from "@/mocks/networkSettings";

type Option<V extends string | number> = { value: V; label: string; hint?: string };

const latencyOptions: Option<Latency>[] = [
    { value: "instant", label: "Instant", hint: "0ms" },
    { value: "realistic", label: "Realistic", hint: "100–400ms" },
    { value: "slow", label: "Slow", hint: "1.5s" },
    { value: "very-slow", label: "Very slow", hint: "5s" },
];

const errorOptions: Option<ErrorMode>[] = [
    { value: "off", label: "Off" },
    { value: "random", label: "Random", hint: `${RANDOM_FAILURE_RATE * 100}% fail` },
    { value: "always", label: "Always", hint: "every request" },
];

const errorTypeOptions: Option<ErrorType>[] = [
    { value: 400, label: "400", hint: "bad request" },
    { value: 404, label: "404", hint: "not found" },
    { value: 500, label: "500", hint: "server" },
    { value: "network", label: "Network", hint: "no response" },
];

const targetOptions: Option<Target>[] = [
    { value: "all", label: "All APIs" },
    { value: "classes", label: "Classes" },
    { value: "attendees", label: "Attendees" },
];

/** A row of radio buttons styled as a segmented control; native radios keep arrow-key navigation */
const Segmented = <V extends string | number>({
    legend,
    name,
    options,
    value,
    onChange,
}: {
    legend: string;
    name: string;
    options: Option<V>[];
    value: V;
    onChange: (value: V) => void;
}) => (
    <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {legend}
        </legend>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn(
                        "flex flex-1 cursor-pointer flex-col items-center rounded-md px-1.5 py-1 text-center text-xs text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                        "has-checked:bg-white has-checked:font-medium has-checked:text-gray-900 has-checked:shadow-xs dark:has-checked:bg-gray-950 dark:has-checked:text-white",
                        "has-focus-visible:ring-2 has-focus-visible:ring-gray-400 dark:has-focus-visible:ring-gray-500",
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        className="sr-only"
                    />
                    {option.label}
                    {option.hint && (
                        <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
                            {option.hint}
                        </span>
                    )}
                </label>
            ))}
        </div>
    </fieldset>
);

/**
 * Header button + panel for simulating network conditions in the mock API.
 * Every change refetches active queries, so its effect shows right away.
 */
export const NetworkControls = () => {
    const settings = useSyncExternalStore(subscribeNetworkSettings, getNetworkSettings);
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const idPrefix = useId();
    const isDefault = isDefaultNetworkSettings(settings);

    const update = (patch: Partial<NetworkSettings>) => {
        setNetworkSettings(patch);
        void queryClient.invalidateQueries();
    };

    const reset = () => {
        resetNetworkSettings();
        void queryClient.invalidateQueries();
    };

    // Close on a click outside the panel or on Escape
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    open && "bg-gray-100 dark:bg-gray-800",
                    focusRing,
                )}
            >
                <LuActivity aria-hidden className="size-4" />
                <span className="hidden sm:inline">Network</span>
                {/* Amber dot while anything differs from the defaults, so a forgotten "Always fail" is visible */}
                {!isDefault && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-gray-900">
                        <span className="sr-only">(custom settings active)</span>
                    </span>
                )}
            </button>

            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Mock network settings"
                    className="absolute top-full right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Mock network
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Simulated API. Changes refetch the current data.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            className={cn(
                                "rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                                focusRing,
                            )}
                        >
                            <LuX aria-hidden className="size-4" />
                        </button>
                    </div>

                    <Segmented
                        legend="Latency"
                        name={`${idPrefix}-latency`}
                        options={latencyOptions}
                        value={settings.latency}
                        onChange={(latency) => update({ latency })}
                    />
                    <Segmented
                        legend="Errors"
                        name={`${idPrefix}-errors`}
                        options={errorOptions}
                        value={settings.errorMode}
                        onChange={(errorMode) => update({ errorMode })}
                    />
                    {settings.errorMode !== "off" && (
                        <Segmented
                            legend="Error type"
                            name={`${idPrefix}-error-type`}
                            options={errorTypeOptions}
                            value={settings.errorType}
                            onChange={(errorType) => update({ errorType })}
                        />
                    )}

                    <label className="flex cursor-pointer items-center justify-between gap-3">
                        <span>
                            <span className="block text-xs font-medium text-gray-700 dark:text-gray-200">
                                Empty results
                            </span>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                                Lists come back with no rows
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            role="switch"
                            checked={settings.empty}
                            onChange={(event) => update({ empty: event.target.checked })}
                            className="peer sr-only"
                        />
                        <span
                            aria-hidden
                            className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-gray-300 transition-colors peer-checked:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400 dark:bg-gray-700 dark:peer-checked:bg-gray-100 peer-checked:[&>span]:translate-x-4.5"
                        >
                            <span className="inline-block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform dark:bg-gray-900" />
                        </span>
                    </label>

                    <Segmented
                        legend="Apply to"
                        name={`${idPrefix}-target`}
                        options={targetOptions}
                        value={settings.target}
                        onChange={(target) => update({ target })}
                    />

                    <div className="flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={reset}
                            disabled={isDefault}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                                focusRing,
                            )}
                        >
                            <LuRotateCcw aria-hidden className="size-3.5" />
                            Reset to defaults
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
