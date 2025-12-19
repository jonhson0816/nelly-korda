const getApiUrl = () => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://nelly-api.onrender.com/api';
  }
  
  // Development mode - use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const getSocketUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SOCKET_URL || 'https://nelly-api.onrender.com';
  }
  
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

console.log('🌐 API Configuration:', {
  mode: import.meta.env.MODE,
  apiUrl: API_URL,
  socketUrl: SOCKET_URL
});