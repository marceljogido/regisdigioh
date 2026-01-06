import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Input } from "./ui/input";
import { toast } from 'react-toastify';

// Define the types for the props
interface AddGuestDialogProps {
    isOpen: boolean;
    guestAttributes: string[];
    onClose: () => void;
    onSave: (newGuest: Record<string, any>) => void;
    onImport: (selectedFile: File) => void;
}

const AddGuestDialog = ({ isOpen, onClose, onSave, guestAttributes, onImport }: AddGuestDialogProps) => {
  const [newGuest, setNewGuest] = useState<Record<string, any>>({});
  const [importMode, setImportMode] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (importMode) {
      if (!selectedFile) {
        console.error("No file selected for import.");
        return;
      }

      onImport(selectedFile)
      onClose();
    } else {
      try {
        onSave(newGuest);
        setNewGuest({});
        toast.success('Guest added successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.error('Error adding guest:', error);
        toast.error('Failed to add gues!.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    setImportMode(true);
  };

  const handleFormMode = () => {
    setImportMode(false);
    setNewGuest({});
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add Guest</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent>
          {importMode ? (
            <>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              <Button
                onClick={handleFormMode}
                color="primary"
                style={{ marginTop: '16px' }}
              >
                Form
              </Button>
            </>
          ) : (
            <>
              <TextField
                key="username"
                label="Name"
                value={newGuest["username"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["username"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                key="email"
                label="Email"
                value={newGuest["email"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["email"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                key="phoneNum"
                label="Phone Number"
                value={newGuest["phoneNum"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["phoneNum"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                key="instansi"
                label="Instansi"
                value={newGuest["instansi"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["instansi"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              {guestAttributes.map((key) => (
                <TextField
                  key={key}
                  label={key}
                  value={newGuest[key] || ''}
                  onChange={(e) => setNewGuest({ ...newGuest, [key]: e.target.value })}
                  fullWidth
                  margin="normal"
                  required
                />
              ))}
              <Button
                onClick={handleImport}
                color="primary"
                style={{ marginTop: '16px' }}
              >
                Import
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddGuestDialog;
