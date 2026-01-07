import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import UpdateConfirmationDialog from "./UpdateConfirmationDialog";
import UpdateMerchandiseDialog from "./UpdateMerchandiseDialog";
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
    merchandise: string;
    merchandise_updated_by?: string;
    qrCode?: string; // TAMBAHAN: Properti untuk menampung data gambar QR
    attributes?: { [key: string]: string };
    confirmation_updated_by?: string;
    attendance_updated_by?: string;
    attributes_updated_by?: string;
    email_sent_by?: string;
}

interface Props {
    guests: Guest[];
    updateAttendance: (selectedAttendanceStatus: string, guestId: number) => void;
    updateMerchandise: (selectedMerchandiseStatus: string, guestId: number) => void;
    updateJumlahOrang: (jumlahOrang: number, guestId: number) => void;
    getIconForSorting: (key: string) => React.ReactNode;
    handleSort: (key: string) => void;
    selectedGuests: Set<number>;
    selectAll: boolean;
    onSelectGuest: (id: number) => void;
    onSelectAll: (currentState: boolean) => void;
    currentPage: number;
    itemsPerPage: number;
}

const EventDataTable: React.FC<Props> = ({
    guests,
    updateAttendance,
    updateMerchandise,
    updateJumlahOrang,
    getIconForSorting,
    handleSort,
    selectedGuests,
    selectAll,
    onSelectGuest,
    onSelectAll,
    currentPage,
    itemsPerPage
}) => {
    const navigate = useNavigate();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [merchandiseDialogOpen, setMerchandiseDialogOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    const [infoBoxVisible, setInfoBoxVisible] = useState(false);
    const [infoBoxPosition, setInfoBoxPosition] = useState({ top: 0, left: 0 });
    const [infoGuest, setInfoGuest] = useState<Guest | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrModalImage, setQrModalImage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
    }, []);

    const capitalizeFirstLetter = (word: string) => {
        if (word.toLowerCase() === 'attended') return 'Hadir';
        if (word.toLowerCase() === 'represented') return 'Mewakili';
        if (word.toLowerCase() === 'did not attend') return 'Belum Hadir';
        return word;
    };

    const getAttendanceColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'attended': return '#25B380';
            case 'represented': return '#2CBAE9';
            case 'did not attend': return '#FF8211';
            default: return '#000000';
        }
    };

    const getMerchandiseColor = (status: string) => {
        return status === 'received' ? '#25B380' : '#C80000';
    };

    const formatMerchandise = (status: string) => {
        return status === 'received' ? 'Sudah Terima' : 'Belum Terima';
    };

    const handleConfirmationClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setConfirmationDialogOpen(true);
    };

    const handleConfirmationDialogClose = () => {
        setConfirmationDialogOpen(false);
        setSelectedGuest(null);
    };

    const handleMerchandiseClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setMerchandiseDialogOpen(true);
    };

    const handleMerchandiseDialogClose = () => {
        setMerchandiseDialogOpen(false);
        setSelectedGuest(null);
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

    const handleConfirmationUpdate = async (newStatus: string, jumlahOrang: number) => {
        if (selectedGuest) {
            try {
                await updateAttendance(newStatus, selectedGuest.id);
                // Update jumlah orang jika status hadir atau mewakili
                if (newStatus === 'attended' || newStatus === 'represented') {
                    await updateJumlahOrang(jumlahOrang, selectedGuest.id);
                }
                toast.success(`Status kehadiran berhasil diupdate! (${jumlahOrang} orang)`);
            } catch (error) {
                toast.error('Gagal mengupdate status kehadiran!');
            }
        }
    };

    const handleMerchandiseUpdate = async (newStatus: string) => {
        if (selectedGuest) {
            try {
                await updateMerchandise(newStatus, selectedGuest.id);
                toast.success('Merchandise status updated successfully!');
            } catch (error) {
                toast.error('Failed to update merchandise status!');
            }
        }
    };

    return (
        <div className="my-2 rounded-b-xl border-slate-950 bg-[#ffffff] overflow-x-auto">
            <Table className="max-w-screen">
                <TableCaption>A list of your recent events.</TableCaption>
                <TableHeader className="bg-[#EDEDED] border-y-[1px] border-black overflow-x-auto">
                    <TableRow>
                        <TableHead className="w-[50px] text-center">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </TableHead>
                        <TableHead className="text-center text-black w-[50px]">No</TableHead>
                        <TableHead className="w-[150px] text-left text-black cursor-pointer hover:underline">
                            <div className="flex items-center justify-start" onClick={() => handleSort('username')}>
                                {getIconForSorting('username')}
                                <div>Nama</div>
                            </div>
                        </TableHead>
                        <TableHead className="text-center text-black">QR Code</TableHead>
                        <TableHead className="text-center text-black">Jabatan</TableHead>
                        <TableHead className="text-center text-black">Instansi</TableHead>
                        <TableHead className="text-center text-black">Keterangan</TableHead>
                        <TableHead className="text-center text-black">CP</TableHead>
                        <TableHead className="text-center text-black">No HP CP</TableHead>
                        <TableHead className="text-center text-black">Kehadiran</TableHead>
                        <TableHead className="text-center text-black">Merchandise</TableHead>
                        <TableHead className="text-center text-black">Jumlah Orang</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.length > 0 ? (
                        guests.map((guest, index) => (
                            <TableRow key={guest.id} className={index % 2 === 0 ? "bg-white" : "bg-[#D9D9D933]"}>
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedGuests.has(guest.id)}
                                        onChange={() => onSelectGuest(guest.id)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </TableCell>
                                <TableCell className="font-medium text-left">
                                    <div className="flex items-center justify-start">
                                        <InformationCircleIcon onClick={(e) => handleInfoIconClick(e, guest)} className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" />
                                        {guest.username}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {guest.qrCode ? (
                                        <img
                                            src={guest.qrCode}
                                            alt="QR"
                                            className="w-10 h-10 mx-auto cursor-pointer hover:scale-150 transition-all border rounded p-1"
                                            onClick={() => {
                                                setQrModalImage(guest.qrCode || null);
                                                setQrModalOpen(true);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    {guest.attributes ? (guest.attributes['Jabatan'] || guest.attributes['jabatan'] || '-') : '-'}
                                </TableCell>
                                <TableCell className="text-center">{guest.instansi}</TableCell>
                                <TableCell className="text-center">
                                    {guest.attributes ? (guest.attributes['Keterangan'] || guest.attributes['keterangan'] || '-') : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {guest.attributes ? (guest.attributes['CP'] || guest.attributes['cp'] || '-') : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {guest.attributes ? (guest.attributes['No HP CP'] || guest.attributes['no hp cp'] || '-') : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center font-bold" style={{ color: getAttendanceColor(guest.attendance) }}>
                                        <PencilSquareIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={() => handleConfirmationClick(guest)} />
                                        {capitalizeFirstLetter(guest.attendance)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-bold" style={{ color: getMerchandiseColor(guest.merchandise) }}>
                                    <div className="flex items-center justify-center">
                                        <PencilSquareIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={() => handleMerchandiseClick(guest)} />
                                        {formatMerchandise(guest.merchandise)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {guest.attributes ? (guest.attributes['Jumlah Orang'] || guest.attributes['jumlah orang'] || '-') : '-'}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={12} className="text-center text-2xl text-red-600">No data available. Select Event!</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Dialog-dialog tetap sama di bawah */}
            {
                selectedGuest && (
                    <UpdateConfirmationDialog
                        open={confirmationDialogOpen}
                        onClose={handleConfirmationDialogClose}
                        currentStatus={selectedGuest.attendance}
                        currentJumlahOrang={parseInt(selectedGuest.attributes?.['Jumlah Orang'] || selectedGuest.attributes?.['jumlah orang'] || '1')}
                        onUpdate={handleConfirmationUpdate}
                    />
                )
            }
            {
                selectedGuest && (
                    <UpdateMerchandiseDialog open={merchandiseDialogOpen} onClose={handleMerchandiseDialogClose} currentStatus={selectedGuest.merchandise} onUpdate={handleMerchandiseUpdate} />
                )
            }
            {
                infoGuest && (
                    <InfoBox visible={infoBoxVisible} position={infoBoxPosition} guest={infoGuest} onClose={handleCloseInfoBox} />
                )
            }
            {/* QR Code Modal */}
            {qrModalOpen && qrModalImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setQrModalOpen(false)}
                >
                    <div
                        className="bg-white p-6 rounded-xl shadow-2xl max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={qrModalImage} alt="QR Code" className="w-80 h-80 mx-auto" />
                        <button
                            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => setQrModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
}

export default EventDataTable;
