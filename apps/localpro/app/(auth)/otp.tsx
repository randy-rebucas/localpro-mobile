import { useAuthContext } from '@localpro/auth';
import { OTPInput } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OTPScreen() {
  const { phone, sessionId } = useLocalSearchParams<{ phone: string; sessionId: string }>();
  const [code, setCode] = useState('');
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
        router.replace('/(app)/(tabs)/index' as any);
      } else {
        // User is authenticated but needs onboarding
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, isOnboarding, loading]);

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
    setCode(otpCode);

    try {
      setLoading(true);
      const response = await verifyOTP(phone, otpCode, sessionId);
      
      if (response.success) {
        // Auth state will be updated by verifyOTP
        // The useEffect hook will handle navigation based on auth state
        // No need to navigate here - let the useEffect handle it
      } else {
        setError('Verification failed. Please try again.');
        setCode('');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      setCode('');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>

          <OTPInput
            length={6}
            onComplete={handleVerify}
            error={error}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <Text style={styles.loadingText}>Verifying...</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  phone: {
    fontWeight: '600',
    color: '#000',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  timerText: {
    fontSize: 14,
    color: '#999',
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

