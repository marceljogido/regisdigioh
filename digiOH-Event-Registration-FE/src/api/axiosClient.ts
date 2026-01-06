import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from '../constants/constants';

const useAxiosClient = () => {
  const { token } = useAuth();
  const axiosClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosClient.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export default useAxiosClient;
