import useAxiosClient from './axiosClient';

const useEventApi = () => {
  const axiosClient = useAxiosClient();

  const createEvent = async (eventData: any) => {
    const response = await axiosClient.post('/event', eventData);
    return response.data;
  };

  const getEvents = async () => {
    const response = await axiosClient.get('/events');
    return response.data;
  };

  const getLoadedEvent = async (eventId: string) => {
    const response = await axiosClient.get(`/events/${eventId}`)
    return response.data;
  }

  const updateEvent = async (eventId: string, eventData: any) => {
    const response = await axiosClient.patch(`/events/${eventId}`, eventData);
    return response.data;
  };

  const changeLastUpdate = async (eventId: string, eventData: any) => {
    const response = await axiosClient.patch(`/event-update/${eventId}`, eventData);
    return response;
  };

  const importEvent = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await axiosClient.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  return { createEvent, getEvents, getLoadedEvent, updateEvent, changeLastUpdate, importEvent };
};

export default useEventApi;
