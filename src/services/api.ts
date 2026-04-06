import axios from 'axios';
import { secureStorage } from './storage.service';

// Base API URL from environment variables
// Backend runs on port 3001 by default (see motorly-backend/src/index.ts)
// For physical device testing, use your computer's IP address instead of localhost
// Your computer IP: 192.168.0.106
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.106:3001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStorage.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await secureStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          
          await secureStorage.setAuthToken(token);
          if (newRefreshToken) {
            await secureStorage.setRefreshToken(newRefreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await secureStorage.removeAuthTokens();
        // You might want to navigate to login screen here
        console.error('Token refresh failed:', refreshError);
      }
    }

    // Format error message for user display
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';
    
    // Create a formatted error object
    const formattedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

// Helper function to set auth tokens
export const setAuthTokens = async (token: string, refreshToken?: string) => {
  await secureStorage.setAuthToken(token);
  if (refreshToken) {
    await secureStorage.setRefreshToken(refreshToken);
  }
};

// Helper function to clear auth tokens
export const clearAuthTokens = async () => {
  await secureStorage.removeAuthTokens();
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  return await secureStorage.isAuthenticated();
};

// Helper function to get current token
export const getAuthToken = async (): Promise<string | null> => {
  return await secureStorage.getAuthToken();
};

export default api;