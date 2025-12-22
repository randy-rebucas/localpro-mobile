import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import type { Job } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WavyBackground } from '../../../components/WavyBackground';
import {
  JobStatsCard,
  QuickActionButtons
} from '../../../components/job-board';
import { EmptyState, LoadingSkeleton } from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

const toTitleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

// Reserved for future use
// const formatSalaryRange = (salary?: Job['salary']) => {
//   if (!salary || salary.min == null || salary.max == null || !salary.currency) {
//     return 'Salary not disclosed';
//   }
//   const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
//   const min = formatter.format(Math.min(salary.min, salary.max));
//   const max = formatter.format(Math.max(salary.min, salary.max));
//   const period = salary.period ? ` / ${salary.period}` : '';
//   return `${salary.currency}${min} - ${salary.currency}${max}${period}`;
// };

const getRelativeTime = (isoDate?: string | number | Date) => {
  if (!isoDate) {
    return 'Date unknown';
  }

  const timestamp = typeof isoDate === 'number' ? isoDate : new Date(isoDate).getTime();
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'Just posted';
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: Colors.secondary[50], text: Colors.secondary[600] },
  closed: { bg: Colors.neutral.gray100, text: Colors.neutral.gray600 },
  filled: { bg: Colors.primary[50], text: Colors.primary[600] },
  draft: { bg: Colors.neutral.gray100, text: Colors.neutral.gray500 },
  paused: { bg: Colors.semantic.warning[50], text: Colors.semantic.warning[600] },
};

export default function MyJobsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { activeRole } = useRoleContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusFilters = ['all', 'draft', 'open', 'paused', 'closed', 'filled'];

  useEffect(() => {
    if (activeRole !== 'provider' && activeRole !== 'admin') {
      setError('Access denied. Provider or admin role required.');
      setLoading(false);
      return;
    }

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, activeRole]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: Record<string, any> = {};
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      const data = await JobBoardService.getMyJobs(filters);
      setJobs(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your jobs');
      console.error('Error fetching my jobs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
  }, [fetchJobs]);

  const handleJobPress = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  }, [router]);

  const handleViewApplications = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}/applications` as any);
  }, [router]);

  const handleCreateJob = useCallback(() => {
    router.push('/(app)/(tabs)/post-job' as any);
  }, [router]);

  const handleEdit = useCallback(
    async (jobId: string) => {
      router.push(`/(app)/(tabs)/post-job?jobId=${jobId}` as any);
    },
    [router]
  );

  const handlePause = useCallback(
    async (jobId: string) => {
      try {
        const job = jobs.find((j) => j.id === jobId);
        const newStatus = job?.status === 'open' ? 'closed' : 'open';
        await JobBoardService.updateJob(jobId, { status: newStatus as any });
        Alert.alert('Success', `Job ${newStatus === 'open' ? 'resumed' : 'paused'} successfully`);
        await fetchJobs();
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update job status');
      }
    },
    [jobs, fetchJobs]
  );

  const handleClose = useCallback(
    async (jobId: string) => {
      try {
        await JobBoardService.updateJob(jobId, { status: 'closed' as any });
        Alert.alert('Success', 'Job closed successfully');
        await fetchJobs();
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to close job');
      }
    },
    [fetchJobs]
  );

  const handleDelete = useCallback(
    async (jobId: string) => {
      try {
        await JobBoardService.deleteJob(jobId);
        Alert.alert('Success', 'Job deleted successfully');
        await fetchJobs();
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to delete job');
      }
    },
    [fetchJobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs;
  }, [jobs]);

  const stats = useMemo(() => {
    const totalApplications = jobs.reduce((sum, job) => {
      return sum + ((job as any).applicationsCount || 0);
    }, 0);
    const totalViews = jobs.reduce((sum, job) => {
      return sum + ((job as any).views || 0);
    }, 0);

    return {
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'open').length,
      applications: totalApplications,
      views: totalViews,
    };
  }, [jobs]);

  const renderJobCard = useCallback(
    ({ item }: { item: Job }) => {
      const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.open;
      const postedAgo = getRelativeTime(item.postedAt);

      return (
        <View style={styles.jobCard}>
          <View style={styles.jobCardHeader}>
            <View style={styles.jobCardHeaderLeft}>
              <Text style={styles.jobCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.jobCompany, { color: colors.text.secondary }]} numberOfLines={1}>
                {item.company}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                {toTitleCase(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.jobCardMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
              <Text style={[styles.metaText, { color: colors.text.tertiary }]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="briefcase-outline" size={14} color={colors.text.tertiary} />
              <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                {toTitleCase(item.type)}
              </Text>
            </View>
          </View>

          <View style={styles.jobCardStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.statText, { color: colors.text.tertiary }]}>
                {(item as any).views || 0} views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.statText, { color: colors.text.tertiary }]}>
                {(item as any).applicationsCount || 0} applications
              </Text>
            </View>
            <Text style={[styles.postedText, { color: colors.text.tertiary }]}>{postedAgo}</Text>
          </View>

          <QuickActionButtons
            job={item}
            onEdit={handleEdit}
            onPause={handlePause}
            onClose={handleClose}
            onDelete={handleDelete}
            onView={handleJobPress}
            onViewApplications={handleViewApplications}
          />
        </View>
      );
    },
    [colors, handleJobPress, handleViewApplications, handleEdit, handlePause, handleClose, handleDelete]
  );

  if (activeRole !== 'provider' && activeRole !== 'admin') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="lock-closed-outline"
          title="Access Denied"
          subtitle="You need to be a provider or admin to view your jobs"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={Platform.select({ ios: ['bottom'], android: ['bottom', 'top'] })}>
      <WavyBackground />
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobCard}
        ListHeaderComponent={
          <View>
            {/* Header Actions */}
            <View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
                onPress={() => router.back()}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>My Jobs</Text>
                <Text style={styles.subtitle}>Manage your job postings</Text>
              </View>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary[600] }]}
                onPress={handleCreateJob}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="add" size={20} color={Colors.text.inverse} />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            {jobs.length > 0 && (
              <>
                <JobStatsCard
                  total={stats.total}
                  active={stats.active}
                  applications={stats.applications}
                  views={stats.views}
                />

                <View style={styles.filtersContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                  >
                    {statusFilters.map((status) => {
                      const isSelected = selectedStatus === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.filterChip,
                            {
                              backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                              borderColor: isSelected ? colors.primary[600] : colors.border.light,
                            },
                          ]}
                          onPress={() => setSelectedStatus(status)}
                          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                            ]}
                          >
                            {toTitleCase(status)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSkeleton viewMode="list" count={3} />
          ) : error ? (
            <EmptyState icon="alert-circle-outline" title="Error" subtitle={error} />
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="No jobs yet"
              subtitle="Create your first job posting to get started"
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.select({
      ios: Spacing.lg,
      android: Spacing.xl
    }),
    backgroundColor: 'transparent',
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  headerButton: {
    width: Platform.select({
      ios: 48,
      android: 48
    }),
    height: Platform.select({
      ios: 48,
      android: 48
    }),
    borderRadius: Platform.select({
      ios: 24,
      android: 24
    }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    ...Platform.select({
      android: {
        elevation: Shadows.lg.elevation,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  jobCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    ...Shadows.sm,
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
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
  jobCompany: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: 'transparent',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCardMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
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
  jobCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderTopColor: Colors.border.light,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  postedText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});
