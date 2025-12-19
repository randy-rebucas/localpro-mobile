import { useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePackageContext } from '../contexts/PackageContext';
import { navigateToFirstTab } from '../utils/navigation';

export default function Index() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { activePackage, isLoading: packageLoading } = usePackageContext();
  const router = useRouter();
  const isLoading = authLoading || packageLoading;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/phone');
    } else {
      // Use double requestAnimationFrame to ensure tabs layout has fully initialized
      // This prevents unmatched route errors
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          navigateToFirstTab(router, activePackage);
        });
      });
    }
  }, [isAuthenticated, isLoading, activePackage]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Loading message="Loading..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
