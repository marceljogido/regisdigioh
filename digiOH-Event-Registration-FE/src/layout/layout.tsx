import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ToastContainer } from 'react-toastify';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-[#D9D9D9]">
            <Sidebar />
            <div className="flex flex-col flex-grow bg-[#D9D9D9] lg:ml-64 w-[10px]">
                <div className="flex-grow">
                    <Outlet />
                </div>
                <div className="bg-[#3F3F3F] text-white p-4 font-bold text-right w-auto">
                    PT DIGITAL OPEN HOUSE @ 2024
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Layout;
