import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../layout/layout";
import Login from "../pages/Login";
import EventData from "../pages/EventData";
import Dashboard from "../pages/Dashboard";
import EventInformation from "../pages/EventInformation";
import ScanQR from "../pages/ScanQR";

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
            { path: "data", element: <EventData />},
            { path: "information", element: <EventInformation />},
            { path: "scan", element: <ScanQR />},
            // { path: "loading", element: <LoadingPage />}
        ],
    }
]);

const Routes = () => {
    return <RouterProvider router={routeList} />;
};

export default Routes;
