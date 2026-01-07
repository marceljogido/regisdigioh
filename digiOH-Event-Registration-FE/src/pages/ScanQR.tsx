import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";
import { Guest } from "../types/types";
import useGuestApi from '../api/guestApi';
import QrScanner from 'qr-scanner';
import printJS from 'print-js';

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const { email, token } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [scannedOnce, setScannedOnce] = useState<boolean>(false);
  const [jumlahOrang, setJumlahOrang] = useState<number>(1);

  const {
    getGuestById,
    updateGuestAttendance,
    updateGuestAttendanceBy,
    updateGuestConfirmation,
    updateGuestConfirmationBy,
    updateJumlahOrang,
  } = useGuestApi();

  useEffect(() => {
    // Public access allowed for scanning
  }, [navigate, token]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast.error('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
      }
    };

    requestCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraPermission && cameraOpen && videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        result => {
          if (!scannedOnce) {
            handleScan(result);
          }
        },
        {
          onDecodeError: () => { },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScanner.start();

      return () => {
        qrScanner.stop();
      };
    }
  }, [cameraPermission, cameraOpen, scannedOnce]);

  const handleScan = async (result: QrScanner.ScanResult) => {
    let scannedText = result.data;
    setScannedOnce(true);

    try {
      // Jika hasil scan adalah URL (misal http://.../guest/ABCD123), ambil kodenya saja
      if (scannedText.includes('/guest/')) {
        const parts = scannedText.split('/');
        scannedText = parts[parts.length - 1];
      } else if (scannedText.startsWith('http')) {
        // Fallback jika format URL berbeda tapi masih URL
        const parts = scannedText.split('/');
        scannedText = parts[parts.length - 1];
      }

      console.log('Fetching guest with code:', scannedText);

      // Ambil data tamu terbaru dari server
      const guestResponse = await getGuestById(scannedText);

      if (guestResponse && guestResponse.id) {
        setGuest(guestResponse);
        setShowPopup(true);
      } else {
        toast.error('Data tamu tidak ditemukan!');
        setScannedOnce(false);
      }
    } catch (error: any) {
      console.error('QR Scan Error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'ID Tamu tidak terdaftar!';
      toast.error(`Error: ${errorMsg}`);
      setScannedOnce(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setScannedOnce(false);
    setGuest(null);
    setJumlahOrang(1); // Reset jumlah orang
  };

  const handleAttend = async () => {
    try {
      if (!guest) return;

      const updater = email || 'Public User';

      // Update both attendance and confirmation status (Kehadiran)
      await updateGuestAttendance('attended', guest.id.toString());
      await updateGuestConfirmation('confirmed', guest.id.toString());

      // Update by who
      await updateGuestAttendanceBy(updater, guest.id.toString());
      await updateGuestConfirmationBy(updater, guest.id.toString());

      // Update jumlah orang
      await updateJumlahOrang(jumlahOrang, guest.id.toString());

      toast.success(`${guest.username} berhasil Check-in (${jumlahOrang} orang)!`);
      handlePopupClose();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Gagal memproses kehadiran.');
    }
  };

  const handleAttendRepresented = async () => {
    try {
      if (!guest) return;

      const updater = email || 'Public User';

      // Update both attendance and confirmation status (Kehadiran)
      await updateGuestAttendance('represented', guest.id.toString());
      await updateGuestConfirmation('represented', guest.id.toString());

      // Update by who
      await updateGuestAttendanceBy(updater, guest.id.toString());
      await updateGuestConfirmationBy(updater, guest.id.toString());

      toast.success(`${guest.username} hadir melalui perwakilan (Mewakili).`);
      handlePopupClose();
    } catch (error) {
      console.error('Error updating attendance (represented):', error);
      toast.error('Gagal memproses kehadiran.');
    }
  };

  const handlePrint = () => {
    if (guest) {
      const printContent = `
        <div style="width: 250px; padding: 20px; text-align: center; border: 2px solid #000;">
          <h1 style="margin:0;">${guest.username}</h1>
          <p style="font-size:18px;">${guest.email || ''}</p>
          <hr/>
          <p>Verified Guest</p>
        </div>
      `;
      printJS({ printable: printContent, type: 'raw-html' });
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">QR Scanner Absensi</h2>

      <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-md border-2 border-blue-100">
        <button
          className={`mb-6 w-full px-8 py-4 rounded-2xl font-black text-white transition-all transform active:scale-95 ${cameraOpen ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-xl'}`}
          onClick={() => setCameraOpen(!cameraOpen)}
        >
          {cameraOpen ? 'Matikan Kamera' : 'Buka Kamera Scan Absensi'}
        </button>

        {cameraOpen && cameraPermission && (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border-4 border-blue-400 bg-black shadow-inner">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black opacity-30 pointer-events-none"></div>
            <div className="absolute inset-x-10 top-1/2 h-0.5 bg-blue-500 shadow-[0_0_12px_blue] animate-pulse"></div>
          </div>
        )}

        {!cameraOpen && (
          <div className="w-full aspect-square bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-300 border-2 border-dashed border-blue-200">
            <span className="text-6xl mb-4">👋</span>
            <p className="font-bold">Kamera Belum Aktif</p>
          </div>
        )}
      </div>

      {/* Pop-up Selamat Datang & Status Check-in */}
      {showPopup && guest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border-t-8 border-blue-600 transform animate-in slide-in-from-bottom-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
                <span className="text-5xl">
                  {guest.attendance === 'attended' || guest.attendance === 'represented' ? '✅' : '👋'}
                </span>
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-blue-600 font-black mb-3">
                {guest.attendance === 'attended' || guest.attendance === 'represented' || guest.confirmation === 'confirmed' || guest.confirmation === 'represented' ? 'Sudah Hadir' : 'Selamat Datang'}
              </h3>
              <h2 className="text-3xl font-black text-gray-900 break-words leading-tight mb-2">{guest.username}</h2>

              {guest.attributes?.Jabatan && (
                <p className="text-gray-500 text-base font-bold mb-1 italic">
                  {guest.attributes.Jabatan}
                </p>
              )}

              {guest.instansi && (
                <p className="text-blue-600 font-black text-sm mt-3 px-4 py-2 bg-blue-50 inline-block rounded-xl border border-blue-100">
                  {guest.instansi}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {/* Logika Kondisional: Tombol hanya muncul jika belum absen */}
              {guest.attendance !== 'attended' && guest.attendance !== 'represented' && guest.confirmation !== 'confirmed' && guest.confirmation !== 'represented' ? (
                <>
                  {/* Counter Jumlah Orang */}
                  <div className="mb-4">
                    <p className="text-gray-600 font-bold text-sm mb-2 uppercase tracking-wide">Jumlah Orang Hadir</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setJumlahOrang(prev => Math.max(1, prev - 1))}
                        className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-2xl text-gray-600 transition-all active:scale-95 shadow-sm"
                      >
                        -
                      </button>
                      <span className="text-4xl font-black text-blue-600 w-16 text-center">
                        {jumlahOrang}
                      </span>
                      <button
                        onClick={() => setJumlahOrang(prev => prev + 1)}
                        className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-2xl text-gray-600 transition-all active:scale-95 shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button onClick={handleAttend} className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black shadow-xl shadow-green-100 transition-all active:scale-95 text-xl tracking-tight">
                    HADIR
                  </button>
                  <button onClick={handleAttendRepresented} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 text-xl tracking-tight">
                    MEWAKILI
                  </button>
                </>
              ) : (
                <div className="bg-green-50 border-4 border-green-200 p-6 rounded-[2rem] text-center mb-4">
                  <p className="text-green-800 font-black text-xl mb-1">DATA DITEMUKAN</p>
                  <p className="text-green-600 font-bold italic">Tamu ini sudah tercatat HADIR.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handlePrint}
                  className="py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>🖨️</span> Print
                </button>
                <button
                  onClick={handlePopupClose}
                  className="py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQR;
