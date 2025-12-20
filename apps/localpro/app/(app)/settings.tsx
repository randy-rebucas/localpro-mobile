import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { Button, Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export default function SettingsScreen() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/phone');
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Account Section */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(app)/(tabs)/profile')}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Name</Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text style={styles.settingValue}>{user?.name || 'N/A'}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Phone</Text>
              </View>
              <Text style={styles.settingValue}>{user?.phone || 'N/A'}</Text>
            </View>

            {user?.email && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.settingLabel}>Email</Text>
                  </View>
                  <Text style={styles.settingValue}>{user.email}</Text>
                </View>
              </>
            )}

            {user?.createdAt && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.settingLabel}>Member Since</Text>
                  </View>
                  <Text style={styles.settingValue}>{formatDate(user.createdAt)}</Text>
                </View>
              </>
            )}
          </Card>

          {/* Notifications Section */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.neutral.gray300, true: colors.primary[200] }}
                thumbColor={pushNotifications ? colors.primary[600] : colors.neutral.gray400}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.neutral.gray300, true: colors.primary[200] }}
                thumbColor={emailNotifications ? colors.primary[600] : colors.neutral.gray400}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(app)/notifications')}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="settings-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Notification Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>

          {/* App Settings */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(app)/help-support')}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(app)/about')}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>

          {/* About Section */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              LocalPro Super App{'\n'}
              Version 1.0.0{'\n\n'}
              Connect with local professionals and services in your community.
            </Text>
          </Card>

          {/* Logout Button */}
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
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    color: Colors.text.primary,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.xs,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

