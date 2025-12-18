import { useAuthContext } from '@localpro/auth';
import { Button, Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
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
        <Text style={styles.title}>Settings</Text>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{user?.name || 'N/A'}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Phone</Text>
            <Text style={styles.settingValue}>{user?.phone || 'N/A'}</Text>
          </View>
          {user?.email && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user.email}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.comingSoon}>More settings coming soon...</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            LocalPro Super App{'\n'}
            Version 1.0.0
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
    marginBottom: 24,
    color: '#000',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  comingSoon: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 24,
  },
});

