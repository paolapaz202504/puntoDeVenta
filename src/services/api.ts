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

export const STORAGE_BASE_URL =
  import.meta.env.VITE_STORAGE_URL ||
  (import.meta.env.PROD
    ? "https://storage.googleapis.com/punto_de_venta/prod"
    : "https://storage.googleapis.com/punto_de_venta/dev");

export const getFileUrl = (filePath?: string | null): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  if (STORAGE_BASE_URL) {
    return `${STORAGE_BASE_URL.replace(/\/+$/, "")}${cleanPath}`;
  }
  return `${API_HOST}${cleanPath}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Decodifica el payload de un token JWT de forma segura sin librerías externas
 */
export function decodeJwtPayload(token: string): { exp?: number; iat?: number; id?: string; user?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Promesa compartida para deduplicar llamadas concurrentes de refresco
let refreshPromise: Promise<string | null> | null = null;

/**
 * Renueva el token de autenticación en segundo plano (Silent Refresh)
 */
export async function refreshAuthToken(): Promise<string | null> {
  const currentToken = useAuthStore.getState().token;
  if (!currentToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.data?.success && response.data?.data?.token) {
        const { token: newToken, user: updatedUser } = response.data.data;
        useAuthStore.getState().login(newToken, updatedUser);
        return newToken;
      }
      return null;
    } catch (err: any) {
      console.warn(
        "No se pudo renovar el token automáticamente:",
        err?.response?.data?.message || err?.message
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        useAuthStore.getState().logout();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Verifica si el token está próximo a expirar (menos de 2 horas) o ya expiró,
 * y lo renueva proactivamente en segundo plano.
 */
export async function checkAndRefreshToken(): Promise<boolean> {
  const token = useAuthStore.getState().token;
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const secondsRemaining = payload.exp - nowInSeconds;

  // Si faltan menos de 2 horas (7200 segundos) o si ya expiró pero está dentro de la ventana de gracia
  if (secondsRemaining < 7200) {
    const newToken = await refreshAuthToken();
    return !!newToken;
  }

  return true;
}

// Interceptor para inyectar Token JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta con Reintento Automático (Silent Retry) ante 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detectar 401 en peticiones recuperables (que no sean login ni refresh y sin reintentos previos)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAuthToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    // Si no fue recuperable y fue 401 (excluyendo pantalla de login)
    if (error.response?.status === 401 && !originalRequest?.url?.includes("/auth/login")) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);
