import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useMessageContext } from '../context/MessageContext';

interface MessageSettingDialogProps {
  open: boolean;
  eventId: number;
  guests: Set<number>;
  onClose: () => void;
  onConfirm: () => void;
  onUpdate: (guestId: number) => void;
}

const MessageSettingDialog: React.FC<MessageSettingDialogProps> = ({
  open,
  eventId,
  guests,
  onClose,
  onConfirm,
  onUpdate
}) => {
  const { subject, message, setSubject, setMessage } = useMessageContext();

  const handleSave = async () => {
    try {
      await onConfirm();

      await Promise.all(
        Array.from(guests).map(id => onUpdate(id))
      );
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Send Email
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Subject"
          type="text"
          fullWidth
          variant="outlined"
          value={subject[eventId] || ''}
          onChange={(e) => setSubject(eventId, e.target.value)}
        />
        <TextField
          margin="dense"
          label="Message"
          type="text"
          fullWidth
          multiline
          rows={18}
          variant="outlined"
          value={message[eventId] || ''}
          onChange={(e) => setMessage(eventId, e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageSettingDialog;
