import type { ExpansionProps, SelectedId } from "../types";
import { useControllableState } from "./useControllableState";

type UseExpansionOptions = ExpansionProps;

/** Kept in the table rather than in each row, so a row stays open when it remounts (e.g. after paging) */
export const useExpansion = (props: UseExpansionOptions) => {
    const [value, setValue] = useControllableState(props.value ?? [], props.changeFn);
    const expandedSet = new Set(value);

    const toggleExpand = (id: SelectedId) => {
        if (expandedSet.has(id)) {
            setValue(value.filter((existingId) => existingId !== id));
            return;
        }
        setValue([...value, id]);
    };

    const isExpanded = (id: SelectedId) => expandedSet.has(id);

    return {
        toggleExpand,
        isExpanded,
    };
};
