import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";
import { Guest } from "../types/types";
import useGuestApi from '../api/guestApi';
import QrScanner from 'qr-scanner';
import LoadingPage from "./LoadingPage";
import printJS from 'print-js';

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const { email, token } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanResult, setScanResult] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [scannedOnce, setScannedOnce] = useState<boolean>(false);
  
  const {
    getGuestById,
    updateGuestAttendance,
    updateGuestAttendanceBy,
  } = useGuestApi();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
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
          onDecodeError: () => {},
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
    const scannedText = result.data;
    setScannedOnce(true);

    try {
      // Ambil data tamu terbaru dari server
      const guestResponse = await getGuestById(scannedText);
      
      if (guestResponse) {
        setGuest(guestResponse);
        setScanResult(guestResponse.username);
        setShowPopup(true);
      } else {
        throw new Error("Data tidak ditemukan");
      }
    } catch (error) {
      toast.error('ID Tamu tidak terdaftar!');
      setScannedOnce(false); 
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setScannedOnce(false);
    setScanResult('');
    setGuest(null);
  };

  const handleAttend = async () => {
    try {
      if (!guest || !email) return;

      // Update status ke database
      await updateGuestAttendance('attended', guest.id.toString());
      await updateGuestAttendanceBy(email, guest.id.toString());

      toast.success(`${guest.username} berhasil Check-in!`);
      handlePopupClose();
    } catch (error) {
      toast.error('Gagal memproses kehadiran.');
    }
  };

  const handleAttendRepresented = async () => {
    try {
      if (!guest || !email) return;
      await updateGuestAttendance('represented', guest.id.toString());
      await updateGuestAttendanceBy(email, guest.id.toString());
      toast.success(`${guest.username} hadir melalui perwakilan.`);
      handlePopupClose();
    } catch (error) {
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

  if (!email) return <LoadingPage message="Loading data..." />;

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">QR Scanner Absensi</h2>
      
      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
        <button
          className={`mb-4 px-8 py-3 rounded-full font-bold text-white transition-all ${cameraOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
          onClick={() => setCameraOpen(!cameraOpen)}
        >
          {cameraOpen ? 'Matikan Kamera' : 'Buka Kamera Scan'}
        </button>

        {cameraOpen && cameraPermission && (
          <div className="relative w-80 h-80 overflow-hidden rounded-xl border-4 border-blue-400">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black opacity-30 pointer-events-none"></div>
            <div className="absolute inset-x-10 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_red] animate-pulse"></div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xl font-semibold">
        Hasil Terakhir: <span className="text-blue-600">{scanResult || '-'}</span>
      </p>

      {/* Pop-up Selamat Datang & Status Check-in */}
      {showPopup && guest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-t-8 border-blue-500">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">
                  {guest.attendance === 'attended' || guest.attendance === 'represented' ? '✅' : '👋'}
                </span>
              </div>
              <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                {guest.attendance === 'attended' || guest.attendance === 'represented' ? 'Sudah Check-in' : 'Selamat Datang'}
              </h3>
              <h2 className="text-3xl font-black text-gray-800 break-words">{guest.username}</h2>
            </div>
            
            <div className="space-y-3">
              {/* Logika Kondisional: Tombol hanya muncul jika belum absen */}
              {guest.attendance !== 'attended' && guest.attendance !== 'represented' ? (
                <>
                  <button onClick={handleAttend} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95">
                    KONFIRMASI HADIR
                  </button>
                  <button onClick={handleAttendRepresented} className="w-full py-4 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95 text-sm">
                    HADIR (DIWAKILI)
                  </button>
                </>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl text-center mb-4">
                  <p className="text-green-700 font-medium italic">Tamu ini sudah melakukan check-in sebelumnya.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handlePrint} className="py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <span>🖨️</span> Print
                </button>
                <button onClick={handlePopupClose} className="py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-semibold">
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
