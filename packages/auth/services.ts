import { API_ENDPOINTS, apiClient } from '@localpro/api';
import { SecureStorage } from '@localpro/storage';
import type {
  AuthResponse,
  LoginCredentials,
  OTPVerificationResponse,
  OnboardingData,
  PhoneAuthResponse,
  RegisterData,
  User
} from '@localpro/types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Implement API call if needed
    throw new Error('Not implemented');
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    // TODO: Implement API call if needed
    throw new Error('Not implemented');
  }

  static async logout(): Promise<void> {
    try {
      // Call API logout endpoint if available
      await apiClient.post(API_ENDPOINTS.auth.logout).catch(() => {
        // Ignore errors on logout
      });
    } finally {
      // Always clear token from storage
      await SecureStorage.removeToken();
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await SecureStorage.getToken();
      if (!token) {
        return null;
      }

      const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.auth.getCurrentUser);
      return response.user || null;
    } catch (error: any) {
      // If unauthorized, clear token
      if (error.status === 401) {
        await SecureStorage.removeToken();
      }
      return null;
    }
  }

  static async sendOTP(phone: string): Promise<PhoneAuthResponse> {
    try {
      const response = await apiClient.post<PhoneAuthResponse>(
        API_ENDPOINTS.auth.sendOTP,
        { phoneNumber:phone }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  }

  static async verifyOTP(
    phone: string,
    code: string,
    sessionId: string
  ): Promise<OTPVerificationResponse> {
    try {
      const response = await apiClient.post<OTPVerificationResponse>(
        API_ENDPOINTS.auth.verifyOTP,
        { phoneNumber: phone, code, sessionId }
      );

      // Store token securely if verification is successful
      if (response.success && response.token) {
        await SecureStorage.setToken(response.token);
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP code. Please try again.');
    }
  }

  static async completeOnboarding(data: OnboardingData, phone: string): Promise<User | null> {
    try {
      const response = await apiClient.post<{ user: User }>(
        API_ENDPOINTS.auth.completeOnboarding,
        { ...data, phone }
      );
      return response.user || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete onboarding. Please try again.');
    }
  }
}
