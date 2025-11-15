import axios from 'axios';

// Use environment variable for API base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spend-log-backend.onrender.com/api' || 'http://localhost:5000/api';

// Create axios instance
export const authAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const transactionAPI = {
  getAll: (params) => authAPI.get('/transactions', { params }),
  getById: (id) => authAPI.get(`/transactions/${id}`),
  create: (data) => authAPI.post('/transactions', data),
  update: (id, data) => authAPI.put(`/transactions/${id}`, data),
  delete: (id) => authAPI.delete(`/transactions/${id}`),
  getStats: (params) => authAPI.get('/transactions/stats/overview', { params }),
  getCategoryStats: (params) => authAPI.get('/transactions/stats/categories', { params })
};

export const budgetAPI = {
  getAll: (params) => authAPI.get('/budgets', { params }),
  set: (data) => authAPI.post('/budgets', data),
  delete: (id) => authAPI.delete(`/budgets/${id}`),
  getRecommendations: (params) => authAPI.get('/budgets/recommendations', { params })
};

export const savingsAPI = {
  get: () => authAPI.get('/savings'),
  set: (data) => authAPI.post('/savings', data),
  update: (data) => authAPI.put('/savings', data),
  delete: () => authAPI.delete('/savings'),
  getProgress: () => authAPI.get('/savings/progress')
};

export default authAPI;