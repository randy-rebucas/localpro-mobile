import { AuthProvider, useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasNavigated.current = false;
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inTabsGroup = segments[1] === '(tabs)';

    // If already in correct location, reset flag and don't redirect
    if ((!isAuthenticated && inAuthGroup) || 
        (isAuthenticated && inAppGroup && inTabsGroup)) {
      hasNavigated.current = false;
      return;
    }

    // Prevent infinite loops by checking if we've already navigated
    if (hasNavigated.current) {
      return;
    }

    // Only redirect if we're not already in the correct group
    if (!isAuthenticated && !inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(auth)/phone');
    } else if (isAuthenticated) {
        hasNavigated.current = true;
        router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

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
