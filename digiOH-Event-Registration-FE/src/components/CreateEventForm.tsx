import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DocumentPlusIcon, PencilIcon } from '@heroicons/react/24/outline';

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEventApi from '../api/eventApi';
import { Event } from "../types/types";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CreateEventFormProps {
    onEventCreated: () => void;
    editEvent?: Event | null;
    isEditMode?: boolean;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated, editEvent, isEditMode = false }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState('');
    const [clientName, setClientName] = useState('');
    const [salesName, setSalesName] = useState('');
    const [accountManager, setAccountManager] = useState('');
    const [startTime, setStartTime] = useState('');
    const [location, setLocation] = useState('');
    const [discordChannel, setDiscordChannel] = useState('');
    const [driveFolder, setDriveFolder] = useState('');
    const [loadingDate, setLoadingDate] = useState<Date | null>(null);

    const navigate = useNavigate();
    const { createEvent, updateEvent } = useEventApi();

    // Pre-fill form when editing
    useEffect(() => {
        if (editEvent && isEditMode) {
            setEventName(editEvent.name || '');
            setStartDate(editEvent.start_date ? new Date(editEvent.start_date) : null);
            setEndDate(editEvent.end_date ? new Date(editEvent.end_date) : null);
            setClientName(editEvent.company || '');
            setSalesName(editEvent.sales || '');
            setAccountManager(editEvent.account_manager || '');
            setStartTime(editEvent.event_time || '');
            setLocation(editEvent.location || '');
            setDiscordChannel(editEvent.discord_channel || '');
            setDriveFolder(editEvent.drive_folder || '');
            setLoadingDate(editEvent.loading_date ? new Date(editEvent.loading_date) : null);
        }
    }, [editEvent, isEditMode]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const data = {
                'name': eventName,
                'start_date': startDate,
                'end_date': endDate,
                'sales': salesName,
                'account_manager': accountManager,
                'company': clientName,
                'event_time': startTime,
                'location': location,
                'discord_channel': discordChannel || null,
                'drive_folder': driveFolder || null,
                'loading_date': loadingDate || null
            }

            if (isEditMode && editEvent) {
                await updateEvent(editEvent.id.toString(), data);
                toast.success('Event updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                await createEvent(data);
                toast.success('Event created successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }

            // Reset all fields
            setEventName('');
            setStartDate(null);
            setEndDate(null);
            setClientName('');
            setSalesName('');
            setAccountManager('');
            setStartTime('');
            setLocation('');
            setDiscordChannel('');
            setDriveFolder('');
            setLoadingDate(null);

            onEventCreated();
            navigate('/dashboard');

        } catch (error) {
            console.error('Error saving event:', error);
            toast.error(isEditMode ? 'Failed to update event.' : 'Failed to create event.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleStartDateChange = (date: Date | null) => setStartDate(date);
    const handleEndDateChange = (date: Date | null) => setEndDate(date);
    const handleLoadingDateChange = (date: Date | null) => setLoadingDate(date);

    return (
        <Card className="w-full max-w-2xl m-2 mt-0 flex flex-col justify-center rounded-xl drop-shadow-xl bg-white">
            <CardHeader className="py-3 px-4 bg-gradient-to-r from-pink-400 to-pink-700 rounded-t-xl">
                <CardTitle className="flex items-center font-bold text-white text-xl">
                    {isEditMode ? (
                        <><PencilIcon className="h-5 w-5 mr-2" /> Edit Event</>
                    ) : (
                        <><DocumentPlusIcon className="h-5 w-5 mr-2" /> Create Event</>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleSubmit}>
                    {/* Table-style form */}
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700 w-1/3">Event Name <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter event name"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Start Date <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={handleStartDateChange}
                                        required
                                        placeholderText="Select start date"
                                        className="w-full p-2 border rounded"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">End Date <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <DatePicker
                                        selected={endDate}
                                        onChange={handleEndDateChange}
                                        required
                                        placeholderText="Select end date"
                                        className="w-full p-2 border rounded"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Start Time <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="time"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Location <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter location"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Client <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter client name"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Sales <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter sales name"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={salesName}
                                        onChange={(e) => setSalesName(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Account Manager <span className="text-red-500">*</span></td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter account manager"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={accountManager}
                                        onChange={(e) => setAccountManager(e.target.value)}
                                    />
                                </td>
                            </tr>
                            {/* Optional Fields */}
                            <tr className="border-b bg-gray-100">
                                <td colSpan={2} className="py-1 px-4 text-xs text-gray-500 font-semibold">OPTIONAL FIELDS</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Discord Channel</td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter discord channel"
                                        className="w-full p-2 border rounded"
                                        value={discordChannel}
                                        onChange={(e) => setDiscordChannel(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Drive Folder URL</td>
                                <td className="py-2 px-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter drive folder URL"
                                        className="w-full p-2 border rounded"
                                        value={driveFolder}
                                        onChange={(e) => setDriveFolder(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Loading Date</td>
                                <td className="py-2 px-4">
                                    <DatePicker
                                        selected={loadingDate}
                                        onChange={handleLoadingDateChange}
                                        placeholderText="Select loading date"
                                        className="w-full p-2 border rounded"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="flex justify-end p-4 bg-gray-50 rounded-b-xl">
                        <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-700 font-bold text-white py-2 px-6 rounded-lg shadow hover:scale-105 transition-transform">
                            {isEditMode ? 'UPDATE EVENT' : 'CREATE EVENT'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card >
    );
};

export default CreateEventForm;
