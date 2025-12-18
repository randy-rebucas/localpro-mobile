import { AuthProvider, useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading, isOnboarding } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to phone entry if not authenticated
      router.replace('/(auth)/phone');
    } else if (isAuthenticated) {
      // Redirect to app if authenticated and onboarded
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading, isOnboarding, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading..." />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
