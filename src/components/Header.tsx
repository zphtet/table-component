import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { NavLink } from "react-router";
import { NetworkControls } from "./NetworkControls";
import { cn, focusRing } from "./Table/utils";

const navItems = [
    { to: "/client-side", label: "Client Demo" },
    { to: "/server-side", label: "Server Side Demo" },
    { to: "/ecommerce-store", label: "Ecommerce Store" },
];

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const isDark = theme === "dark";

    return (
        // On small screens the nav wraps onto its own row under the title and controls
        <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Table</h1>
            <nav
                aria-label="Demos"
                className="order-last flex w-full gap-1 sm:order-none sm:w-auto"
            >
                {navItems.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        // NavLink sets aria-current="page" on the active link for screen readers
                        className={({ isActive }) =>
                            cn(
                                "rounded-lg px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                                isActive
                                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                                focusRing,
                            )
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>
            <div className="ml-auto flex items-center gap-1">
                {/* Mock API controls */}
                <NetworkControls />
                <button
                    type="button"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
            </div>
        </header>
    );
}
