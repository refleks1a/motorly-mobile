import api, { setAuthTokens, clearAuthTokens } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.token) {
      await setAuthTokens(response.data.token, response.data.refreshToken);
    }
    
    return response.data;
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (response.data.token) {
      await setAuthTokens(response.data.token, response.data.refreshToken);
    }
    
    return response.data;
  }

  // Forgot password
  async forgotPassword(emailData: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', emailData);
    return response.data;
  }

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', resetData);
    return response.data;
  }

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  }

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/auth/profile', profileData);
    return response.data;
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', passwordData);
    return response.data;
  }

  // Delete account
  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/auth/account');
    
    // Clear tokens after account deletion
    await clearAuthTokens();
    
    return response.data;
  }

  // Logout user
  async logout(): Promise<void> {
    // Clear tokens from storage
    await clearAuthTokens();
    
    // You might want to call a logout endpoint if your backend has one
    // await api.post('/auth/logout');
  }

  // Check if user is authenticated
  async checkAuth(): Promise<boolean> {
    try {
      // Try to get profile to verify token is valid
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();