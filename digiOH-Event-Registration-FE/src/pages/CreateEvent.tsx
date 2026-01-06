import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import CreateEventForm from "../components/CreateEventForm";
import useEventApi from '../api/eventApi';
import { Event } from "../types/types";

const CreateEvent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { token } = useAuth();
    const { getEvents, getLoadedEvent } = useEventApi();
    const [editEvent, setEditEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);

    const editEventId = searchParams.get('edit');
    const isEditMode = !!editEventId;

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [navigate, token]);

    useEffect(() => {
        if (editEventId) {
            setLoading(true);
            getLoadedEvent(editEventId)
                .then(event => {
                    setEditEvent(event);
                })
                .catch(error => {
                    console.error('Error loading event:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [editEventId]);

    const handleEventCreated = async () => {
        await getEvents();
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-[#D9D9D9] min-h-screen ml-0 lg:ml-[7rem] p-4"
        >
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-[#608EC4]">
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                </h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>
            <div className="flex justify-center">
                {loading ? (
                    <div className="text-gray-500">Loading event data...</div>
                ) : (
                    <CreateEventForm
                        onEventCreated={handleEventCreated}
                        editEvent={editEvent}
                        isEditMode={isEditMode}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default CreateEvent;
