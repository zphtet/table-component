import { useState } from "react";

export const useControllableState = <V,>(value: V, changeFn?: (value: V) => void) => {
    const [inner, setInner] = useState(value);
    const isControlled = typeof changeFn === "function";
    const current = isControlled ? value : inner;

    const setValue = (next: V) => {
        if (!isControlled) setInner(next);
        changeFn?.(next);
    };

    return [current, setValue] as const;
};
