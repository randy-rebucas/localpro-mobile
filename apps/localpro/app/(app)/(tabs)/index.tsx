import { useAuthContext } from '@localpro/auth';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePackageContext } from '../../../contexts/PackageContext';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const { activePackage } = usePackageContext();
  const router = useRouter();

  const getPackageContent = () => {
    switch (activePackage) {
      case 'marketplace':
        return {
          title: 'Browse Services',
          subtitle: 'Find and book services',
          description: 'Explore the marketplace, find services, and make bookings!',
        };
      case 'job-board':
        return {
          title: 'Browse Jobs',
          subtitle: 'Find your next opportunity',
          description: 'Search for jobs, track applications, and post job listings!',
        };
      default:
        return {
          title: 'Welcome back, ' + (user?.name || 'User') + '!',
          subtitle: 'Your LocalPro Dashboard',
          description: 'Explore the marketplace, find jobs, manage your profile, and more!',
        };
    }
  };

  const content = getPackageContent();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Text style={styles.cardText}>{content.description}</Text>
          </Card>

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
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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

