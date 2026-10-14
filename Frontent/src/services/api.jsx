import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

// Helper function to get token from both sources
const getTokenFromStorage = () => {
  // First try localStorage
  const localStorageToken = localStorage.getItem('token');
  if (localStorageToken) {
    return localStorageToken;
  }
  
  // Then try cookies
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  return cookieToken || null;
};

// Helper function to remove token from both sources
const removeToken = () => {
  // Remove from localStorage
  localStorage.removeItem('token');
  
  // Remove from cookies
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Add token to requests from both localStorage and cookies
api.interceptors.request.use((config) => {
  const token = getTokenFromStorage();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    // Only redirect to login on actual authentication failures
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      removeToken();
      // Use a timeout to prevent immediate redirect conflicts
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  googleAuth: () => `${API_BASE_URL}/users/auth/google`,
  githubAuth: () => `${API_BASE_URL}/users/auth/github`,
};

export const profileAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

export default api;
