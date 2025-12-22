import { Ionicons } from '@expo/vector-icons';
import type { Job } from '@localpro/types';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Card } from '@localpro/ui';
import { useThemeColors } from '../../hooks/use-theme';

interface CompanyJobsListProps {
  jobs: Job[];
  onJobPress: (jobId: string) => void;
  loading?: boolean;
}

const toTitleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatSalaryRange = (salary?: Job['salary']) => {
  if (!salary || salary.min == null || salary.max == null || !salary.currency) {
    return 'Salary not disclosed';
  }
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const min = formatter.format(Math.min(salary.min, salary.max));
  const max = formatter.format(Math.max(salary.min, salary.max));
  const period = salary.period ? ` / ${salary.period}` : '';
  return `${salary.currency}${min} - ${salary.currency}${max}${period}`;
};

const getRelativeTime = (isoDate?: string | number | Date) => {
  if (!isoDate) return 'Date unknown';
  const timestamp = typeof isoDate === 'number' ? isoDate : new Date(isoDate).getTime();
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return 'Just posted';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function CompanyJobsList({ jobs, onJobPress, loading = false }: CompanyJobsListProps) {
  const colors = useThemeColors();

  const renderJobCard = ({ item }: { item: Job }) => {
    const salaryLabel = formatSalaryRange(item.salary);
    const postedAgo = getRelativeTime(item.postedAt);

    return (
      <Card style={styles.jobCard}>
        <TouchableOpacity
          onPress={() => onJobPress(item.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <View style={styles.jobCardHeader}>
            <View style={styles.jobCardHeaderLeft}>
              <Text style={styles.jobCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.jobCardMeta}>
                <View style={styles.metaRow}>
                  <Ionicons name="briefcase-outline" size={14} color={colors.text.tertiary} />
                  <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                    {toTitleCase(item.type)}
                  </Text>
                </View>
                {item.experienceLevel && (
                  <View style={styles.metaRow}>
                    <Ionicons name="star-outline" size={14} color={colors.text.tertiary} />
                    <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                      {toTitleCase(item.experienceLevel)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {item.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
          </View>

          <View style={styles.jobCardLocation}>
            <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
            <Text style={[styles.locationText, { color: colors.text.tertiary }]} numberOfLines={1}>
              {item.location}
            </Text>
            {item.remote && (
              <View style={[styles.remoteBadge, { backgroundColor: colors.primary[50] }]}>
                <Text style={[styles.remoteText, { color: colors.primary[600] }]}>Remote</Text>
              </View>
            )}
          </View>

          <View style={styles.jobCardFooter}>
            <Text style={[styles.salaryText, { color: colors.primary[600] }]}>{salaryLabel}</Text>
            <Text style={[styles.postedText, { color: colors.text.tertiary }]}>{postedAgo}</Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading jobs...</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No jobs available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Positions ({jobs.length})</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobCard}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  jobCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.sm,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  jobCardHeaderLeft: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCardMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  featuredBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  remoteBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  remoteText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  postedText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    padding: Spacing.lg,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: Spacing.lg,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

