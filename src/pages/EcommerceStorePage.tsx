import { EcommerceStore } from "@/feature/EcommerceStore/EcommerceStore";

/** Stores paged and sorted by the mock API, with each store's stock as the child table. */
export const EcommerceStorePage = () => (
    <>
        {/* React 19 moves <title> into <head> */}
        <title>Ecommerce Store · Table</title>
        <EcommerceStore />
    </>
);
