import { Guest } from '../types/types';
import useAxiosClient from './axiosClient';

const useGuestApi = () => {
    const axiosClient = useAxiosClient();

    // Get
    const getGuestById = async (guestId: string) => {
        const response = await axiosClient.get(`/guests/${guestId}`);
        return response.data;
    }

    const getGuests = async (eventId: string) => {
        const response = await axiosClient.get(`/guests/event/${eventId}`);
        return response.data;
    }

    const getAllGuests = async (eventId: string, page: number) => {
        const response = await axiosClient.get(`/guests/event/${eventId}?page=${page}`);
        return response.data;
    }

    const countConfirmation = async (eventId: string) => {
        const response = await axiosClient.get(`/guests/count-confirmation/${eventId}`);
        return response.data;
    }

    const getGuestsSearchFilter = async (eventId: string, query: string) => {
        const response = await axiosClient.get(`/guests/event/${eventId}${query}`);
        return response.data;
    }

    const getEventLengths = async (eventId: string) => {
        const response = await axiosClient.get(`/guests/event-lengths/${eventId}`);
        return response.data;
    }

    // Update
    const updateGuestAttendance = async (attendanceStatus: string, guestId: string) => {
        const response = await axiosClient.patch(`/attend/${guestId}`, { attendance: attendanceStatus });
        return response.data;
    };

    const updateGuestAttendanceBy = async (email: string, guestId: string) => {
        const response = await axiosClient.patch(`/attendance-by/${guestId}`, { attendance_updated_by: email });
        return response.data;
    };

    const updateGuestConfirmation = async (confirmationStatus: string, guestId: string) => {
        const response = await axiosClient.patch(`/confirmation/${guestId}`, { confirmation: confirmationStatus });
        return response.data;
    };

    const updateGuestConfirmationBy = async (email: string, guestId: string) => {
        const response = await axiosClient.patch(`/confirmation-by/${guestId}`, { confirmation_updated_by: email });
        return response.data;
    };

    const updateGuestEmailed = async (guestId: string) => {
        const response = await axiosClient.patch(`/emailed/${guestId}`, { emailed: true });
        return response.data;
    };

    const updateGuestEmailedBy = async (email: string, guestId: string) => {
        const response = await axiosClient.patch(`/emailed-by/${guestId}`, { email_sent_by: email });
        return response.data;
    };

    const updateGuestAttributes = async (guestId: string, guestData: any) => {
        const response = await axiosClient.patch(`/guests/${guestId}`, guestData);
        return response.data;
    };

    const updateGuestAttributesBy = async (email: string, guestId: string) => {
        const response = await axiosClient.patch(`/attributes-by/${guestId}`, { attributes_updated_by: email });
        return response.data;
    };

    // Delete
    const deleteSingleGuest = async (guestId: string) => {
        const response = await axiosClient.delete(`/guest/${guestId}`);
        return response.data;
    }

    // Add
    const addSingleGuest = async (newGuest: Partial<Guest>, eventId: string | null) => {
        const response = await axiosClient.post(
            '/guests',
            {
                ...newGuest,
                event_id: eventId,
                attendance: 'did not attend',
                confirmation: 'to be confirmed'
            },
        );
        return response.data;
    };

    const importGuest = async (formData: FormData) => {
        console.log(formData)
        const response = await axiosClient.post(
            '/import-guests',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    };

    // Utils
    const exportGuestsToExcel = async (allGuests: Guest[]) => {
        const response = await axiosClient.post('/export-excel', allGuests, { responseType: 'text' });
        return response.data;
    }

    const sendEmailToGuest = async (emailData: any) => {
        const response = await axiosClient.post('/broadcast-email', emailData);
        return response.data;
    }

    return {
        addSingleGuest,
        importGuest,
        getGuestById,
        getGuests,
        getAllGuests,
        getEventLengths,
        countConfirmation,
        getGuestsSearchFilter,
        updateGuestAttendance,
        updateGuestAttendanceBy,
        updateGuestConfirmation,
        updateGuestConfirmationBy,
        updateGuestEmailed,
        updateGuestEmailedBy,
        updateGuestAttributes,
        updateGuestAttributesBy,
        deleteSingleGuest,
        exportGuestsToExcel,
        sendEmailToGuest,

    };
}

export default useGuestApi;

