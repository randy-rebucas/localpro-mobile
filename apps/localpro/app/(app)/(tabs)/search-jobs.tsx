import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { SecureStorage } from '@localpro/storage';
import type { Job } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JobFilterSheet } from '../../../components/job-board';
import type { JobFilters } from '../../../components/job-board/JobFilterSheet';
import {
    EmptyState,
    SearchHistory,
    SearchInput,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

const POPULAR_SEARCHES_JOBS = [
  'Software Engineer',
  'Project Manager',
  'Marketing Manager',
  'Sales Representative',
  'Graphic Designer',
  'Accountant',
  'Customer Service',
  'Data Analyst',
];

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

export default function SearchJobsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  
  // Search history (stored in state, should be persisted)
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Job-specific state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<{ id: string; name: string }[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [jobViewMode, setJobViewMode] = useState<'grid' | 'list'>('list');

  // Load job categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await JobBoardService.getCategories();
        setJobCategories(categories);
      } catch (err) {
        console.error('Error loading job categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await SecureStorage.getItem('job_search_history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (err) {
        console.error('Error loading search history:', err);
      }
    };
    loadSearchHistory();
  }, []);

  // Fetch jobs when search query or filters change
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const searchFilters: Record<string, any> = { ...jobFilters };
        if (searchQuery) {
          const results = await JobBoardService.searchJobs(searchQuery, searchFilters);
          setJobs(results);
        } else {
          const results = await JobBoardService.getJobs(searchFilters);
          setJobs(results);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, [searchQuery, jobFilters]);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matches = POPULAR_SEARCHES_JOBS.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const updated = [query.trim(), ...searchHistory].slice(0, 10);
        setSearchHistory(updated);
        try {
          await SecureStorage.setItem('job_search_history', JSON.stringify(updated));
        } catch (err) {
          console.error('Error saving search history:', err);
        }
      }
    },
    [searchHistory]
  );

  const handleSearchSelect = (query: string) => {
    handleSearch(query);
  };

  const handleClearHistory = async () => {
    setSearchHistory([]);
    try {
      await SecureStorage.removeItem('job_search_history');
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  };

  const handleJobFilterApply = (filters: JobFilters) => {
    setJobFilters(filters);
  };

  const handleJobPress = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const hasActiveJobFilters =
    jobFilters.categoryId !== undefined ||
    (jobFilters.jobTypes && jobFilters.jobTypes.length > 0) ||
    jobFilters.experienceLevel !== undefined ||
    jobFilters.salaryMin !== undefined ||
    jobFilters.salaryMax !== undefined ||
    jobFilters.remote === true ||
    jobFilters.location !== undefined ||
    jobFilters.companyName !== undefined ||
    jobFilters.featured === true ||
    jobFilters.sortBy !== undefined;

  const renderJobCard = useCallback(
    ({ item }: { item: Job }) => {
      const salaryLabel = formatSalaryRange(item.salary);
      const postedAgo = getRelativeTime(item.postedAt);

      return (
        <TouchableOpacity
          style={[
            styles.jobCard,
            jobViewMode === 'grid' ? styles.jobCardGrid : styles.jobCardList,
            { backgroundColor: colors.background.primary },
          ]}
          onPress={() => handleJobPress(item.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <View style={styles.jobCardContent}>
            <View style={styles.jobCardHeader}>
              <Text style={styles.jobCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.featured && (
                <View style={[styles.featuredBadge, { backgroundColor: colors.primary[50] }]}>
                  <Text style={[styles.featuredBadgeText, { color: colors.primary[600] }]}>Featured</Text>
                </View>
              )}
            </View>
            <Text style={[styles.jobCompany, { color: colors.text.secondary }]} numberOfLines={1}>
              {item.company}
            </Text>
            <View style={styles.jobMetaRow}>
              <View style={styles.metaItem}>
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
            <View style={styles.jobMetaRow}>
              <View style={[styles.jobTag, { borderColor: colors.border.light }]}>
                <Text style={[styles.jobTagText, { color: colors.text.secondary }]}>
                  {toTitleCase(item.type)}
                </Text>
              </View>
              {item.experienceLevel && (
                <View style={[styles.jobTag, { borderColor: colors.border.light }]}>
                  <Text style={[styles.jobTagText, { color: colors.text.secondary }]}>
                    {toTitleCase(item.experienceLevel)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.jobFooter}>
              <Text style={[styles.salaryText, { color: colors.primary[600] }]} numberOfLines={1}>
                {salaryLabel}
              </Text>
              <Text style={[styles.postedText, { color: colors.text.tertiary }]}>{postedAgo}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [jobViewMode, colors, handleJobPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <JobFilterSheet
        visible={filterSheetVisible}
        filters={jobFilters}
        onApply={handleJobFilterApply}
        onClose={() => setFilterSheetVisible(false)}
        categories={jobCategories}
      />

      <FlatList
        data={jobs}
        key={jobViewMode}
        numColumns={jobViewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderJobCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search Jobs</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <View style={styles.searchInputWrapper}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search jobs, companies..."
                  showFilterButton={true}
                  onFilterPress={() => setFilterSheetVisible(true)}
                />
              </View>

              {/* Filter Badge */}
              {hasActiveJobFilters && (
                <TouchableOpacity
                  style={[styles.filterBadge, { backgroundColor: colors.primary[600] }]}
                  onPress={() => setFilterSheetVisible(true)}
                >
                  <Ionicons name="funnel" size={14} color={Colors.text.inverse} />
                  <Text style={styles.filterBadgeText}>Filters Active</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Search Suggestions */}
            {suggestions.length > 0 && !searchQuery.includes(suggestions[0]) && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions</Text>
                <View style={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => handleSearchSelect(suggestion)}
                    >
                      <Ionicons name="search-outline" size={14} color={colors.primary[600]} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Search History */}
            {!searchQuery && searchHistory.length > 0 && (
              <SearchHistory
                searches={searchHistory}
                onSearchSelect={handleSearchSelect}
                onClearHistory={handleClearHistory}
              />
            )}

            {/* View Mode Toggle */}
            {jobs.length > 0 && (
              <View style={styles.viewModeContainer}>
                <Text style={styles.resultsCount}>
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                </Text>
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      jobViewMode === 'grid' && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setJobViewMode('grid')}
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
                  >
                    <Ionicons
                      name="list-outline"
                      size={18}
                      color={jobViewMode === 'list' ? Colors.text.inverse : colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          jobsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Searching jobs...
              </Text>
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="No jobs found"
              subtitle="Try adjusting your search or filters"
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
  headerContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  searchSection: {
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    marginHorizontal: -Spacing.lg,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  suggestionsContainer: {
    marginBottom: Spacing.md,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: 2,
    gap: 2,
    ...Shadows.sm,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  jobCard: {
    margin: Spacing.xs,
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
    gap: Spacing.xs,
  },
  jobCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  featuredBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobCompany: {
    fontSize: 14,
    lineHeight: 20,
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
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  jobTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  jobTagText: {
    fontSize: 12,
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
  postedText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

