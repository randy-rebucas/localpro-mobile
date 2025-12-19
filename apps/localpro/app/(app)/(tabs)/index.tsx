import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useStylePresets, useThemeColors } from '../../../hooks/use-theme';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const { activePackage } = usePackageContext();
  const { activeRole } = useRoleContext();
  const router = useRouter();
  const colors = useThemeColors();
  const presets = useStylePresets();

  const getPackageContent = () => {
    switch (activePackage) {
      case 'marketplace':
        return {
          title: 'Browse Services',
          subtitle: 'Find and book services',
          quickActions: [
            { icon: 'search', label: 'Search Services', route: '/(app)/(tabs)/search' },
            { icon: 'calendar', label: 'My Bookings', route: '/(app)/(tabs)/bookings' },
            { icon: 'chatbubbles', label: 'Messages', route: '/(app)/(tabs)/messages' },
          ],
        };
      case 'job-board':
        return {
          title: 'Browse Jobs',
          subtitle: 'Find your next opportunity',
          quickActions: [
            { icon: 'search', label: 'Search Jobs', route: '/(app)/(tabs)/search' },
            { icon: 'document-text', label: 'Applications', route: '/(app)/(tabs)/applications' },
            { icon: 'add-circle', label: 'Post Job', route: '/(app)/(tabs)/post-job' },
          ],
        };
      default:
        return {
          title: `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`,
          subtitle: 'Your LocalPro Dashboard',
          quickActions: [
            { icon: 'search', label: 'Search', route: '/(app)/(tabs)/search' },
            { icon: 'calendar', label: 'Bookings', route: '/(app)/(tabs)/bookings' },
            { icon: 'person', label: 'Profile', route: '/(app)/(tabs)/profile' },
          ],
        };
    }
  };

  const content = getPackageContent();

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      client: 'Client',
      provider: 'Provider',
      admin: 'Admin',
      supplier: 'Supplier',
      instructor: 'Instructor',
      agency_owner: 'Agency Owner',
      agency_admin: 'Agency Admin',
      partner: 'Partner',
    };
    return roleMap[role] || role;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.subtitle}>{content.subtitle}</Text>
            </View>
            {activeRole && (
              <View style={styles.roleBadge}>
                <Ionicons 
                  name="briefcase-outline" 
                  size={14} 
                  color={colors.primary[600]} 
                />
                <Text style={styles.roleText}>{getRoleDisplayName(activeRole)}</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {content.quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionItem}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[100] }]}>
                    <Ionicons 
                      name={action.icon as any} 
                      size={24} 
                      color={colors.primary[600]} 
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondary[100] }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.secondary[600]} />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="time-outline" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.neutral.gray100 }]}>
                <Ionicons name="checkmark-done" size={24} color={colors.text.secondary} />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
          </View>

          {/* Recent Activity */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>
                Your recent actions will appear here
              </Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[600],
    marginLeft: 4,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickActionItem: {
    width: '33.33%',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

