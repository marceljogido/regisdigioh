import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface UpdateConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    currentStatus: string;
    onUpdate: (newStatus: string) => void;
}

const UpdateConfirmationDialog: React.FC<UpdateConfirmationDialogProps> = ({ open, onClose, currentStatus, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdate = async () => {
        try {
            onUpdate(selectedStatus);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Update Confirmation Status</DialogTitle>
            <DialogContent>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    fullWidth
                >
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="to be confirmed">To Be Confirmed</MenuItem>
                    <MenuItem value="represented">Represented</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateConfirmationDialog;
