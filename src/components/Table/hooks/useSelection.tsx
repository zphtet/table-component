import type { SelectedId, UseSelectionOptions } from "@/types/table.types";
import { useControllableState } from "./useControllableState";

export const useSelection = (props: UseSelectionOptions) => {
    const { pageIds } = props;
    const [value, setValue] = useControllableState(props?.selectedIds ?? [], props?.onChangeSelect);
    const selectedSet = new Set(value);

    // Header checkbox state, derived from the selection so it can't get out of sync
    const selectedOnPage = pageIds.filter((id) => selectedSet.has(id)).length;
    const isAllSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
    const isSomeSelected = selectedOnPage > 0 && !isAllSelected;

    const toggleCheck = (id: SelectedId) => {
        if (selectedSet.has(id)) {
            setValue(value.filter((existingId) => existingId !== id));
            return;
        }
        setValue([...value, id]);
    };

    const check = (id: SelectedId) => {
        if (!selectedSet.has(id)) setValue([...value, id]);
    };

    const unCheck = (id: SelectedId) => {
        setValue(value.filter((existingId) => existingId !== id));
    };

    /** Adds the page's rows that aren't selected yet, so no id is added twice */
    const selectAll = () => {
        const selectedIdsss = pageIds.filter((id) => !selectedSet.has(id));
        console.log("selectedIdsss", pageIds, selectedSet, selectedIdsss);
        setValue([...value, ...pageIds.filter((id) => !selectedSet.has(id))]);
    };

    /** Removes only this page's rows; selections on other pages stay */
    const deselectAll = () => {
        const onPage = new Set(pageIds);
        setValue(value.filter((id) => !onPage.has(id)));
    };

    /** Header checkbox: deselect when the whole page is selected, otherwise fill the page */
    const toggleAll = () => (isAllSelected ? deselectAll() : selectAll());

    const isAlreadyChecked = (id: SelectedId) => selectedSet.has(id);

    return {
        selection: value,
        toggleCheck,
        check,
        unCheck,
        selectAll,
        deselectAll,
        toggleAll,
        isAllSelected,
        isSomeSelected,
        isAlreadyChecked,
    };
};
