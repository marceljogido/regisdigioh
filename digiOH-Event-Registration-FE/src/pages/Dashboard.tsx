// import CreateEventForm from "../components/CreateEventForm";
import LoadEventForm from "../components/LoadEventForm";
import ProfileHolder from "../components/ProfileHolder";
import ProfileList from "../components/ProfileList";
import LoadingPage from "../pages/LoadingPage";
import ImportDataForm from "../components/ImportDatabaseForm";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

import { Event } from "../types/types";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { toast } from "react-toastify";
import useEventApi from '../api/eventApi';
const ProfPicTemplate = require("../assets/profile-template.svg").default as string;

const Dashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const { email, token } = useAuth();
    const { getEvents, importEvent } = useEventApi();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchEvents();
        }
    }, [navigate]);

    const fetchEvents = async () => {
        try {
            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleImport = async (selectedFile: File) => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await importEvent(selectedFile);
            toast.success('Event imported successfully!')
            if (token) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Error importing the file:', error);
            toast.error('Failed to load event!')
        }
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
            className="flex flex-col lg:flex-row bg-[#D9D9D9] justify-between ml-0 lg:ml-[7rem] ml-custom"
        >
            <div className="flex flex-col items-center lg:hidden mb-4 mt-4">
                <Avatar>
                    <AvatarImage src={ProfPicTemplate} />
                    <AvatarFallback>PP</AvatarFallback>
                </Avatar>
                <div className="text-sm truncate pr-2 max-w-[150px]">
                    {email}
                </div>
            </div>

            <div className="flex flex-col justify-start width-custom">
                <div className="p-3 text-2xl lg:text-4xl font-semibold text-[#608EC4]">
                    Dashboard
                </div>
                <div className="flex-1 flex flex-col lg:flex-row p-4 items-center lg:items-start justify-center space-y-4 lg:space-y-0 lg:space-x-4 responsive-container">
                    <ImportDataForm onImport={handleImport}/>
                    {/* <CreateEventForm onEventCreated={handleEventCreated}/> */}
                    <LoadEventForm events={events} />
                </div>
            </div>

            <div className="hidden lg:flex flex-col space-y-9 pt-12 lg:w-30">
                <div className="w-full">
                    <ProfileHolder email={email} imageSrc={ProfPicTemplate} />
                </div>
                <div className="w-full items-end flex">
                    <ProfileList />
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
