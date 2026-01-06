import LoadingPage from "../pages/LoadingPage";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

import { Event } from "../types/types";
import { toast } from "react-toastify";
import useEventApi from '../api/eventApi';

const Dashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const { email, token } = useAuth();
    const { getEvents, deleteEvent } = useEventApi();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchEvents();
        }
    }, [navigate, token]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteEvent(eventId.toString());
            toast.success('Event deleted successfully!');
            fetchEvents(); // Refresh list
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    const handleEditEvent = (eventId: number) => {
        // Store event ID and navigate to create page in edit mode
        localStorage.setItem('editEventId', eventId.toString());
        navigate(`/create?edit=${eventId}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (!email) {
        return <LoadingPage message="Loading user data..." />;
    }

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-[#D9D9D9] min-h-screen p-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-[#608EC4]">
                    Dashboard
                </h1>
                <Link
                    to="/create"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-700 text-white font-semibold rounded-lg hover:scale-105 transition-transform shadow"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Event
                </Link>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
                        <p className="text-gray-600 mb-4">Are you sure you want to delete this event? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600">
                    <h2 className="text-lg font-semibold text-white">Events List</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="mb-4">No events found</p>
                        <Link to="/create" className="text-pink-600 hover:underline">
                            Create your first event →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold">#</th>
                                    <th className="py-3 px-4 text-left font-semibold">Event Name</th>
                                    <th className="py-3 px-4 text-left font-semibold">Start Date</th>
                                    <th className="py-3 px-4 text-left font-semibold">End Date</th>
                                    <th className="py-3 px-4 text-left font-semibold">Time</th>
                                    <th className="py-3 px-4 text-left font-semibold">Location</th>
                                    <th className="py-3 px-4 text-left font-semibold">Client</th>
                                    <th className="py-3 px-4 text-left font-semibold">Sales</th>
                                    <th className="py-3 px-4 text-left font-semibold">Account Manager</th>
                                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event, index) => (
                                    <tr key={event.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-4 font-medium text-gray-800">{event.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(event.start_date)}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(event.end_date)}</td>
                                        <td className="py-3 px-4 text-gray-600">{event.event_time || '-'}</td>
                                        <td className="py-3 px-4 text-gray-600">{event.location || '-'}</td>
                                        <td className="py-3 px-4 text-gray-600">{event.company || '-'}</td>
                                        <td className="py-3 px-4 text-gray-600">{event.sales || '-'}</td>
                                        <td className="py-3 px-4 text-gray-600">{event.account_manager || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/event/${event.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditEvent(event.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(event.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;
