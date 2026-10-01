import type { PaginationProps } from "../types";
import { DEFAULT_PAGINATION } from "../utils";
import { useControllableState } from "./useControllableState";

type UsePaginationOptions = Omit<PaginationProps, "pageSizeOptions" | "isManual">;

export const usePagination = (props: UsePaginationOptions) => {
    const [value, setValue] = useControllableState(
        { ...DEFAULT_PAGINATION, ...props.value },
        props.changeFn,
    );
    const setPage = (pageNum: number) => {
        setValue({ ...value, page: pageNum });
    };
    const setSize = (size: number) => {
        setValue({ ...value, size: size, page: 1 });
    };
    return {
        pagination: value,
        setPage,
        setSize,
    };
};
