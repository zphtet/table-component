import { useMemo, useState } from "react";
import { Table, type SelectedId } from "@/components/Table";
import { focusRing } from "@/components/Table/utils";
import { columns } from "./columns";
import { attendeeColumns } from "./attendee/columns";
import { fitnessClassesData } from "@/mocks/data";
import { generateFitnessClasses, getAttendees } from "@/mocks/largeData";

// 20 = the hand-written classes; the rest are generated, for stress-testing
const DATASET_SIZES = [20, 1_000, 10_000, 50_000, 100_000];

export const Demo = () => {
    const [selectedIds, setSelectedIds] = useState<SelectedId[]>([]);
    const [datasetSize, setDatasetSize] = useState(DATASET_SIZES[0]);

    const { data, generatedMs } = useMemo(() => {
        if (datasetSize === fitnessClassesData.length) {
            return { data: fitnessClassesData, generatedMs: null };
        }
        const { classes, ms } = generateFitnessClasses(datasetSize);
        return { data: classes, generatedMs: ms };
    }, [datasetSize]);

    return (
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Classes
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        This week's schedule. Expand a class to see its attendees.
                    </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {generatedMs != null && (
                        <span className="tabular-nums">
                            Generated in {Math.round(generatedMs)} ms
                        </span>
                    )}
                    <label className="flex items-center gap-2">
                        Rows
                        <select
                            value={datasetSize}
                            onChange={(e) => {
                                setDatasetSize(Number(e.target.value));
                                // Old ids don't belong to the new dataset
                                setSelectedIds([]);
                            }}
                            className={`h-8 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-gray-900 shadow-xs dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 ${focusRing}`}
                        >
                            {DATASET_SIZES.map((size) => (
                                <option key={size} value={size}>
                                    {size.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <Table
                // Pagination is uncontrolled and reads `total` only on mount, so remount per dataset
                key={datasetSize}
                ariaLabel="FitnessClass"
                columns={columns}
                data={data}
                // pagination
                pagination={{
                    value: { page: 1, size: 10, total: data.length },
                    pageSizeOptions: [3, 5, 10, 20, 100],
                }}
                // sorting
                sorting={{
                    value: [],
                    isMultiSort: false,
                }}
                // sticky header and maxHeight
                // isHeaderSticky={true}
                // maxHeight="400px"
                // expansion
                // expandKey="attendees"
                renderExpandedFn={({ row }) => {
                    // return <div> {JSON.stringify(value)}</div>;
                    return (
                        <Table
                            ariaLabel="Attendee tabble"
                            columns={attendeeColumns}
                            // Generated classes build their attendees on first expand
                            data={row.attendees ?? getAttendees(row)}
                            getRowIdFn={row => row.id}
                        />
                    );
                }}
                // selectio
                selection={{
                    value: selectedIds,
                    changeFn: setSelectedIds,
                }}
                getRowIdFn={(row) => row.id}
            />
        </div>
    );
};
