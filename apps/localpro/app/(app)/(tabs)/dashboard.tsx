import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

export default function DashboardTabScreen() {
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();

  const getDashboardMetrics = (): DashboardMetric[] => {
    const baseMetrics: DashboardMetric[] = [
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: '$0.00',
        icon: 'cash-outline',
        color: colors.semantic.success,
        route: '/(app)/(tabs)/financial-analytics',
      },
      {
        id: 'users',
        label: 'Active Users',
        value: '0',
        icon: 'people-outline',
        color: colors.primary[600],
        route: '/(app)/(tabs)/user-analytics',
      },
      {
        id: 'bookings',
        label: 'Bookings',
        value: '0',
        icon: 'calendar-outline',
        color: colors.secondary[600],
        route: '/(app)/(tabs)/bookings',
      },
      {
        id: 'growth',
        label: 'Growth Rate',
        value: '0%',
        icon: 'trending-up-outline',
        color: colors.semantic.warning,
        route: '/(app)/(tabs)/trends',
      },
    ];

    // Filter based on active package
    switch (activePackage) {
      case 'marketplace':
        return baseMetrics.filter(m => ['revenue', 'bookings', 'growth'].includes(m.id));
      case 'job-board':
        return baseMetrics.filter(m => ['revenue', 'users', 'growth'].includes(m.id));
      default:
        return baseMetrics;
    }
  };

  const metrics = getDashboardMetrics();

  const quickActions: QuickAction[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics-outline',
      color: colors.primary[600],
      route: '/(app)/(tabs)/analytics',
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: 'stats-chart-outline',
      color: colors.secondary[600],
      route: '/(app)/(tabs)/trends',
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: 'cash-outline',
      color: colors.semantic.success,
      route: '/(app)/(tabs)/financial-analytics',
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'people-outline',
      color: colors.primary[600],
      route: '/(app)/(tabs)/user-analytics',
    },
  ];

  const handleMetricPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Overview and insights</Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => {
                // TODO: Refresh dashboard data
                console.log('Refresh dashboard');
              }}
            >
              <Ionicons name="refresh-outline" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  onPress={() => handleMetricPress(metric.route)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.metricCard}>
                    <View style={[styles.metricIconContainer, { backgroundColor: `${metric.color}15` }]}>
                      <Ionicons name={metric.icon} size={24} color={metric.color} />
                    </View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickAction}
                  onPress={() => handleQuickAction(action.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Overview Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Overview</Text>
              <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Overview chart coming soon</Text>
            </View>
          </Card>

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${colors.primary[600]}15` }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary[600]} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>No recent activity</Text>
                  <Text style={styles.activityTime}>Activity will appear here</Text>
                </View>
              </View>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  quickActionsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    width: '47%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  chartCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activityList: {
    gap: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

