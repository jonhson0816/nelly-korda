import api from './api';

// ============================================
// TOURNAMENT API SERVICE
// ============================================

const tournamentService = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Get all tournaments with filters
  getTournaments: async (params = {}) => {
    try {
      const response = await api.get('/tournaments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single tournament by ID
  getTournament: async (id) => {
    try {
      const response = await api.get(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming tournaments
  getUpcomingTournaments: async (limit = 5) => {
    try {
      const response = await api.get('/tournaments/upcoming', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get tournament statistics
  getStatistics: async (year) => {
    try {
      const response = await api.get('/tournaments/statistics', {
        params: { year },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Create new tournament
  createTournament: async (formData) => {
    try {
      const response = await api.post('/tournaments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update tournament
  updateTournament: async (id, formData) => {
    try {
      const response = await api.put(`/tournaments/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete tournament
  deleteTournament: async (id) => {
    try {
      const response = await api.delete(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Nelly's performance
  updatePerformance: async (id, performanceData) => {
    try {
      const response = await api.put(`/tournaments/${id}/performance`, performanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add image to gallery
  addToGallery: async (id, formData) => {
    try {
      const response = await api.post(`/tournaments/${id}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove image from gallery
  removeFromGallery: async (id, imageId) => {
    try {
      const response = await api.delete(`/tournaments/${id}/gallery/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default tournamentService;