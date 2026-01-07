import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Select, SelectChangeEvent, TextField, Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface UpdateConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    currentStatus: string;
    currentJumlahOrang?: number;
    onUpdate: (newStatus: string, jumlahOrang: number) => void;
}

const UpdateConfirmationDialog: React.FC<UpdateConfirmationDialogProps> = ({
    open,
    onClose,
    currentStatus,
    currentJumlahOrang = 1,
    onUpdate
}) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [jumlahOrang, setJumlahOrang] = useState(currentJumlahOrang);

    // Reset values when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedStatus(currentStatus);
            setJumlahOrang(currentJumlahOrang || 1);
        }
    }, [open, currentStatus, currentJumlahOrang]);

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdate = async () => {
        try {
            onUpdate(selectedStatus, jumlahOrang);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Update Status Kehadiran</DialogTitle>
            <DialogContent>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    fullWidth
                    style={{ marginTop: '10px' }}
                >
                    <MenuItem value="attended">Hadir</MenuItem>
                    <MenuItem value="represented">Mewakili</MenuItem>
                    <MenuItem value="did not attend">Belum Hadir</MenuItem>
                </Select>

                {/* Jumlah Orang Counter - hanya tampil jika status Hadir atau Mewakili */}
                {(selectedStatus === 'attended' || selectedStatus === 'represented') && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Jumlah Orang Hadir
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <IconButton
                                onClick={() => setJumlahOrang(prev => Math.max(1, prev - 1))}
                                sx={{
                                    bgcolor: 'grey.100',
                                    '&:hover': { bgcolor: 'grey.200' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <RemoveIcon />
                            </IconButton>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 60, textAlign: 'center' }}>
                                {jumlahOrang}
                            </Typography>
                            <IconButton
                                onClick={() => setJumlahOrang(prev => prev + 1)}
                                sx={{
                                    bgcolor: 'grey.100',
                                    '&:hover': { bgcolor: 'grey.200' },
                                    width: 48,
                                    height: 48
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate} color="primary" variant="contained">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateConfirmationDialog;
