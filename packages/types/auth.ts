export interface User {
  id: string;
  email?: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
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

