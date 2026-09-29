import { Demo } from "@/feature/Demo";

/** All rows are in memory; the table pages and sorts them itself. */
export const ClientDemoPage = () => (
    <>
        {/* React 19 moves <title> into <head> */}
        <title>Client Demo · Table</title>
        <Demo />
    </>
);
