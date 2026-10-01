import type { UsePaginationOptions } from "@/types/table.types";
import { useControllableState } from "./useControllableState";
import { DEFAULT_PAGINATION } from "@/lib/constant";
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
