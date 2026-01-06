import { PencilSquareIcon } from "@heroicons/react/24/outline";
import UpdateEventDialog from './UpdateEventDialog';
import { useEffect, useState } from "react";

interface Event {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    sales: string;
    account_manager: string;
    company?: string;
    event_time?: string;
    loading_date?: Date;
    discord_channel?: string;
    drive_folder?: string;
    location?: string;
}

interface EventProfileProps {
    event: Event;
}

const EventProfile: React.FC<EventProfileProps> = ({ event }) => {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(event);

    useEffect(() => {
        setCurrentEvent(event);
    }, [event]);

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return '-';
        if (typeof date === 'string') date = new Date(date);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    const handleUpdateEvent = (updatedEvent: Event) => {
        setCurrentEvent(updatedEvent);
    };

    return (
        <div className="bg-white rounded-3xl mt-2 w-full max-w-3xl mx-auto relative">
            <div className="rounded-t-3xl p-8 space-y-4 bg-gradient-to-r from-pink-400 to-pink-700 text-white">
                <div className="font-semibold text-3xl">Event Name:</div>
                <div className="font-extrabold text-4xl">{currentEvent.name}</div>
            </div>
            <div className="rounded-b-3xl p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-20 gap-y-7">
                    <div>
                        <div className="font-semibold">Client Name:</div>
                        <div className="font-bold">{currentEvent.company || '-'}</div>
                    </div>
                    <div>
                        <div className="font-semibold">Event Location:</div>
                        <div className="font-bold">{currentEvent.location || '-'}</div>
                    </div>
                    <div>
                        <div className="font-semibold">Event Time:</div>
                        <div className="font-bold">{currentEvent.event_time || '-'}</div>
                    </div>
                    <div>
                        <div className="font-semibold">Start Date:</div>
                        <div className="font-bold text-red-600">{formatDate(currentEvent.start_date)}</div>
                        <div className="font-semibold">Until</div>
                        <div className="font-bold text-red-600">{formatDate(currentEvent.end_date)}</div>
                    </div>
                    <div>
                        <div className="font-semibold">Loading Date:</div>
                        <div className="font-bold text-red-600">{formatDate(currentEvent.loading_date)}</div>
                    </div>
                    <div>
                        <div className="font-semibold">Discord Channel:</div>
                        <div className="font-bold text-blue-600">
                            <a href={currentEvent.discord_channel || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                                Discord
                            </a>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold">Drive Folder:</div>
                        <div className="font-bold text-green-600">
                            <a href={currentEvent.drive_folder || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">
                                Onedrive
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 right-4">
                <PencilSquareIcon
                    className="h-5 w-5 text-gray-500 cursor-pointer transition-colors duration-300 hover:text-red-500"
                    onClick={() => setUpdateDialogOpen(true)}
                />
            </div>
            <UpdateEventDialog
                open={updateDialogOpen}
                onClose={() => setUpdateDialogOpen(false)}
                currentEvent={currentEvent}
                onUpdate={handleUpdateEvent}
            />
        </div>
    )
}

export default EventProfile;
