import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEventApi from '../api/eventApi';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CreateEventFormProps {
    onEventCreated: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState('');
    const [clientName, setClientName] = useState('');
    const [salesName, setSalesName] = useState('');
    const [accountManager, setAccountManager] = useState('');

    const navigate = useNavigate();
    const { createEvent } = useEventApi();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const data = {
                'name': eventName,
                'start_date': startDate,
                'end_date': endDate,
                'sales': salesName,
                'account_manager': accountManager,
                'company': clientName
            }

            await createEvent(data);

            setEventName('');
            setStartDate(null);
            setEndDate(null);
            setClientName('');
            setSalesName('');
            setAccountManager('');

            onEventCreated();

            navigate('/dashboard');

            toast.success('Event created successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create event.', {
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

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    };
    return (
        <Card className="w-full max-w-lg m-2 mt-0 p-3 flex flex-col justify-center rounded-3xl drop-shadow-xl">
            <CardHeader className="space-y-1 items-center bg-gradient-to-r from-pink-400 to-pink-700 rounded-t-3xl">
                <CardTitle className="flex items-center font-bold text-white text-4xl">
                    <DocumentPlusIcon className="h-8 w-8 mr-2" />
                    Create Event
                </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        id="event-name"
                        placeholder="Event Name"
                        required
                        className="w-full p-2 border rounded-md"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                    />
                    <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        required
                        placeholderText="Event Start Date"
                        className="w-full p-2 border rounded-md"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        required
                        placeholderText="Event End Date"
                        className="w-full p-2 border rounded-md"
                    />
                    <Input
                        type="text"
                        id="client-name"
                        placeholder="Client Name"
                        required
                        className="w-full p-2 border rounded-md"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <Input
                        type="text"
                        id="sales-name"
                        placeholder="Sales Name"
                        required
                        className="w-full p-2 border rounded-md"
                        value={salesName}
                        onChange={(e) => setSalesName(e.target.value)}
                    />
                    <Input
                        type="text"
                        id="account-manager"
                        placeholder="Account Manager"
                        required
                        className="w-full p-2 border rounded-md"
                        value={accountManager}
                        onChange={(e) => setAccountManager(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                        <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-700 font-extrabold text-white py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105">
                            CREATE!
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateEventForm;
