import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Guest } from '../types/types';
import useGuestApi from '../api/guestApi';

const ConfirmMerchandise: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const guest: Guest | null = location.state?.guest || null;

    const { updateGuestMerchandise, updateGuestMerchandiseBy } = useGuestApi();

    useEffect(() => {
        if (!guest) {
            toast.error('Data tamu tidak ditemukan!');
            navigate('/scan-merchandise');
        }
    }, [guest, navigate]);

    const isReceived = guest?.merchandise === 'received';

    const handleConfirmMerchandise = async () => {
        if (!guest || isLoading) return;
        setIsLoading(true);

        try {
            const updater = email || 'Public User';
            await updateGuestMerchandise('received', guest.id.toString());
            await updateGuestMerchandiseBy(updater, guest.id.toString());

            toast.success(`Merchandise untuk ${guest.username} berhasil dikonfirmasi!`);
            navigate('/scan-merchandise');
        } catch (error) {
            console.error('Error updating merchandise:', error);
            toast.error('Gagal memproses konfirmasi merchandise.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/scan-merchandise');
    };

    if (!guest) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-500 to-amber-700 flex flex-col p-4 font-sans">
            {/* Header */}
            <div className="text-center pt-6 pb-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">
                        {isReceived ? '✅' : '🎁'}
                    </span>
                </div>
                <p className="text-white/80 text-sm uppercase tracking-widest font-bold mb-2">
                    {isReceived ? 'Sudah Menerima' : 'Konfirmasi Merchandise'}
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
                {isReceived ? (
                    <div className="bg-white rounded-3xl p-8 mx-2 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h2 className="text-green-700 text-xl font-black mb-2">DATA DITEMUKAN</h2>
                        <p className="text-green-600 font-medium">Sudah menerima merchandise.</p>
                    </div>
                ) : (
                    <div className="space-y-4 mx-2">
                        {/* Info Card */}
                        <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🎁</span>
                            </div>
                            <p className="text-gray-600 font-bold text-lg">
                                Konfirmasi penerimaan merchandise untuk tamu ini?
                            </p>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirmMerchandise}
                            disabled={isLoading}
                            className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? 'Memproses...' : 'KONFIRMASI TERIMA'}
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

export default ConfirmMerchandise;
