import api from './api';

const commentService = {
  // Get all comments for a post
  getCommentsByPost: async (postId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single comment by ID
  getCommentById: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Like a comment
  likeComment: async (commentId) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unlike a comment
  unlikeComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get replies to a comment
  getReplies: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}/replies`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reply to a comment
  replyToComment: async (commentId, replyData) => {
    try {
      const response = await api.post(`/comments/${commentId}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default commentService;