import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import type { Job } from '@localpro/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { WavyBackground } from '../../../components/WavyBackground';
import {
  CompanyHeader,
  CompanyJobsList,
  CompanyStats,
} from '../../../components/job-board';
import { EmptyState } from '../../../components/marketplace';
import { Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type CompanyInfo = {
  name: string;
  website?: string;
  size?: string;
  industry?: string;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isRemote?: boolean;
  };
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
};

function CompanyDetailScreenContent() {
  const params = useLocalSearchParams<{ companyId: string }>();
  const rawCompanyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId;
  const companyId =
    rawCompanyId && typeof rawCompanyId === 'string' && rawCompanyId.trim() !== ''
      ? decodeURIComponent(rawCompanyId.trim())
      : '';

  const router = useRouter();
  const colors = useThemeColors();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setError('Company ID is required');
      setLoading(false);
      return;
    }

    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch jobs by company name
      const companyJobs = await JobBoardService.getJobs({ company: companyId });

      if (companyJobs.length === 0) {
        setError('Company not found');
        setLoading(false);
        return;
      }

      setJobs(companyJobs);

      // Extract company info from the first job
      const firstJob = companyJobs[0];

      // Try to get full job details to extract company object
      try {
        const fullJob = await JobBoardService.getJob(firstJob.id);
        if (fullJob && (fullJob as any).company && typeof (fullJob as any).company === 'object') {
          const companyObj = (fullJob as any).company as CompanyInfo;
          setCompany({
            name: companyObj.name || firstJob.company || companyId,
            website: companyObj.website,
            size: companyObj.size,
            industry: companyObj.industry,
            description: companyObj.description,
            location: companyObj.location,
            logo: companyObj.logo,
            contactEmail: companyObj.contactEmail || (fullJob as any).contactEmail,
            contactPhone: companyObj.contactPhone || (fullJob as any).contactPhone,
          });
        } else {
          // Fallback: create company info from job data
          setCompany({
            name: firstJob.company || companyId,
          });
        }
      } catch {
        // Fallback: create company info from job data
        setCompany({
          name: firstJob.company || companyId,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load company information');
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCompanyData();
  }, [fetchCompanyData]);

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/(stack)/job/${jobId}` as any);
    },
    [router]
  );

  const handleShare = useCallback(async () => {
    if (!company) return;

    try {
      await Share.share({
        message: `Check out ${company.name}${company.industry ? ` - ${company.industry}` : ''}`,
        title: company.name,
      });
    } catch (err) {
      console.error('Error sharing company:', err);
    }
  }, [company]);

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((j) => j.status === 'open').length;
    const totalApplications = jobs.reduce((sum, job) => {
      return sum + ((job as any).applicationsCount || 0);
    }, 0);
    const totalViews = jobs.reduce((sum, job) => {
      return sum + ((job as any).views || 0);
    }, 0);

    return {
      totalJobs: jobs.length,
      activeJobs,
      totalApplications,
      totalViews,
    };
  }, [jobs]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading company...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !company) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState
          icon="business-outline"
          title={error || 'Company not found'}
          subtitle="The company you're looking for doesn't exist or has no job postings"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WavyBackground />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={() => null}
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
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
                  onPress={handleShare}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="share-outline" size={26} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerSection}>
              <CompanyHeader
                name={company.name}
                logo={company.logo}
                description={company.description}
                industry={company.industry}
                size={company.size}
                website={company.website}
                location={company.location}
                contactEmail={company.contactEmail}
                contactPhone={company.contactPhone}
              />

              {jobs.length > 0 && (
                <CompanyStats
                  totalJobs={stats.totalJobs}
                  activeJobs={stats.activeJobs}
                  totalApplications={stats.totalApplications}
                  totalViews={stats.totalViews}
                />
              )}
            </View>

            {jobs.length > 0 && (
              <CompanyJobsList jobs={jobs} onJobPress={handleJobPress} loading={false} />
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="briefcase-outline"
              title="No open positions"
              subtitle="This company currently has no job openings"
            />
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

export default function CompanyDetailScreen() {
  return (
    <ErrorBoundary>
      <CompanyDetailScreenContent />
    </ErrorBoundary>
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
    color: Colors.text.secondary,
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
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  headerSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  emptyContainer: {
    padding: Spacing.lg,
  },
});
