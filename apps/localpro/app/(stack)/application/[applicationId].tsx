import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import type { Job, JobApplication } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import {
  ApplicationStatusBadge,
  ApplicationTimeline,
  FeedbackDisplay,
  InterviewDetails,
  ResumeViewer,
} from '../../../components/job-board';
import { EmptyState } from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

type ApplicationWithDetails = JobApplication & {
  job?: Job;
  applicant?: {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    avatar?: string;
  };
  interview?: {
    date?: Date | string;
    time?: Date | string;
    location?: string;
    type?: 'in-person' | 'video' | 'phone';
    notes?: string;
    meetingLink?: string;
  };
  feedback?: string;
  rating?: number;
  notes?: string;
};

function ApplicationDetailScreenContent() {
  const params = useLocalSearchParams<{ applicationId: string }>();
  const rawApplicationId = Array.isArray(params.applicationId)
    ? params.applicationId[0]
    : params.applicationId;
  const applicationId =
    rawApplicationId && typeof rawApplicationId === 'string' && rawApplicationId.trim() !== ''
      ? rawApplicationId.trim()
      : '';

  const router = useRouter();
  const colors = useThemeColors();
  const { activeRole } = useRoleContext();
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      setError('Application ID is required');
      setLoading(false);
      return;
    }

    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from my applications
      const applications = await JobBoardService.getApplications();
      const foundApp = applications.find((app) => app.id === applicationId) as
        | ApplicationWithDetails
        | undefined;

      if (foundApp) {
        // Fetch job details if we have jobId
        if (foundApp.jobId) {
          try {
            const job = await JobBoardService.getJob(foundApp.jobId);
            setApplication({ ...foundApp, job: job || undefined });
          } catch {
            setApplication(foundApp);
          }
        } else {
          setApplication(foundApp);
        }
      } else {
        setError('Application not found');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load application details');
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const handleWithdraw = useCallback(async () => {
    if (!application || !application.jobId) {
      return;
    }

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
              setWithdrawing(true);
              await JobBoardService.updateApplicationStatus(
                application.jobId,
                application.id,
                'rejected'
              );
              Alert.alert('Success', 'Application withdrawn successfully');
              await fetchApplication();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to withdraw application');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  }, [application, fetchApplication]);

  const handleContactEmployer = useCallback(() => {
    if (!application?.job) {
      Alert.alert('No Contact Info', 'Contact information not available');
      return;
    }

    // Try to get contact info from job or application
    const contactEmail = (application.job as any)?.contactEmail;
    const contactPhone = (application.job as any)?.contactPhone;

    if (!contactEmail && !contactPhone) {
      Alert.alert('No Contact Info', 'Contact information not available for this job');
      return;
    }

    Alert.alert(
      'Contact Employer',
      'Choose a contact method',
      [
        contactEmail
          ? {
              text: 'Email',
              onPress: () => {
                Linking.openURL(`mailto:${contactEmail}`);
              },
            }
          : null,
        contactPhone
          ? {
              text: 'Phone',
              onPress: () => {
                Linking.openURL(`tel:${contactPhone}`);
              },
            }
          : null,
        { text: 'Cancel', style: 'cancel' },
      ].filter(Boolean) as any
    );
  }, [application]);

  const handleShare = async () => {
    if (!application || !application.job) return;

    try {
      await Share.share({
        message: `I applied for ${application.job.title} at ${application.job.company}`,
        title: 'My Job Application',
      });
    } catch (err) {
      console.error('Error sharing application:', err);
    }
  };

  const isJobSeeker = activeRole !== 'provider' && activeRole !== 'admin';
  const canWithdraw = isJobSeeker && application?.status === 'pending';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading application...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !application) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title={error || 'Application not found'}
          subtitle="Please try again later"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        <View style={styles.content}>
          {/* Application Status */}
          <Card style={styles.sectionCard}>
            <View style={styles.statusHeader}>
              <ApplicationStatusBadge status={application.status} />
              <Text style={[styles.appliedDate, { color: colors.text.tertiary }]}>
                Applied {new Date(application.appliedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Card>

          {/* Application Timeline */}
          <ApplicationTimeline application={application} />

          {/* Job Details */}
          {application.job && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Job Applied For</Text>
              <Text style={[styles.jobTitle, { color: colors.text.primary }]}>
                {application.job.title}
              </Text>
              <Text style={[styles.jobCompany, { color: colors.text.secondary }]}>
                {application.job.company}
              </Text>
              <Text style={[styles.jobLocation, { color: colors.text.tertiary }]}>
                {application.job.location}
              </Text>
              <TouchableOpacity
                style={styles.viewJobButton}
                onPress={() => router.push(`/(stack)/job/${application.jobId}` as any)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text style={[styles.viewJobButtonText, { color: colors.primary[600] }]}>
                  View Job Details
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
              </TouchableOpacity>
            </Card>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Cover Letter</Text>
              <Text style={[styles.coverLetterText, { color: colors.text.secondary }]}>
                {application.coverLetter}
              </Text>
            </Card>
          )}

          {/* Resume */}
          <ResumeViewer resumeUrl={application.resume} resumeName="Resume.pdf" />

          {/* Interview Details */}
          {application.status === 'interview' && (
            <InterviewDetails
              date={application.interview?.date}
              time={application.interview?.time}
              location={application.interview?.location}
              type={application.interview?.type}
              notes={application.interview?.notes}
              meetingLink={application.interview?.meetingLink}
            />
          )}

          {/* Feedback */}
          {(application.feedback || application.rating || application.notes) && (
            <FeedbackDisplay
              feedback={application.feedback}
              rating={application.rating}
              notes={application.notes}
            />
          )}

          {/* Actions */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {canWithdraw && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.withdrawButton, { borderColor: colors.semantic.error[200] }]}
                  onPress={handleWithdraw}
                  disabled={withdrawing}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  {withdrawing ? (
                    <ActivityIndicator size="small" color={colors.semantic.error[600]} />
                  ) : (
                    <Ionicons name="close-circle-outline" size={20} color={colors.semantic.error[600]} />
                  )}
                  <Text style={[styles.actionButtonText, { color: colors.semantic.error[600] }]}>
                    {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.viewJobActionButton, { borderColor: colors.border.light }]}
                onPress={() => router.push(`/(stack)/job/${application.jobId}` as any)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="briefcase-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>View Job</Text>
              </TouchableOpacity>

              {isJobSeeker && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.contactButton, { borderColor: colors.border.light }]}
                  onPress={handleContactEmployer}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>
                    Contact Employer
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ApplicationDetailScreen() {
  return (
    <ErrorBoundary>
      <ApplicationDetailScreenContent />
    </ErrorBoundary>
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
  scrollContent: {
    paddingBottom: Spacing.xl,
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
  content: {
    padding: Spacing.lg,
    paddingTop: Platform.select({ ios: 60, android: 70 }),
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
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedDate: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCompany: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobLocation: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  viewJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  viewJobButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  coverLetterText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    backgroundColor: Colors.background.secondary,
  },
  withdrawButton: {
    backgroundColor: Colors.semantic.error[50],
  },
  viewJobActionButton: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  contactButton: {
    backgroundColor: Colors.background.secondary,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});
