import { useAuthContext } from '@localpro/auth';
import { SecureStorage } from '@localpro/storage';
import { Button, Input } from '@localpro/ui';
import { Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { completeOnboarding, isAuthenticated, isOnboarding } = useAuthContext();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Watch for auth state changes and navigate to home when onboarding is complete
  useEffect(() => {
    if (!loading && isAuthenticated && !isOnboarding && !hasNavigated.current) {
      hasNavigated.current = true;
      // Navigate to tabs - use a small delay to ensure routes are fully initialized
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
    }
  }, [isAuthenticated, isOnboarding, loading, router]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });


    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      await completeOnboarding({
        name: name.trim(),
        avatar: avatar || undefined,
      });
      // Navigation will be handled by useEffect when isOnboarding becomes false
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = async () => {
    try {
      await SecureStorage.clearAll();
      setError('');
      alert('Storage cleared successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to clear storage');
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
                  <Text style={styles.iconEmoji}>👤</Text>
                </View>
              </View>

              {/* Title Section */}
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Let&apos;s set up your profile to get started with your journey
              </Text>

              {/* Card Container */}
              <View style={styles.card}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                  <TouchableOpacity 
                    style={styles.avatarWrapper}
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {name.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.avatarEditBadge}>
                      <Text style={styles.avatarEditIcon}>📷</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.avatarButton} 
                    onPress={pickImage}
                  >
                    <Text style={styles.avatarButtonText}>
                      {avatar ? 'Change Photo' : 'Add Photo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  error={error && !name.trim() ? error : undefined}
                />

                <Button
                  title="Complete Setup"
                  onPress={handleComplete}
                  loading={loading}
                  disabled={loading || !name.trim()}
                />
              </View>

              {/* Dev utility: Clear storage button */}
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={handleClearStorage}
              >
                <Text style={styles.clearButtonText}>Clear Storage (Dev)</Text>
              </TouchableOpacity>
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
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.primary[100],
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary[100],
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...Shadows.md,
  },
  avatarEditIcon: {
    fontSize: 18,
  },
  avatarButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  avatarButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  clearButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.semantic.error,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 200,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.semibold,
  },
});

