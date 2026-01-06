import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface UpdateMerchandiseDialogProps {
    open: boolean;
    onClose: () => void;
    currentStatus: string;
    onUpdate: (newStatus: string) => void;
}

const UpdateMerchandiseDialog: React.FC<UpdateMerchandiseDialogProps> = ({ open, onClose, currentStatus, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdate = async () => {
        try {
            onUpdate(selectedStatus);
            onClose();
        } catch (error) {
            console.error('Error updating merchandise status:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Update Status Merchandise</DialogTitle>
            <DialogContent>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    fullWidth
                    style={{ marginTop: '10px' }}
                >
                    <MenuItem value="received">Sudah Terima</MenuItem>
                    <MenuItem value="not received">Belum Terima</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateMerchandiseDialog;
