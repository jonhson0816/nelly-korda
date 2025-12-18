import axios from 'axios';

const API_URL = 'http://localhost:5000/api/points';

// Get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Get API headers
const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// USER STATS
// ============================================

// Get current user's stats
export const getMyStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error.response?.data || error;
  }
};

// Get user stats by ID
export const getUserStats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/stats/${userId}`, {
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

// Get all available badges
export const getAllBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/badges`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error.response?.data || error;
  }
};

// Get current user's badges
export const getMyBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-badges`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my badges:', error);
    throw error.response?.data || error;
  }
};

// Check and award badges
export const checkBadges = async () => {
  try {
    const response = await axios.post(`${API_URL}/check-badges`, {}, {
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

// Get leaderboard
export const getLeaderboard = async (type = 'points', limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard`, {
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

// Get points configuration
export const getPointsConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    return response.data;
  } catch (error) {
    console.error('Error fetching points config:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Award points to user (Admin only)
export const awardPoints = async (userId, pointsType, metadata = {}) => {
  try {
    const response = await axios.post(`${API_URL}/award`, {
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

// Award badge to user (Admin only)
export const awardBadge = async (userId, badgeId) => {
  try {
    const response = await axios.post(`${API_URL}/award-badge`, {
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