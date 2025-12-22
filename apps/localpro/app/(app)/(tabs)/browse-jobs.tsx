import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { SecureStorage } from '@localpro/storage';
import type { Job } from '@localpro/types';
import { safeReverseGeocode } from '@localpro/utils/location';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    JobFilterSheet,
    SwipeableJobCard,
    type JobFilters,
} from '../../../components/job-board';
import {
    CategoryFilter,
    EmptyState,
    LoadingSkeleton,
    SearchInput,
    SortDropdown,
    type Category,
    type SortOption,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type ViewMode = 'grid' | 'list';

type JobCategoryResponse = {
  id: string;
  name: string;
};

const JOB_CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  construction: 'hammer-outline',
  carpentry: 'construct-outline',
  hvac: 'snow-outline',
  landscaping: 'leaf-outline',
  painting: 'color-palette-outline',
  roofing: 'home-outline',
  default: 'briefcase-outline',
};

// Fallback categories only used if API fails
const FALLBACK_JOB_CATEGORIES: Category[] = [
  { id: 'plumbing', name: 'Plumbing', icon: JOB_CATEGORY_ICON_MAP.plumbing },
  { id: 'electrical', name: 'Electrical', icon: JOB_CATEGORY_ICON_MAP.electrical },
  { id: 'construction', name: 'Construction', icon: JOB_CATEGORY_ICON_MAP.construction },
  { id: 'carpentry', name: 'Carpentry', icon: JOB_CATEGORY_ICON_MAP.carpentry },
  { id: 'hvac', name: 'HVAC', icon: JOB_CATEGORY_ICON_MAP.hvac },
  { id: 'landscaping', name: 'Landscaping', icon: JOB_CATEGORY_ICON_MAP.landscaping },
  { id: 'painting', name: 'Painting', icon: JOB_CATEGORY_ICON_MAP.painting },
  { id: 'roofing', name: 'Roofing', icon: JOB_CATEGORY_ICON_MAP.roofing },
];

// "All" category that's always included
const ALL_CATEGORY: Category = { id: 'all', name: 'All Jobs', icon: 'briefcase-outline' };

const JOB_SEARCH_TERMS = [
  'Plumber',
  'Electrician',
  'HVAC Technician',
  'Carpenter',
  'Construction Project Manager',
  'Painting Apprentice',
  'Solar Installer',
  'Roofing Inspector',
];

const JOBS_PER_PAGE = 20;

const toTitleCase = (value: string | undefined | null) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

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
  });
};

const mapApiCategories = (apiCategories?: JobCategoryResponse[]): Category[] => {
  if (!apiCategories || apiCategories.length === 0) {
    return [ALL_CATEGORY, ...FALLBACK_JOB_CATEGORIES];
  }

  const mappedCategories = apiCategories
    .map((category) => ({
      id: category.id,
      name: category.name,
      icon: JOB_CATEGORY_ICON_MAP[category.id] || JOB_CATEGORY_ICON_MAP.default,
    }))
    .filter((category) => category.id !== 'all');

  return [ALL_CATEGORY, ...mappedCategories];
};

