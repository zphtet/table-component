import Table from "@/components/Table/Table";
import { columns } from "./columns";
import { attendeeColumns } from "./attendee/columns";
import { fitnessClassesData } from "@/mock/data";
import { Attendee } from "@/types/data.types";

export const Demo = () => {
    return (
        <div>
            <p>Demo Testing</p>

            <Table
                ariaLabel="FitnessClass"
                columns={columns}
                data={fitnessClassesData}
                // pagination
                pagination={{
                    pagination: { page: 1, size: 10, total: fitnessClassesData?.length },
                    pageSizeOptions: [3, 5, 10, 20],
                }}
                // sorting
                sorting={{
                    sorts: [],
                    isMultiple: false,
                }}
                // expansion
                expandKey="attendees"
                renderExpandUI={(value) => {
                    // return <div> {JSON.stringify(value)}</div>;
                    return <Table columns={attendeeColumns} data={value.value as Attendee[]} />;
                }}
            />
        </div>
    );
};
