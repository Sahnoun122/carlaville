import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
import { getAuthToken, logout } from './auth';

// Define a custom error shape for consistent error handling
export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setApiAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

// Request interceptor to inject the JWT
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError): Promise<ApiError> => {
    if (error.response?.status === 401) {
      logout();
      setApiAuthToken();
    }

    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    const apiError: ApiError = {
      message:
        responseData?.message || error.message || 'An unknown error occurred',
      status: error.response?.status,
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  },
);

// --- Request Helper Functions ---

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.get<T>(url, config).then(res => res.data);

export const post = <T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> =>
  api.post<T>(url, data, config).then(res => res.data);

export const patch = <T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> =>
  api.patch<T>(url, data, config).then(res => res.data);

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.delete<T>(url, config).then(res => res.data);

export default api;
