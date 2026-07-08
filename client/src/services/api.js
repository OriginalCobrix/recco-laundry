import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recco_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('recco_refresh_token');
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('recco_token', res.data.token);
        localStorage.setItem('recco_refresh_token', res.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('recco_token');
        localStorage.removeItem('recco_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;