import axios from 'axios';

// Use the same API_URL pattern as your ProfilePage.js
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
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
// ACHIEVEMENT API SERVICES
// ============================================

// Get all achievements with filters
export const getAchievements = async (params = {}) => {
  try {
    const response = await api.get('/achievements', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single achievement
export const getAchievement = async (id) => {
  try {
    const response = await api.get(`/achievements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get featured achievements
export const getFeaturedAchievements = async (limit = 6) => {
  try {
    const response = await api.get('/achievements/featured', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get achievements by year
export const getAchievementsByYear = async (year) => {
  try {
    const response = await api.get(`/achievements/year/${year}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get achievement statistics
export const getAchievementStats = async () => {
  try {
    const response = await api.get('/achievements/stats/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create achievement (Admin only)
export const createAchievement = async (formData) => {
  try {
    const response = await api.post('/achievements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update achievement (Admin only)
export const updateAchievement = async (id, formData) => {
  try {
    const response = await api.put(`/achievements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete achievement (Admin only)
export const deleteAchievement = async (id) => {
  try {
    const response = await api.delete(`/achievements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add image to gallery (Admin only)
export const addToGallery = async (id, formData) => {
  try {
    const response = await api.post(`/achievements/${id}/gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove image from gallery (Admin only)
export const removeFromGallery = async (achievementId, imageId) => {
  try {
    const response = await api.delete(
      `/achievements/${achievementId}/gallery/${imageId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAchievements,
  getAchievement,
  getFeaturedAchievements,
  getAchievementsByYear,
  getAchievementStats,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  addToGallery,
  removeFromGallery,
};