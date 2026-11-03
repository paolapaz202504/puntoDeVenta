import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://puntodeventabackend-m73e.onrender.com/api"
    : "/api");

export const API_HOST = API_BASE_URL.startsWith("http")
  ? API_BASE_URL.replace(/\/api\/?$/, "")
  : "";

export const getFileUrl = (filePath?: string | null): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `${API_HOST}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar Token JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para detectar 401 (sesión expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
