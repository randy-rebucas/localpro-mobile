import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CompanyStatsProps {
  totalJobs: number;
  activeJobs: number;
  totalApplications?: number;
  totalViews?: number;
}

export function CompanyStats({
  totalJobs,
  activeJobs,
  totalApplications,
  totalViews,
}: CompanyStatsProps) {
  const colors = useThemeColors();

  const stats = [
    {
      label: 'Total Jobs',
      value: totalJobs,
      icon: 'briefcase-outline',
      color: colors.primary[600],
    },
    {
      label: 'Active Jobs',
      value: activeJobs,
      icon: 'checkmark-circle-outline',
      color: colors.secondary[600],
    },
    ...(totalApplications !== undefined
      ? [
          {
            label: 'Applications',
            value: totalApplications,
            icon: 'document-text-outline',
            color: colors.primary[600],
          },
        ]
      : []),
    ...(totalViews !== undefined
      ? [
          {
            label: 'Total Views',
            value: totalViews,
            icon: 'eye-outline',
            color: colors.text.secondary,
          },
        ]
      : []),
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart-outline" size={20} color={colors.primary[600]} />
        <Text style={styles.title}>Company Statistics</Text>
      </View>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

