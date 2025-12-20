import { useAuthContext } from '@localpro/auth';
import { SecureStorage } from '@localpro/storage';
import { Button, Input } from '@localpro/ui';
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
      router.replace('/(app)/(tabs)/index' as any);
    }
  }, [isAuthenticated, isOnboarding, loading, router]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images' as any],
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Let&apos;s set up your profile to get started
          </Text>

          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {name.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#999',
  },
  avatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  avatarButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

