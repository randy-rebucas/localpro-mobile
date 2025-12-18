export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

import { validatePhoneNumber } from './phone';
import type { CountryCode } from 'libphonenumber-js';

export const isValidPhone = (phone: string, countryCode?: string): boolean => {
  // Use libphonenumber-js validation if available
  if (countryCode) {
    return validatePhoneNumber(phone, countryCode as CountryCode);
  }
  
  // Fallback to basic validation
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  const cleaned = phone.replace(/\D/g, '');
  // Basic validation - at least 10 digits
  return cleaned.length >= 10 && phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

