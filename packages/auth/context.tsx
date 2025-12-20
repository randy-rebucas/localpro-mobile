import { apiClient } from '@localpro/api';
import { SecureStorage } from '@localpro/storage';
import type { AuthState, OTPVerificationResponse, OnboardingData, PhoneAuthResponse, User } from '@localpro/types';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from './services';

interface AuthContextType extends AuthState {
  sendOTP: (phone: string) => Promise<PhoneAuthResponse>;
  verifyOTP: (phone: string, code: string, sessionId: string) => Promise<OTPVerificationResponse>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  }) => Promise<void>;
  uploadAvatar: (imageUri: string, fileSize?: number) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  useEffect(() => {
    // Set token getter for API client
    apiClient.setTokenGetter(async () => {
      return await SecureStorage.getToken();
    });
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStorage.getToken();
      if (token) {
        setToken(token);
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsOnboarding(!currentUser.isOnboarded);
        } else {
          // Token exists but user fetch failed - clear token
          await SecureStorage.removeToken();
          setToken(undefined);
          setIsAuthenticated(false);
          setIsOnboarding(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsOnboarding(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setIsOnboarding(false);
      setToken(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string): Promise<PhoneAuthResponse> => {
    try {
      setPhoneNumber(phone);
      const response = await AuthService.sendOTP(phone);
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phone: string, code: string, sessionId: string): Promise<OTPVerificationResponse> => {
    try {
      const response = await AuthService.verifyOTP(phone, code, sessionId);
      if (response.success && response.user && response.token) {
        // Store token securely (already stored in service, but ensure it's set)
        await SecureStorage.setToken(response.token);
        
        // Normalize user data for backward compatibility
        const normalizedUser: User = {
          ...response.user,
          id: response.user._id || response.user.id,
          name: response.user.firstName && response.user.lastName 
            ? `${response.user.firstName} ${response.user.lastName}`.trim()
            : response.user.firstName || response.user.lastName || response.user.name,
          phone: response.user.phoneNumber || response.user.phone,
        };
        
        // Update state with user and token
        setUser(normalizedUser);
        setToken(response.token);
        setIsAuthenticated(true);
        setIsOnboarding(response.isNewUser);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      const updatedUser = await AuthService.completeOnboarding(data, phoneNumber || user?.phoneNumber || user?.phone || '');
      if (updatedUser) {
        setUser(updatedUser);
        setIsOnboarding(false);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  }) => {
    try {
      const updatedUser = await AuthService.updateProfile(data);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const uploadAvatar = async (imageUri: string, fileSize?: number) => {
    try {
      const updatedUser = await AuthService.uploadAvatar(imageUri, fileSize);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      // Clear all secure storage data for complete cleanup
      await SecureStorage.clearAll();
      setUser(null);
      setToken(undefined);
      setIsAuthenticated(false);
      setIsOnboarding(false);
      setPhoneNumber(undefined);
      setSessionId(undefined);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token,
    phoneNumber,
    isOnboarding,
    sendOTP,
    verifyOTP,
    completeOnboarding,
    updateProfile,
    uploadAvatar,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

