import { Ionicons } from '@expo/vector-icons';
import {
  ApplicantCard,
  ApplicationAnalytics,
  FeedbackForm,
  InterviewScheduler,
  StatusUpdateModal,
} from '../../../../components/job-board';
import { JobBoardService } from '@localpro/job-board';
import type { Job, JobApplication } from '@localpro/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingSkeleton } from '../../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../../constants/theme';
import { useRoleContext } from '../../../../contexts/RoleContext';
import { useThemeColors } from '../../../../hooks/use-theme';

type ApplicationWithApplicant = JobApplication & {
  applicant?: {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    avatar?: string;
  };
};

export default function JobApplicationsScreen() {
  const params = useLocalSearchParams<{ jobId: string }>();
  const rawJobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const jobId = rawJobId && typeof rawJobId === 'string' && rawJobId.trim() !== '' ? rawJobId.trim() : '';

  const router = useRouter();
  const colors = useThemeColors();
  const { activeRole } = useRoleContext();
  const [applications, setApplications] = useState<ApplicationWithApplicant[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithApplicant | null>(null);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  // const [updatingStatus, setUpdatingStatus] = useState<string | null>(null); // Reserved for future use

  const statusFilters = ['all', 'pending', 'reviewed', 'interview', 'accepted', 'rejected'];

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setLoading(false);
      return;
    }

    if (activeRole !== 'provider' && activeRole !== 'admin') {
      setError('Access denied. Provider or admin role required.');
      setLoading(false);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, selectedStatus, activeRole]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch job details
      const jobData = await JobBoardService.getJob(jobId);
      setJob(jobData);

      // Fetch applications
      const filters: Record<string, any> = {};
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      const apps = await JobBoardService.getJobApplications(jobId, filters);
      setApplications(apps as ApplicationWithApplicant[]);
    } catch (err: any) {
      setError(err?.message || 'Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId, selectedStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
  }, [fetchData]);

  const handleApplicationPress = useCallback((applicationId: string) => {
    router.push(`/(stack)/application/${applicationId}` as any);
  }, [router]);

  const handleResumePress = useCallback(async (resumeUrl?: string) => {
    if (!resumeUrl) {
      Alert.alert('No Resume', 'This applicant has not uploaded a resume');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(resumeUrl);
      if (canOpen) {
        await Linking.openURL(resumeUrl);
      } else {
        Alert.alert('Error', 'Cannot open resume URL');
      }
    } catch {
      Alert.alert('Error', 'Failed to open resume');
    }
  }, []);

  const handleUpdateStatus = useCallback(
    async (status: JobApplication['status'], notes?: string, rating?: number) => {
      if (!selectedApplication) return;

      try {
        setUpdatingStatus(selectedApplication.id);
        await JobBoardService.updateApplicationStatus(jobId, selectedApplication.id, status, notes, rating);
        await fetchData();
        Alert.alert('Success', 'Application status updated');
        setShowStatusModal(false);
        setSelectedApplication(null);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update status');
      } finally {
        setUpdatingStatus(null);
      }
    },
    [jobId, selectedApplication, fetchData]
  );

  const handleScheduleInterview = useCallback((application: ApplicationWithApplicant) => {
    setSelectedApplication(application);
    setShowInterviewScheduler(true);
  }, []);

  const handleInterviewScheduled = useCallback(
    async (data: {
      date: Date;
      time: Date;
      location?: string;
      type: 'in-person' | 'video' | 'phone';
      notes?: string;
    }) => {
      if (!selectedApplication) return;

      try {
        await JobBoardService.updateApplicationStatus(
          jobId,
          selectedApplication.id,
          'interview',
          data.notes
        );
        setShowInterviewScheduler(false);
        setSelectedApplication(null);
        await fetchData();
        Alert.alert('Success', 'Interview scheduled successfully');
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to schedule interview');
      }
    },
    [jobId, selectedApplication, fetchData]
  );

  const handleFeedback = useCallback((application: ApplicationWithApplicant) => {
    setSelectedApplication(application);
    setShowFeedbackForm(true);
  }, []);

  const handleSubmitFeedback = useCallback(
    async (feedback: string, rating?: number) => {
      if (!selectedApplication) return;

      try {
        await JobBoardService.updateApplicationStatus(
          jobId,
          selectedApplication.id,
          selectedApplication.status,
          undefined, // notes
          rating,
          feedback // feedback
        );
        await fetchData();
        Alert.alert('Success', 'Feedback submitted successfully');
        setShowFeedbackForm(false);
        setSelectedApplication(null);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to submit feedback');
      }
    },
    [jobId, selectedApplication, fetchData]
  );

  const handleStatusUpdate = useCallback((application: ApplicationWithApplicant) => {
    setSelectedApplication(application);
    setShowStatusModal(true);
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      reviewed: applications.filter((a) => a.status === 'reviewed').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (selectedStatus === 'all') return applications;
    return applications.filter((app) => app.status === selectedStatus);
  }, [applications, selectedStatus]);

  const renderApplicationCard = useCallback(
    ({ item }: { item: ApplicationWithApplicant }) => {
      return (
        <ApplicantCard
          application={item}
          onPress={() => handleApplicationPress(item.id)}
          onResumePress={handleResumePress}
          onStatusUpdate={() => handleStatusUpdate(item)}
          onScheduleInterview={() => handleScheduleInterview(item)}
          onFeedback={() => handleFeedback(item)}
          showCoverLetter={true}
        />
      );
    },
    [handleApplicationPress, handleResumePress, handleStatusUpdate, handleScheduleInterview, handleFeedback]
  );

  const handleShare = useCallback(async () => {
    if (!job) return;

    try {
      await Share.share({
        message: `Check out applications for: ${job.title}`,
        title: `Applications for ${job.title}`,
      });
    } catch (err) {
      console.error('Error sharing applications:', err);
    }
  }, [job]);

  if (activeRole !== 'provider' && activeRole !== 'admin') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState
          icon="lock-closed-outline"
          title="Access Denied"
          subtitle="You need to be a provider or admin to view applications"
        />
      </SafeAreaView>
    );
  }

  if (loading && !job) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState icon="alert-circle-outline" title={error || 'Job not found'} subtitle="Please try again later" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplicationCard}
        ListHeaderComponent={
          <View>
            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.back()}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleShare}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="share-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.header, { paddingTop: Platform.select({ ios: 60, android: 70 }) }]}>
              <View>
                <Text style={styles.title}>Applications</Text>
                <Text style={styles.subtitle}>{job.title}</Text>
              </View>
            </View>

            {applications.length > 0 && (
              <>
                <ApplicationAnalytics
                  total={stats.total}
                  pending={stats.pending}
                  reviewed={stats.reviewed}
                  interview={stats.interview}
                  accepted={stats.accepted}
                  rejected={stats.rejected}
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtersContainer}
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
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
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
              icon="document-text-outline"
              title="No applications yet"
              subtitle="Applications will appear here when candidates apply"
            />
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        visible={showStatusModal}
        application={selectedApplication}
        currentStatus={selectedApplication?.status || 'pending'}
        onUpdate={handleUpdateStatus}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedApplication(null);
        }}
      />

      {/* Interview Scheduler Modal */}
      <Modal
        visible={showInterviewScheduler}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowInterviewScheduler(false);
          setSelectedApplication(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          {selectedApplication && (
            <InterviewScheduler
              applicationId={selectedApplication.id}
              applicantName={selectedApplication.applicant?.name || 'Applicant'}
              onSchedule={handleInterviewScheduled}
              onCancel={() => {
                setShowInterviewScheduler(false);
                setSelectedApplication(null);
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Feedback Form Modal */}
      <FeedbackForm
        visible={showFeedbackForm}
        application={selectedApplication}
        onSubmit={handleSubmitFeedback}
        onClose={() => {
          setShowFeedbackForm(false);
          setSelectedApplication(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    marginBottom: 4,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  filtersContainer: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filtersContent: {
    paddingRight: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginRight: Spacing.sm,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
});
