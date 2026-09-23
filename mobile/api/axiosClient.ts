import axios from "axios";
import { useAuthStore } from "../store/auth";

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000, 
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
