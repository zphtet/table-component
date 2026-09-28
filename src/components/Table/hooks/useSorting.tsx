import type { Sort, UseSortingOptions } from "@/types/table.types";
import { useControllableState } from "./useControllableState";
export const useSorting = (props: UseSortingOptions) => {
    const [storedSorting, setSorting] = useControllableState(props?.sorts, props?.onChangeSort);
    // Single sort by default. Turning multi-sort off keeps only the main (first) sort.
    const isMultiple = props?.isMultiple ?? false;
    const sorting = isMultiple ? storedSorting : storedSorting?.slice(0, 1);
    /** Cycles the column none → asc → desc → none. "none" means the column isn't in `sorting`. */
    const onClickSort = (id: string) => {
        const sorts = sorting ?? [];
        const current = sorts.find((sort) => sort.columnId === id);

        let next: Sort | undefined;
        if (!current) next = { columnId: id, direction: "asc" };
        else if (current.direction === "asc") next = { columnId: id, direction: "desc" };

        if (!isMultiple) {
            setSorting(next ? [next] : []);
            return;
        }

        // Multi-sort: keep the other columns, update this one in place (or append it if new).
        if (!current) setSorting([...sorts, next!]);
        else if (next) setSorting(sorts.map((sort) => (sort.columnId === id ? next : sort)));
        else setSorting(sorts.filter((sort) => sort.columnId !== id));
    };
    return {
        sorting,
        onClickSort,
        isMultiple: isMultiple,
    };
};
