import { API_ENDPOINTS, apiClient } from '@localpro/api';
import { SecureStorage } from '@localpro/storage';
import type {
  AuthResponse,
  AvatarUploadResponse,
  LoginCredentials,
  OTPVerificationResponse,
  OnboardingData,
  PhoneAuthResponse,
  RegisterData,
  User
} from '@localpro/types';

/**
 * Normalizes user data from API response to include computed properties
 * for backward compatibility
 */
function normalizeUser(user: User): User {
  return {
    ...user,
    // Add computed properties for backward compatibility
    id: user._id || user.id,
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.lastName || user.name,
    phone: user.phoneNumber || user.phone,
  };
}

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
      if (response.user) {
        return normalizeUser(response.user);
      }
      return null;
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
      if (response.user) {
        return normalizeUser(response.user);
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete onboarding. Please try again.');
    }
  }

  /**
   * Update user profile information
   * @param data - Profile data to update
   * @returns Updated user object
   */
  static async updateProfile(data: {
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
      coordinates: [number, number]; // [longitude, latitude]
    };
  }): Promise<User | null> {
    try {
      const response = await apiClient.put<{ user: User }>(
        API_ENDPOINTS.auth.updateProfile,
        data
      );
      if (response.user) {
        return normalizeUser(response.user);
      }
      return null;
    } catch (error: any) {
      // If unauthorized, clear token
      if (error.status === 401) {
        await SecureStorage.removeToken();
      }
      throw new Error(error.message || 'Failed to update profile. Please try again.');
    }
  }

  /**
   * Upload user avatar image using FormData (multipart/form-data)
   * @param imageUri - Local URI of the image to upload
   * @param fileSize - File size in bytes (optional, for validation)
   * @returns Updated user object with new avatar URL
   */
  static async uploadAvatar(imageUri: string, fileSize?: number): Promise<User | null> {
    try {
      const token = await SecureStorage.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Validate file size (2MB limit) if provided
      if (fileSize && fileSize > 2 * 1024 * 1024) {
        throw new Error('Image size exceeds 2MB limit. Please choose a smaller image.');
      }

      // Extract file extension from URI
      const uriWithoutQuery = imageUri.split('?')[0];
      const uriParts = uriWithoutQuery.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: mimeType,
        name: `avatar.${fileType}`,
      } as any);

      // Upload to server using FormData
      const apiResponse = await apiClient.post<AvatarUploadResponse>(
        API_ENDPOINTS.auth.uploadAvatar,
        formData
      );

      // Handle response - API may return user directly or in data.avatar
      if (apiResponse.user) {
        return normalizeUser(apiResponse.user);
      }

      // If response has avatar data, fetch updated user
      if (apiResponse.data?.avatar) {
        // Fetch updated user to get complete user object
        const updatedUser = await this.getCurrentUser();
        if (updatedUser) {
          return updatedUser;
        }
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      
      // If unauthorized, clear token
      if (error.status === 401) {
        await SecureStorage.removeToken();
      }
      
      // Extract error message
      const errorMessage = error.message || 
                           (typeof error === 'string' ? error : 'Failed to upload avatar. Please try again.');
      
      throw new Error(errorMessage);
    }
  }
}
