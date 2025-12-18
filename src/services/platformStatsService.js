import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// PLATFORM STATS API SERVICES
// ============================================

// Get current platform statistics
export const getPlatformStats = async () => {
  try {
    const response = await api.get('/platform-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Force refresh platform statistics (Admin only)
export const refreshPlatformStats = async () => {
  try {
    const response = await api.post('/platform-stats/refresh');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get platform stats history (Admin only)
export const getStatsHistory = async (days = 30) => {
  try {
    const response = await api.get('/platform-stats/history', {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get growth analytics
export const getGrowthAnalytics = async () => {
  try {
    const response = await api.get('/platform-stats/growth');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getPlatformStats,
  refreshPlatformStats,
  getStatsHistory,
  getGrowthAnalytics,
};