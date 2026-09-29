import { Outlet } from "react-router";
import Header from "./components/Header";

/** Layout for every page: the header, then whichever page the URL matches */
function App() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <Outlet />
        </div>
    );
}

export default App;
