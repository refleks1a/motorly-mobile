import axios from 'axios';
import { secureStorage } from './storage.service';

// Base API URL from environment variables
// Backend runs on port 3001 by default (see motorly-backend/src/index.ts)
// For physical device testing, use your computer's IP address instead of localhost
// Your computer IP: 192.168.0.103
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.101:3001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Don't add auth token to login or refresh token requests
    const isAuthRequest = config.url?.includes('/auth/login') || 
                         config.url?.includes('/auth/refresh') ||
                         config.url?.includes('/auth/register');
    
    if (!isAuthRequest) {
      try {
        const token = await secureStorage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
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

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest?.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
      
      // For login requests with 401, clear any existing tokens (they're invalid)
      if (isLoginRequest) {
        await secureStorage.removeAuthTokens();
      }
      // For other 401 errors (token expired), try to refresh
      else if (!isRefreshRequest) {
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
          // Refresh failed, clear tokens
          await secureStorage.removeAuthTokens();
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    // Format error message for user display
    let errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'An unexpected error occurred';
    
    // Provide more user-friendly messages for common error cases
    if (error.response?.status === 401) {
      // Check if this is a login error (not token refresh)
      const isLoginRequest = originalRequest?.url?.includes('/auth/login');
      if (isLoginRequest) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (!originalRequest._retry) {
        // Token expired but we already tried to refresh
        errorMessage = 'Your session has expired. Please log in again.';
      }
    } else if (error.response?.status === 400) {
      // Bad request - often validation errors
      if (error.response?.data?.error?.includes('required')) {
        errorMessage = 'Please fill in all required fields.';
      } else if (error.response?.data?.error?.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.response?.data?.error?.includes('password')) {
        errorMessage = 'Password does not meet requirements.';
      }
    } else if (error.response?.status === 409) {
      errorMessage = 'An account with this email already exists.';
    } else if (error.response?.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
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