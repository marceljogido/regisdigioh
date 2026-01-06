import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { Event } from "../types/types"
import useEventApi from '../api/eventApi';

interface UpdateEventDialogProps {
    open: boolean;
    onClose: () => void;
    currentEvent: Event;
    onUpdate: (updatedEvent: Event) => void;
}

const UpdateEventDialog: React.FC<UpdateEventDialogProps> = ({ open, onClose, currentEvent, onUpdate }) => {
    const [eventData, setEventData] = useState(currentEvent);
    const { changeLastUpdate } = useEventApi();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        try {
            const response = await changeLastUpdate(currentEvent.id.toString(), eventData)

            if (response.status === 200) {
                toast.success('Event updated successfully!');
                onUpdate(eventData);
                onClose();
            } else {
                toast.error('Failed to update event! Please try again.');
                console.error('Failed to update event:', response.status);
            }
        } catch (error) {
            toast.error('Error updating event! Please try again.');
            console.error('Error updating event:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Update Event</DialogTitle>
            <DialogContent>
                <TextField
                    label="Name"
                    name="name"
                    value={eventData.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={eventData.start_date}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="End Date"
                    name="end_date"
                    type="date"
                    value={eventData.end_date}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Sales"
                    name="sales"
                    value={eventData.sales}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Account Manager"
                    name="account_manager"
                    value={eventData.account_manager}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Company"
                    name="company"
                    value={eventData.company || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Event Time"
                    name="event_time"
                    value={eventData.event_time || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Loading Date"
                    name="loading_date"
                    type="date"
                    value={eventData.loading_date ? eventData.loading_date.toString() : ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Discord Channel"
                    name="discord_channel"
                    value={eventData.discord_channel || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Drive Folder"
                    name="drive_folder"
                    value={eventData.drive_folder || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Location"
                    name="location"
                    value={eventData.location || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateEventDialog;
