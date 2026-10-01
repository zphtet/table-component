import { createBrowserRouter, Navigate } from "react-router";
import App from "./App";
import { ClientDemoPage } from "./pages/ClientDemoPage";
import { EcommerceStorePage } from "./pages/EcommerceStorePage";
import { ServerSideDemoPage } from "./pages/ServerSideDemoPage";

// Created once, outside the React tree, as React Router's data mode expects
export const router = createBrowserRouter([
    {
        path: "/",
        // Header + the current page
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/client-side" replace /> },
            { path: "client-side", element: <ClientDemoPage /> },
            { path: "server-side", element: <ServerSideDemoPage /> },
            { path: "ecommerce-store", element: <EcommerceStorePage /> },
            // Unknown URLs go back to the first demo
            { path: "*", element: <Navigate to="/client-side" replace /> },
        ],
    },
]);
