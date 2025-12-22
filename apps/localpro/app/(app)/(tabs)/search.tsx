import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { useServices } from '@localpro/marketplace';
import { SecureStorage } from '@localpro/storage';
import type { Job, Service } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
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
  FilterSheet,
  LoadingSkeleton,
  NaturalLanguageSearch,
  SearchHistory,
  SearchInput,
  ServiceCard,
  type Category,
  type FilterState
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

// Mock categories - replace with actual API call
const MARKETPLACE_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', icon: 'apps-outline' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
  { id: 'landscaping', name: 'Landscaping', icon: 'leaf-outline' },
  { id: 'painting', name: 'Painting', icon: 'brush-outline' },
  { id: 'handyman', name: 'Handyman', icon: 'construct-outline' },
];

const POPULAR_SEARCHES_MARKETPLACE = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Landscaping',
  'Handyman',
  'Painting',
];

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

export default function SearchScreen() {
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    sort: 'newest',
  });

  // Search history (stored in state, should be persisted)
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [useAISearch, setUseAISearch] = useState(false);

  // Job-specific state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<{ id: string; name: string }[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [jobViewMode, setJobViewMode] = useState<'grid' | 'list'>('list');

  // Fetch services with filters
  const { services, loading } = useServices({
    search: searchQuery || undefined,
    category: filters.categories.length > 0 ? filters.categories : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    sort: filters.sort,
  });

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    let result = services;

    if (searchQuery) {
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.providerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter
    result = result.filter(
      (service) => service.price >= filters.minPrice && service.price <= filters.maxPrice
    );

    // Apply rating filter
    if (filters.minRating > 0) {
      result = result.filter(
        (service) => service.rating && service.rating >= filters.minRating
      );
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [services, searchQuery, filters]);

  // Load job categories
  useEffect(() => {
    if (activePackage === 'job-board') {
      const loadCategories = async () => {
        try {
          const categories = await JobBoardService.getCategories();
          setJobCategories(categories);
        } catch (err) {
          console.error('Error loading job categories:', err);
        }
      };
      loadCategories();
    }
  }, [activePackage]);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await SecureStorage.getItem(
          activePackage === 'job-board' ? 'job_search_history' : 'search_history'
        );
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (err) {
        console.error('Error loading search history:', err);
      }
    };
    loadSearchHistory();
  }, [activePackage]);

  // Fetch jobs when search query or filters change
  useEffect(() => {
    if (activePackage === 'job-board') {
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
    }
  }, [activePackage, searchQuery, jobFilters]);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const popularSearches =
        activePackage === 'job-board' ? POPULAR_SEARCHES_JOBS : POPULAR_SEARCHES_MARKETPLACE;
      const matches = popularSearches.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, activePackage]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const updated = [query.trim(), ...searchHistory].slice(0, 10);
        setSearchHistory(updated);
        try {
          await SecureStorage.setItem(
            activePackage === 'job-board' ? 'job_search_history' : 'search_history',
            JSON.stringify(updated)
          );
        } catch (err) {
          console.error('Error saving search history:', err);
        }
      }
    },
    [searchHistory, activePackage]
  );

  const handleSearchSelect = (query: string) => {
    handleSearch(query);
  };

  const handleClearHistory = async () => {
    setSearchHistory([]);
    try {
      await SecureStorage.removeItem(
        activePackage === 'job-board' ? 'job_search_history' : 'search_history'
      );
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  };

  const handleJobFilterApply = (filters: JobFilters) => {
    setJobFilters(filters);
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  };

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleServicePress = (serviceId: string) => {
    router.push(`/(stack)/service/${serviceId}` as any);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderServiceCard = ({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      viewMode={viewMode}
      onPress={handleServicePress}
    />
  );

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000 ||
    filters.minRating > 0 ||
    filters.sort !== 'newest';

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

  // Job Board specific search UI
  if (activePackage === 'job-board') {
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

  // If not marketplace package, show default search
  if (activePackage !== 'marketplace') {
    const getSearchConfig = () => {
      switch (activePackage) {
        case 'supplies':
          return {
            placeholder: 'Search supplies, products...',
            emptyMessage: 'No products found',
            emptySubtext: 'Try adjusting your search or filters',
          };
        case 'rentals':
          return {
            placeholder: 'Search rentals, properties...',
            emptyMessage: 'No rentals found',
            emptySubtext: 'Try adjusting your search or filters',
          };
        default:
          return {
            placeholder: 'Search...',
            emptyMessage: 'No results found',
            emptySubtext: 'Try adjusting your search or filters',
          };
      }
    };

    const config = getSearchConfig();

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Search</Text>
            </View>
            <SearchInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder={config.placeholder}
            />
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="search-outline"
                title={config.emptyMessage}
                subtitle={config.emptySubtext}
              />
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Marketplace-specific search UI
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={handleFilterApply}
        categories={MARKETPLACE_CATEGORIES}
        initialFilters={filters}
        minPrice={0}
        maxPrice={1000}
      />
      
      <FlatList
        data={filteredServices}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search Services</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <View style={styles.searchModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.searchModeButton,
                    !useAISearch && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setUseAISearch(false)}
                >
                  <Text
                    style={[
                      styles.searchModeText,
                      !useAISearch && { color: Colors.text.inverse },
                    ]}
                  >
                    Standard
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.searchModeButton,
                    useAISearch && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setUseAISearch(true)}
                >
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color={useAISearch ? Colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.searchModeText,
                      useAISearch && { color: Colors.text.inverse },
                    ]}
                  >
                    AI Search
                  </Text>
                </TouchableOpacity>
              </View>

              {useAISearch ? (
                <NaturalLanguageSearch
                  onServiceSelect={(service) => handleServicePress(service.id)}
                />
              ) : (
                <View style={styles.searchInputWrapper}>
                  <SearchInput
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder="Search services, providers..."
                    showFilterButton={true}
                    onFilterPress={() => setFilterSheetVisible(true)}
                  />
                </View>
              )}
              
              {/* Filter Badge */}
              {hasActiveFilters && (
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
            {filteredServices.length > 0 && (
              <View style={styles.viewModeContainer}>
                <Text style={styles.resultsCount}>
                  {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                </Text>
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === 'grid' && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setViewMode('grid')}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={18}
                      color={viewMode === 'grid' ? Colors.text.inverse : colors.text.secondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === 'list' && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setViewMode('list')}
                  >
                    <Ionicons
                      name="list-outline"
                      size={18}
                      color={viewMode === 'list' ? Colors.text.inverse : colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSkeleton viewMode={viewMode} count={6} />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No services found"
              subtitle="Try adjusting your search or filters"
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
      />
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
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    margin: Spacing.xs,
  },
  popularSearchText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
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
  emptyCard: {
    marginTop: Spacing.xl,
  },
  searchModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: 2,
    marginBottom: Spacing.md,
    gap: 2,
  },
  searchModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  searchModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
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
