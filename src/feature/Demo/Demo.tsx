import Table from "@/components/Table/Table";
import { columns } from "./columns";
import { attendeeColumns } from "./attendee/columns";
import { fitnessClassesData } from "@/mocks/data";
import type { Attendee } from "@/types/data.types";

export const Demo = () => {
    return (
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Classes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This week's schedule. Expand a class to see its attendees.
                </p>
            </div>

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
                    return (
                        <Table columns={attendeeColumns} data={(value.value as Attendee[]) || []} />
                    );
                }}
            />
        </div>
    );
};
