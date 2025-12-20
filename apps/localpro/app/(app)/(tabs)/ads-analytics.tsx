import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

interface AdMetric {
  id: string;
  label: string;
  value: number;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface TopAd {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface CategoryPerformance {
  category: string;
  ads: number;
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  color: string;
}

export default function AdsAnalyticsTabScreen() {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('month');

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock ad metrics - replace with actual API call
  const metrics: AdMetric[] = [
    {
      id: 'impressions',
      label: 'Impressions',
      value: 0,
      change: 0,
      icon: 'eye-outline',
      color: colors.primary[600],
    },
    {
      id: 'clicks',
      label: 'Clicks',
      value: 0,
      change: 0,
      icon: 'hand-left-outline',
      color: colors.secondary[600],
    },
    {
      id: 'ctr',
      label: 'CTR',
      value: 0,
      change: 0,
      icon: 'trending-up-outline',
      color: colors.semantic.success,
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: 0,
      change: 0,
      icon: 'checkmark-circle-outline',
      color: colors.semantic.warning,
    },
    {
      id: 'spend',
      label: 'Total Spend',
      value: 0,
      change: 0,
      icon: 'cash-outline',
      color: colors.semantic.error,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: 0,
      change: 0,
      icon: 'wallet-outline',
      color: colors.semantic.success,
    },
  ];

  // Mock top ads - replace with actual API call
  const topAds: TopAd[] = [];

  // Mock category performance - replace with actual API call
  const categoryPerformance: CategoryPerformance[] = [];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? colors.semantic.success : colors.semantic.error;
    return { text: `${sign}${change.toFixed(1)}%`, color };
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  };

  const calculateROI = (revenue: number, spend: number) => {
    if (spend === 0) return 0;
    return ((revenue - spend) / spend) * 100;
  };

  const calculateConversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return 0;
    return (conversions / clicks) * 100;
  };

  const totalImpressions = metrics.find(m => m.id === 'impressions')?.value || 0;
  const totalClicks = metrics.find(m => m.id === 'clicks')?.value || 0;
  const totalSpend = metrics.find(m => m.id === 'spend')?.value || 0;
  const totalRevenue = metrics.find(m => m.id === 'revenue')?.value || 0;
  const overallCTR = calculateCTR(totalClicks, totalImpressions);
  const overallROI = calculateROI(totalRevenue, totalSpend);

