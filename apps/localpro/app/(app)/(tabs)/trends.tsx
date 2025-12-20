import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
type TrendType = 'all' | 'revenue' | 'users' | 'engagement' | 'conversions';

interface TrendData {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function TrendsTabScreen() {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');
  const [activeTrend, setActiveTrend] = useState<TrendType>('all');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  const trendTypes: { key: TrendType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All Trends', icon: 'stats-chart-outline' },
    { key: 'revenue', label: 'Revenue', icon: 'cash-outline' },
    { key: 'users', label: 'Users', icon: 'people-outline' },
    { key: 'engagement', label: 'Engagement', icon: 'heart-outline' },
    { key: 'conversions', label: 'Conversions', icon: 'checkmark-circle-outline' },
  ];

  // Mock trend data - replace with actual API call
  const trends: TrendData[] = [
    {
      id: 'revenue',
      label: 'Revenue Trend',
      value: 0,
      change: 0,
      trend: 'up',
      icon: 'trending-up',
      color: colors.semantic.success,
    },
    {
      id: 'users',
      label: 'User Growth',
      value: 0,
      change: 0,
      trend: 'up',
      icon: 'people',
      color: colors.primary[600],
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: 0,
      change: 0,
      trend: 'stable',
      icon: 'heart',
      color: colors.secondary[600],
    },
    {
      id: 'conversions',
      label: 'Conversion Rate',
      value: 0,
      change: 0,
      trend: 'up',
      icon: 'checkmark-circle',
      color: colors.semantic.warning,
    },
  ];

  const filteredTrends = activeTrend === 'all' 
    ? trends 
    : trends.filter(t => t.id === activeTrend);

  const formatValue = (value: number, id: string) => {
    if (id === 'engagement' || id === 'conversions') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: TrendData['trend']): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: TrendData['trend']) => {
    switch (trend) {
      case 'up':
        return colors.semantic.success;
      case 'down':
        return colors.semantic.error;
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
            <Text style={styles.title}>Trends</Text>
            <Text style={styles.subtitle}>Time series analytics and patterns</Text>
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

          {/* Trend Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trendsContainer}
            contentContainerStyle={styles.trendsContent}
          >
            {trendTypes.map((type) => {
              const isActive = activeTrend === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.trendTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveTrend(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.trendTabText,
                      isActive && styles.trendTabTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Trend Cards */}
          <View style={styles.trendsList}>
            {filteredTrends.map((trend) => {
              const trendColor = getTrendColor(trend.trend);
              return (
                <Card key={trend.id} style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <View style={[styles.trendIconContainer, { backgroundColor: `${trend.color}15` }]}>
                      <Ionicons name={trend.icon} size={24} color={trend.color} />
                    </View>
                    <View style={styles.trendInfo}>
                      <Text style={styles.trendLabel}>{trend.label}</Text>
                      <Text style={[styles.trendValue, { color: trend.color }]}>
                        {formatValue(trend.value, trend.id)}
                      </Text>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
                      <Ionicons name={getTrendIcon(trend.trend)} size={16} color={trendColor} />
                      <Text style={[styles.trendChange, { color: trendColor }]}>
                        {formatChange(trend.change)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chartPlaceholder}>
                    <Ionicons name="analytics-outline" size={32} color={colors.text.tertiary} />
                    <Text style={styles.chartPlaceholderText}>Trend chart coming soon</Text>
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Combined Trends Chart */}
          <Card style={styles.combinedChartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Combined Trends</Text>
              <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="stats-chart-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Combined trends visualization coming soon</Text>
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
    marginBottom: Spacing.md,
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
  trendsContainer: {
    marginBottom: Spacing.lg,
  },
  trendsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  trendTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  trendTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  trendTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  trendsList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  trendCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  trendIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendInfo: {
    flex: 1,
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  trendChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  combinedChartCard: {
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
});

