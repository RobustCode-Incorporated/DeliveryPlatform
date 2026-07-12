
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // L'URL de ton backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);