import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface StatCategory {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  change?: number;
  color: string;
}

export default function StatsTabScreen() {
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock stats data - replace with actual API call
  const stats: StatCategory[] = [
    {
      id: 'referrals',
      label: 'Referrals',
      icon: 'people-outline',
      value: 0,
      change: 0,
      color: colors.primary[600],
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: 'calendar-outline',
      value: 0,
      change: 0,
      color: colors.secondary[600],
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: 'cash-outline',
      value: 0,
      change: 0,
      color: colors.semantic.success,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'briefcase-outline',
      value: 0,
      change: 0,
      color: colors.semantic.warning,
    },
  ];

  const getPackageStats = () => {
    switch (activePackage) {
      case 'marketplace':
        return stats.filter(s => ['bookings', 'earnings'].includes(s.id));
      case 'job-board':
        return stats.filter(s => ['jobs', 'earnings'].includes(s.id));
      case 'referrals':
        return stats.filter(s => ['referrals', 'earnings'].includes(s.id));
      default:
        return stats;
    }
  };

  const packageStats = getPackageStats();

  const formatValue = (value: number, type: string) => {
    if (type === 'earnings') {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Statistics</Text>
            <Text style={styles.subtitle}>Track your performance and activity</Text>
          </View>

          {/* Time Period Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodsContainer}
            contentContainerStyle={styles.periodsContent}
          >
            {timePeriods.map((period) => {
              const isActive = activePeriod === period.key;
              return (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActivePeriod(period.key)}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      isActive && styles.periodTabTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Overview Stats */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {packageStats.map((stat) => (
                <Card key={stat.id} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{formatValue(stat.value, stat.id)}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  {stat.change !== undefined && stat.change !== 0 && (
                    <View style={styles.statChange}>
                      <Ionicons
                        name={stat.change > 0 ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color={stat.change > 0 ? colors.semantic.success : colors.semantic.error}
                      />
                      <Text
                        style={[
                          styles.statChangeText,
                          {
                            color:
                              stat.change > 0 ? colors.semantic.success : colors.semantic.error,
                          },
                        ]}
                      >
                        {formatChange(stat.change)}
                      </Text>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          </View>

          {/* Detailed Stats */}
          <View style={styles.detailedSection}>
            <Text style={styles.sectionTitle}>Detailed Statistics</Text>
            
            {/* Referrals Stats */}
            {activePackage === 'referrals' ? (
              <Card style={styles.detailedCard}>
                <View style={styles.detailedCardHeader}>
                  <View style={styles.detailedCardHeaderLeft}>
                    <Ionicons name="people" size={24} color={colors.primary[600]} />
                    <Text style={styles.detailedCardTitle}>Referrals</Text>
                  </View>
                </View>
                <View style={styles.detailedStatsList}>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Total Referrals</Text>
                    <Text style={styles.detailedStatValue}>0</Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Completed</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.semantic.success }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Pending</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.semantic.warning }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Rewards Earned</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.primary[600] }]}>
                      $0.00
                    </Text>
                  </View>
                </View>
              </Card>
            ) : null}

            {/* Bookings Stats */}
            {activePackage === 'marketplace' && (
              <Card style={styles.detailedCard}>
                <View style={styles.detailedCardHeader}>
                  <View style={styles.detailedCardHeaderLeft}>
                    <Ionicons name="calendar" size={24} color={colors.secondary[600]} />
                    <Text style={styles.detailedCardTitle}>Bookings</Text>
                  </View>
                </View>
                <View style={styles.detailedStatsList}>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Total Bookings</Text>
                    <Text style={styles.detailedStatValue}>0</Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Active</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.secondary[600] }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Completed</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.semantic.success }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Total Revenue</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.primary[600] }]}>
                      $0.00
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Jobs Stats */}
            {activePackage === 'job-board' && (
              <Card style={styles.detailedCard}>
                <View style={styles.detailedCardHeader}>
                  <View style={styles.detailedCardHeaderLeft}>
                    <Ionicons name="briefcase" size={24} color={colors.semantic.warning} />
                    <Text style={styles.detailedCardTitle}>Jobs</Text>
                  </View>
                </View>
                <View style={styles.detailedStatsList}>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Applications</Text>
                    <Text style={styles.detailedStatValue}>0</Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Interviews</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.secondary[600] }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Accepted</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.semantic.success }]}>
                      0
                    </Text>
                  </View>
                  <View style={styles.detailedStatRow}>
                    <Text style={styles.detailedStatLabel}>Rejected</Text>
                    <Text style={[styles.detailedStatValue, { color: colors.semantic.error }]}>
                      0
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Chart Placeholder */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Activity Trend</Text>
                <Ionicons name="stats-chart-outline" size={20} color={colors.text.secondary} />
              </View>
              <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.chartPlaceholderText}>Chart visualization</Text>
                <Text style={styles.chartPlaceholderSubtext}>
                  Data visualization will appear here
                </Text>
              </View>
            </Card>
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
  periodsContainer: {
    marginBottom: Spacing.lg,
  },
  periodsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  periodTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  periodTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  overviewSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
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
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailedSection: {
    marginBottom: Spacing.lg,
  },
  detailedCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  detailedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailedCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  detailedStatsList: {
    gap: Spacing.md,
  },
  detailedStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailedStatLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chartCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

