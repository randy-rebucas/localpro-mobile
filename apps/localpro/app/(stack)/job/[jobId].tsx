import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { JobBoardService } from '@localpro/job-board';
import { SecureStorage } from '@localpro/storage';
import type { Job, JobApplication } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import {
  ApplicationForm,
  ApplicationStatusBadge,
  BenefitsList,
  CompanyLogo,
  SimilarJobsList,
} from '../../../components/job-board';
import { EmptyState } from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

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
    year: 'numeric',
  });
};

function JobDetailScreenContent() {
  const params = useLocalSearchParams<{ jobId: string }>();
  const rawJobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const jobId = rawJobId && typeof rawJobId === 'string' && rawJobId.trim() !== '' ? rawJobId.trim() : '';

  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [existingApplication, setExistingApplication] = useState<JobApplication | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Validate jobId format (should be a valid MongoDB ObjectId or string)
        if (!jobId || jobId.length < 1) {
          throw new Error('Invalid job ID');
        }
        
        const jobData = await JobBoardService.getJob(jobId);
        
        if (!jobData) {
          throw new Error('Job not found');
        }
        
        setJob(jobData);
        setCompanyLogo((jobData as any)?.companyLogo);

        // Check if job is saved
        try {
          const savedJobs = await SecureStorage.getItem('saved_jobs');
          const saved = savedJobs ? JSON.parse(savedJobs) : [];
          setIsSaved(saved.includes(jobId));
        } catch (err) {
          // Silently fail if storage is not available
          console.log('Could not check saved jobs:', err);
        }

        // Check if user has already applied
        if (user) {
          try {
            const applications = await JobBoardService.getApplications();
            const existingApp = applications.find((app) => app.jobId === jobId);
            setExistingApplication(existingApp || null);
          } catch (err) {
            // Silently fail - user might not have applied
            console.log('Could not fetch applications:', err);
          }
        }

        // Fetch similar jobs
        try {
          const similar = await JobBoardService.getJobs({
            category: jobData.categoryId,
            limit: 6,
          });
          setSimilarJobs(similar.filter((j) => j.id !== jobId).slice(0, 5));
        } catch (err) {
          console.log('Could not fetch similar jobs:', err);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, user]);

  const handleApply = async () => {
    if (!job || !user) {
      Alert.alert('Error', 'Please log in to apply for this job');
      return;
    }

    // Prevent job owner from applying to their own job
    if (job.postedBy && user.id && job.postedBy === user.id) {
      Alert.alert('Cannot Apply', 'You cannot apply to a job that you posted.');
      return;
    }

    if (job.status === 'closed' || job.status === 'filled') {
      Alert.alert('Job Unavailable', 'This job is no longer accepting applications');
      return;
    }

    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (data: { coverLetter: string; resume: string; additionalInfo?: { portfolio?: string; linkedIn?: string } }) => {
    if (!job) return;

    try {
      setApplying(true);

      // Build payload according to API structure
      const payload: {
        coverLetter: string;
        resume: string;
        additionalInfo?: {
          portfolio?: string;
          linkedIn?: string;
        };
      } = {
        coverLetter: data.coverLetter,
        resume: data.resume,
      };

      if (data.additionalInfo && (data.additionalInfo.portfolio || data.additionalInfo.linkedIn)) {
        payload.additionalInfo = {};
        if (data.additionalInfo.portfolio) {
          payload.additionalInfo.portfolio = data.additionalInfo.portfolio;
        }
        if (data.additionalInfo.linkedIn) {
          payload.additionalInfo.linkedIn = data.additionalInfo.linkedIn;
        }
      }

      await JobBoardService.applyForJob(job.id, payload);

      setShowApplicationForm(false);
      Alert.alert('Success', 'Your application has been submitted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit application');
      throw err;
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (!job) return;

    try {
      await Share.share({
        message: `Check out this job: ${job.title} at ${job.company} - ${job.location}`,
        title: job.title,
      });
    } catch (err) {
      console.error('Error sharing job:', err);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;

    try {
      const savedJobs = await SecureStorage.getItem('saved_jobs');
      const saved = savedJobs ? JSON.parse(savedJobs) : [];

      if (isSaved) {
        const updated = saved.filter((id: string) => id !== job.id);
        await SecureStorage.setItem('saved_jobs', JSON.stringify(updated));
        setIsSaved(false);
        Alert.alert('Removed', 'Job removed from saved jobs');
      } else {
        saved.push(job.id);
        await SecureStorage.setItem('saved_jobs', JSON.stringify(saved));
        setIsSaved(true);
        Alert.alert('Saved', 'Job saved to your favorites');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save job');
      console.error('Error saving job:', err);
    }
  };

  const handleReportJob = () => {
    Alert.alert(
      'Report Job',
      'Why are you reporting this job posting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam or Scam',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this job posting.');
          },
        },
        {
          text: 'Inappropriate Content',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this job posting.');
          },
        },
        {
          text: 'Other',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this job posting.');
          },
        },
      ]
    );
  };

  const handleCompanyPress = () => {
    // Navigate to company profile if companyId exists, otherwise use company name
    const companyId = (job as any)?.companyId || encodeURIComponent(job?.company || '');
    router.push(`/(stack)/company/${companyId}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title={error || 'Job not found'}
          subtitle="The job you're looking for doesn't exist or has been removed"
        />
      </SafeAreaView>
    );
  }

  const postedAgo = getRelativeTime(job.postedAt);
  const salaryLabel = formatSalaryRange(job.salary);
  const isJobClosed = job.status === 'closed' || job.status === 'filled';
  const isJobOwner = job.postedBy && user?.id && job.postedBy === user.id;

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
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleReportJob}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="flag-outline" size={24} color={colors.semantic.error[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            {job.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
            {isJobClosed && (
              <View style={[styles.statusBadge, { backgroundColor: colors.semantic.error[50] }]}>
                <Text style={[styles.statusBadgeText, { color: colors.semantic.error[600] }]}>
                  {job.status === 'closed' ? 'Closed' : 'Filled'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>

          {/* Company Info with Logo */}
          <TouchableOpacity
            style={styles.companySection}
            onPress={handleCompanyPress}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <CompanyLogo logo={companyLogo} companyName={job.company} size={48} />
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.text.secondary }]}>{job.company}</Text>
              <View style={styles.companyLink}>
                <Text style={[styles.companyLinkText, { color: colors.primary[600] }]}>View Company Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.metaText, { color: colors.text.tertiary }]}>{job.location}</Text>
            </View>
            {job.remote && (
              <View style={[styles.remoteBadge, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="wifi-outline" size={14} color={colors.primary[600]} />
                <Text style={[styles.remoteText, { color: colors.primary[600] }]}>Remote</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                {toTitleCase(job.type)}
              </Text>
            </View>
            {job.experienceLevel && (
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={16} color={colors.text.tertiary} />
                <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                  {toTitleCase(job.experienceLevel)} level
                </Text>
              </View>
            )}
          </View>

          <View style={styles.salaryRow}>
            <View style={styles.salaryInfo}>
              <Text style={[styles.salaryText, { color: colors.primary[600] }]}>{salaryLabel}</Text>
              {(job.salary as any)?.negotiable && (
                <Text style={[styles.salaryNote, { color: colors.text.tertiary }]}>Negotiable</Text>
              )}
              {(job.salary as any)?.confidential && (
                <Text style={[styles.salaryNote, { color: colors.text.tertiary }]}>Confidential</Text>
              )}
            </View>
            <Text style={[styles.postedText, { color: colors.text.tertiary }]}>Posted {postedAgo}</Text>
          </View>

          {/* Application Status Badge */}
          {existingApplication && (
            <View style={styles.applicationStatusContainer}>
              <ApplicationStatusBadge status={existingApplication.status} />
            </View>
          )}
        </Card>

        {/* Description Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={[styles.descriptionText, { color: colors.text.secondary }]}>
            {job.description}
          </Text>
        </Card>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                  {requirement}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Job Details Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Job Type:</Text>
            <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
              {toTitleCase(job.type)}
            </Text>
          </View>
          {job.experienceLevel && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Experience:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {toTitleCase(job.experienceLevel)} level
              </Text>
            </View>
          )}
          {job.categoryId && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Category:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {job.categoryId}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Location:</Text>
            <Text style={[styles.detailValue, { color: colors.text.secondary }]}>{job.location}</Text>
          </View>
          {job.remote && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Remote:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>Yes</Text>
            </View>
          )}
        </Card>

        {/* Benefits Section */}
        {(job as any)?.benefits && (job as any).benefits.length > 0 && (
          <BenefitsList benefits={(job as any).benefits} />
        )}

        {/* Application Details Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          {job.expiresAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Application Deadline:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {new Date(job.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
          {(job as any)?.applicationInstructions && (
            <View style={styles.instructionsContainer}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary, marginBottom: Spacing.xs }]}>
                Application Instructions:
              </Text>
              <Text style={[styles.instructionsText, { color: colors.text.secondary }]}>
                {(job as any).applicationInstructions}
              </Text>
            </View>
          )}
        </Card>

        {/* Salary Section */}
        {job.salary && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            <Text style={[styles.salaryDetailText, { color: colors.text.secondary }]}>
              {salaryLabel}
            </Text>
            {job.salary.period && (
              <Text style={[styles.salaryPeriodText, { color: colors.text.tertiary }]}>
                Paid {job.salary.period}
              </Text>
            )}
            {(job.salary as any)?.negotiable && (
              <View style={styles.salaryBadge}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.salaryBadgeText, { color: colors.primary[600] }]}>Salary is negotiable</Text>
              </View>
            )}
            {(job.salary as any)?.confidential && (
              <View style={styles.salaryBadge}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.text.tertiary} />
                <Text style={[styles.salaryBadgeText, { color: colors.text.tertiary }]}>
                  Salary information is confidential
                </Text>
              </View>
            )}
          </Card>
        )}

        </View>

        {/* Similar Jobs Section */}
        {similarJobs.length > 0 && (
          <SimilarJobsList jobs={similarJobs} onJobPress={(id) => router.push(`/(stack)/job/${id}` as any)} currentJobId={job.id} />
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: colors.background.primary, borderTopColor: colors.border.light }]}>
        <TouchableOpacity
          style={[styles.iconButton, { borderColor: colors.border.light }]}
          onPress={handleSaveJob}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.primary[600] : colors.text.secondary}
          />
        </TouchableOpacity>
        {isJobOwner ? (
          <View style={[styles.applyButton, styles.applyButtonDisabled, { backgroundColor: colors.neutral.gray400 }]}>
            <Text style={[styles.applyButtonText, { color: colors.text.tertiary }]}>
              Your Job Posting
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: isJobClosed ? colors.neutral.gray400 : colors.primary[600] },
              isJobClosed && styles.applyButtonDisabled,
              existingApplication && { backgroundColor: colors.secondary[600] },
            ]}
            onPress={existingApplication ? () => router.push(`/(stack)/application/${existingApplication.id}` as any) : handleApply}
            disabled={isJobClosed || applying}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            {applying ? (
              <ActivityIndicator size="small" color={Colors.text.inverse} />
            ) : (
              <Text style={styles.applyButtonText}>
                {existingApplication
                  ? 'View Application'
                  : isJobClosed
                  ? 'Job Unavailable'
                  : 'Apply Now'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Application Form Modal */}
      <Modal
        visible={showApplicationForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplicationForm(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <ApplicationForm
            jobId={job.id}
            jobTitle={job.title}
            onSubmit={handleSubmitApplication}
            onCancel={() => setShowApplicationForm(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function JobDetailScreen() {
  return (
    <ErrorBoundary>
      <JobDetailScreenContent />
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
    paddingTop: 0,
    paddingBottom: Spacing['3xl'],
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
    color: Colors.text.secondary,
  },
  headerCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
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
    ...Shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 36,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  companyName: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  remoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  remoteText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  salaryText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 24,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  postedText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  salaryDetailText: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  salaryPeriodText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    ...Shadows.md,
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  companyInfo: {
    flex: 1,
  },
  companyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  companyLinkText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applicationStatusContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  salaryInfo: {
    flex: 1,
  },
  salaryNote: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  salaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  salaryBadgeText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  instructionsContainer: {
    marginTop: Spacing.sm,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
});

