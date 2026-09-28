import type { UsePaginationOptions } from "@/types/table.types";
import { useControllableState } from "./useControllableState";
const DEFAULT_PAGINATION = { page: 1, size: 10, total: 10 };
export const usePagination = (props: UsePaginationOptions) => {
    const { pagination } = props;
    const [value, setValue] = useControllableState(
        { ...DEFAULT_PAGINATION, ...pagination },
        props?.onChangeHandler,
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
