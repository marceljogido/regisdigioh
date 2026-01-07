import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Guest } from '../types/types';
import useGuestApi from '../api/guestApi';

const ConfirmAttendance: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = useAuth();
    const [jumlahOrang, setJumlahOrang] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    const guest: Guest | null = location.state?.guest || null;

    const {
        updateGuestAttendance,
        updateGuestAttendanceBy,
        updateGuestConfirmation,
        updateGuestConfirmationBy,
        updateJumlahOrang,
    } = useGuestApi();

    useEffect(() => {
        if (!guest) {
            toast.error('Data tamu tidak ditemukan!');
            navigate('/scan');
        }
    }, [guest, navigate]);

    const isAlreadyAttended =
        guest?.attendance === 'attended' ||
        guest?.attendance === 'represented' ||
        guest?.confirmation === 'confirmed' ||
        guest?.confirmation === 'represented';

    const handleAttend = async () => {
        if (!guest || isLoading) return;
        setIsLoading(true);

        try {
            const updater = email || 'Public User';
            await updateGuestAttendance('attended', guest.id.toString());
            await updateGuestConfirmation('confirmed', guest.id.toString());
            await updateGuestAttendanceBy(updater, guest.id.toString());
            await updateGuestConfirmationBy(updater, guest.id.toString());
            await updateJumlahOrang(jumlahOrang, guest.id.toString());

            toast.success(`${guest.username} berhasil Check-in (${jumlahOrang} orang)!`);
            navigate('/scan');
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Gagal memproses kehadiran.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttendRepresented = async () => {
        if (!guest || isLoading) return;
        setIsLoading(true);

        try {
            const updater = email || 'Public User';
            await updateGuestAttendance('represented', guest.id.toString());
            await updateGuestConfirmation('represented', guest.id.toString());
            await updateGuestAttendanceBy(updater, guest.id.toString());
            await updateGuestConfirmationBy(updater, guest.id.toString());

            toast.success(`${guest.username} hadir melalui perwakilan (Mewakili).`);
            navigate('/scan');
        } catch (error) {
            console.error('Error updating attendance (represented):', error);
            toast.error('Gagal memproses kehadiran.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/scan');
    };

    if (!guest) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col p-4 font-sans">
            {/* Header */}
            <div className="text-center pt-6 pb-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">
                        {isAlreadyAttended ? '✅' : '👋'}
                    </span>
                </div>
                <p className="text-white/80 text-sm uppercase tracking-widest font-bold mb-2">
                    {isAlreadyAttended ? 'Sudah Hadir' : 'Selamat Datang'}
                </p>
                <h1 className="text-white text-3xl font-black break-words leading-tight">
                    {guest.username}
                </h1>
                {guest.attributes?.Jabatan && (
                    <p className="text-white/70 text-base mt-2 italic">{guest.attributes.Jabatan}</p>
                )}
                {guest.instansi && (
                    <p className="text-white/90 text-sm mt-3 px-4 py-2 bg-white/20 inline-block rounded-full">
                        {guest.instansi}
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
                {isAlreadyAttended ? (
                    <div className="bg-white rounded-3xl p-8 mx-2 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h2 className="text-green-700 text-xl font-black mb-2">DATA DITEMUKAN</h2>
                        <p className="text-green-600 font-medium">Tamu ini sudah tercatat HADIR.</p>
                    </div>
                ) : (
                    <div className="space-y-4 mx-2">
                        {/* Counter Jumlah Orang */}
                        <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                            <p className="text-gray-600 font-bold text-sm mb-4 uppercase tracking-wide">
                                Jumlah Orang Hadir
                            </p>
                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={() => setJumlahOrang((prev) => Math.max(1, prev - 1))}
                                    className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-3xl text-gray-600 transition-all active:scale-90"
                                >
                                    −
                                </button>
                                <span className="text-5xl font-black text-blue-600 w-20 text-center">
                                    {jumlahOrang}
                                </span>
                                <button
                                    onClick={() => setJumlahOrang((prev) => prev + 1)}
                                    className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-3xl text-gray-600 transition-all active:scale-90"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handleAttend}
                            disabled={isLoading}
                            className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? 'Memproses...' : 'HADIR'}
                        </button>

                        <button
                            onClick={handleAttendRepresented}
                            disabled={isLoading}
                            className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            MEWAKILI
                        </button>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="pt-6 pb-4 mx-2">
                <button
                    onClick={handleBack}
                    className="w-full py-5 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                    ← Kembali ke Scanner
                </button>
            </div>
        </div>
    );
};

export default ConfirmAttendance;
