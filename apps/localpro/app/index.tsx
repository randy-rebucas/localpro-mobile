import { useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/phone');
    } else {
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

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
