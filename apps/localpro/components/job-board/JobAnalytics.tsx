import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface JobAnalyticsData {
  views: number;
  applications: number;
  shortlisted: number;
  interviewed: number;
  hired: number;
  rejected: number;
}

interface JobAnalyticsProps {
  analytics: JobAnalyticsData;
  loading?: boolean;
}

export function JobAnalytics({ analytics, loading }: JobAnalyticsProps) {
  const colors = useThemeColors();

  if (loading) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading analytics...</Text>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Views',
      value: analytics.views,
      icon: 'eye-outline' as const,
      color: colors.text.secondary,
    },
    {
      label: 'Applications',
      value: analytics.applications,
      icon: 'document-text-outline' as const,
      color: colors.primary[600],
    },
    {
      label: 'Shortlisted',
      value: analytics.shortlisted,
      icon: 'star-outline' as const,
      color: Colors.secondary[600],
    },
    {
      label: 'Interviewed',
      value: analytics.interviewed,
      icon: 'people-outline' as const,
      color: Colors.primary[600],
    },
    {
      label: 'Hired',
      value: analytics.hired,
      icon: 'checkmark-circle-outline' as const,
      color: Colors.secondary[600],
    },
    {
      label: 'Rejected',
      value: analytics.rejected,
      icon: 'close-circle-outline' as const,
      color: colors.semantic.error[600],
    },
  ];

  const conversionRate =
    analytics.views > 0 ? ((analytics.applications / analytics.views) * 100).toFixed(1) : '0.0';
  const hireRate =
    analytics.applications > 0 ? ((analytics.hired / analytics.applications) * 100).toFixed(1) : '0.0';

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Job Analytics</Text>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
            <Ionicons name={stat.icon} size={24} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.metricsRow, { borderTopColor: colors.border.light }]}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.text.tertiary }]}>Conversion Rate</Text>
          <Text style={[styles.metricValue, { color: colors.primary[600] }]}>{conversionRate}%</Text>
          <Text style={[styles.metricSubtext, { color: colors.text.tertiary }]}>
            Applications / Views
          </Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border.light }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.text.tertiary }]}>Hire Rate</Text>
          <Text style={[styles.metricValue, { color: Colors.secondary[600] }]}>{hireRate}%</Text>
          <Text style={[styles.metricSubtext, { color: colors.text.tertiary }]}>
            Hired / Applications
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    padding: Spacing.lg,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    width: '30%',
    flex: 1,
    minWidth: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  metricSubtext: {
    fontSize: 11,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  metricDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
});

