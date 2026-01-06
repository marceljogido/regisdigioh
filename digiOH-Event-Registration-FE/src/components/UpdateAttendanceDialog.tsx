import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface UpdateAttendanceDialogProps {
    open: boolean;
    onClose: () => void;
    currentStatus: string;
    onUpdate: (newStatus: string) => void;
}

const UpdateAttendanceDialog: React.FC<UpdateAttendanceDialogProps> = ({ open, onClose, currentStatus, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdate = async () => {
        try {
            onUpdate(selectedStatus);
            onClose();
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className='font-extrabold'>Update Attendance Status</DialogTitle>
            <DialogContent>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    fullWidth
                >
                    <MenuItem value="attended">Attended</MenuItem>
                    <MenuItem value="represented">Represented</MenuItem>
                    <MenuItem value="did not attend">Did Not Attend</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateAttendanceDialog;
