import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ApplicationAnalyticsProps {
  total: number;
  pending: number;
  reviewed: number;
  interview: number;
  accepted: number;
  rejected: number;
}

export function ApplicationAnalytics({
  total,
  pending,
  reviewed,
  interview,
  accepted,
  rejected,
}: ApplicationAnalyticsProps) {
  const colors = useThemeColors();

  const stats = [
    { label: 'Total', value: total, icon: 'document-text-outline', color: colors.text.primary },
    { label: 'Pending', value: pending, icon: 'time-outline', color: Colors.neutral.gray600 },
    { label: 'Reviewed', value: reviewed, icon: 'eye-outline', color: Colors.primary[600] },
    { label: 'Interview', value: interview, icon: 'calendar-outline', color: Colors.secondary[600] },
    { label: 'Accepted', value: accepted, icon: 'checkmark-circle-outline', color: Colors.semantic.success[600] },
    { label: 'Rejected', value: rejected, icon: 'close-circle-outline', color: Colors.semantic.error[600] },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={20} color={colors.primary[600]} />
        <Text style={styles.title}>Application Analytics</Text>
      </View>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
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
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
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
    minWidth: '30%',
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
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 24,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

