import { useState } from "react";
import Table from "@/components/Table/Table";
import { columns } from "./columns";
import { fitnessClassesData } from "@/mock/data";

export const Demo = () => {
    return (
        <div>
            <p>Demo Testing</p>

            <Table
                ariaLabel="FitnessClass"
                columns={columns}
                data={fitnessClassesData}
                pagination={{
                    pagination: { page: 1, size: 10, total: fitnessClassesData?.length },
                    pageSizeOptions: [3, 5, 10, 20],
                }}
                sorting={{
                    sorts: [],
                    isMultiple: false,
                }}
            />
        </div>
    );
};
