import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface JobStatsCardProps {
  total: number;
  active: number;
  applications: number;
  views?: number;
}

export function JobStatsCard({ total, active, applications, views }: JobStatsCardProps) {
  const colors = useThemeColors();

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="briefcase-outline" size={24} color={colors.primary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Total Jobs</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary[50] }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.secondary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{active}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Active</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{applications}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Applications</Text>
        </View>

        {views !== undefined && (
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="eye-outline" size={24} color={colors.primary[600]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{views}</Text>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Total Views</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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

