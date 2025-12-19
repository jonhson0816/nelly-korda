// src/api/trending.js
import axios from 'axios';
import { API_URL } from '../config/api';

const TRENDING_API_URL = `${API_URL}/trending`;

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get trending hashtags
export const getTrending = async (limit = 10, period = 'weekly') => {
  try {
    const token = getAuthToken();
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    const response = await axios.get(`${TRENDING_API_URL}?limit=${limit}&period=${period}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending:', error);
    throw error.response?.data || error;
  }
};

// Search posts by hashtag
export const searchByHashtag = async (hashtag, page = 1, limit = 20) => {
  try {
    const token = getAuthToken();
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    const normalizedHashtag = hashtag.replace(/^#/, '');

    const response = await axios.get(
      `${TRENDING_API_URL}/search/${normalizedHashtag}?page=${page}&limit=${limit}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error searching by hashtag:', error);
    throw error.response?.data || error;
  }
};

// Get hashtag details
export const getHashtagDetails = async (hashtag) => {
  try {
    const token = getAuthToken();
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    const normalizedHashtag = hashtag.replace(/^#/, '');

    const response = await axios.get(`${TRENDING_API_URL}/${normalizedHashtag}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching hashtag details:', error);
    throw error.response?.data || error;
  }
};

// Admin: Update trending data
export const updateTrendingData = async (period = 'weekly') => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${TRENDING_API_URL}/update`,
      { period },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating trending data:', error);
    throw error.response?.data || error;
  }
};

// Admin: Get trending statistics
export const getTrendingStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${TRENDING_API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending stats:', error);
    throw error.response?.data || error;
  }
};

// Admin: Delete trending hashtag
export const deleteTrendingHashtag = async (hashtag) => {
  try {
    const token = getAuthToken();
    const normalizedHashtag = hashtag.replace(/^#/, '');
    
    const response = await axios.delete(`${TRENDING_API_URL}/${normalizedHashtag}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting trending hashtag:', error);
    throw error.response?.data || error;
  }
};

// Admin: Cleanup old trending data
export const cleanupTrendingData = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${TRENDING_API_URL}/cleanup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error cleaning up trending data:', error);
    throw error.response?.data || error;
  }
};

export default {
  getTrending,
  searchByHashtag,
  getHashtagDetails,
  updateTrendingData,
  getTrendingStats,
  deleteTrendingHashtag,
  cleanupTrendingData,
};