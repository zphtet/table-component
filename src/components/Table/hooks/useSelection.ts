import type { SelectedId, SelectionProps } from "../types";
import { useControllableState } from "./useControllableState";

type UseSelectionOptions = SelectionProps & {
    // ids of current page
    pageIds: SelectedId[];
};

export const useSelection = (props: UseSelectionOptions) => {
    const { pageIds } = props;
    const [value, setValue] = useControllableState(props.value ?? [], props.changeFn);
    const selectedSet = new Set(value);

    // Header checkbox state, derived from the selection so it can't get out of sync
    const selectedOnPage = pageIds.filter((id) => selectedSet.has(id)).length;
    const isAllSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
    const isSomeSelected = selectedOnPage > 0 && !isAllSelected;

    const toggleSelect = (id: SelectedId) => {
        if (selectedSet.has(id)) {
            setValue(value.filter((existingId) => existingId !== id));
            return;
        }
        setValue([...value, id]);
    };

    /** Adds the page's rows that aren't selected yet, so no id is added twice */
    const selectAll = () => {
        setValue([...value, ...pageIds.filter((id) => !selectedSet.has(id))]);
    };

    /** Removes only this page's rows; selections on other pages stay */
    const deselectAll = () => {
        const onPage = new Set(pageIds);
        setValue(value.filter((id) => !onPage.has(id)));
    };

    /** Header checkbox: deselect when the whole page is selected, otherwise fill the page */
    const toggleAll = () => (isAllSelected ? deselectAll() : selectAll());

    const isSelected = (id: SelectedId) => selectedSet.has(id);

    return {
        selection: value,
        toggleSelect,
        selectAll,
        deselectAll,
        toggleAll,
        isAllSelected,
        isSomeSelected,
        isSelected,
    };
};
