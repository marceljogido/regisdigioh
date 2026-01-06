import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import UpdateConfirmationDialog from "./UpdateConfirmationDialog";
import UpdateAttendanceDialog from "./UpdateAttendanceDialog";
import UpdateGuestDialog from "./UpdateGuestDialog";
import InfoBox from "./InfoBox";
import { toast } from 'react-toastify';

interface Guest {
    id: number;
    username: string;
    email: string;
    phoneNum: string;
    confirmation: string;
    attendance: string;
    emailed: boolean;
    instansi: string;
    qrCode?: string; // TAMBAHAN: Properti untuk menampung data gambar QR
    attributes?: { [key: string]: string };
    confirmation_updated_by?: string;
    attendance_updated_by?: string;
    attributes_updated_by?: string;
    email_sent_by?: string;
}

interface Props {
    guests: Guest[];
    selectedGuests: Set<number>;
    selectAll: boolean;
    updateAttendance: (selectedAttendanceStatus: string, guestId: number) => void;
    updateConfirmation: (selectedConfirmationStatus: string, guestId: number) => void;
    updateGuest: (guest: Guest) => void;
    getIconForSorting: (key: string) => React.ReactNode;
    handleSort: (key: string) => void;
    onSelectGuest: (guestId: number) => void;
    onSelectAll: (selectAll: boolean) => void;
}

