import { useAuthContext } from '@localpro/auth';
import { Button, Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/phone');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        <Text style={styles.title}>Welcome back, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Your LocalPro Dashboard</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Text style={styles.cardText}>
            Explore the marketplace, find jobs, manage your profile, and more!
          </Text>
        </Card>

        <View style={styles.logoutButton}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 24,
  },
});

