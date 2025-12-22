import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS, apiClient } from '@localpro/api';
import { useAuthContext } from '@localpro/auth';
import { JobBoardService } from '@localpro/job-board';
import { SecureStorage } from '@localpro/storage';
import type { Job, JobApplication } from '@localpro/types';
import { Card } from '@localpro/ui';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  const [rawJobData, setRawJobData] = useState<any>(null); // Store raw API response
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
        
        // Fetch both transformed job and raw API response
        const [jobData, rawResponse] = await Promise.all([
          JobBoardService.getJob(jobId),
          apiClient.get<any>(API_ENDPOINTS.jobs.public.getById(encodeURIComponent(jobId)))
        ]);
        
        if (!jobData) {
          throw new Error('Job not found');
        }
        
        // Extract raw job data from API response
        let rawJob: any = null;
        if (rawResponse?.success && rawResponse?.data) {
          rawJob = rawResponse.data;
        } else if (rawResponse?.data) {
          rawJob = rawResponse.data;
        } else {
          rawJob = rawResponse;
        }
        
        setJob(jobData);
        setRawJobData(rawJob);
        setCompanyLogo(rawJob?.companyLogo || rawJob?.company?.logo);

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

  const postedAgo = getRelativeTime((job as any)?.createdAt || job.postedAt);
  const salaryLabel = formatSalaryRange(job.salary);
  const isJobClosed = job.status === 'closed' || job.status === 'filled';
  const isJobOwner = ((job as any)?.employer?._id && user?.id && (job as any).employer._id === user.id) || 
                      (job.postedBy && user?.id && job.postedBy === user.id);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Actions */}
        <View style={[styles.headerActions, { backgroundColor: Platform.select({ 
          ios: 'rgba(255, 255, 255, 0.9)', // 90% opacity
          android: 'rgba(255, 255, 255, 0.92)' // 92% opacity
        }) }]}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
            onPress={() => router.back()}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
              onPress={handleShare}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="share-outline" size={26} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
              onPress={handleSaveJob}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={26}
                color={isSaved ? colors.primary[600] : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
              onPress={handleReportJob}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="flag-outline" size={26} color={colors.semantic.error[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            {((job as any)?.featured?.isFeatured || job.featured) && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color={colors.primary[600]} />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
            {(job as any)?.promoted?.isPromoted && (
              <View style={[styles.featuredBadge, { backgroundColor: colors.secondary[50], borderColor: colors.secondary[200] }]}>
                <Ionicons name="rocket" size={12} color={colors.secondary[600]} />
                <Text style={[styles.featuredBadgeText, { color: colors.secondary[600] }]}>Promoted</Text>
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
            <CompanyLogo 
              logo={companyLogo || rawJobData?.company?.logo || (job as any)?.company?.logo} 
              companyName={rawJobData?.company?.name || (job as any)?.company?.name || job.company} 
              size={48} 
            />
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.text.secondary }]}>
                {rawJobData?.company?.name || (job as any)?.company?.name || job.company}
              </Text>
              {(rawJobData?.company?.industry || (job as any)?.company?.industry) && (
                <Text style={[styles.companyIndustry, { color: colors.text.tertiary }]}>
                  {rawJobData?.company?.industry || (job as any)?.company?.industry}
                </Text>
              )}
              <View style={styles.companyLink}>
                <Text style={[styles.companyLinkText, { color: colors.primary[600] }]}>View Company Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.metaText, { color: colors.text.tertiary }]}>
                {rawJobData?.company?.location?.address || 
                 rawJobData?.company?.location?.city || 
                 (job as any)?.company?.location?.address || 
                 (job as any)?.company?.location?.city || 
                 job.location}
              </Text>
            </View>
            {((rawJobData?.company?.location?.isRemote || (job as any)?.company?.location?.isRemote || job.remote)) && (
              <View style={[styles.remoteBadge, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="wifi-outline" size={14} color={colors.primary[600]} />
                <Text style={[styles.remoteText, { color: colors.primary[600] }]}>
                  {(rawJobData?.company?.location?.remoteType || (job as any)?.company?.location?.remoteType) === 'remote' ? 'Remote' : 
                   (rawJobData?.company?.location?.remoteType || (job as any)?.company?.location?.remoteType) === 'hybrid' ? 'Hybrid' : 
                   'Remote'}
                </Text>
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
              {((job.salary as any)?.isNegotiable || (job.salary as any)?.negotiable) && (
                <Text style={[styles.salaryNote, { color: colors.text.tertiary }]}>Negotiable</Text>
              )}
              {((job.salary as any)?.isConfidential || (job.salary as any)?.confidential) && (
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

        {/* Responsibilities Section */}
        {(job as any)?.responsibilities && (job as any).responsibilities.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Responsibilities</Text>
            {(job as any).responsibilities.map((responsibility: string, index: number) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="ellipse" size={8} color={colors.primary[600]} style={{ marginTop: 6 }} />
                <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                  {responsibility}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Qualifications Section */}
        {(job as any)?.qualifications && (job as any).qualifications.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Qualifications</Text>
            {(job as any).qualifications.map((qualification: string, index: number) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                  {qualification}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Requirements Section */}
        {(rawJobData?.requirements || (job as any)?.requirements || (Array.isArray(job.requirements) && job.requirements.length > 0)) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            
            {(() => {
              const requirements = rawJobData?.requirements || (job as any)?.requirements;
              
              // If requirements is an object with structure (education, skills, etc.)
              if (requirements && typeof requirements === 'object' && !Array.isArray(requirements)) {
                return (
                  <>
                    {/* Education Requirement */}
                    {requirements.education?.isRequired && (
                      <View style={styles.requirementItem}>
                        <Ionicons name="school-outline" size={16} color={colors.primary[600]} />
                        <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                          Education required
                        </Text>
                      </View>
                    )}

                    {/* Skills */}
                    {requirements.skills && Array.isArray(requirements.skills) && requirements.skills.length > 0 && (
                      <View style={styles.requirementsSubsection}>
                        <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>Skills</Text>
                        <View style={styles.tagsContainer}>
                          {requirements.skills.map((skill: string, index: number) => (
                            <View key={index} style={[styles.tag, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                              <Text style={[styles.tagText, { color: colors.primary[700] }]}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Certifications */}
                    {requirements.certifications && Array.isArray(requirements.certifications) && requirements.certifications.length > 0 && (
                      <View style={styles.requirementsSubsection}>
                        <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>Certifications</Text>
                        {requirements.certifications.map((cert: string, index: number) => (
                          <View key={index} style={styles.requirementItem}>
                            <Ionicons name="ribbon-outline" size={16} color={colors.primary[600]} />
                            <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                              {cert}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Languages */}
                    {requirements.languages && Array.isArray(requirements.languages) && requirements.languages.length > 0 && (
                      <View style={styles.requirementsSubsection}>
                        <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>Languages</Text>
                        {requirements.languages.map((lang: string, index: number) => (
                          <View key={index} style={styles.requirementItem}>
                            <Ionicons name="chatbubbles-outline" size={16} color={colors.primary[600]} />
                            <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                              {lang}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Other Requirements */}
                    {requirements.other && Array.isArray(requirements.other) && requirements.other.length > 0 && (
                      <View style={styles.requirementsSubsection}>
                        <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>Other Requirements</Text>
                        {requirements.other.map((other: string, index: number) => (
                          <View key={index} style={styles.requirementItem}>
                            <Ionicons name="document-text-outline" size={16} color={colors.primary[600]} />
                            <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                              {other}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                );
              }
              
              // Legacy string array requirements
              if (Array.isArray(job.requirements) && job.requirements.length > 0) {
                return (
                  <>
                    {job.requirements.map((requirement, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[600]} />
                        <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                          {requirement}
                        </Text>
                      </View>
                    ))}
                  </>
                );
              }
              
              return null;
            })()}
          </Card>
        )}

        {/* Company Details Section */}
        {(rawJobData?.company || (job as any)?.company) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            {(rawJobData?.company?.name || (job as any)?.company?.name || (typeof (job as any)?.company === 'string' ? (job as any).company : null)) && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Company:</Text>
                <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                  {rawJobData?.company?.name || (job as any)?.company?.name || (typeof (job as any)?.company === 'string' ? (job as any).company : 'N/A')}
                </Text>
              </View>
            )}
            {(rawJobData?.company?.website || (job as any)?.company?.website) && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Website:</Text>
                <TouchableOpacity onPress={() => {
                  const website = rawJobData?.company?.website || (job as any)?.company?.website;
                  const url = website.startsWith('http') 
                    ? website 
                    : `https://${website}`;
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Error', 'Could not open website');
                  });
                }}>
                  <Text style={[styles.detailValue, { color: colors.primary[600] }]}>
                    {rawJobData?.company?.website || (job as any)?.company?.website}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {(rawJobData?.company?.size || (job as any)?.company?.size) && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Company Size:</Text>
                <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                  {toTitleCase(rawJobData?.company?.size || (job as any)?.company?.size)}
                </Text>
              </View>
            )}
            {(rawJobData?.company?.industry || (job as any)?.company?.industry) && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Industry:</Text>
                <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                  {rawJobData?.company?.industry || (job as any)?.company?.industry}
                </Text>
              </View>
            )}
            {(rawJobData?.company?.location || (job as any)?.company?.location) && (
              <>
                {(rawJobData?.company?.location?.address || (job as any)?.company?.location?.address) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Address:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {rawJobData?.company?.location?.address || (job as any)?.company?.location?.address}
                    </Text>
                  </View>
                )}
                {(rawJobData?.company?.location?.city || (job as any)?.company?.location?.city) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>City:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {rawJobData?.company?.location?.city || (job as any)?.company?.location?.city}
                    </Text>
                  </View>
                )}
                {(rawJobData?.company?.location?.state || (job as any)?.company?.location?.state) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>State/Province:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {rawJobData?.company?.location?.state || (job as any)?.company?.location?.state}
                    </Text>
                  </View>
                )}
                {(rawJobData?.company?.location?.country || (job as any)?.company?.location?.country) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Country:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {rawJobData?.company?.location?.country || (job as any)?.company?.location?.country}
                    </Text>
                  </View>
                )}
                {(rawJobData?.company?.location?.remoteType || (job as any)?.company?.location?.remoteType) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Work Type:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {toTitleCase((rawJobData?.company?.location?.remoteType || (job as any)?.company?.location?.remoteType || '').replace('_', ' '))}
                    </Text>
                  </View>
                )}
                {(rawJobData?.company?.location?.coordinates || (job as any)?.company?.location?.coordinates) && (() => {
                  const coords = rawJobData?.company?.location?.coordinates || (job as any)?.company?.location?.coordinates;
                  return (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Coordinates:</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const { lat, lng } = coords;
                          const url = Platform.select({
                            ios: `maps://maps.apple.com/?q=${lat},${lng}`,
                            android: `geo:${lat},${lng}?q=${lat},${lng}`,
                          });
                          if (url) {
                            Linking.openURL(url).catch(() => {
                              Alert.alert('Error', 'Could not open maps application');
                            });
                          }
                        }}
                      >
                        <Text style={[styles.detailValue, { color: colors.primary[600] }]}>
                          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })()}
              </>
            )}
          </Card>
        )}

        {/* Job Details Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Job Type:</Text>
            <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
              {toTitleCase((job as any)?.jobType || job.type)}
            </Text>
          </View>
          {((job as any)?.experienceLevel || job.experienceLevel) && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Experience:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {toTitleCase((job as any)?.experienceLevel || job.experienceLevel)} level
              </Text>
            </View>
          )}
          {(job as any)?.category && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Category:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {(job as any).category.name || job.categoryId}
              </Text>
            </View>
          )}
          {(job as any)?.subcategory && (job as any).subcategory !== 'No subcategory' && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Subcategory:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {(job as any).subcategory}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Location:</Text>
            <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
              {rawJobData?.company?.location?.address || (job as any)?.company?.location?.address || job.location}
            </Text>
          </View>
          {((rawJobData?.company?.location?.isRemote || (job as any)?.company?.location?.isRemote || job.remote)) && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Remote:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {(rawJobData?.company?.location?.isRemote || (job as any)?.company?.location?.isRemote || job.remote) ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          {(job as any)?.visibility && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Visibility:</Text>
              <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                {toTitleCase((job as any).visibility)}
              </Text>
            </View>
          )}
        </Card>

        {/* Employer Information */}
        {(job as any)?.employer && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.employerContainer}>
              {(job as any).employer.profile?.avatar?.thumbnail ? (
                <Image
                  source={{ uri: (job as any).employer.profile.avatar.thumbnail }}
                  style={styles.employerAvatar}
                  contentFit="cover"
                  placeholder={require('../../../assets/images/icon.png')}
                />
              ) : (
                <View style={[styles.employerAvatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="person" size={24} color={colors.primary[600]} />
                </View>
              )}
              <View style={styles.employerInfo}>
                <Text style={[styles.employerName, { color: colors.text.primary }]}>
                  {(job as any).employer.firstName} {(job as any).employer.lastName}
                </Text>
                {(job as any).employer.profile?.bio && (
                  <Text style={[styles.employerBio, { color: colors.text.secondary }]}>
                    {(job as any).employer.profile.bio}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Tags Section */}
        {(job as any)?.tags && (job as any).tags.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {(job as any).tags.map((tag: string, index: number) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                  <Text style={[styles.tagText, { color: colors.primary[700] }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Category Description */}
        {(job as any)?.category && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About This Category</Text>
            {(job as any).category.description && (
              <Text style={[styles.descriptionText, { color: colors.text.secondary }]}>
                {(job as any).category.description}
              </Text>
            )}
            {(job as any).category.metadata?.tags && (job as any).category.metadata.tags.length > 0 && (
              <View style={[styles.tagsContainer, { marginTop: Spacing.md }]}>
                {(job as any).category.metadata.tags.map((tag: string, index: number) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.secondary[50], borderColor: colors.secondary[200] }]}>
                    <Text style={[styles.tagText, { color: colors.secondary[700] }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Benefits Section */}
        {(job as any)?.benefits && (job as any).benefits.length > 0 && (
          <BenefitsList benefits={(job as any).benefits} />
        )}

        {/* Application Details Section */}
        {(rawJobData?.applicationProcess || (job as any)?.applicationProcess || job.expiresAt) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application Details</Text>
            {(rawJobData?.applicationProcess || (job as any)?.applicationProcess) ? (
              <>
                {(rawJobData?.applicationProcess?.deadline || (job as any)?.applicationProcess?.deadline) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Application Deadline:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {new Date(rawJobData?.applicationProcess?.deadline || (job as any)?.applicationProcess?.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                {(rawJobData?.applicationProcess?.startDate || (job as any)?.applicationProcess?.startDate) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Start Date:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {new Date(rawJobData?.applicationProcess?.startDate || (job as any)?.applicationProcess?.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                {(rawJobData?.applicationProcess?.applicationMethod || (job as any)?.applicationProcess?.applicationMethod) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Application Method:</Text>
                    <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                      {toTitleCase(rawJobData?.applicationProcess?.applicationMethod || (job as any)?.applicationProcess?.applicationMethod || '')}
                    </Text>
                  </View>
                )}
                {(rawJobData?.applicationProcess?.contactEmail || (job as any)?.applicationProcess?.contactEmail) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Contact Email:</Text>
                    <TouchableOpacity onPress={() => {
                      const email = rawJobData?.applicationProcess?.contactEmail || (job as any)?.applicationProcess?.contactEmail;
                      Linking.openURL(`mailto:${email}`).catch(() => {
                        Alert.alert('Error', 'Could not open email client');
                      });
                    }}>
                      <Text style={[styles.detailValue, { color: colors.primary[600] }]}>
                        {rawJobData?.applicationProcess?.contactEmail || (job as any)?.applicationProcess?.contactEmail}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {(rawJobData?.applicationProcess?.contactPhone || (job as any)?.applicationProcess?.contactPhone) && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Contact Phone:</Text>
                    <TouchableOpacity onPress={() => {
                      const phone = rawJobData?.applicationProcess?.contactPhone || (job as any)?.applicationProcess?.contactPhone;
                      Linking.openURL(`tel:${phone}`).catch(() => {
                        Alert.alert('Error', 'Could not open phone dialer');
                      });
                    }}>
                      <Text style={[styles.detailValue, { color: colors.primary[600] }]}>
                        {rawJobData?.applicationProcess?.contactPhone || (job as any)?.applicationProcess?.contactPhone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {(rawJobData?.applicationProcess?.instructions || (job as any)?.applicationProcess?.instructions) && (
                  <View style={styles.instructionsContainer}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary, marginBottom: Spacing.xs }]}>
                      Application Instructions:
                    </Text>
                    <Text style={[styles.instructionsText, { color: colors.text.secondary }]}>
                      {rawJobData?.applicationProcess?.instructions || (job as any)?.applicationProcess?.instructions}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
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
                {(rawJobData?.applicationInstructions || (job as any)?.applicationInstructions) && (
                  <View style={styles.instructionsContainer}>
                    <Text style={[styles.detailLabel, { color: colors.text.tertiary, marginBottom: Spacing.xs }]}>
                      Application Instructions:
                    </Text>
                    <Text style={[styles.instructionsText, { color: colors.text.secondary }]}>
                      {rawJobData?.applicationInstructions || (job as any)?.applicationInstructions}
                    </Text>
                  </View>
                )}
              </>
            )}
          </Card>
        )}

        {/* Analytics Section (for job owners) */}
        {isJobOwner && (job as any)?.analytics && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Job Analytics</Text>
            <View style={styles.analyticsContainer}>
              <View style={styles.analyticsItem}>
                <Ionicons name="eye-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>
                  {(job as any).analytics.viewsCount || (job as any)?.views?.count || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: colors.text.tertiary }]}>Views</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>
                  {(job as any).analytics.applicationsCount || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: colors.text.tertiary }]}>Applications</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>
                  {(job as any).analytics.sharesCount || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: colors.text.tertiary }]}>Shares</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Ionicons name="bookmark-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>
                  {(job as any).analytics.savesCount || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: colors.text.tertiary }]}>Saves</Text>
              </View>
            </View>
            {(job as any)?.views?.unique && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Unique Views:</Text>
                <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                  {(job as any).views.unique}
                </Text>
              </View>
            )}
            {(job as any)?.updatedAt && (
              <View style={[styles.detailRow, { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.light }]}>
                <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Last Updated:</Text>
                <Text style={[styles.detailValue, { color: colors.text.secondary }]}>
                  {new Date((job as any).updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Applications Preview (for job owners) */}
        {isJobOwner && (job as any)?.applications && Array.isArray((job as any).applications) && (job as any).applications.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Applications</Text>
              <TouchableOpacity
                onPress={() => router.push(`/(stack)/job/${job.id}/applications` as any)}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
              </TouchableOpacity>
            </View>
            {(job as any).applications.slice(0, 3).map((application: any, index: number) => (
              <TouchableOpacity
                key={application._id || index}
                style={[
                  styles.applicationPreviewItem,
                  index < Math.min((job as any).applications.length, 3) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.light,
                    paddingBottom: Spacing.md,
                    marginBottom: Spacing.md,
                  }
                ]}
                onPress={() => router.push(`/(stack)/job/${job.id}/applications` as any)}
              >
                <View style={styles.applicationPreviewHeader}>
                  {application.applicant?.profile?.avatar?.thumbnail ? (
                    <Image
                      source={{ uri: application.applicant.profile.avatar.thumbnail }}
                      style={styles.applicationAvatar}
                      contentFit="cover"
                      placeholder={require('../../../assets/images/icon.png')}
                    />
                  ) : (
                    <View style={[styles.applicationAvatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
                      <Ionicons name="person" size={20} color={colors.primary[600]} />
                    </View>
                  )}
                  <View style={styles.applicationPreviewInfo}>
                    <Text style={[styles.applicationName, { color: colors.text.primary }]}>
                      {application.applicant?.firstName} {application.applicant?.lastName}
                    </Text>
                    <Text style={[styles.applicationDate, { color: colors.text.tertiary }]}>
                      Applied {getRelativeTime(application.appliedAt)}
                    </Text>
                  </View>
                  <ApplicationStatusBadge status={application.status} />
                </View>
                {application.coverLetter && (
                  <Text 
                    style={[styles.applicationCoverLetterPreview, { color: colors.text.secondary }]}
                    numberOfLines={2}
                  >
                    {application.coverLetter}
                  </Text>
                )}
                {application.interviewSchedule && application.interviewSchedule.length > 0 && (
                  <View style={styles.interviewSchedulePreview}>
                    <Ionicons name="calendar-outline" size={14} color={colors.primary[600]} />
                    <Text style={[styles.interviewScheduleText, { color: colors.primary[600] }]}>
                      {application.interviewSchedule.length} interview{application.interviewSchedule.length > 1 ? 's' : ''} scheduled
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Card>
        )}

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
            {((job.salary as any)?.isNegotiable || (job.salary as any)?.negotiable) && (
              <View style={styles.salaryBadge}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.salaryBadgeText, { color: colors.primary[600] }]}>Salary is negotiable</Text>
              </View>
            )}
            {((job.salary as any)?.isConfidential || (job.salary as any)?.confidential) && (
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
        {isJobOwner ? (
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.secondary[600] }]}
            onPress={() => router.push(`/(stack)/job/${job.id}/applications` as any)}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text style={styles.applyButtonText}>View Applicants</Text>
          </TouchableOpacity>
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
    paddingBottom: Platform.select({ ios: Spacing['3xl'], android: Spacing['3xl'] + 8 }),
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
    borderRadius: Platform.select({ ios: BorderRadius.xl, android: BorderRadius.lg }),
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.select({ ios: Spacing.lg, android: Spacing.xl }),
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
    borderBottomWidth: Platform.select({ ios: 0.5, android: 1 }),
    borderBottomColor: Colors.border.light,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: Platform.select({ ios: 48, android: 48 }),
    height: Platform.select({ ios: 48, android: 48 }),
    borderRadius: Platform.select({ ios: 24, android: 24 }),
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    ...Platform.select({
      android: {
        elevation: Shadows.lg.elevation,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    paddingVertical: Platform.select({ ios: 4, android: 5 }),
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.primary[200],
  },
  featuredBadgeText: {
    fontSize: Platform.select({ ios: 11, android: 10 }),
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    paddingVertical: Platform.select({ ios: 4, android: 5 }),
  },
  statusBadgeText: {
    fontSize: Platform.select({ ios: 11, android: 10 }),
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobTitle: {
    fontSize: Platform.select({ ios: 28, android: 26 }),
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Platform.select({ ios: 36, android: 34 }),
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  companyName: {
    fontSize: Platform.select({ ios: 18, android: 17 }),
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Platform.select({ ios: 24, android: 23 }),
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  companyIndustry: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
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
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  remoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    paddingVertical: Platform.select({ ios: 4, android: 5 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.primary[200],
  },
  remoteText: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderTopColor: Colors.border.light,
  },
  salaryText: {
    fontSize: Platform.select({ ios: 18, android: 17 }),
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Platform.select({ ios: 24, android: 23 }),
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  postedText: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    lineHeight: Platform.select({ ios: 16, android: 15 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Platform.select({ ios: BorderRadius.xl, android: BorderRadius.lg }),
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  sectionTitle: {
    fontSize: Platform.select({ ios: 18, android: 17 }),
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Platform.select({ ios: 24, android: 23 }),
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  descriptionText: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    lineHeight: Platform.select({ ios: 22, android: 21 }),
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
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderBottomColor: Colors.border.light,
  },
  detailLabel: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  detailValue: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  salaryDetailText: {
    fontSize: Platform.select({ ios: 20, android: 19 }),
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Platform.select({ ios: 28, android: 27 }),
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  salaryPeriodText: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: Platform.select({ ios: Spacing.lg, android: Spacing.lg + 4 }),
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
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
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applicationStatusContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderTopColor: Colors.border.light,
  },
  salaryInfo: {
    flex: 1,
  },
  salaryNote: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    marginTop: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  salaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: Platform.select({ ios: BorderRadius.md, android: BorderRadius.sm }),
    backgroundColor: Colors.background.secondary,
  },
  salaryBadgeText: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  instructionsContainer: {
    marginTop: Spacing.sm,
  },
  instructionsText: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  iconButton: {
    width: Platform.select({ ios: 48, android: 48 }),
    height: Platform.select({ ios: 48, android: 48 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  applyButton: {
    flex: 1,
    height: Platform.select({ ios: 48, android: 50 }),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    padding: Platform.select({ ios: Spacing.lg, android: Spacing.lg }),
    paddingTop: Platform.select({ ios: Spacing.md, android: Spacing.md + 2 }),
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: Platform.select({ ios: 16, android: 15 }),
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
    ...Platform.select({
      android: {
        letterSpacing: 0.3,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  requirementsSubsection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subsectionTitle: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    paddingVertical: Platform.select({ ios: 6, android: 7 }),
    borderRadius: Platform.select({ ios: BorderRadius.md, android: BorderRadius.sm }),
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  tagText: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  employerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  employerAvatar: {
    width: Platform.select({ ios: 48, android: 48 }),
    height: Platform.select({ ios: 48, android: 48 }),
    borderRadius: Platform.select({ ios: 24, android: 24 }),
    backgroundColor: Colors.background.secondary,
  },
  employerAvatarPlaceholder: {
    width: Platform.select({ ios: 48, android: 48 }),
    height: Platform.select({ ios: 48, android: 48 }),
    borderRadius: Platform.select({ ios: 24, android: 24 }),
    justifyContent: 'center',
    alignItems: 'center',
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    fontSize: Platform.select({ ios: 16, android: 15 }),
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  employerBio: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 19 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderTopColor: Colors.border.light,
  },
  analyticsItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  analyticsValue: {
    fontSize: Platform.select({ ios: 20, android: 19 }),
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  analyticsLabel: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applicationPreviewItem: {
    marginBottom: Spacing.sm,
  },
  applicationPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  applicationAvatar: {
    width: Platform.select({ ios: 40, android: 40 }),
    height: Platform.select({ ios: 40, android: 40 }),
    borderRadius: Platform.select({ ios: 20, android: 20 }),
    backgroundColor: Colors.background.secondary,
  },
  applicationAvatarPlaceholder: {
    width: Platform.select({ ios: 40, android: 40 }),
    height: Platform.select({ ios: 40, android: 40 }),
    borderRadius: Platform.select({ ios: 20, android: 20 }),
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationPreviewInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: Platform.select({ ios: 15, android: 14 }),
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applicationDate: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  applicationCoverLetterPreview: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    lineHeight: Platform.select({ ios: 18, android: 17 }),
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  interviewSchedulePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  interviewScheduleText: {
    fontSize: Platform.select({ ios: 12, android: 11 }),
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

