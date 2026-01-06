import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';
import { Button } from "./ui/button";

import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

interface Event {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    sales: string;
    account_manager: string;
    company?: string;
}

interface LoadEventFormProps {
    events: Event[];
}

const LoadEventForm: React.FC<LoadEventFormProps> = ({ events }) => {
    // const [events, setEvents] = useState<Event[]>([]);
    // const token = localStorage.getItem('token');
    const [selectedEvent, setSelectedEvent] = useState('Select Event Database');
    const navigate = useNavigate();

    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event.name);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const selectedEventId = events.find(event => event.name === selectedEvent)?.id;
        try {
            localStorage.setItem('event id', selectedEventId?.toString() || '');
            setSelectedEvent('Select Event Database')
            navigate("/dashboard")
            toast.success('Event loaded successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            toast.error('Failed to load event!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <Card className="w-full max-w-lg m-2 p-3 flex flex-col justify-center rounded-3xl drop-shadow-xl">
            <CardHeader className="space-y-1 items-center bg-gradient-to-r from-sage-400 to-sage-700 rounded-t-3xl">
                <CardTitle className="flex items-center font-bold text-white text-4xl">
                    <FolderIcon className="h-8 w-8 mr-2" />
                    Load Event
                </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <form onSubmit={handleSubmit}>
                    <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-between p-2 bg-white rounded shadow-xl drop-shadow-lg w-full">
                        <span>{selectedEvent}</span>
                        <ChevronDownIcon className="h-5 w-5 ml-2" />
                    </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-48 overflow-y-auto">
                            {events.map(event => (
                                <DropdownMenuItem key={event.id} onClick={() => handleEventSelect(event)}>
                                    {event.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex justify-end mt-4 ">
                        <Button type="submit" className="bg-gradient-to-r from-sage-400 to-sage-700 font-extrabold text-white py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105">
                            LOAD!
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoadEventForm;
