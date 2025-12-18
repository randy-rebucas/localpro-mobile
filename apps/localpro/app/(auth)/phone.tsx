import { useAuthContext } from '@localpro/auth';
import { Button, Input } from '@localpro/ui';
import {
  formatPhoneNumberAsYouType,
  getCallingCode,
  getCountryCodeFromLocation,
  isValidPhone,
  normalizePhoneNumber
} from '@localpro/utils';
import { useRouter } from 'expo-router';
import type { CountryCode } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState('+1');
  const { sendOTP } = useAuthContext();
  const router = useRouter();

  // Detect location and set country code on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setDetectingLocation(true);
        const detectedCountryCode = await getCountryCodeFromLocation();
        if (detectedCountryCode) {
          const code = detectedCountryCode.toUpperCase() as CountryCode;
          setCountryCode(code);
          const codeWithPlus = getCallingCode(detectedCountryCode);
          if (codeWithPlus) {
            setCallingCode(codeWithPlus);
            // Pre-fill the calling code if phone is empty
            setPhone((prev) => prev || codeWithPlus + ' ');
          }
        } else {
          // Default to US if no country detected
          setCountryCode('US');
          setCallingCode('+1');
          setPhone((prev) => prev || '+1 ');
        }
      } catch (err) {
        console.error('Error detecting location:', err);
        // Default to US if location detection fails
        setCountryCode('US');
        setCallingCode('+1');
        setPhone((prev) => prev || '+1 ');
      } finally {
        setDetectingLocation(false);
      }
    };

    detectLocation();
  }, []);

  const handlePhoneChange = (text: string) => {
    setError('');
    
    // If user deletes everything, reset to calling code
    if (text.length === 0) {
      setPhone(callingCode + ' ');
      return;
    }
    
    // If user starts typing without country code, add it
    if (!text.startsWith('+') && !text.startsWith(callingCode)) {
      // Check if it's just digits (user typing local number)
      if (/^\d+$/.test(text.replace(/\s/g, ''))) {
        text = callingCode + ' ' + text;
      }
    }
    
    // Format phone number as user types using libphonenumber-js
    const formatted = formatPhoneNumberAsYouType(text, countryCode);
    setPhone(formatted);
  };

  const handleContinue = async () => {
    setError('');
    
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Normalize phone number to E.164 format before validation
    const normalizedPhone = normalizePhoneNumber(phone, countryCode);
    
    if (!isValidPhone(normalizedPhone, countryCode)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      // Send normalized phone number to API
      const response = await sendOTP(normalizedPhone);
      
      // If API call succeeded (no error thrown), redirect to OTP screen
      // Use sessionId from response, or generate a temporary one if not provided
      const sessionId = response?.sessionId || `temp_${Date.now()}`;
      
      router.replace({
        pathname: '/(auth)/otp',
        params: { phone: normalizedPhone, sessionId },
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to confirm your number
          </Text>

          {detectingLocation && (
            <View style={styles.locationIndicator}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.locationText}>Detecting your location...</Text>
            </View>
          )}

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder={`${callingCode} (555) 123-4567`}
            error={error}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={loading || detectingLocation}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
});

