import { ServerSideDemo } from "@/feature/ServerSide/ServerSide";

/** The mock API pages and sorts; the table only shows what it gets back. */
export const ServerSideDemoPage = () => (
    <>
        {/* React 19 moves <title> into <head> */}
        <title>Server Side Demo · Table</title>
        <ServerSideDemo />
    </>
);
