import { useAuthContext } from '@localpro/auth';
import { Loading } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

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
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Loading message="Loading..." />
    </View>
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
