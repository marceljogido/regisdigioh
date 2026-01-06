import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface Event {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  sales: string;
  account_manager: string;
  company?: string;
  event_time?: string;
  loading_date?: Date;
  discord_channel?: string;
  drive_folder?: string;
  location?: string;
  last_updated_by?: string;
  last_updated_at?: Date;
}

interface MessageContextType {
  subject: { [key: number]: string };
  message: { [key: number]: string };
  setSubject: (eventId: number, subject: string) => void;
  setMessage: (eventId: number, message: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subject, setSubjectState] = useState<{ [key: number]: string }>({});
  const [message, setMessageState] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const storedSubjects = JSON.parse(localStorage.getItem('subjects') || '{}');
    const storedMessages = JSON.parse(localStorage.getItem('messages') || '{}');
    const eventId = parseInt(localStorage.getItem('event_id') || '0');

    if (storedSubjects && storedMessages) {
      setSubjectState(storedSubjects);
      setMessageState(storedMessages);
    }

    if (eventId && storedSubjects[eventId]) {
      const event = JSON.parse(localStorage.getItem('events') || '[]').find((e: Event) => e.id === eventId);
      if (event && !storedSubjects[eventId]) {
        setSubjectState((prev) => ({ ...prev, [eventId]: `Invitation: ${event.name} Event` }));
      }
    }
  }, []);

  const setSubject = (eventId: number, subject: string) => {
    setSubjectState((prev) => {
      const newState = { ...prev, [eventId]: subject };
      localStorage.setItem('subjects', JSON.stringify(newState));
      return newState;
    });
  };

  const setMessage = (eventId: number, message: string) => {
    setMessageState((prev) => {
      const newState = { ...prev, [eventId]: message };
      localStorage.setItem('messages', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <MessageContext.Provider value={{ subject, message, setSubject, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
