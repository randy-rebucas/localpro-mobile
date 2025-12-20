import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

interface UserMetric {
  id: string;
  label: string;
  value: number;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  color: string;
}

export default function UserAnalyticsTabScreen() {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock user metrics - replace with actual API call
  const metrics: UserMetric[] = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: 0,
      change: 0,
      icon: 'people-outline',
      color: colors.primary[600],
    },
    {
      id: 'active-users',
      label: 'Active Users',
      value: 0,
      change: 0,
      icon: 'person-outline',
      color: colors.semantic.success,
    },
    {
      id: 'new-users',
      label: 'New Users',
      value: 0,
      change: 0,
      icon: 'person-add-outline',
      color: colors.secondary[600],
    },
    {
      id: 'retention',
      label: 'Retention Rate',
      value: 0,
      change: 0,
      icon: 'repeat-outline',
      color: colors.semantic.warning,
    },
  ];

  // Mock user segments - replace with actual API call
  const userSegments: UserSegment[] = [];

  const formatValue = (value: number, id: string) => {
    if (id === 'retention') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? colors.semantic.success : colors.semantic.error;
    return { text: `${sign}${change.toFixed(1)}%`, color };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>User Analytics</Text>
            <Text style={styles.subtitle}>User insights and engagement metrics</Text>
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

          {/* User Metrics */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>User Metrics</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => {
                const change = formatChange(metric.change);
                return (
                  <Card key={metric.id} style={styles.metricCard}>
                    <View style={[styles.metricIconContainer, { backgroundColor: `${metric.color}15` }]}>
                      <Ionicons name={metric.icon} size={24} color={metric.color} />
                    </View>
                    <Text style={styles.metricValue}>
                      {formatValue(metric.value, metric.id)}
                    </Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    {change && (
                      <View style={styles.metricChange}>
                        <Ionicons
                          name={metric.change! > 0 ? 'arrow-up' : 'arrow-down'}
                          size={12}
                          color={change.color}
                        />
                        <Text style={[styles.metricChangeText, { color: change.color }]}>
                          {change.text}
                        </Text>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          </View>

          {/* User Segments */}
          {userSegments.length > 0 && (
            <Card style={styles.segmentsCard}>
              <Text style={styles.sectionTitle}>User Segments</Text>
              <View style={styles.segmentsList}>
                {userSegments.map((segment) => (
                  <View key={segment.segment} style={styles.segmentItem}>
                    <View style={styles.segmentInfo}>
                      <View style={[styles.segmentColor, { backgroundColor: segment.color }]} />
                      <Text style={styles.segmentLabel}>{segment.segment}</Text>
                    </View>
                    <View style={styles.segmentValues}>
                      <Text style={styles.segmentCount}>{segment.count.toLocaleString()}</Text>
                      <Text style={styles.segmentPercentage}>{segment.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Engagement Chart Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>User Engagement</Text>
              <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Engagement chart coming soon</Text>
            </View>
          </Card>

          {/* Demographics Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>User Demographics</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Demographics breakdown coming soon</Text>
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
  segmentsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  segmentsList: {
    gap: Spacing.md,
  },
  segmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  segmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  segmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  segmentLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  segmentValues: {
    alignItems: 'flex-end',
  },
  segmentCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  segmentPercentage: {
    fontSize: 12,
    color: Colors.text.secondary,
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
});

