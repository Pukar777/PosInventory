import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback } from 'react';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const useApi = () => {
    const request = useCallback(
        async <T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${currentToken}`,
                };
            }

            try {
                const response = await api.request<T, R>(config);
                return response;
            } catch (error: any) {
                if (error.response?.status === 401 && config.url !== '/login') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw error;
            }
        },
        []
    );

    return { request, api };
};
