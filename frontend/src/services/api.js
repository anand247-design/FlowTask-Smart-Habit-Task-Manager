// services/api.js - Axios instance with interceptors
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// ── Request interceptor: attach token ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    // Don't show toast for auth errors (handled by form)
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Task service ───────────────────────────────────────────────────────────
export const taskService = {
  getAll:   (params) => api.get('/tasks', { params }),
  getToday: ()       => api.get('/tasks/today'),
  getById:  (id)     => api.get(`/tasks/${id}`),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)     => api.delete(`/tasks/${id}`),
};

// ── Habit service ──────────────────────────────────────────────────────────
export const habitService = {
  getAll:  ()       => api.get('/habits'),
  getById: (id)     => api.get(`/habits/${id}`),
  create:  (data)   => api.post('/habits', data),
  update:  (id, data) => api.put(`/habits/${id}`, data),
  delete:  (id)     => api.delete(`/habits/${id}`),
  toggle:  (id)     => api.post(`/habits/${id}/toggle`),
};

// ── Analytics service ──────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard:    () => api.get('/analytics/dashboard'),
  getWeeklyTasks:  () => api.get('/analytics/weekly-tasks'),
  getHabitStreaks: () => api.get('/analytics/habit-streaks'),
  getProductivity: () => api.get('/analytics/productivity'),
};
