import Header from "./components/Header";
import { Demo } from "@/feature/Demo";
import { ServerSideDemo } from "@/feature/ServerSide/ServerSide";
function App() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <Demo />
            <ServerSideDemo />
        </div>
    );
}

export default App;
