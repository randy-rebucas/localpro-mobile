import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import type { Job } from '@localpro/types';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SimilarJobsListProps {
  jobs: Job[];
  onJobPress: (jobId: string) => void;
  currentJobId?: string;
}

const toTitleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

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

export function SimilarJobsList({ jobs, onJobPress, currentJobId }: SimilarJobsListProps) {
  const colors = useThemeColors();

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const filteredJobs = jobs.filter((job) => job.id !== currentJobId).slice(0, 5);

  if (filteredJobs.length === 0) {
    return null;
  }

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: colors.background.primary }]}
      onPress={() => onJobPress(item.id)}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      <View style={styles.jobCardHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        )}
      </View>
      <Text style={[styles.companyName, { color: colors.text.secondary }]} numberOfLines={1}>
        {item.company}
      </Text>
      <View style={styles.jobMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
          <Text style={[styles.metaText, { color: colors.text.tertiary }]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        {item.remote && (
          <View style={[styles.remoteBadge, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="wifi-outline" size={12} color={colors.primary[600]} />
            <Text style={[styles.remoteText, { color: colors.primary[600] }]}>Remote</Text>
          </View>
        )}
      </View>
      <View style={styles.jobFooter}>
        <Text style={[styles.salaryText, { color: colors.primary[600] }]} numberOfLines={1}>
          {formatSalaryRange(item.salary)}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{toTitleCase(item.type)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Similar Jobs</Text>
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  listContent: {
    gap: Spacing.sm,
  },
  jobCard: {
    width: 280,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    ...Shadows.sm,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  jobTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  featuredBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  companyName: {
    fontSize: 14,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  remoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  typeBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  typeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

