import api from './api';

const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user profile
  getCurrentProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      // Update local storage with new user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete account
  deleteAccount: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;