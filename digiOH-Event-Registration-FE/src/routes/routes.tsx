import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../layout/layout";
import Login from "../pages/Login";
import EventData from "../pages/EventData";
import Dashboard from "../pages/Dashboard";
import ScanQR from "../pages/ScanQR";
import ScanMerchandise from "../pages/ScanMerchandise";
import CreateEvent from "../pages/CreateEvent";

const routeList = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "/", element: <Dashboard /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "create", element: <CreateEvent /> },
            { path: "data", element: <EventData /> },
            { path: "event/:id", element: <EventData /> },
            { path: "scan", element: <ScanQR /> },
            { path: "scan-merchandise", element: <ScanMerchandise /> },
        ],
    }
]);

const Routes = () => {
    return <RouterProvider router={routeList} />;
};

export default Routes;
