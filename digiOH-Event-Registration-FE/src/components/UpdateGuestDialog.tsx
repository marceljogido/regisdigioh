import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface Guest {
  id: number;
  username: string;
  email: string;
  phoneNum: string;
  confirmation: string;
  attendance: string;
  emailed: boolean;
  instansi: string;
  merchandise: string;
  merchandise_updated_by?: string;
  attributes?: { [key: string]: string };
}

// Define the types for the props
interface UpdateGuestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedGuest: Guest) => void;
  guestAttributes: string[];
  guest: Guest;
}

const UpdateGuestDialog = ({ isOpen, onClose, onUpdate, guestAttributes, guest }: UpdateGuestDialogProps) => {
  const [updatedGuest, setUpdatedGuest] = useState<Guest>(guest);

  useEffect(() => {
    setUpdatedGuest(guest);
  }, [guest]);

  const handleSave = () => {
    onUpdate(updatedGuest);
    onClose();
  };

  const handleChange = (key: string, value: string) => {
    setUpdatedGuest(prevGuest => {
      const updated = { ...prevGuest, [key]: value };
      return updated;
    });
  };

  const handleAttributeChange = (key: string, value: string) => {
    setUpdatedGuest(prevGuest => {
      const updatedAttributes = { ...prevGuest.attributes, [key]: value };
      const updated = { ...prevGuest, attributes: updatedAttributes };
      return updated;
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Update Guest</DialogTitle>
      <DialogContent>
        <TextField
          key="username"
          label="Name"
          value={updatedGuest.username}
          onChange={(e) => handleChange("username", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          key="email"
          label="Email"
          value={updatedGuest.email}
          onChange={(e) => handleChange("email", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          key="phoneNum"
          label="Phone Number"
          value={updatedGuest.phoneNum}
          onChange={(e) => handleChange("phoneNum", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          key="instansi"
          label="Instansi"
          value={updatedGuest.instansi}
          onChange={(e) => handleChange("instansi", e.target.value)}
          fullWidth
          margin="normal"
        />
        {guestAttributes.map((key) => (
          <TextField
            key={key}
            label={key}
            value={updatedGuest.attributes?.[key] || ''}
            onChange={(e) => handleAttributeChange(key, e.target.value)}
            fullWidth
            margin="normal"
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateGuestDialog;
