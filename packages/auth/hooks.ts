import { useState, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@localpro/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    // TODO: Implement actual login logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          name: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
        setIsLoading(false);
        resolve({ user: mockUser, token: 'mock-token' });
      }, 1000);
    });
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    setIsLoading(true);
    // TODO: Implement actual registration logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: data.email,
          name: data.name,
          phone: data.phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
        setIsLoading(false);
        resolve({ user: mockUser, token: 'mock-token' });
      }, 1000);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
};

