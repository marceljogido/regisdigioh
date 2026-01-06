import React, { useEffect, useRef } from 'react';

interface Guest {
    id: number;
    username: string;
    email: string;
    phoneNum: string;
    confirmation: string;
    attendance: string;
    emailed: boolean;
    instansi: string;
    attributes?: { [key: string]: string };
    confirmation_updated_by?: string;
    attendance_updated_by?: string;
    attributes_updated_by?: string;
    email_sent_by?: string;
}

interface InfoBoxProps {
  visible: boolean;
  position: { top: number, left: number };
  guest: Guest;
  onClose: () => void;
}

const InfoBox: React.FC<InfoBoxProps> = ({ visible, position, guest, onClose }) => {
  const infoBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoBoxRef.current && !infoBoxRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={infoBoxRef}
      className="text-sm text-gray-500 font-light absolute p-2 bg-white border border-gray-300 shadow-md flex flex-col"
      style={{ top: position.top, left: position.left }}
    >
      <div>Confirmation updated by: {guest.confirmation_updated_by ? guest.confirmation_updated_by : "Not updated yet"}</div>
      <div>Attendance updated by: {guest.attendance_updated_by ? guest.attendance_updated_by : "Not updated yet"}</div>
      <div>Attribute updated by: {guest.attributes_updated_by ? guest.attributes_updated_by : "Not updated yet"}</div>
      <div>Email sent by: {guest.email_sent_by ? guest.email_sent_by : "Not updated yet"}</div>
    </div>
  );
};

export default InfoBox;