const EventDataTable: React.FC<Props> = ({
    guests,
    selectedGuests,
    selectAll,
    updateAttendance,
    updateConfirmation,
    getIconForSorting,
    handleSort,
    updateGuest,
    onSelectGuest,
    onSelectAll,
}) => {
    const navigate = useNavigate();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [selectedAttendanceGuest, setSelectedAttendanceGuest] = useState<Guest | null>(null);

    const [infoBoxVisible, setInfoBoxVisible] = useState(false);
    const [infoBoxPosition, setInfoBoxPosition] = useState({ top: 0, left: 0 });
    const [infoGuest, setInfoGuest] = useState<Guest | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
    }, []);

    const toggleSelectGuest = (guestId: number) => {
        onSelectGuest(guestId);
    };

    const capitalizeFirstLetter = (word: string) => {
        if (word.toLowerCase() === 'confirmed') return 'Confirmed';
        if (word.toLowerCase() === 'to be confirmed') return 'To Be Confirmed';
        if (word.toLowerCase() === 'represented') return 'Represented';
        if (word.toLowerCase() === 'cancelled') return 'Cancelled';
        if (word.toLowerCase() === 'attended') return 'Attended';
        if (word.toLowerCase() === 'did not attend') return 'Did Not Attend';
        return word;
    };

    const getConfirmationColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return '#25B380';
            case 'to be confirmed': return '#FF8211';
            case 'represented': return '#2CBAE9';
            case 'cancelled': return '#C80000';
            default: return '#000000';
        }
    };

    const getAttendanceColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'attended': return '#25B380';
            case 'represented': return '#2CBAE9';
            case 'did not attend': return '#C80000';
            default: return '#000000';
        }
    };

    const getEmailStatusColor = (emailed: boolean) => emailed ? '#25B380' : '#C80000';

    const handleUpdateClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setUpdateDialogOpen(true);
    };

    const handleUpdateDialogClose = () => {
        setUpdateDialogOpen(false);
        setSelectedGuest(null);
    };

    const handleConfirmationClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setConfirmationDialogOpen(true);
    };

    const handleConfirmationDialogClose = () => {
        setConfirmationDialogOpen(false);
        setSelectedGuest(null);
    };

    const handleAttendancePencilClick = (guest: Guest) => {
        setSelectedAttendanceGuest(guest);
        setAttendanceDialogOpen(true);
    };

    const handleAttendanceDialogClose = () => {
        setAttendanceDialogOpen(false);
        setSelectedAttendanceGuest(null);
    };

    const handleInfoIconClick = (event: React.MouseEvent, guest: Guest) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        setInfoBoxPosition({ top: rect.bottom + scrollTop, left: rect.left + scrollLeft });
        setInfoBoxVisible(true);
        setInfoGuest(guest);
    };

    const handleCloseInfoBox = () => {
        setInfoBoxVisible(false);
        setInfoGuest(null);
    }

    const handleConfirmationUpdate = async (newStatus: string) => {
        if (selectedGuest) {
            try {
                await updateConfirmation(newStatus, selectedGuest.id);
                toast.success('Confirmation status updated successfully!');
            } catch (error) {
                toast.error('Failed to update confirmation status!');
            }
        }
    };

    const handleAttendanceUpdate = async (newStatus: string) => {
        if (selectedAttendanceGuest) {
            try {
                await updateAttendance(newStatus, selectedAttendanceGuest.id);
                toast.success('Attendance status updated successfully!');
            } catch (error) {
                toast.error('Failed to update attendance status!');
            }
        }
    };

    const attributeKeys = Array.from(
        new Set(guests.flatMap((guest) => guest.attributes ? Object.keys(guest.attributes) : []))
    );

    return (
        <div className="my-2 rounded-b-xl border-slate-950 bg-[#ffffff] overflow-x-auto">
            <Table className="max-w-screen">
                <TableCaption>A list of your recent events.</TableCaption>
                <TableHeader className="bg-[#EDEDED] border-y-[1px] border-black overflow-x-auto">
                    <TableRow>
                        <TableHead className="text-center text-black">
                            <input type="checkbox" checked={selectAll} onChange={() => onSelectAll(!selectAll)} />
                        </TableHead>
                        <TableHead className="w-[100px] text-center text-black cursor-pointer hover:underline">
                            <div className="flex items-center justify-center" onClick={() => handleSort('username')}>
                                {getIconForSorting('username')}
                                <div>Name</div>
                            </div>
                        </TableHead>
                        {/* TAMBAHAN HEADER QR CODE */}
                        <TableHead className="text-center text-black">QR Code</TableHead>
                        <TableHead className="text-center text-black cursor-pointer hover:underline">
                            <div className="flex items-center justify-center" onClick={() => handleSort('email')}>
                                {getIconForSorting('email')}
                                <div>Email</div>
                            </div>
                        </TableHead>
                        <TableHead className="text-center text-black">Confirmation</TableHead>
                        <TableHead className="text-center text-black">Attendance</TableHead>
                        <TableHead className="text-center text-black">Is Emailed</TableHead>
                        <TableHead className="text-center text-black">Instansi</TableHead>
                        {attributeKeys.map((key) => (
                            <TableHead key={key} className="text-center text-black">{key}</TableHead>
                        ))}
                        <TableHead className="text-center text-black">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.length > 0 ? (
                        guests.map((guest, index) => (
                            <TableRow key={guest.id} className={index % 2 === 0 ? "bg-white" : "bg-[#D9D9D933]"}>
                                <TableCell className="text-center">
                                    <input type="checkbox" checked={selectedGuests.has(guest.id)} onChange={() => toggleSelectGuest(guest.id)} />
                                </TableCell>
                                <TableCell className="font-medium text-center">
                                    <div className="flex items-center">
                                        <InformationCircleIcon onClick={(e) => handleInfoIconClick(e, guest)} className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" />
                                        {guest.username}
                                    </div>
                                </TableCell>
                                {/* TAMBAHAN CELL GAMBAR QR CODE */}
                                <TableCell className="text-center">
                                    {guest.qrCode ? (
                                        <img 
                                            src={guest.qrCode} 
                                            alt="QR" 
                                            className="w-10 h-10 mx-auto cursor-pointer hover:scale-150 transition-all border rounded p-1"
                                            onClick={() => {
                                                const win = window.open("");
                                                win?.document.write(`<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${guest.qrCode}" width="400" /></div>`);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">{guest.email}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center font-bold" style={{ color: getConfirmationColor(guest.confirmation) }}>
                                        <PencilSquareIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={() => handleConfirmationClick(guest)} />
                                        {capitalizeFirstLetter(guest.confirmation)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-start font-bold" style={{ color: getAttendanceColor(guest.attendance) }}>
                                        <PencilSquareIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={() => handleAttendancePencilClick(guest)} />
                                        {capitalizeFirstLetter(guest.attendance)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-bold" style={{ color: getEmailStatusColor(guest.emailed) }}>
                                    {guest.emailed ? "Emailed" : "Not Emailed"}
                                </TableCell>
                                <TableCell className="text-center">{guest.instansi}</TableCell>
                                {attributeKeys.map((key) => (
                                    <TableCell key={key} className="text-center">
                                        {guest.attributes ? guest.attributes[key] : '-'}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => handleUpdateClick(guest)} className="border-2 py-1 px-3 rounded-lg bg-[#E6F1F6] hover:bg-[#7cd5ff] border-[#9A9A9A] transition-all flex items-center space-x-1">
                                            <span>Edit</span>
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={attributeKeys.length + 10} className="text-center text-2xl text-red-600">No data available. Select Event!</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Dialog-dialog tetap sama di bawah */}
            {selectedGuest && (
                <UpdateConfirmationDialog open={confirmationDialogOpen} onClose={handleConfirmationDialogClose} currentStatus={selectedGuest.confirmation} onUpdate={handleConfirmationUpdate} />
            )}
            {selectedAttendanceGuest && (
                <UpdateAttendanceDialog open={attendanceDialogOpen} onClose={handleAttendanceDialogClose} currentStatus={selectedAttendanceGuest.attendance} onUpdate={handleAttendanceUpdate} />
            )}
            {selectedGuest && (
                <UpdateGuestDialog isOpen={updateDialogOpen} onClose={handleUpdateDialogClose} onUpdate={updateGuest} guestAttributes={attributeKeys} guest={selectedGuest} />
            )}
            {infoGuest && (
                <InfoBox visible={infoBoxVisible} position={infoBoxPosition} guest={infoGuest} onClose={handleCloseInfoBox} />
            )}
        </div>
    );
}

export default EventDataTable;
