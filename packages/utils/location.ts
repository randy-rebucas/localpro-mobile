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

// Cache for reverse geocoding results to prevent rate limit issues
const geocodeCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_RETRY_DELAY = 2000; // 2 seconds

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
  const errorMessage = error?.message || String(error || '');
  return errorMessage.includes('rate limit') || 
         errorMessage.includes('too many requests') ||
         errorMessage.includes('Geocoding rate limit');
}

/**
 * Safe reverse geocode with rate limit handling and caching
 */
async function safeReverseGeocode(
  latitude: number,
  longitude: number,
  retries = 2
): Promise<any[] | null> {
  // Create cache key from coordinates (rounded to 4 decimal places for caching)
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = geocodeCache.get(cacheKey);
  
  // Return cached result if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    // Cache the result
    if (reverseGeocode && reverseGeocode.length > 0) {
      geocodeCache.set(cacheKey, {
        result: reverseGeocode,
        timestamp: Date.now(),
      });
    }

    return reverseGeocode;
  } catch (error: any) {
    // Handle rate limit errors with retry
    if (isRateLimitError(error) && retries > 0) {
      console.warn(`Rate limit hit, retrying in ${RATE_LIMIT_RETRY_DELAY}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY));
      return safeReverseGeocode(latitude, longitude, retries - 1);
    }

    // Log non-rate-limit errors
    if (!isRateLimitError(error)) {
      console.error('Error reverse geocoding:', error);
    } else {
      console.warn('Geocoding rate limit exceeded. Please try again later.');
    }
    
    return null;
  }
}

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

    // Reverse geocode to get country with rate limit handling
    const reverseGeocode = await safeReverseGeocode(
      location.coords.latitude,
      location.coords.longitude
    );

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
    
    // Get country name from reverse geocode (reuse cached result if available)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const reverseGeocode = await safeReverseGeocode(
      location.coords.latitude,
      location.coords.longitude
    );

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
 * Export safe reverse geocode function for use in other files
 */
export { safeReverseGeocode };

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