export default function BrowseJobsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('all');
  const [jobViewMode, setJobViewMode] = useState<ViewMode>('list');
  const [jobRefreshing, setJobRefreshing] = useState(false);
  const [jobSort, setJobSort] = useState<SortOption>('newest');
  const [jobFilterSheetVisible, setJobFilterSheetVisible] = useState(false);
  const [jobCategories, setJobCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobRefreshTrigger, setJobRefreshTrigger] = useState(0);
  const [jobPage, setJobPage] = useState(1);
  const [jobHasMore, setJobHasMore] = useState(true);
  const [jobLoadingMore, setJobLoadingMore] = useState(false);
  const [accumulatedJobs, setAccumulatedJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<string>('Loading location...');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Load saved jobs on mount
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const savedJobs = await SecureStorage.getItem('saved_jobs');
        if (savedJobs) {
          const saved = JSON.parse(savedJobs) as string[];
          setSavedJobIds(new Set(saved));
        }
      } catch (err) {
        console.error('Error loading saved jobs:', err);
      }
    };
    loadSavedJobs();
  }, []);

  // Get current location for job board
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentLocation('Location unavailable');
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Reverse geocode to get city and state
        const reverseGeocode = await safeReverseGeocode(latitude, longitude);

        if (reverseGeocode && reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const city = address.city || address.district || address.subregion || '';
          const state = address.region || '';
          const locationText = city && state ? `${city}, ${state}` : city || state || 'Current Location';
          setCurrentLocation(`${locationText} · 15 mi radius`);
        } else {
          setCurrentLocation('Current Location · 15 mi radius');
        }
      } catch (error: any) {
        console.error('Error getting location:', error);
        setCurrentLocation('Location unavailable');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getCurrentLocation();
  }, []);

  const jobSearchSuggestions = useMemo(() => {
    if (!jobSearchQuery) {
      return [];
    }
    return JOB_SEARCH_TERMS.filter((term) =>
      term.toLowerCase().includes(jobSearchQuery.toLowerCase())
    ).slice(0, 5);
  }, [jobSearchQuery]);

  const jobFiltersActive = useMemo(() => {
    return (
      jobSearchQuery.length > 0 ||
      selectedJobCategory !== 'all' ||
      !!jobFilters.jobTypes?.length ||
      !!jobFilters.experienceLevel ||
      !!jobFilters.remote ||
      !!jobFilters.salaryMin ||
      !!jobFilters.salaryMax ||
      !!jobFilters.location ||
      !!jobFilters.companyName ||
      !!jobFilters.featured
    );
  }, [jobSearchQuery, selectedJobCategory, jobFilters]);

  const jobFilterParams = useMemo(
    () => {
      const params: Record<string, any> = {
        search: jobSearchQuery.trim() || undefined,
        category: selectedJobCategory === 'all' ? undefined : selectedJobCategory,
        sort: jobSort,
        limit: JOBS_PER_PAGE,
      };

      // Add filters from JobFilterSheet
      if (jobFilters.jobTypes?.length) {
        params.type = jobFilters.jobTypes;
      }
      if (jobFilters.experienceLevel) {
        params.experience = jobFilters.experienceLevel;
      }
      if (jobFilters.remote !== undefined) {
        params.remote = jobFilters.remote;
      }
      if (jobFilters.salaryMin !== undefined) {
        params.minSalary = jobFilters.salaryMin;
      }
      if (jobFilters.salaryMax !== undefined) {
        params.maxSalary = jobFilters.salaryMax;
      }
      if (jobFilters.location) {
        params.location = jobFilters.location;
      }
      if (jobFilters.radius) {
        params.radius = jobFilters.radius;
      }
      if (jobFilters.companyName) {
        params.company = jobFilters.companyName;
      }
      if (jobFilters.featured !== undefined) {
        params.featured = jobFilters.featured;
      }
      if (jobFilters.sortBy) {
        params.sortBy = jobFilters.sortBy;
      }

      return params;
    },
    [
      jobSearchQuery,
      selectedJobCategory,
      jobSort,
      jobFilters,
    ]
  );

  const jobFilterKey = useMemo(() => JSON.stringify(jobFilterParams), [jobFilterParams]);
  const previousJobFiltersKeyRef = React.useRef<string>('');

  // Reset accumulated jobs when filters change
  useEffect(() => {
    if (jobFilterKey !== previousJobFiltersKeyRef.current) {
      setAccumulatedJobs([]);
      setJobPage(1);
      setJobHasMore(true);
      setJobLoadingMore(false);
      previousJobFiltersKeyRef.current = jobFilterKey;
    }
  }, [jobFilterKey]);

  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      if (jobPage === 1) {
        setJobsLoading(true);
      } else {
        setJobLoadingMore(true);
      }
      setJobError(null);

      try {
        const data = await JobBoardService.getJobs({
          ...jobFilterParams,
          page: jobPage,
          limit: JOBS_PER_PAGE,
        });
        if (!isMounted) {
          return;
        }

        if (jobPage === 1) {
          // First page - replace
          setAccumulatedJobs(data);
        } else {
          // Subsequent pages - append and deduplicate
          setAccumulatedJobs((prev) => {
            const existingIds = new Set(prev.map((j) => j.id));
            const newJobs = data.filter((j) => !existingIds.has(j.id));

            if (newJobs.length === 0) {
              setJobHasMore(false);
              setJobLoadingMore(false);
              return prev;
            }

            setJobLoadingMore(false);
            return [...prev, ...newJobs];
          });
        }

        // Update hasMore based on returned data
        if (data.length < JOBS_PER_PAGE) {
          setJobHasMore(false);
        } else {
          setJobHasMore(true);
        }
      } catch (error: any) {
        if (!isMounted) {
          return;
        }
        setJobError(error?.message || 'Unable to load job listings.');
        setJobHasMore(false);
      } finally {
        if (!isMounted) {
          return;
        }
        setJobsLoading(false);
        setJobLoadingMore(false);
        setJobRefreshing(false);
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [jobFilterKey, jobPage, jobRefreshTrigger, jobFilterParams]);

  // Fetch job categories from API
  useEffect(() => {
    let isMounted = true;

    JobBoardService.getCategories()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const mappedCategories = mapApiCategories(data);
        setJobCategories(mappedCategories);
      })
      .catch((error) => {
        console.error('Error fetching job categories:', error);
        if (!isMounted) {
          return;
        }
        // Fallback to default categories if API fails
        setJobCategories([ALL_CATEGORY, ...FALLBACK_JOB_CATEGORIES]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedJobs = useMemo(() => {
    const sorted = [...accumulatedJobs];

    switch (jobSort) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.salary?.min ?? 0) - (b.salary?.min ?? 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.salary?.max ?? 0) - (a.salary?.max ?? 0));
      case 'distance':
        return sorted.sort((a, b) => {
          const aNear = a.nearby ? 1 : 0;
          const bNear = b.nearby ? 1 : 0;
          return bNear - aNear;
        });
      case 'rating':
        return sorted.sort((a, b) => {
          const aFeatured = a.featured ? 1 : 0;
          const bFeatured = b.featured ? 1 : 0;
          return bFeatured - aFeatured;
        });
      case 'newest':
      default:
        return sorted.sort(
          (a, b) =>
            (new Date(b.postedAt || '').getTime() || 0) -
            (new Date(a.postedAt || '').getTime() || 0)
        );
    }
  }, [accumulatedJobs, jobSort]);

  const featuredJobs = useMemo(
    () => sortedJobs.filter((job) => job.featured).slice(0, 5),
    [sortedJobs]
  );

  const recentJobs = useMemo(
    () =>
      [...sortedJobs]
        .sort(
          (a, b) =>
            (new Date(b.postedAt || '').getTime() || 0) -
            (new Date(a.postedAt || '').getTime() || 0)
        )
        .slice(0, 5),
    [sortedJobs]
  );

  const nearbyJobs = useMemo(
    () =>
      sortedJobs
        .filter(
          (job) =>
            job.nearby ||
            job.location?.toLowerCase().includes('austin') ||
            job.location?.toLowerCase().includes('round rock')
        )
        .slice(0, 5),
    [sortedJobs]
  );

  const handleJobPress = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  }, [router]);

  const handleJobRefresh = useCallback(() => {
    setJobRefreshing(true);
    setAccumulatedJobs([]);
    setJobPage(1);
    setJobHasMore(true);
    setJobLoadingMore(false);
    setJobRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleJobLoadMore = useCallback(() => {
    if (!jobsLoading && !jobLoadingMore && jobHasMore && accumulatedJobs.length > 0) {
      setJobLoadingMore(true);
      setJobPage((prev) => prev + 1);
    }
  }, [jobsLoading, jobLoadingMore, jobHasMore, accumulatedJobs.length]);

  const handleSaveJob = useCallback(async (jobId: string, isSaved: boolean) => {
    try {
      const saved = Array.from(savedJobIds);
      let updated: string[];

      if (isSaved) {
        updated = saved.filter((id) => id !== jobId);
      } else {
        updated = [...saved, jobId];
      }

      await SecureStorage.setItem('saved_jobs', JSON.stringify(updated));
      setSavedJobIds(new Set(updated));
    } catch (err) {
      Alert.alert('Error', 'Failed to save job');
      console.error('Error saving job:', err);
    }
  }, [savedJobIds]);

  const handleQuickApply = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  }, [router]);

  const handleJobFilterApply = useCallback((filters: JobFilters) => {
    setJobFilters(filters);
    setJobFilterSheetVisible(false);
  }, []);

  const handleJobFilterReset = useCallback(() => {
    setJobFilters({});
    setSelectedJobCategory('all');
    setJobSearchQuery('');
  }, []);

  const renderJobCard = useCallback(
    ({ item }: { item: Job }) => {
      const salaryLabel = formatSalaryRange(item.salary);
      const postedAgo = getRelativeTime(item.postedAt);
      const isSaved = savedJobIds.has(item.id);

      const jobCardContent = (
        <View
          style={[
            styles.jobCard,
            jobViewMode === 'grid' ? styles.jobCardGrid : styles.jobCardList,
          ]}
        >
          <View style={styles.jobCardContent}>
            <View style={styles.jobCardHeader}>
              <Text style={styles.jobCardTitle}>{item.title}</Text>
              {item.featured && (
                <View style={styles.jobBadge}>
                  <Text style={styles.jobBadgeText}>Featured</Text>
                </View>
              )}
            </View>
            <Text style={[styles.jobCompany, { color: colors.text.secondary }]} numberOfLines={1}>
              {typeof item.company === 'string' ? item.company : (item.company as any)?.name || 'Company'}
            </Text>
            <View style={styles.jobMetaRow}>
              <View key={`job-tag-type-${item.id}`} style={styles.jobTag}>
                <Text style={styles.jobTagText}>{toTitleCase(item.type)}</Text>
              </View>
              {item.experienceLevel && (
                <View key={`job-tag-exp-${item.id}`} style={styles.jobTag}>
                  <Text style={styles.jobTagText}>{`${toTitleCase(item.experienceLevel)} level`}</Text>
                </View>
              )}
            </View>
            <View style={styles.jobMetaRow}>
              <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
              <Text style={[styles.jobLocationText, { color: colors.text.tertiary }]} numberOfLines={1}>
                {item.location}
              </Text>
              {item.remote && (
                <View key={`job-tag-remote-${item.id}`} style={[styles.jobTag, styles.jobRemoteTag]}>
                  <Ionicons name="wifi-outline" size={12} color={colors.primary[600]} />
                  <Text style={[styles.jobTagText, { color: colors.primary[600], marginLeft: 2 }]}>Remote</Text>
                </View>
              )}
            </View>
            <View style={styles.jobCardFooter}>
              <View style={styles.jobSalaryRow}>
                <View style={styles.jobSalaryContainer}>
                  <Ionicons name="cash-outline" size={14} color={colors.primary[600]} />
                  <Text style={[styles.jobSalaryText, { color: colors.primary[600] }]} numberOfLines={1}>
                    {salaryLabel}
                  </Text>
                </View>
                <View style={styles.jobPostedContainer}>
                  <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                  <Text style={[styles.jobPostedText, { color: colors.text.tertiary }]}>{postedAgo}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );

      return (
        <SwipeableJobCard
          job={item}
          onPress={handleJobPress}
          onSave={handleSaveJob}
          onQuickApply={handleQuickApply}
          isSaved={isSaved}
          viewMode={jobViewMode}
        >
          {jobCardContent}
        </SwipeableJobCard>
      );
    },
    [colors, handleJobPress, jobViewMode, savedJobIds, handleSaveJob, handleQuickApply]
  );

  const renderHorizontalJobList = useCallback(
    (jobsToShow: Job[], listKey?: string) => (
      <View key={listKey || `jobList-${jobsToShow.length}`}>
        <FlatList
          data={jobsToShow}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightListContent}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.highlightCard, { backgroundColor: colors.background.primary }]}
              onPress={() => handleJobPress(item.id)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.highlightJobTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.highlightJobCompany}>
                {typeof item.company === 'string' ? item.company : (item.company as any)?.name || 'Company'}
              </Text>
              <Text style={styles.highlightJobLocation}>{item.location}</Text>
              <Text style={styles.highlightJobSalary}>{formatSalaryRange(item.salary)}</Text>
              <View style={styles.highlightTagsRow}>
                <View key={`tag-type-${item.id}`} style={styles.highlightTag}>
                  <Text style={styles.highlightTagText}>{toTitleCase(item.type)}</Text>
                </View>
                {item.remote && (
                  <View key={`tag-remote-${item.id}`} style={[styles.highlightTag, styles.highlightTagSecondary]}>
                    <Text style={styles.highlightTagText}>Remote</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    ),
    [colors.background.primary, handleJobPress]
  );

  // Render section header
  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.select({ ios: ['bottom'], android: ['bottom', 'top'] })}
    >
      <FlatList
        key={jobViewMode}
        data={sortedJobs}
        numColumns={jobViewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderJobCard}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        ListHeaderComponent={
          <View key="job-board-header-wrapper" style={styles.jobBoardHeaderWrapper}>
            <View key="job-board-header" style={[styles.header, styles.jobBoardHeader]}>
              <View>
                <Text style={styles.title}>Browse Jobs</Text>
                <Text style={styles.subtitle}>Find work tailored to your skills</Text>
              </View>
            </View>

            <View key="search-section" style={styles.searchSection}>
              <SearchInput
                value={jobSearchQuery}
                onChangeText={setJobSearchQuery}
                placeholder="Search jobs, companies, locations..."
                suggestions={jobSearchSuggestions}
                onSuggestionSelect={setJobSearchQuery}
                showFilterButton={true}
                onFilterPress={() => setJobFilterSheetVisible(true)}
              />
              {jobFiltersActive && (
                <TouchableOpacity
                  key="clear-filters-button"
                  style={styles.activeFiltersBadge}
                  onPress={handleJobFilterReset}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="close-circle" size={14} color={colors.primary[600]} />
                  <Text style={styles.activeFiltersText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>

            <JobFilterSheet
              key="job-filter-sheet"
              visible={jobFilterSheetVisible}
              filters={jobFilters}
              onApply={handleJobFilterApply}
              onClose={() => setJobFilterSheetVisible(false)}
              categories={jobCategories.map((c) => ({ id: c.id, name: c.name }))}
            />

            <CategoryFilter
              key="category-filter"
              categories={jobCategories}
              selectedCategory={selectedJobCategory}
              onCategorySelect={setSelectedJobCategory}
            />

            {/* Active Filter Chips */}
            {(jobFilters.jobTypes?.length ||
              jobFilters.experienceLevel ||
              jobFilters.remote ||
              jobFilters.location ||
              jobFilters.companyName) && (
              <View key="filter-chips-row" style={styles.jobFilterChipsRow}>
                {jobFilters.jobTypes?.map((type) => (
                  <TouchableOpacity
                    key={`jobType-${type}`}
                    style={[
                      styles.jobFilterChip,
                      styles.activeFilterChip,
                      { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                    ]}
                    onPress={() => {
                      const newTypes = jobFilters.jobTypes?.filter((t) => t !== type);
                      setJobFilters({
                        ...jobFilters,
                        jobTypes: newTypes && newTypes.length > 0 ? newTypes : undefined,
                      });
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Text style={[styles.jobFilterChipText, { color: colors.primary[600] }]}>
                      {toTitleCase(type)}
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                ))}
                {jobFilters.experienceLevel && (
                  <TouchableOpacity
                    key="experienceLevel"
                    style={[
                      styles.jobFilterChip,
                      styles.activeFilterChip,
                      { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                    ]}
                    onPress={() => {
                      setJobFilters({ ...jobFilters, experienceLevel: undefined });
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Text style={[styles.jobFilterChipText, { color: colors.primary[600] }]}>
                      {toTitleCase(jobFilters.experienceLevel)}
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                )}
                {jobFilters.remote && (
                  <TouchableOpacity
                    key="remote"
                    style={[
                      styles.jobFilterChip,
                      styles.activeFilterChip,
                      { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                    ]}
                    onPress={() => {
                      setJobFilters({ ...jobFilters, remote: undefined });
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Text style={[styles.jobFilterChipText, { color: colors.primary[600] }]}>
                      Remote
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                )}
                {jobFilters.location && (
                  <TouchableOpacity
                    key="location"
                    style={[
                      styles.jobFilterChip,
                      styles.activeFilterChip,
                      { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                    ]}
                    onPress={() => {
                      setJobFilters({ ...jobFilters, location: undefined });
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons name="location" size={12} color={colors.primary[600]} />
                    <Text style={[styles.jobFilterChipText, { color: colors.primary[600] }]}>
                      {jobFilters.location}
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                )}
                {jobFilters.companyName && (
                  <TouchableOpacity
                    key="companyName"
                    style={[
                      styles.jobFilterChip,
                      styles.activeFilterChip,
                      { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                    ]}
                    onPress={() => {
                      setJobFilters({ ...jobFilters, companyName: undefined });
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Text style={[styles.jobFilterChipText, { color: colors.primary[600] }]}>
                      {jobFilters.companyName}
                    </Text>
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Sort and View Mode */}
            <View key="view-mode-container" style={styles.viewModeContainer}>
              <View style={styles.sortContainer}>
                <SortDropdown selectedSort={jobSort} onSortChange={setJobSort} />
              </View>
              <View style={styles.viewModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.viewModeButton,
                    jobViewMode === 'grid' && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setJobViewMode('grid')}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color={jobViewMode === 'grid' ? Colors.text.inverse : colors.text.secondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.viewModeButton,
                    jobViewMode === 'list' && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setJobViewMode('list')}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons
                    name="list-outline"
                    size={18}
                    color={jobViewMode === 'list' ? Colors.text.inverse : colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View key="job-location-row" style={styles.jobLocationRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary[600]} />
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={colors.primary[600]} style={{ marginLeft: Spacing.xs }} />
              ) : (
                <Text style={[styles.subtitle, { marginLeft: Spacing.xs }]}>
                  {currentLocation}
                </Text>
              )}
            </View>

            {featuredJobs.length > 0 && (
              <View key="featured-jobs-section" style={styles.section}>
                {renderSectionHeader('Featured Jobs', 'Top-rated roles')}
                {renderHorizontalJobList(featuredJobs, 'featured-jobs')}
              </View>
            )}

            {recentJobs.length > 0 && (
              <View key="recent-jobs-section" style={styles.section}>
                {renderSectionHeader('Recent Jobs', 'New listings')}
                {renderHorizontalJobList(recentJobs, 'recent-jobs')}
              </View>
            )}

            {nearbyJobs.length > 0 && (
              <View key="nearby-jobs-section" style={styles.section}>
                {renderSectionHeader('Nearby Jobs', 'Opportunities near you')}
                {renderHorizontalJobList(nearbyJobs, 'nearby-jobs')}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          jobsLoading ? (
            <LoadingSkeleton viewMode={jobViewMode} count={6} />
          ) : jobError ? (
            <EmptyState
              icon="warning-outline"
              title="Unable to load jobs"
              subtitle={jobError}
            />
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="No jobs found"
              subtitle="Adjust your search or filters to discover opportunities"
            />
          )
        }
        ListFooterComponent={
          jobLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
          ) : !jobsLoading && sortedJobs.length > 0 && !jobHasMore ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.jobFooterText}>End of results</Text>
            </View>
          ) : null
        }
        onEndReached={handleJobLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={jobRefreshing} onRefresh={handleJobRefresh} />
        }
        contentContainerStyle={[styles.listContent, { paddingTop: Spacing.lg }]}
        columnWrapperStyle={jobViewMode === 'grid' ? styles.gridRow : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.select({ ios: Spacing.md, android: Spacing.sm }),
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
  searchSection: {
    position: 'relative',
  },
  activeFiltersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    marginLeft: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 4, android: 6 }),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.primary[200],
    gap: Spacing.xs,
  },
  activeFiltersText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 16,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sortContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: 2,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  viewModeButton: {
    width: Platform.select({ ios: 36, android: 40 }),
    height: Platform.select({ ios: 36, android: 40 }),
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobBoardHeaderWrapper: {
    paddingBottom: Spacing.md,
  },
  jobBoardHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  jobFilterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  jobFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  jobFilterChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  jobCard: {
    margin: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    overflow: 'hidden',
    ...Shadows.sm,
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
  },
  jobCardGrid: {
    flex: 1,
  },
  jobCardList: {
    marginHorizontal: Spacing.lg,
  },
  jobCardContent: {
    padding: Spacing.md,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    flex: 1,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCompany: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  jobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  jobTagText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobRemoteTag: {
    borderColor: Colors.primary[200],
    backgroundColor: Colors.primary[50],
  },
  jobLocationText: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobSalaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  jobSalaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  jobSalaryText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  jobPostedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobPostedText: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobCardFooter: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  jobBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  jobBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  highlightListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  highlightCard: {
    width: 220,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
  },
  highlightJobTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  highlightJobCompany: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  highlightJobLocation: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  highlightJobSalary: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  highlightTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  highlightTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  highlightTagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  highlightTagSecondary: {
    borderColor: Colors.primary[200],
    backgroundColor: Colors.primary[50],
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  loadingFooter: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  jobFooterText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

