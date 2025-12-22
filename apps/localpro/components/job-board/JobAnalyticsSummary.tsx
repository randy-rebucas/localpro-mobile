import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { Card } from '@localpro/ui';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface JobAnalyticsSummaryProps {
  jobId: string;
  compact?: boolean;
}

export function JobAnalyticsSummary({ jobId, compact = false }: JobAnalyticsSummaryProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    views: number;
    applications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await JobBoardService.getJobStats(jobId);
        setStats(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load analytics');
        console.error('Error fetching job stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchStats();
    }
  }, [jobId]);

  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading analytics...</Text>
        </View>
      </Card>
    );
  }

  if (error || !stats) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactStat}>
          <Ionicons name="eye-outline" size={16} color={colors.text.tertiary} />
          <Text style={[styles.compactStatText, { color: colors.text.tertiary }]}>{stats.views}</Text>
        </View>
        <View style={styles.compactStat}>
          <Ionicons name="document-text-outline" size={16} color={colors.text.tertiary} />
          <Text style={[styles.compactStatText, { color: colors.text.tertiary }]}>{stats.applications}</Text>
        </View>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={20} color={colors.primary[600]} />
        <Text style={styles.title}>Analytics Summary</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="eye-outline" size={20} color={colors.primary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.views}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Views</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary[50] }]}>
            <Ionicons name="document-text-outline" size={20} color={colors.secondary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.applications}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Applications</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="star-outline" size={20} color={colors.primary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.shortlisted}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Shortlisted</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary[50] }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondary[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.interviewed}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Interviewed</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: Colors.semantic.success[50] }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.semantic.success[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.hired}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Hired</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: Colors.semantic.error[50] }]}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.semantic.error[600]} />
          </View>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.rejected}</Text>
          <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Rejected</Text>
        </View>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  compactContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactStatText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

