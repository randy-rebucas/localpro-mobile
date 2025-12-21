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
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, Typography } from '../../constants/theme';

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
      <View style={styles.gradient}>
        {/* Decorative Circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Image 
                    source={require('../../assets/images/icon.png')} 
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Title Section */}
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                Enter your phone number to get started. We&apos;ll send you a verification code to confirm your number.
              </Text>

              {/* Location Detection Indicator */}
              {detectingLocation && (
                <View style={styles.locationIndicator}>
                  <ActivityIndicator size="small" color={Colors.primary[600]} />
                  <Text style={styles.locationText}>Detecting your location...</Text>
                </View>
              )}

              {/* Card Container */}
              <View style={styles.card}>
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

              {/* Footer Text */}
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: Colors.primary[600],
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary[400],
    opacity: 0.3,
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.secondary[400],
    opacity: 0.25,
    bottom: 100,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[300],
    opacity: 0.2,
    top: '30%',
    right: 20,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    minHeight: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.neutral.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.white,
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
    lineHeight: Typography.lineHeight.base + 4,
    opacity: 0.95,
    paddingHorizontal: Spacing.md,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.neutral.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    alignSelf: 'center',
  },
  locationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.medium,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.xl,
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.white,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: Spacing.lg,
    lineHeight: Typography.lineHeight.xs + 2,
  },
});

