import axios from 'axios';

// ✅ FIX: Better fallback with console warning
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug log for hosted environment
if (import.meta.env.PROD) {
  console.log('🔍 Production API_URL:', API_URL);
  if (!import.meta.env.VITE_API_URL) {
    console.error('❌ VITE_API_URL is not set in Vercel! Using fallback:', API_URL);
  }
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000 // 30 seconds timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recco_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug log in production
  if (import.meta.env.PROD) {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Debug log in production
    if (import.meta.env.PROD) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Debug log in production
    if (import.meta.env.PROD) {
      console.error(`❌ API Error: ${error.response?.status || 'Network Error'}`, {
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
    }

    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('recco_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('recco_token', res.data.token);
        localStorage.setItem('recco_refresh_token', res.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return api(originalRequest);
      } catch (err) {
        console.error('❌ Token refresh failed:', err);
        localStorage.removeItem('recco_token');
        localStorage.removeItem('recco_refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;