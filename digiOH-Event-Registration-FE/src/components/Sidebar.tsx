import { HomeIcon, PlusCircleIcon, ArrowLeftStartOnRectangleIcon, Bars3Icon, XMarkIcon, QrCodeIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const logo = require("../assets/digioh-logo.svg").default as string;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth()

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
        setIsOpen(false);
    };

    const handleEventDataClick = () => {
        navigate('/data');
        setIsOpen(false);
    };

    const handleCreateEventClick = () => {
        navigate('/create');
        setIsOpen(false);
    };

    const handleScanQRCodeClick = () => {
        navigate('/scan');
        setIsOpen(false);
    };

    const handleScanMerchandiseClick = () => {
        navigate('/scan-merchandise');
        setIsOpen(false);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const getNavItemClassName = (path: string) => {
        return location.pathname === path || location.pathname.startsWith('/event/') && path === '/data'
            ? 'bg-[#A2E3FF] text-white'
            : 'hover:bg-[#A2E3FF]';
    };

    return (
        <div className="relative lg:fixed lg:inset-y-0 lg:left-0 lg:h-screen lg:w-64 bg-gradient-to-b from-blue-400 to-blue-700">
            <div className="lg:hidden p-4">
                <button onClick={toggleSidebar} className="text-white">
                    {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            <div className={`fixed lg:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out h-screen w-64 bg-gradient-to-b from-blue-400 to-blue-700 text-white flex flex-col z-40 lg:translate-x-0`}>
                <div className="p-4 text-2xl font-bold flex items-center cursor-pointer">
                    <img src={logo} alt="Logo" className="mr-2" />
                    <div>PT DIGITAL OPEN HOUSE</div>
                </div>

                {useAuth().token ? (
                    <>
                        <div className={`cursor-pointer p-2 m-4 mb-1 text-lg font-semibold ${getNavItemClassName('/dashboard')} rounded flex items-center`} onClick={handleDashboardClick}>
                            <HomeIcon className="h-6 w-6 mr-2" />
                            Dashboard
                        </div>

                        <div className="relative p-4 text-sm font-semibold text-gray-300 flex items-center">
                            <span>Management</span>
                            <span className="w-full h-px bg-gray-300 ml-2 flex-1"></span>
                        </div>

                        <ul className="p-4 space-y-2 overflow-auto pt-0">
                            <li className={`cursor-pointer p-2 text-lg rounded flex items-center ${getNavItemClassName('/data')}`} onClick={handleEventDataClick}>
                                <DocumentChartBarIcon className="h-6 w-6 mr-2" />
                                Event Data
                            </li>
                            <li className={`cursor-pointer p-2 text-lg rounded flex items-center ${getNavItemClassName('/create')}`} onClick={handleCreateEventClick}>
                                <PlusCircleIcon className="h-6 w-6 mr-2" />
                                Create Event
                            </li>
                        </ul>
                    </>
                ) : null}

                <div className="relative p-4 text-sm font-semibold text-gray-300 flex items-center">
                    <span>Scanning</span>
                    <span className="w-full h-px bg-gray-300 ml-2 flex-1"></span>
                </div>

                <ul className="p-4 space-y-2 overflow-auto pt-0">
                    <li className={`cursor-pointer p-2 text-lg rounded flex items-center ${getNavItemClassName('/scan')}`} onClick={handleScanQRCodeClick}>
                        <QrCodeIcon className="h-6 w-6 mr-2" />
                        Scan QR Kehadiran
                    </li>
                    <li className={`cursor-pointer p-2 text-lg rounded flex items-center ${getNavItemClassName('/scan-merchandise')}`} onClick={handleScanMerchandiseClick}>
                        <QrCodeIcon className="h-6 w-6 mr-2 text-purple-200" />
                        Scan QR Merchandise
                    </li>
                </ul>

                <div className="mt-auto relative p-4 text-sm font-semibold text-gray-300 flex items-center">
                    <span>Account</span>
                    <span className="w-full h-px bg-gray-300 ml-2 flex-1"></span>
                </div>

                <ul className="p-4 space-y-2 pt-0">
                    {useAuth().token ? (
                        <li className={`p-2 text-lg rounded flex items-center cursor-pointer hover:bg-white/10`} onClick={handleLogoutClick}>
                            <ArrowLeftStartOnRectangleIcon className="h-6 w-6 mr-2" />
                            Logout
                        </li>
                    ) : (
                        <li className={`p-2 text-lg rounded flex items-center cursor-pointer hover:bg-white/10`} onClick={() => navigate('/login')}>
                            <ArrowLeftStartOnRectangleIcon className="h-6 w-6 mr-2" />
                            Login Petugas
                        </li>
                    )}
                </ul>
            </div>

            {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={toggleSidebar}></div>}
        </div>
    );
};

export default Sidebar;

