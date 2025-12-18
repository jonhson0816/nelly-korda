import api from './api';

const chatService = {
  // Get all messages for a conversation
  getMessages: async (receiverId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chat/messages/${receiverId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send a message
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/chat/messages', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark messages as read
  markAsRead: async (senderId) => {
    try {
      const response = await api.put(`/chat/messages/read/${senderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search messages
  searchMessages: async (query) => {
    try {
      const response = await api.get(`/chat/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload file/image in chat
  uploadChatFile: async (formData) => {
    try {
      const response = await api.post('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get online users
  getOnlineUsers: async () => {
    try {
      const response = await api.get('/chat/online-users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default chatService;