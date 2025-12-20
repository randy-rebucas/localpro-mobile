import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function AnalyticsTabScreen() {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock financial metrics - replace with actual API call
  const metrics: FinancialMetric[] = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 0,
      change: 0,
      icon: 'trending-up-outline',
      color: colors.semantic.success,
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: 0,
      change: 0,
      icon: 'trending-down-outline',
      color: colors.semantic.error,
    },
    {
      id: 'profit',
      label: 'Net Profit',
      value: 0,
      change: 0,
      icon: 'cash-outline',
      color: colors.primary[600],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      value: 0,
      change: 0,
      icon: 'swap-horizontal-outline',
      color: colors.secondary[600],
    },
  ];

  // Mock category breakdown - replace with actual API call
  const categoryBreakdown: CategoryBreakdown[] = [];

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? colors.semantic.success : colors.semantic.error;
    return { text: `${sign}${change.toFixed(1)}%`, color };
  };

  const handleExportReport = async () => {
    try {
      // TODO: Generate and export analytics report
      await Share.share({
        message: 'Analytics Report',
        title: 'Analytics Report',
      });
    } catch {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const totalRevenue = metrics.find(m => m.id === 'revenue')?.value || 0;
  const totalExpenses = metrics.find(m => m.id === 'expenses')?.value || 0;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Analytics</Text>
              <Text style={styles.subtitle}>Financial insights and reports</Text>
            </View>
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleExportReport}
            >
              <Ionicons name="download-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
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

          {/* Financial Overview Cards */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Financial Overview</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => {
                const change = formatChange(metric.change);
                return (
                  <Card key={metric.id} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <View style={[styles.metricIconContainer, { backgroundColor: `${metric.color}15` }]}>
                        <Ionicons name={metric.icon} size={20} color={metric.color} />
                      </View>
                      {change && (
                        <View style={[styles.changeBadge, { backgroundColor: `${change.color}15` }]}>
                          <Ionicons 
                            name={metric.change! > 0 ? 'arrow-up' : 'arrow-down'} 
                            size={12} 
                            color={change.color} 
                          />
                          <Text style={[styles.changeText, { color: change.color }]}>
                            {change.text}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={[styles.metricValue, { color: metric.color }]}>
                      {metric.id === 'transactions' 
                        ? metric.value.toLocaleString() 
                        : formatCurrency(metric.value)}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Net Profit Summary */}
          <Card style={[styles.summaryCard, { backgroundColor: colors.primary[600] }] as any}>
            <View style={styles.summaryHeader}>
              <Ionicons name="analytics-outline" size={24} color={colors.text.inverse} />
              <Text style={styles.summaryTitle}>Net Profit</Text>
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(netProfit)}
            </Text>
            <Text style={styles.summarySubtext}>
              {netProfit >= 0 ? 'Positive' : 'Negative'} balance for this period
            </Text>
          </Card>

          {/* Revenue vs Expenses Chart Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Revenue vs Expenses</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Chart visualization</Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Revenue and expense trends will be displayed here
              </Text>
            </View>
          </Card>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 ? (
            <Card style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>Expense Categories</Text>
              <View style={styles.breakdownList}>
                {categoryBreakdown.map((item, index) => (
                  <View key={index} style={styles.breakdownItem}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.breakdownColorDot, { backgroundColor: item.color }]} />
                      <View style={styles.breakdownInfo}>
                        <Text style={styles.breakdownCategory}>{item.category}</Text>
                        <View style={styles.breakdownBarContainer}>
                          <View 
                            style={[
                              styles.breakdownBar, 
                              { 
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                    <View style={styles.breakdownRight}>
                      <Text style={styles.breakdownAmount}>{formatCurrency(item.amount)}</Text>
                      <Text style={styles.breakdownPercentage}>{item.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="pie-chart-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>No category data</Text>
                <Text style={styles.emptyStateSubtext}>
                  Category breakdown will appear here once you have transactions
                </Text>
              </View>
            </Card>
          )}

          {/* Transaction Trends Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Transaction Trends</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="trending-up-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Trend analysis</Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Transaction trends and patterns will be displayed here
              </Text>
            </View>
          </Card>

          {/* Quick Insights */}
          <Card style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb-outline" size={24} color={colors.semantic.warning} />
              <Text style={styles.sectionTitle}>Quick Insights</Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                <Text style={styles.insightText}>
                  {netProfit >= 0 
                    ? 'Your finances are in good shape' 
                    : 'Consider reducing expenses to improve profitability'}
                </Text>
              </View>
              {categoryBreakdown.length > 0 && (
                <View style={styles.insightItem}>
                  <Ionicons name="information-circle" size={16} color={colors.semantic.info} />
                  <Text style={styles.insightText}>
                    Top spending category: {categoryBreakdown[0]?.category || 'N/A'}
                  </Text>
                </View>
              )}
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
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
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  summarySubtext: {
    fontSize: 13,
    color: Colors.text.inverse,
    opacity: 0.8,
  },
  chartCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chartPlaceholderSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  breakdownCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  breakdownList: {
    gap: Spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  breakdownColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  breakdownBarContainer: {
    height: 4,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  breakdownRight: {
    alignItems: 'flex-end',
    marginLeft: Spacing.md,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyCard: {
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  insightsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  insightsList: {
    gap: Spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

