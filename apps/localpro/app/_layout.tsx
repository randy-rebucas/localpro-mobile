import { AuthProvider, useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { PackageProvider } from '../contexts/PackageContext';
import { RoleProvider } from '../contexts/RoleContext';

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
    const inStackGroup = segments[0] === '(stack)';
    const inTabsGroup = segments[1] === '(tabs)';

    // If already in correct location, reset flag and don't redirect
    if ((!isAuthenticated && inAuthGroup) || 
        (isAuthenticated && ((inAppGroup && inTabsGroup) || inStackGroup))) {
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
    } else if (isAuthenticated && !inStackGroup && (!inAppGroup || !inTabsGroup)) {
        hasNavigated.current = true;
        router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

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
      <Stack.Screen name="(stack)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PackageProvider>
          <RoleProviderWrapper>
            <RootLayoutNav />
          </RoleProviderWrapper>
        </PackageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RoleProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const availableRoles = user?.roles && user.roles.length > 0 
    ? user.roles 
    : ['client' as const];
  
  return (
    <RoleProvider availableRoles={availableRoles}>
      {children}
    </RoleProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
});
