export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  coordinates?: Coordinates;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserProfile {
  address?: Address;
  bio?: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

