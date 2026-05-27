import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add Firebase token to every request automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting Firebase token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token is invalid or expired — Firebase will handle refresh,
      // but if the user is truly logged out, redirect.
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sync: () => api.post('/auth/sync'),
  deleteAccount: (data) => api.delete('/auth/delete-account', { data }),
};

export const profileAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// CV API functions
export const cvAPI = {
  analyze: (cvData) => api.post('/api/cv/analyze', cvData),
  getHistory: () => api.get('/api/cv/history'),
  deleteHistory: (id) => api.delete(`/api/cv/history/${id}`)
};

export default api;
