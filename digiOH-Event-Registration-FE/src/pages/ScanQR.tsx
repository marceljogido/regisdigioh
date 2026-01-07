import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import useGuestApi from '../api/guestApi';
import QrScanner from 'qr-scanner';

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [scannedOnce, setScannedOnce] = useState<boolean>(false);

  const { getGuestById } = useGuestApi();

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
      // Extract code from URL if scanned from QR
      if (scannedText.includes('/guest/')) {
        const parts = scannedText.split('/');
        scannedText = parts[parts.length - 1];
      } else if (scannedText.startsWith('http')) {
        const parts = scannedText.split('/');
        scannedText = parts[parts.length - 1];
      }

      console.log('Fetching guest with code:', scannedText);
      const guestResponse = await getGuestById(scannedText);

      if (guestResponse && guestResponse.id) {
        // Navigate to confirmation page with guest data
        navigate('/confirm-attendance', { state: { guest: guestResponse } });
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

  // Reset scannedOnce when returning to this page
  useEffect(() => {
    setScannedOnce(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">QR Scanner Absensi</h2>

      <div className="bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-sm border-2 border-blue-100">
        <button
          className={`mb-4 w-full px-6 py-4 rounded-2xl font-black text-white transition-all transform active:scale-95 text-lg ${cameraOpen ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-xl'}`}
          onClick={() => setCameraOpen(!cameraOpen)}
        >
          {cameraOpen ? 'Matikan Kamera' : 'Buka Kamera'}
        </button>

        {cameraOpen && cameraPermission && (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl border-4 border-blue-400 bg-black shadow-inner">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[30px] border-black opacity-30 pointer-events-none"></div>
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-blue-500 shadow-[0_0_12px_blue] animate-pulse"></div>
          </div>
        )}

        {!cameraOpen && (
          <div className="w-full aspect-square bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-300 border-2 border-dashed border-blue-200">
            <span className="text-5xl mb-3">👋</span>
            <p className="font-bold text-sm">Kamera Belum Aktif</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQR;
