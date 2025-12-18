import api from './api';

const postService = {
  // Get all posts
  getAllPosts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single post by ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new post (admin only)
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unlike a post
  unlikePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload image for post
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default postService;