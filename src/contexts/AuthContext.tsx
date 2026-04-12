import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService, { UserProfile } from '@/services/auth.service';
import { clearAuthTokens, isAuthenticated, getAuthToken } from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True only immediately after a successful register() call – cleared on first read via consumeNewUser(). */
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  checkAuth: () => Promise<void>;
  /** Reads and clears the isNewUser flag in one call. */
  consumeNewUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Ephemeral — set to true after register(), consumed once by the Auth screen
  const [isNewUser, setIsNewUser] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const hasToken = await isAuthenticated();
      
      if (hasToken) {
        const currentToken = await getAuthToken();
        setToken(currentToken);
        
        // Try to get user profile
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // Token might be invalid, clear it
          await clearAuthTokens();
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register({ email, password, firstName, lastName });
      setUser(response.user);
      setToken(response.token);
      setIsNewUser(true); // signal that this is a brand-new account
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /** Reads the isNewUser flag and immediately resets it to false. */
  const consumeNewUser = (): boolean => {
    const value = isNewUser;
    setIsNewUser(false);
    return value;
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      const updatedProfile = await authService.updateProfile(profileData);
      setUser(updatedProfile);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isNewUser,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    consumeNewUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};