import type { User, LoginCredentials, RegisterData, AuthResponse } from '@localpro/types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async logout(): Promise<void> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async getCurrentUser(): Promise<User | null> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

