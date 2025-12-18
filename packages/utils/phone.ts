// Phone number utilities
import * as Location from 'expo-location';
import { parsePhoneNumber, getCountryCallingCode, AsYouType, CountryCode } from 'libphonenumber-js';

/**
 * Format phone number as user types using libphonenumber-js
 */
export const formatPhoneNumberAsYouType = (phone: string, countryCode: CountryCode = 'US'): string => {
  try {
    const formatter = new AsYouType(countryCode);
    return formatter.input(phone);
  } catch (error) {
    // Fallback to basic formatting if libphonenumber fails
    return phone;
  }
};

/**
 * Get calling code for a country using libphonenumber-js
 */
export const getCallingCode = (countryCode: string): string | null => {
  try {
    const code = getCountryCallingCode(countryCode.toUpperCase() as CountryCode);
    return `+${code}`;
  } catch (error) {
    // Fallback to common codes
    const codes: Record<string, string> = {
      US: '+1',
      CA: '+1',
      GB: '+44',
      AU: '+61',
      FR: '+33',
      DE: '+49',
      IT: '+39',
      ES: '+34',
      BR: '+55',
      MX: '+52',
      IN: '+91',
      CN: '+86',
      JP: '+81',
      KR: '+82',
    };
    return codes[countryCode.toUpperCase()] || null;
  }
};

/**
 * Get country code from device location using expo-location
 */
export const getCountryCodeFromLocation = async (): Promise<string | null> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      // Try to get last known position without permission
      try {
        const location = await Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        if (location) {
          return await getCountryCodeFromCoordinates(
            location.coords.latitude,
            location.coords.longitude
          );
        }
      } catch (err) {
        console.log('Could not get last known position');
      }
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    if (location) {
      return await getCountryCodeFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
    }

    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get country code
 */
const getCountryCodeFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const countryCode = reverseGeocode[0].isoCountryCode;
      if (countryCode) {
        return countryCode.toUpperCase();
      }
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Normalize phone number to E.164 format using libphonenumber-js
 */
export const normalizePhoneNumber = (phone: string, countryCode: CountryCode = 'US'): string => {
  try {
    // Try to parse the phone number
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
  } catch (error) {
    // If parsing fails, try basic normalization
  }

  // Fallback: basic normalization
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, add country code
  if (!cleaned.startsWith('+')) {
    const callingCode = getCallingCode(countryCode);
    if (callingCode) {
      cleaned = callingCode.replace('+', '') + cleaned;
    } else {
      cleaned = '1' + cleaned; // Default to US
    }
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validate phone number using libphonenumber-js
 */
export const validatePhoneNumber = (phone: string, countryCode?: CountryCode): boolean => {
  try {
    if (countryCode) {
      const phoneNumber = parsePhoneNumber(phone, countryCode);
      return phoneNumber?.isValid() || false;
    } else {
      // Try to parse without country code (must include +)
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.isValid() || false;
    }
  } catch (error) {
    return false;
  }
};

