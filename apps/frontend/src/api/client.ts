import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback to localStorage on page refresh to prevent session loss
let inMemoryToken: string | null = localStorage.getItem('access_token');
let inMemoryRefreshToken: string | null = localStorage.getItem('refresh_token');

export const setTokens = (access: string | null, refresh: string | null) => {
  inMemoryToken = access;
  inMemoryRefreshToken = refresh;
  if (access) localStorage.setItem('access_token', access);
  else localStorage.removeItem('access_token');
  
  if (refresh) localStorage.setItem('refresh_token', refresh);
  else localStorage.removeItem('refresh_token');
};

apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (inMemoryRefreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: inMemoryRefreshToken,
          });
          const { access } = response.data;
          inMemoryToken = access; 
          
          // Dispatch event to sync back to Redux without circular dependencies
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { access } }));
          
          if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        setTokens(null, null);
        window.dispatchEvent(new Event('authFailed'));
      }
    }
    return Promise.reject(error);
  }
);
