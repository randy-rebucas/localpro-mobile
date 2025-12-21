import { useAuthContext } from '@localpro/auth';
import { OTPInput } from '@localpro/ui';
import { Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPScreen() {
  const { phone, sessionId } = useLocalSearchParams<{ phone: string; sessionId: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const { verifyOTP, sendOTP, isAuthenticated, isOnboarding } = useAuthContext();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Watch for auth state changes and navigate accordingly
  // Only navigate if we're still on the OTP screen (not already navigating)
  useEffect(() => {
    if (!loading && isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      if (!isOnboarding) {
        // User is authenticated and onboarded - navigate to app
        // Use a small delay to ensure routes are fully initialized
        const timer = setTimeout(() => {
          try {
            // Navigate to tabs - the drawer will show the initial tab based on package
            router.replace('/(app)/(tabs)');
          } catch (error) {
            console.error('Navigation error:', error);
            // Fallback: try navigating to index tab if available
            router.replace('/(app)/(tabs)/index');
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        // User is authenticated but needs onboarding
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, isOnboarding, loading, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (otpCode: string) => {
    if (!phone || !sessionId) {
      setError('Missing phone or session information');
      return;
    }

    setError('');

    try {
      setLoading(true);
      const response = await verifyOTP(phone, otpCode, sessionId);
      
      if (!response.success) {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;

    try {
      setError('');
      setResendTimer(60);
      const response = await sendOTP(phone);
      if (!response.success) {
        setError(response.message || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
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
                  <Text style={styles.iconEmoji}>🔐</Text>
                </View>
              </View>

              {/* Title Section */}
              <Text style={styles.title}>Verify Your Number</Text>
              <Text style={styles.subtitle}>
                We&apos;ve sent a 6-digit verification code to{'\n'}
                <Text style={styles.phone}>{phone}</Text>
              </Text>

              {/* Card Container */}
              <View style={styles.card}>
                <OTPInput
                  length={6}
                  onComplete={handleVerify}
                  error={error}
                />

                {loading && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Verifying...</Text>
                  </View>
                )}

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                  {resendTimer > 0 ? (
                    <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                      <Text style={styles.resendLink}>Resend Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  iconEmoji: {
    fontSize: 48,
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
  phone: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.lg,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.xl,
  },
  loadingContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.medium,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  resendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  timerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  resendButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  resendLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
});

