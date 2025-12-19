import axios from 'axios';
import { API_URL } from '../config/api';

const POINTS_URL = `${API_URL}/points`;

// Get auth token
const getToken = () => localStorage.getItem('token');

// Get API headers
const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// USER STATS
// ============================================

export const getMyStats = async () => {
  try {
    const response = await axios.get(`${POINTS_URL}/stats`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error.response?.data || error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await axios.get(`${POINTS_URL}/stats/${userId}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// BADGES
// ============================================

export const getAllBadges = async () => {
  try {
    const response = await axios.get(`${POINTS_URL}/badges`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error.response?.data || error;
  }
};

export const getMyBadges = async () => {
  try {
    const response = await axios.get(`${POINTS_URL}/my-badges`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my badges:', error);
    throw error.response?.data || error;
  }
};

export const checkBadges = async () => {
  try {
    const response = await axios.post(`${POINTS_URL}/check-badges`, {}, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error checking badges:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// LEADERBOARD
// ============================================

export const getLeaderboard = async (type = 'points', limit = 10) => {
  try {
    const response = await axios.get(`${POINTS_URL}/leaderboard`, {
      params: { type, limit },
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// CONFIGURATION
// ============================================

export const getPointsConfig = async () => {
  try {
    const response = await axios.get(`${POINTS_URL}/config`);
    return response.data;
  } catch (error) {
    console.error('Error fetching points config:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

export const awardPoints = async (userId, pointsType, metadata = {}) => {
  try {
    const response = await axios.post(`${POINTS_URL}/award`, {
      userId,
      pointsType,
      metadata
    }, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error.response?.data || error;
  }
};

export const awardBadge = async (userId, badgeId) => {
  try {
    const response = await axios.post(`${POINTS_URL}/award-badge`, {
      userId,
      badgeId
    }, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error.response?.data || error;
  }
};

export default {
  getMyStats,
  getUserStats,
  getAllBadges,
  getMyBadges,
  checkBadges,
  getLeaderboard,
  getPointsConfig,
  awardPoints,
  awardBadge
};