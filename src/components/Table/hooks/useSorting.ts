import type { Sort, SortingProps } from "../types";
import { useMemo } from "react";
import { useControllableState } from "./useControllableState";

type UseSortingOptions = SortingProps;

export const useSorting = (props: UseSortingOptions) => {
    const [storedSorts, setSorts] = useControllableState(props.value ?? [], props.changeFn);
    // Single sort by default. Turning multi-sort off keeps only the main (first) sort.
    const isMultiSort = props?.isMultiSort ?? false;
    // Memoized so `sorts` keeps its identity between renders; useTable only re-sorts when it changes
    const sorts = useMemo(
        () => (isMultiSort ? storedSorts : storedSorts.slice(0, 1)),
        [storedSorts, isMultiSort],
    );
    /** Cycles the column none → asc → desc → none. "none" means the column isn't in `sorts`. */
    const toggleSort = (id: string) => {
        const current = sorts.find((sort) => sort.columnId === id);

        let next: Sort | undefined;
        if (!current) next = { columnId: id, direction: "asc" };
        else if (current.direction === "asc") next = { columnId: id, direction: "desc" };

        if (!isMultiSort) {
            setSorts(next ? [next] : []);
            return;
        }

        // Multi-sort: keep the other columns, update this one in place (or append it if new).
        if (!current) setSorts([...sorts, next!]);
        else if (next) setSorts(sorts.map((sort) => (sort.columnId === id ? next : sort)));
        else setSorts(sorts.filter((sort) => sort.columnId !== id));
    };
    return {
        sorts,
        toggleSort,
        isMultiSort,
    };
};
