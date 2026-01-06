import axios from "axios";
import { BASE_URL } from '../constants/constants';

const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/api/login`, {
    email,
    password,
  });
  return response.data;
};

export { loginUser };
