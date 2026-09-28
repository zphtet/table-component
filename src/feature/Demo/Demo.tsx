import Table from "@/components/Table/Table"
import { columns } from "./columns"
import { fitnessClassesData } from "@/mock/data"

export const Demo = () => {

    return <div>
            <p>
                Demo Testing 
            </p>
        <Table
            ariaLabel="FitnessClass"
            columns={columns || []}
            data={fitnessClassesData || []}
        
        />
    </div>
}