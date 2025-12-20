import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  category: 'messages' | 'bookings' | 'jobs' | 'payments' | 'system' | 'marketing';
}

export default function SettingsCommTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Mock notification preferences - replace with actual API call
  const preferences: NotificationPreference[] = [
    {
      id: 'messages',
      label: 'Messages',
      description: 'New messages and chat notifications',
      icon: 'chatbubble-outline',
      enabled: true,
      category: 'messages',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      description: 'Booking confirmations and updates',
      icon: 'calendar-outline',
      enabled: true,
      category: 'bookings',
    },
    {
      id: 'jobs',
      label: 'Jobs',
      description: 'Job applications and opportunities',
      icon: 'briefcase-outline',
      enabled: true,
      category: 'jobs',
    },
    {
      id: 'payments',
      label: 'Payments',
      description: 'Payment confirmations and receipts',
      icon: 'card-outline',
      enabled: true,
      category: 'payments',
    },
    {
      id: 'system',
      label: 'System',
      description: 'Important system updates',
      icon: 'information-circle-outline',
      enabled: true,
      category: 'system',
    },
    {
      id: 'marketing',
      label: 'Marketing',
      description: 'Promotions and special offers',
      icon: 'megaphone-outline',
      enabled: false,
      category: 'marketing',
    },
  ];

  const [notificationPreferences, setNotificationPreferences] = useState(preferences);

  const handleTogglePreference = (id: string) => {
    setNotificationPreferences(prev =>
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const getCategoryColor = (category: NotificationPreference['category']) => {
    switch (category) {
      case 'messages':
        return colors.secondary[600];
      case 'bookings':
        return colors.primary[600];
      case 'jobs':
        return colors.primary[600];
      case 'payments':
        return colors.secondary[600];
      case 'system':
        return colors.text.secondary;
      case 'marketing':
        return colors.primary[600];
      default:
        return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Notification Settings</Text>
            <Text style={styles.subtitle}>Manage your notification preferences</Text>
          </View>

          {/* General Settings */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>General Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Receive push notifications on your device</Text>
                </View>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                thumbColor={Colors.background.primary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive notifications via email</Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                thumbColor={Colors.background.primary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.text.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>SMS Notifications</Text>
                  <Text style={styles.settingDescription}>Receive notifications via SMS</Text>
                </View>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                thumbColor={Colors.background.primary}
              />
            </View>
          </Card>

          {/* Notification Preferences */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <Text style={styles.sectionDescription}>
              Choose which types of notifications you want to receive
            </Text>
            
            <View style={styles.preferencesList}>
              {notificationPreferences.map((preference) => {
                const categoryColor = getCategoryColor(preference.category);
                return (
                  <View key={preference.id}>
                    <View style={styles.settingItem}>
                      <View style={styles.settingItemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
                          <Ionicons name={preference.icon} size={20} color={categoryColor} />
                        </View>
                        <View style={styles.settingInfo}>
                          <Text style={styles.settingLabel}>{preference.label}</Text>
                          <Text style={styles.settingDescription}>{preference.description}</Text>
                        </View>
                      </View>
                      <Switch
                        value={preference.enabled}
                        onValueChange={() => handleTogglePreference(preference.id)}
                        trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                        thumbColor={Colors.background.primary}
                      />
                    </View>
                    {preference.id !== notificationPreferences[notificationPreferences.length - 1].id && (
                      <View style={styles.divider} />
                    )}
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Alert Settings */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Alert Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="volume-high-outline" size={20} color={colors.text.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sound</Text>
                  <Text style={styles.settingDescription}>Play sound for notifications</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                thumbColor={Colors.background.primary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.text.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>Vibrate for notifications</Text>
                </View>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                thumbColor={Colors.background.primary}
              />
            </View>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(app)/(tabs)/notifications-comm')}
            >
              <View style={styles.actionItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary[600]} />
                <Text style={styles.actionLabel}>View Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(app)/(tabs)/messages-comm')}
            >
              <View style={styles.actionItemLeft}>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.secondary[600]} />
                <Text style={styles.actionLabel}>Messages</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
  },
  preferencesList: {
    marginTop: Spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});

