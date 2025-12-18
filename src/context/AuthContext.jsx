import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error);
          // If token is invalid, clear it
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token, API_URL]);

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, updates);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return { success: false, message };
    }
  };

  // Update avatar
  const updateAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.put(`${API_URL}/auth/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser((prevUser) => ({
        ...prevUser,
        avatar: response.data.avatar,
      }));

      return { success: true, avatar: response.data.avatar };
    } catch (error) {
      const message = error.response?.data?.message || 'Avatar update failed';
      return { success: false, message };
    }
  };

  // Update password
  const updatePassword = async (passwords) => {
    try {
      await axios.put(`${API_URL}/auth/password`, passwords);
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      return { success: false, message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      return { success: false, message };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, {
        newPassword,
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed';
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    updateAvatar,
    updatePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;