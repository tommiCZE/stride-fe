import axios from 'axios';
import { forceSessionExpired } from './session-expired';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('stride-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw) as { state: { token: string | null } };
      if (state.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      // ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const url = (error.config?.url ?? '') as string;
    // /api/auth/login returns 401 on bad credentials — that's not session expiry,
    // it's a normal failed login that the form should surface.
    const isLogin = url.includes('/api/auth/login');
    if (status === 401 && !isLogin) {
      forceSessionExpired();
    }
    return Promise.reject(error);
  },
);

export default api;
