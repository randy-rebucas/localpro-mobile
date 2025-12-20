export type UserRole = 
  | 'client' 
  | 'provider' 
  | 'admin' 
  | 'supplier' 
  | 'instructor' 
  | 'agency_owner' 
  | 'agency_admin' 
  | 'partner';

export interface Avatar {
  url: string;
  publicId: string;
  thumbnail: string;
}

export interface User {
  // MongoDB fields
  _id: string;
  __v?: number;
  
  // Basic user info
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;

  // Profile information
  profile?: {
    avatar?: Avatar;
    address?: {
      coordinates?: {
        lat: number;
        lng: number;
      };
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    bio?: string;
  };
  
  // Roles and permissions
  roles?: UserRole[]; // User can have multiple roles
  
  // Verification and status
  isVerified?: boolean;
  isActive?: boolean;
  lastVerificationSent?: Date | string;
  isOnboarded?: boolean; // For backward compatibility
  
  // Related entity IDs
  activity?: string;
  agency?: string;
  management?: string;
  referral?: string;
  trust?: string;
  wallet?: string;
  settings?: string;
  
  // FCM tokens for push notifications
  fcmTokens?: string[];
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Computed/helper properties (not from API)
  id?: string; // Alias for _id for backward compatibility
  name?: string; // Computed from firstName + lastName
  phone?: string; // Alias for phoneNumber for backward compatibility
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
  phoneNumber?: string;
  isOnboarding: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PhoneAuthRequest {
  phone: string;
}

export interface PhoneAuthResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
}

export interface OTPVerificationRequest {
  phone: string;
  code: string;
  sessionId: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  user?: User;
  token?: string;
  isNewUser: boolean;
}

export interface OnboardingData {
  name: string;
  email?: string;
  avatar?: string;
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: {
    avatar: Avatar;
  };
  user?: User;
}