  const handleExportReport = async () => {
    try {
      // TODO: Generate and export ads analytics report
      await Share.share({
        message: 'Ads Analytics Report',
        title: 'Ads Analytics Report',
      });
    } catch {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Ads Analytics</Text>
              <Text style={styles.subtitle}>Track ad performance and insights</Text>
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

          {/* Overview Metrics */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => {
                const change = formatChange(metric.change);
                let displayValue: string;
                if (metric.id === 'ctr') {
                  displayValue = formatPercentage(metric.value);
                } else if (metric.id === 'spend' || metric.id === 'revenue') {
                  displayValue = formatCurrency(metric.value);
                } else {
                  displayValue = formatNumber(metric.value);
                }
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
                      {displayValue}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Key Performance Indicators */}
          <Card style={[styles.kpiCard, { backgroundColor: colors.primary[600] }] as any}>
            <View style={styles.kpiHeader}>
              <Ionicons name="stats-chart-outline" size={24} color={colors.text.inverse} />
              <Text style={styles.kpiTitle}>Key Performance Indicators</Text>
            </View>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Overall CTR</Text>
                <Text style={styles.kpiValue}>{formatPercentage(overallCTR)}</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>ROI</Text>
                <Text style={[styles.kpiValue, { color: overallROI >= 0 ? colors.semantic.success : colors.semantic.error }]}>
                  {formatPercentage(overallROI)}
                </Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Total Ads</Text>
                <Text style={styles.kpiValue}>{topAds.length}</Text>
              </View>
            </View>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Performance Trends</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Performance chart</Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Impressions, clicks, and conversions trends will be displayed here
              </Text>
            </View>
          </Card>

          {/* Top Performing Ads */}
          {topAds.length > 0 ? (
            <Card style={styles.topAdsCard}>
              <Text style={styles.sectionTitle}>Top Performing Ads</Text>
              <View style={styles.topAdsList}>
                {topAds.map((ad, index) => {
                  const ctr = calculateCTR(ad.clicks, ad.impressions);
                  const conversionRate = calculateConversionRate(ad.conversions, ad.clicks);
                  const roi = calculateROI(ad.revenue, ad.spend);
                  return (
                    <View key={ad.id} style={styles.topAdItem}>
                      <View style={styles.topAdHeader}>
                        <View style={styles.topAdRank}>
                          <Text style={styles.topAdRankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.topAdInfo}>
                          <Text style={styles.topAdTitle} numberOfLines={1}>
                            {ad.title}
                          </Text>
                          <View style={styles.topAdStats}>
                            <View style={styles.topAdStatItem}>
                              <Ionicons name="eye-outline" size={12} color={colors.text.secondary} />
                              <Text style={styles.topAdStatText}>{formatNumber(ad.impressions)}</Text>
                            </View>
                            <View style={styles.topAdStatItem}>
                              <Ionicons name="hand-left-outline" size={12} color={colors.text.secondary} />
                              <Text style={styles.topAdStatText}>{formatNumber(ad.clicks)}</Text>
                            </View>
                            <View style={styles.topAdStatItem}>
                              <Ionicons name="trending-up-outline" size={12} color={colors.semantic.success} />
                              <Text style={[styles.topAdStatText, { color: colors.semantic.success }]}>
                                {formatPercentage(ctr)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.topAdMetrics}>
                        <View style={styles.topAdMetricItem}>
                          <Text style={styles.topAdMetricLabel}>Conversions</Text>
                          <Text style={styles.topAdMetricValue}>{formatNumber(ad.conversions)}</Text>
                          <Text style={styles.topAdMetricSubtext}>
                            {formatPercentage(conversionRate)} rate
                          </Text>
                        </View>
                        <View style={styles.topAdMetricItem}>
                          <Text style={styles.topAdMetricLabel}>Revenue</Text>
                          <Text style={[styles.topAdMetricValue, { color: colors.semantic.success }]}>
                            {formatCurrency(ad.revenue)}
                          </Text>
                          <Text style={styles.topAdMetricSubtext}>
                            ROI: {formatPercentage(roi)}
                          </Text>
                        </View>
                        <View style={styles.topAdMetricItem}>
                          <Text style={styles.topAdMetricLabel}>Spend</Text>
                          <Text style={[styles.topAdMetricValue, { color: colors.semantic.error }]}>
                            {formatCurrency(ad.spend)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>No ad data</Text>
                <Text style={styles.emptyStateSubtext}>
                  Top performing ads will appear here once you have active campaigns
                </Text>
              </View>
            </Card>
          )}

          {/* Category Performance */}
          {categoryPerformance.length > 0 ? (
            <Card style={styles.categoryCard}>
              <Text style={styles.sectionTitle}>Performance by Category</Text>
              <View style={styles.categoryList}>
                {categoryPerformance.map((category, index) => {
                  const ctr = calculateCTR(category.clicks, category.impressions);
                  const roi = calculateROI(category.revenue, category.spend);
                  return (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryHeader}>
                        <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <Text style={styles.categoryAdsCount}>{category.ads} ads</Text>
                        </View>
                      </View>
                      <View style={styles.categoryStats}>
                        <View style={styles.categoryStatItem}>
                          <Text style={styles.categoryStatLabel}>Impressions</Text>
                          <Text style={styles.categoryStatValue}>{formatNumber(category.impressions)}</Text>
                        </View>
                        <View style={styles.categoryStatItem}>
                          <Text style={styles.categoryStatLabel}>Clicks</Text>
                          <Text style={styles.categoryStatValue}>{formatNumber(category.clicks)}</Text>
                        </View>
                        <View style={styles.categoryStatItem}>
                          <Text style={styles.categoryStatLabel}>CTR</Text>
                          <Text style={[styles.categoryStatValue, { color: colors.semantic.success }]}>
                            {formatPercentage(ctr)}
                          </Text>
                        </View>
                        <View style={styles.categoryStatItem}>
                          <Text style={styles.categoryStatLabel}>ROI</Text>
                          <Text style={[styles.categoryStatValue, { color: roi >= 0 ? colors.semantic.success : colors.semantic.error }]}>
                            {formatPercentage(roi)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}
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
  kpiCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.inverse,
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
  topAdsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  topAdsList: {
    gap: Spacing.md,
  },
  topAdItem: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  topAdHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  topAdRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topAdRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  topAdInfo: {
    flex: 1,
  },
  topAdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  topAdStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  topAdStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  topAdStatText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  topAdMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  topAdMetricItem: {
    alignItems: 'center',
  },
  topAdMetricLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  topAdMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  topAdMetricSubtext: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  categoryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryItem: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  categoryAdsCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryStatItem: {
    alignItems: 'center',
  },
  categoryStatLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  categoryStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
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
});

