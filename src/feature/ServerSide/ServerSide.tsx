import { useQuery } from "@tanstack/react-query";
import Table from "@/components/Table/Table";
import { columns } from "../Demo/columns";
export const ServerSideDemo = () => {
    const { data, isLoading, refetch, isError } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/classes");
                const data = await res.json();
                return data;
            } catch (e) {
                throw new Error();
            }
        },
    });

    console.log("classess data", data);
    return (
        <div className="mx-auto max-w-11/12">
            <Table
                key={"serverside-classes"}
                data={data?.data || []}
                columns={columns}
                isError={isError}
                isLoading={isLoading}
                onRetry={refetch}
                pagination={{
                    pagination: data?.pagination,
                    pageSizeOptions: [5, 10, 20],
                }}
            />
        </div>
    );
};
