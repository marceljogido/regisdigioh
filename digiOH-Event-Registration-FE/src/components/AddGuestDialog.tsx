import { useState } from 'react';
import { read, utils } from 'xlsx';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Input } from "./ui/input";
import { toast } from 'react-toastify';

import useGuestApi from '../api/guestApi';

// Define the types for the props
interface AddGuestDialogProps {
  isOpen: boolean;
  guestAttributes: string[];
  eventId: string | null;
  onClose: () => void;
  onSave: (newGuest: Record<string, any>) => void;
}

const AddGuestDialog = ({ isOpen, onClose, onSave, guestAttributes, eventId }: AddGuestDialogProps) => {
  const [newGuest, setNewGuest] = useState<Record<string, any>>({ registration_type: 'ots' });
  const [importMode, setImportMode] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [importResult, setImportResult] = useState<any>(null);
  const { addSingleGuest } = useGuestApi();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (importMode) {
      if (!selectedFile) {
        console.error("No file selected for import.");
        return;
      }

      setIsImporting(true);
      setImportResult(null);

      // 1. Read file to get total rows count for "fake" progress
      // 1. Read file and Iterate
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[][] = utils.sheet_to_json(worksheet, { header: 1 });

          const headers = json.shift()?.map((h: any) => String(h).trim().toLowerCase()) || [];
          const rows = json;
          const count = rows.length;
          setTotalRows(count);
          setProcessedCount(0);

          let successCount = 0;
          let failCount = 0;

          // Process one by one
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            setProcessedCount(prev => prev + 1);

            try {
              // Map row to guest object (frontend mapping)
              let guestData: any = {};
              let attributesData: any = {};

              const columnMap: any = {
                'nama': 'username',
                'username': 'username',
                'full name': 'username',
                'email': 'email',
                'e-mail': 'email',
                'no hp': 'phoneNum',
                'phone': 'phoneNum',
                'nomor hp': 'phoneNum',
                'instansi': 'instansi',
                'company': 'instansi',
                'jabatan': 'attr:Jabatan',
                'keterangan': 'attr:Keterangan',
                'cp': 'attr:CP',
                'contact person': 'attr:CP',
                'no hp cp': 'attr:No HP CP',
                'konfirmasi': 'confirmation',
                'kehadiran': 'confirmation',
                'hadir': 'confirmation',
                'status': 'confirmation',
                'jumlah orang': 'attr:Jumlah Orang',
                'pax': 'attr:Jumlah Orang'
              };

              // Iterate based on headers to cover all columns including empty/sparse ones
              headers.forEach((header: string, index: number) => {
                const mapKey = columnMap[header];
                const cellValue = row[index];

                if (mapKey) {
                  if (mapKey.startsWith('attr:')) {
                    const attrName = mapKey.split(':')[1];
                    attributesData[attrName] = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                  } else {
                    if (mapKey === 'confirmation') {
                      const val = String(cellValue).toLowerCase();
                      if (['confirmed', 'represented', 'to be confirmed', 'cancelled'].includes(val)) {
                        guestData[mapKey] = val;
                      }
                    } else {
                      guestData[mapKey] = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                    }
                  }
                }
              });

              // Validation Defaults
              if (!guestData.username) guestData.username = 'Unknown Guest';
              if (!guestData.email) guestData.email = `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}@no-email.com`;
              if (!guestData.phoneNum) guestData.phoneNum = '-';

              // Combine attributes into guestData for the API
              guestData.attributes = attributesData;

              // Import defaults to RSVP registration type
              guestData.registration_type = 'rsvp';

              // Send directly to API to avoid closing modal
              await addSingleGuest(guestData, eventId);

              successCount++;

              // Simple delay to allow UI update if it's too fast
              // await new Promise(r => setTimeout(r, 10));

            } catch (err) {
              console.error("Row import error", err);
              failCount++;
            }
          }

          setImportResult({ successCount, failCount });
        } catch (error) {
          console.error(error);
          setImportResult({ successCount: 0, failCount: 0, error: true });
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsBinaryString(selectedFile);

    } else {
      try {
        // Prepare structured data for API
        // Default values for hidden fields
        const guestData: Record<string, any> = {
          username: newGuest['username'],
          email: '', // Hidden field - empty
          phoneNum: '', // Hidden field - empty
          instansi: newGuest['instansi'],
          registration_type: newGuest['registration_type'] || 'ots',
          attributes: {
            'Jabatan': newGuest['Jabatan'] || '',
            'Jumlah Orang': newGuest['Jumlah Orang'] || '1',
            'Keterangan': '', // Hidden - empty
            'CP': '', // Hidden - empty
            'No HP CP': '' // Hidden - empty
          }
        };

        onSave(guestData);
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
    setImportResult(null);
    setNewGuest({});
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add Guest</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent>
          {importMode ? (
            importResult ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="text-xl font-bold text-green-600">Import Successful!</div>
                <div className="text-center">
                  <p>Total Data Processed: <strong>{totalRows}</strong></p>
                  <p className="text-green-600">Success: <strong>{importResult.successCount}</strong></p>
                  <p className="text-red-500">Failed: <strong>{importResult.failCount}</strong></p>
                </div>
              </div>
            ) : (
              <>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                  disabled={isImporting}
                />
                <Button
                  onClick={handleFormMode}
                  color="primary"
                  style={{ marginTop: '16px' }}
                  disabled={isImporting}
                >
                  Form
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  style={{ marginTop: '16px', marginLeft: '10px' }}
                  onClick={() => {
                    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
                    window.location.href = `${baseUrl}/api/download-template`;
                  }}
                  disabled={isImporting}
                >
                  Download Template
                </Button>
              </>
            )
          ) : (
            <>
              {/* Tipe Registrasi - Dropdown */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="registration-type-label">Tipe Registrasi</InputLabel>
                <Select
                  labelId="registration-type-label"
                  value={newGuest['registration_type'] || 'ots'}
                  label="Tipe Registrasi"
                  onChange={(e) => setNewGuest({ ...newGuest, registration_type: e.target.value })}
                >
                  <MenuItem value="ots">OTS (On The Spot)</MenuItem>
                  <MenuItem value="rsvp">RSVP</MenuItem>
                </Select>
              </FormControl>
              {/* Nama - Required */}
              <TextField
                key="username"
                label="Nama"
                value={newGuest["username"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["username"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              {/* Jabatan - NOT Required */}
              <TextField
                key="Jabatan"
                label="Jabatan"
                value={newGuest["Jabatan"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["Jabatan"]: e.target.value })}
                fullWidth
                margin="normal"
              />
              {/* Instansi - Required */}
              <TextField
                key="instansi"
                label="Instansi"
                value={newGuest["instansi"] || ''}
                onChange={(e) => setNewGuest({ ...newGuest, ["instansi"]: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              {/* Jumlah Orang - Required */}
              <TextField
                key="Jumlah Orang"
                label="Jumlah Orang"
                type="number"
                value={newGuest["Jumlah Orang"] || '1'}
                onChange={(e) => setNewGuest({ ...newGuest, ["Jumlah Orang"]: e.target.value })}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 1 }}
              />
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
          {!importResult && (
            <Button onClick={onClose} color="primary" disabled={isImporting}>
              Cancel
            </Button>
          )}

          {importResult ? (
            <Button onClick={onClose} color="primary">
              Done
            </Button>
          ) : (
            <Button type="submit" color="primary" disabled={isImporting} >
              {isImporting ? `Importing data... (${processedCount} of ${totalRows} data)` : 'Save'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddGuestDialog;
