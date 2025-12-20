import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface UsageMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface PartnerUsage {
  partnerId: string;
  partnerName: string;
  category: string;
  usageCount: number;
  lastUsed: Date;
}

export default function UsageTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock usage metrics - replace with actual API call
  const metrics: UsageMetric[] = [
    {
      id: 'total-usage',
      label: 'Total Usage',
      value: 0,
      unit: 'requests',
      change: 0,
      icon: 'stats-chart-outline',
      color: colors.primary[600],
    },
    {
      id: 'active-partners',
      label: 'Active Partners',
      value: 0,
      unit: 'partners',
      change: 0,
      icon: 'people-outline',
      color: colors.secondary[600],
    },
    {
      id: 'api-calls',
      label: 'API Calls',
      value: 0,
      unit: 'calls',
      change: 0,
      icon: 'code-outline',
      color: colors.semantic.success,
    },
    {
      id: 'data-transferred',
      label: 'Data Transferred',
      value: 0,
      unit: 'MB',
      change: 0,
      icon: 'cloud-upload-outline',
      color: colors.semantic.warning,
    },
  ];

  // Mock partner usage data - replace with actual API call
  const partnerUsage: PartnerUsage[] = [];

  const formatValue = (value: number, unit: string) => {
    if (unit === 'MB' || unit === 'GB') {
      return `${value.toFixed(2)} ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const days = Math.floor(diff / 86400000);

      if (days < 1) return 'Today';
      if (days < 7) return `${days}d ago`;
      if (days < 30) return `${Math.floor(days / 7)}w ago`;
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Usage Statistics</Text>
            <Text style={styles.subtitle}>Track partner usage and activity</Text>
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

          {/* Usage Metrics */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => {
                const changeText = formatChange(metric.change);
                return (
                  <Card key={metric.id} style={styles.metricCard}>
                    <View style={[styles.metricIconContainer, { backgroundColor: `${metric.color}15` }]}>
                      <Ionicons name={metric.icon} size={24} color={metric.color} />
                    </View>
                    <Text style={styles.metricValue}>
                      {formatValue(metric.value, metric.unit)}
                    </Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    {changeText && (
                      <View style={styles.metricChange}>
                        <Ionicons
                          name={metric.change! > 0 ? 'arrow-up' : 'arrow-down'}
                          size={12}
                          color={metric.change! > 0 ? colors.semantic.success : colors.semantic.error}
                        />
                        <Text
                          style={[
                            styles.metricChangeText,
                            { color: metric.change! > 0 ? colors.semantic.success : colors.semantic.error },
                          ]}
                        >
                          {changeText}
                        </Text>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Partner Usage List */}
          <View style={styles.partnersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Partner Usage</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/my-partners')}>
                <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {partnerUsage.length > 0 ? (
              <View style={styles.partnersList}>
                {partnerUsage.map((usage) => (
                  <Card key={usage.partnerId} style={styles.partnerCard}>
                    <View style={styles.partnerHeader}>
                      <View style={styles.partnerInfo}>
                        <Text style={styles.partnerName}>{usage.partnerName}</Text>
                        <Text style={styles.partnerCategory}>{usage.category}</Text>
                      </View>
                      <View style={styles.partnerUsage}>
                        <Text style={styles.usageCount}>{usage.usageCount}</Text>
                        <Text style={styles.usageLabel}>uses</Text>
                      </View>
                    </View>
                    <View style={styles.partnerFooter}>
                      <View style={styles.partnerMeta}>
                        <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                        <Text style={styles.partnerMetaText}>
                          Last used {formatDate(usage.lastUsed)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <Ionicons name="stats-chart-outline" size={64} color={colors.text.tertiary} />
                  <Text style={styles.emptyStateTitle}>No Usage Data</Text>
                  <Text style={styles.emptyStateText}>
                    Usage statistics will appear here once partners start using your services
                  </Text>
                </View>
              </Card>
            )}
          </View>

          {/* Chart Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Usage Trends</Text>
              <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Chart visualization coming soon</Text>
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
    marginBottom: Spacing.xs,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  partnersSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  partnersList: {
    gap: Spacing.md,
  },
  partnerCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  partnerCategory: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  partnerUsage: {
    alignItems: 'flex-end',
  },
  usageCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  usageLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  partnerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  partnerMetaText: {
    fontSize: 12,
    color: Colors.text.tertiary,
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
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

