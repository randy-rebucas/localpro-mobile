import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import type { Job, JobApplication } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ApplicationStatusBadge,
} from '../../../components/job-board';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type ApplicationStatus = 'all' | 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

type ApplicationWithJob = JobApplication & {
  job?: Job;
};

export default function ApplicationsTabScreen() {
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus>('all');
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const router = useRouter();

  const filters: { key: ApplicationStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'reviewed', label: 'Reviewed', icon: 'eye-outline' },
    { key: 'interview', label: 'Interview', icon: 'calendar-outline' },
    { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
    { key: 'rejected', label: 'Rejected', icon: 'close-circle-outline' },
  ];

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, any> = {};
      if (activeFilter !== 'all') {
        filters.status = activeFilter;
      }
      
      // Get applications with job data already included from API
      const apps = await JobBoardService.getApplications(filters);
      
      // Ensure apps is an array
      if (!Array.isArray(apps)) {
        console.warn('getApplications returned non-array:', apps);
        setApplications([]);
        return;
      }
      
      // Applications already have job data from the API response
      setApplications(apps);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      Alert.alert('Error', err?.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = useCallback(async (applicationId: string, jobId: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await JobBoardService.withdrawApplication(jobId, applicationId);
              Alert.alert('Success', 'Application withdrawn successfully');
              await fetchApplications();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  }, [fetchApplications]);

  const handleViewDetails = useCallback((applicationId: string) => {
    router.push(`/(stack)/application/${applicationId}` as any);
  }, [router]);

  const handleBrowseJobs = useCallback(() => {
    router.push('/(app)/(tabs)/index' as any);
  }, [router]);

  const filteredApplications = activeFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === activeFilter);

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

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getJobTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'full-time':
        return 'briefcase-outline';
      case 'part-time':
        return 'time-outline';
      case 'contract':
        return 'document-text-outline';
      case 'freelance':
        return 'laptop-outline';
      default:
        return 'briefcase-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[600]} />}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}> 
            <Text style={styles.title}>My Applications</Text>
            <Text style={styles.subtitle}>Track your job applications</Text>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Applications List */}
          {loading && applications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading applications...</Text>
            </View>
          ) : filteredApplications.length > 0 ? (
            <View style={styles.applicationsList}>
              {filteredApplications.map((application) => (
                <Card key={application.id} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <View key={`header-left-${application.id}`} style={styles.applicationHeaderLeft}>
                      <ApplicationStatusBadge status={application.status} />
                    </View>
                    <View key={`header-date-${application.id}`}>
                      <Text style={[styles.applicationDate, { color: colors.text.tertiary }]}>
                        {formatDate(application.appliedAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.applicationContent}>
                    <View key={`job-title-${application.id}`}>
                      <Text style={styles.jobTitle}>
                        {application.job?.title || 'Job Title'}
                      </Text>
                    </View>
                    <View style={styles.jobInfo}>
                      <View key={`company-${application.id}`} style={styles.jobInfoItem}>
                        <Ionicons name="business-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.jobInfoText}>
                          {application.job?.company || 'Company Name'}
                        </Text>
                      </View>
                      <View key={`location-${application.id}`} style={styles.jobInfoItem}>
                        <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.jobInfoText}>
                          {application.job?.location || 'Location'}
                        </Text>
                      </View>
                      {application.job?.type ? (
                        <View key={`type-${application.id}`} style={styles.jobInfoItem}>
                          <Ionicons 
                            name={getJobTypeIcon(application.job.type)} 
                            size={16} 
                            color={colors.text.secondary} 
                          />
                          <Text style={styles.jobInfoText}>
                            {application.job.type.charAt(0).toUpperCase() + application.job.type.slice(1)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {application.job?.salary ? (
                      <View key={`salary-${application.id}`}>
                        <Text style={[styles.salary, { color: colors.secondary[600] }]}>
                          {formatSalaryRange(application.job.salary)}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.applicationActions}>
                    <TouchableOpacity
                      key={`view-details-${application.id}`}
                      style={[styles.actionButton, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}
                      onPress={() => handleViewDetails(application.id)}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>View Details</Text>
                    </TouchableOpacity>
                    {application.status === 'pending' ? (
                      <TouchableOpacity
                        key={`withdraw-${application.id}`}
                        style={[styles.actionButton, styles.withdrawButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.light }]}
                        onPress={() => handleWithdraw(application.id, application.jobId)}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text style={[styles.actionButtonText, styles.withdrawButtonText, { color: colors.semantic.error[600] }]}>
                          Withdraw
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeFilter === 'all' ? 'document-text-outline' : filters.find(f => f.key === activeFilter)?.icon || 'document-text-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeFilter === 'all' ? 'No Applications Yet' : `No ${filters.find(f => f.key === activeFilter)?.label} Applications`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'all' 
                    ? 'Your job applications will appear here when you apply for positions'
                    : `You don't have any ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} applications at the moment`}
                </Text>
                <TouchableOpacity
                  style={[styles.browseJobsButton, { backgroundColor: colors.primary[600] }]}
                  onPress={handleBrowseJobs}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="search-outline" size={20} color={colors.text.inverse} />
                  <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
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
  filtersContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  filtersContent: {
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  applicationsList: {
    gap: Spacing.md,
  },
  applicationCard: {
    marginBottom: Spacing.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  applicationHeaderLeft: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  applicationContent: {
    marginBottom: Spacing.md,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  jobInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  jobInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary[600],
    marginTop: Spacing.xs,
  },
  applicationActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  withdrawButton: {
    backgroundColor: Colors.neutral.gray100,
    borderColor: Colors.border.light,
  },
  withdrawButtonText: {
    color: Colors.semantic.error,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  browseJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  browseJobsButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  loadingContainer: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});