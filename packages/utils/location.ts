import * as Location from 'expo-location';

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  callingCode: string;
}

/**
 * Country code to calling code mapping
 * Common countries for phone number formatting
 */
const COUNTRY_CALLING_CODES: Record<string, string> = {
  US: '+1',
  CA: '+1',
  GB: '+44',
  AU: '+61',
  NZ: '+64',
  IN: '+91',
  BR: '+55',
  MX: '+52',
  FR: '+33',
  DE: '+49',
  IT: '+39',
  ES: '+34',
  NL: '+31',
  BE: '+32',
  CH: '+41',
  AT: '+43',
  SE: '+46',
  NO: '+47',
  DK: '+45',
  FI: '+358',
  PL: '+48',
  PT: '+351',
  GR: '+30',
  IE: '+353',
  JP: '+81',
  KR: '+82',
  CN: '+86',
  SG: '+65',
  MY: '+60',
  TH: '+66',
  PH: '+63',
  ID: '+62',
  VN: '+84',
  ZA: '+27',
  NG: '+234',
  KE: '+254',
  EG: '+20',
  SA: '+966',
  AE: '+971',
  IL: '+972',
  TR: '+90',
  RU: '+7',
  AR: '+54',
  CL: '+56',
  CO: '+57',
  PE: '+51',
  VE: '+58',
};

/**
 * Get country code from device location
 * Returns the country code (e.g., 'US', 'GB') based on device location
 */
export async function getCountryCodeFromLocation(): Promise<string | null> {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get country
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const countryCode = reverseGeocode[0].isoCountryCode;
      return countryCode || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting country code from location:', error);
    return null;
  }
}

/**
 * Get country info (code, name, calling code) from location
 */
export async function getCountryInfoFromLocation(): Promise<CountryInfo | null> {
  try {
    const countryCode = await getCountryCodeFromLocation();
    if (!countryCode) {
      return null;
    }

    const callingCode = COUNTRY_CALLING_CODES[countryCode] || null;
    
    // Get country name from reverse geocode
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const countryName = reverseGeocode?.[0]?.country || countryCode;

    return {
      countryCode,
      countryName,
      callingCode: callingCode || '',
    };
  } catch (error) {
    console.error('Error getting country info from location:', error);
    return null;
  }
}

/**
 * Get calling code for a country code
 */
export function getCallingCode(countryCode: string): string | null {
  return COUNTRY_CALLING_CODES[countryCode.toUpperCase()] || null;
}

/**
 * Get default country code (fallback to US if location unavailable)
 */
export async function getDefaultCountryCode(): Promise<string> {
  const countryCode = await getCountryCodeFromLocation();
  return countryCode || 'US';
}

