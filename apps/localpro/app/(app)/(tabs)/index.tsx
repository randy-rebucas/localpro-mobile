import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { useCategories, useMyServices, useServices } from '@localpro/marketplace';
import type { Job, Service, ServiceCategory } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CategoryFilter,
  EmptyState,
  FilterSheet,
  LoadingSkeleton,
  SearchInput,
  ServiceCard,
  SortDropdown,
  type Category,
  type FilterState
} from '../../../components/marketplace';
import PackageSelectionModal from '../../../components/PackageSelectionModal';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { PackageType, usePackageContext } from '../../../contexts/PackageContext';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

type ViewMode = 'grid' | 'list';

export default function HomeScreen() {
  const { activePackage, setActivePackage } = usePackageContext();
  const { activeRole } = useRoleContext();
  const router = useRouter();
  const colors = useThemeColors();
  const [showPackageModal, setShowPackageModal] = useState(false);
  
  // Marketplace-specific state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    location: undefined,
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    sort: 'newest',
    groupByCategory: false,
  });
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [accumulatedServices, setAccumulatedServices] = useState<Service[]>([]);
  const previousFiltersKeyRef = React.useRef<string>('');

  // Fetch my services if provider role
  const { services: myServices } = useMyServices();
  
  // Fetch my jobs if provider/admin role
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    const fetchMyJobs = async () => {
      if (activeRole === 'provider' || activeRole === 'admin') {
        try {
          setMyJobsLoading(true);
          const jobs = await JobBoardService.getMyJobs({ limit: 5 });
          setMyJobs(jobs);
        } catch (err) {
          console.error('Error fetching my jobs:', err);
        } finally {
          setMyJobsLoading(false);
        }
      }
    };
    fetchMyJobs();
  }, [activeRole]);


  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matches = POPULAR_SEARCHES.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchSuggestions(matches.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Memoize sort params to prevent unnecessary recalculations
  const sortParams = useMemo(() => {
    const sortMapping: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
      'newest': { sortBy: 'createdAt', sortOrder: 'desc' },
      'price-asc': { sortBy: 'pricing.basePrice', sortOrder: 'asc' },
      'price-desc': { sortBy: 'pricing.basePrice', sortOrder: 'desc' },
      'rating': { sortBy: 'rating.average', sortOrder: 'desc' },
    };
    return sortMapping[filters.sort] || { sortBy: 'createdAt', sortOrder: 'desc' };
  }, [filters.sort]);

  // Memoize filters object (without page) to detect filter changes
  const baseFilters = useMemo(() => ({
    category: filters.categories.length > 0 ? filters.categories : (selectedCategory === 'all' ? undefined : selectedCategory),
    subcategory: filters.subcategories,
    location: filters.location,
    search: searchQuery || undefined,
    minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
    rating: filters.minRating > 0 ? filters.minRating : undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
    radius: filters.radius ? filters.radius * 1000 : undefined, // Convert km to meters
    latitude: filters.latitude,
    longitude: filters.longitude,
    groupByCategory: filters.groupByCategory,
  }), [
    filters.categories,
    selectedCategory,
    filters.subcategories,
    filters.location,
    searchQuery,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    sortParams.sortBy,
    sortParams.sortOrder,
    filters.radius,
    filters.latitude,
    filters.longitude,
    filters.groupByCategory,
  ]);

  // Create a key for base filters to detect when they change
  const filtersKey = useMemo(() => JSON.stringify(baseFilters), [baseFilters]);

  // Reset accumulated services when filters change (not page)
  useEffect(() => {
    if (filtersKey !== previousFiltersKeyRef.current) {
      setAccumulatedServices([]);
      setPage(1);
      setHasMore(true);
      setLoadingMore(false);
      currentPageRef.current = 1;
      previousFiltersKeyRef.current = filtersKey;
    }
  }, [filtersKey]);

  // Service filters with current page
  const serviceFilters = useMemo(() => ({
    ...baseFilters,
    page,
  }), [baseFilters, page]);

  // Fetch services with all filters
  const { services, loading } = useServices(serviceFilters);

  // Track previous services to detect actual changes
  const previousServicesRef = React.useRef<Service[]>([]);
  const currentPageRef = React.useRef(1);
  const isInitialLoadRef = React.useRef(true);

  // Accumulate services across pages
  useEffect(() => {
    // Skip if services haven't actually changed (same reference or same content)
    const servicesChanged = 
      previousServicesRef.current.length !== services.length ||
      services.some((s, i) => previousServicesRef.current[i]?.id !== s.id);

    if (!servicesChanged && !isInitialLoadRef.current) {
      return;
    }

    isInitialLoadRef.current = false;

    if (services.length === 0) {
      if (page === 1) {
        // No services on first page
        setAccumulatedServices([]);
        setHasMore(false);
      } else {
        // No more services on subsequent pages
        setHasMore(false);
      }
      setLoadingMore(false);
      previousServicesRef.current = services;
      return;
    }

    if (page === 1) {
      // First page or filter change - replace
      setAccumulatedServices(services);
      currentPageRef.current = 1;
    } else if (page > currentPageRef.current) {
      // New page loaded - append and deduplicate
      setAccumulatedServices(prev => {
        // Only update if we actually have new services
        const existingIds = new Set(prev.map(s => s.id));
        const newServices = services.filter(s => !existingIds.has(s.id));
        
        if (newServices.length === 0) {
          // No new services means we've reached the end
          setHasMore(false);
          setLoadingMore(false);
          return prev; // Return previous to prevent unnecessary re-render
        }
        
        setLoadingMore(false);
        return [...prev, ...newServices];
      });
      currentPageRef.current = page;
    } else {
      // Same page, just update loading state
      setLoadingMore(false);
    }
    
    // Update hasMore based on returned data
    // If we got fewer items than expected, likely no more pages
    if (services.length < 20) { // Assuming 20 items per page
      setHasMore(false);
    }
    
    previousServicesRef.current = services;
  }, [services, page]);

  // Fetch categories from API
  const { categories: apiCategories } = useCategories();

  // Detect if a package is selected and show modal if not
  useEffect(() => {
    if (!activePackage) {
      setShowPackageModal(true);
    } else {
      setShowPackageModal(false);
    }
  }, [activePackage]);


  // Map emoji icons to Ionicons names
  const getIconName = (emoji?: string, categoryKey?: string): keyof typeof Ionicons.glyphMap => {
    // Map common emoji/icons to Ionicons
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      '🧹': 'sparkles-outline', // cleaning
      '🔧': 'construct-outline', // plumbing
      '⚡': 'flash-outline', // electrical
      '📦': 'cube-outline', // moving
      '🌳': 'leaf-outline', // landscaping
      '🎨': 'brush-outline', // painting
      '🪵': 'hammer-outline', // carpentry
      '🏠': 'home-outline', // flooring
      '🏡': 'home-outline', // roofing
      '❄️': 'snow-outline', // HVAC / snow removal
      '🔌': 'flash-outline', // appliance repair
      '🔐': 'lock-closed-outline', // locksmith
      '🔨': 'construct-outline', // handyman
      '🚨': 'shield-outline', // home security
      '🏊': 'water-outline', // pool maintenance
      '🐛': 'bug-outline', // pest control
      '🧼': 'sparkles-outline', // carpet cleaning
      '🪟': 'square-outline', // window cleaning
      '🌧️': 'rainy-outline', // gutter cleaning
      '💦': 'water-outline', // power washing
      '📋': 'list-outline', // other
    };

    // Try emoji first, then category key, then default
    if (emoji && iconMap[emoji]) {
      return iconMap[emoji];
    }

    // Fallback to category key mapping
    const keyMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'cleaning': 'sparkles-outline',
      'plumbing': 'water-outline',
      'electrical': 'flash-outline',
      'moving': 'cube-outline',
      'landscaping': 'leaf-outline',
      'painting': 'brush-outline',
      'carpentry': 'hammer-outline',
      'flooring': 'home-outline',
      'roofing': 'home-outline',
      'hvac': 'snow-outline',
      'appliance_repair': 'flash-outline',
      'locksmith': 'lock-closed-outline',
      'handyman': 'construct-outline',
      'home_security': 'shield-outline',
      'pool_maintenance': 'water-outline',
      'pest_control': 'bug-outline',
      'carpet_cleaning': 'sparkles-outline',
      'window_cleaning': 'square-outline',
      'gutter_cleaning': 'rainy-outline',
      'power_washing': 'water-outline',
      'snow_removal': 'snow-outline',
      'other': 'list-outline',
    };

    if (categoryKey && keyMap[categoryKey]) {
      return keyMap[categoryKey];
    }

    // Default icon
    return 'apps-outline';
  };

  // Transform API categories to Category format
  const categories: Category[] = useMemo(() => {
    // Start with "All" category
    const allCategory: Category = { id: 'all', name: 'All', icon: 'apps-outline' };
    
    // Map API categories to Category format
    const mappedCategories = apiCategories
      .map((apiCategory: ServiceCategory) => ({
        id: apiCategory.id,
        name: apiCategory.name.replace(/\s+Services$/, ''), // Remove " Services" suffix
        icon: getIconName(apiCategory.icon, apiCategory.id),
      }))
      .sort((a, b) => {
        // Sort by displayOrder if available, otherwise alphabetically
        const categoryA = apiCategories.find(c => c.id === a.id);
        const categoryB = apiCategories.find(c => c.id === b.id);
        const orderA = categoryA?.displayOrder ?? 999;
        const orderB = categoryB?.displayOrder ?? 999;
        return orderA - orderB;
      });

    return [allCategory, ...mappedCategories];
  }, [apiCategories]);

  const POPULAR_SEARCHES = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Landscaping',
    'Handyman',
    'Painting',
    'Carpentry',
    'HVAC',
    'Roofing',
    'Flooring',
  ];

  // Services are already filtered and sorted by the API
  // Only apply client-side filtering for UI-specific features
  const filteredServices = useMemo(() => {
    // Use accumulated services for smooth pagination
    return accumulatedServices;
  }, [accumulatedServices]);

  const featuredServices = useMemo(
    () => filteredServices.filter((s) => s.rating && s.rating >= 4.5).slice(0, 5),
    [filteredServices]
  );

  const popularServices = useMemo(
    () => filteredServices
      .filter((s) => s.reviewCount && s.reviewCount > 10)
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 5),
    [filteredServices]
  );

  const nearbyServices = useMemo(
    () => filteredServices.slice(0, 5), // TODO: Implement actual location-based filtering
    [filteredServices]
  );

  const handlePackageSelect = async (pkg: PackageType) => {
    await setActivePackage(pkg);
    setShowPackageModal(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setAccumulatedServices([]);
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);
    currentPageRef.current = 1;
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && accumulatedServices.length > 0) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [loading, loadingMore, hasMore, accumulatedServices.length]);

  const handleServicePress = useCallback((serviceId: string) => {
    router.push(`/(stack)/service/${serviceId}` as any);
  }, [router]);

  const handleProviderPress = useCallback((providerId: string) => {
    router.push(`/(stack)/provider/${providerId}` as any);
  }, [router]);

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
    setAccumulatedServices([]);
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);
    currentPageRef.current = 1;
  };

  // Helper functions for job display (used in My Jobs section)
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

  const handleJobPress = useCallback((jobId: string) => {
    router.push(`/(stack)/job/${jobId}` as any);
  }, [router]);

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

  const hasActiveFilters =
    filters.categories.length > 0 ||
    (filters.subcategories && filters.subcategories.length > 0) ||
    !!filters.location ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000 ||
    filters.minRating > 0 ||
    filters.sort !== 'newest' ||
    filters.radius !== undefined ||
    filters.latitude !== undefined ||
    filters.groupByCategory === true;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Render service card - memoized to prevent flickering during scroll
  const renderServiceCard = useCallback(({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      viewMode={viewMode}
      onPress={handleServicePress}
      onProviderPress={handleProviderPress}
    />
  ), [viewMode, handleServicePress, handleProviderPress]);

  // Render section header
  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  // Render horizontal service list
  const renderHorizontalServiceList = (services: Service[], listKey?: string) => (
    <View key={listKey || `serviceList-${services.length}`}>
      <FlatList
        horizontal
        data={services}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.horizontalServiceCard}
            onPress={() => handleServicePress(item.id)}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <View style={styles.horizontalServiceImageContainer}>
              {item.images && item.images.length > 0 ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.horizontalServiceImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.serviceImagePlaceholder, styles.horizontalServiceImage, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="image-outline" size={24} color={colors.primary[400]} />
                </View>
              )}
              {item.rating != null && item.rating > 0 && (
                <View style={styles.ratingBadgeSmall}>
                  <Ionicons name="star" size={10} color={colors.semantic.warning} />
                  <Text style={styles.ratingTextSmall}>
                    {typeof item.rating === 'number' ? item.rating.toFixed(1) : String(item.rating)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.horizontalServiceContent}>
              <Text style={styles.horizontalServiceTitle} numberOfLines={2}>
                {item.title || 'Untitled Service'}
              </Text>
              <Text style={styles.horizontalServicePrice}>
                {item.price != null ? formatCurrency(item.price) : 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />
    </View>
  );


  // Redirect to appropriate screen based on active package
  useEffect(() => {
    if (!activePackage) {
      return;
    }

    if (activePackage === 'marketplace') {
      // Stay on index for marketplace
      return;
    }

    // Map package types to their respective routes
    const packageRoutes: Record<string, string> = {
      'job-board': '/(app)/(tabs)/browse-jobs',
      'finance': '/(app)/(tabs)/wallet',
      'academy': '/(app)/(tabs)/courses',
      'referrals': '/(app)/(tabs)/refer',
      'agencies': '/(app)/(tabs)/browse-agencies',
      'supplies': '/(app)/(tabs)/shop',
      'rentals': '/(app)/(tabs)/browse-rentals',
      'ads': '/(app)/(tabs)/browse-ads',
      'facility-care': '/(app)/(tabs)/services-fc',
      'subscriptions': '/(app)/(tabs)/browse-subscriptions',
      'trust': '/(app)/(tabs)/verify',
      'communication': '/(app)/(tabs)/messages-comm',
      'partners': '/(app)/(tabs)/browse-partners',
      'search': '/(app)/(tabs)/global-search',
      'analytics': '/(app)/(tabs)/dashboard',
    };

    const route = packageRoutes[activePackage];
    if (route) {
      router.replace(route as any);
    }
  }, [activePackage, router]);

  // If not marketplace package, show loading or nothing (will redirect)
  if (activePackage !== 'marketplace') {
    return (
      <>
        <PackageSelectionModal
          visible={showPackageModal}
          onSelectPackage={handlePackageSelect}
        />
        <SafeAreaView 
          style={styles.container} 
          edges={Platform.select({ ios: ['bottom'], android: ['bottom', 'top'] })}
        >
          <View style={styles.content}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Marketplace-specific UI
  return (
    <>
      <PackageSelectionModal
        visible={showPackageModal}
        onSelectPackage={handlePackageSelect}
      />
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={handleFilterApply}
        categories={categories.filter((c) => c.id !== 'all')}
        initialFilters={filters}
        minPrice={0}
        maxPrice={1000}
      />
      <SafeAreaView 
        style={styles.container} 
        edges={Platform.select({ ios: ['bottom'], android: ['bottom', 'top'] })}
      >
        <FlatList
          key={viewMode}
          data={filteredServices}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          ListHeaderComponent={
            <View key="marketplace-header-wrapper" style={styles.marketplaceHeader}>
              {/* Header */}
              <View key="services-header" style={styles.header}>
                <View>
                  <Text style={styles.title}>Browse Services</Text>
                  <Text style={styles.subtitle}>Find and book services near you</Text>
                </View>
                <View style={styles.headerRight}>
                  {activeRole === 'provider' && (
                    <TouchableOpacity
                      key="create-service-button"
                      style={[styles.createServiceButton, { backgroundColor: colors.primary[600] }]}
                      onPress={() => router.push('/(stack)/service/create' as any)}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Ionicons name="add" size={20} color={Colors.text.inverse} />
                      <Text style={styles.createServiceText}>Create</Text>
                    </TouchableOpacity>
                  )}
                  {activeRole && (
                    <View key="role-badge" style={styles.roleBadge}>
                      <Ionicons name="briefcase-outline" size={14} color={colors.primary[600]} />
                      <Text style={styles.roleText}>{activeRole}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* My Services Section - Only for providers */}
              {activeRole === 'provider' && myServices.length > 0 && (
                <View key="my-services-section" style={styles.section}>
                  <View style={styles.myServicesHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>My Services</Text>
                      <Text style={styles.sectionSubtitle}>
                        {`${myServices.length} service${myServices.length !== 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => {
                        // TODO: Navigate to My Services screen
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                    </TouchableOpacity>
                  </View>
                  {renderHorizontalServiceList(myServices.slice(0, 5), 'my-services')}
                </View>
              )}

              {/* My Jobs Section - Only for providers and admins */}
              {(activeRole === 'provider' || activeRole === 'admin') && myJobs.length > 0 && (
                <View key="my-jobs-section" style={styles.section}>
                  <View style={styles.myServicesHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>My Jobs</Text>
                      <Text style={styles.sectionSubtitle}>
                        {`${myJobs.length} job${myJobs.length !== 1 ? 's' : ''} posted`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => {
                        router.push('/(stack)/jobs/my-jobs' as any);
                      }}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                    </TouchableOpacity>
                  </View>
                  {renderHorizontalJobList(myJobs.slice(0, 5), 'my-jobs')}
                </View>
              )}

              {/* Search Bar */}
              <View key="services-search-section" style={styles.searchSection}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search services..."
                  onFilterPress={() => setFilterSheetVisible(true)}
                  suggestions={searchSuggestions}
                  onSuggestionSelect={setSearchQuery}
                />
                {hasActiveFilters && (
                  <TouchableOpacity
                    key="services-filters-button"
                    style={styles.activeFiltersBadge}
                    onPress={() => setFilterSheetVisible(true)}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons name="filter" size={14} color={colors.primary[600]} />
                    <Text style={styles.activeFiltersText}>Filters</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter Chips */}
              <CategoryFilter
                key="services-category-filter"
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />

              {/* Sort and View Mode Toggle */}
              <View key="services-view-mode-container" style={styles.viewModeContainer}>
                <View style={styles.sortContainer}>
                  <SortDropdown
                    selectedSort={filters.sort}
                    onSortChange={(sort) => setFilters({ ...filters, sort })}
                  />
                </View>
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === 'grid' && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setViewMode('grid')}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
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
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons
                      name="list-outline"
                      size={18}
                      color={viewMode === 'list' ? Colors.text.inverse : colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Featured Services Section */}
              {featuredServices.length > 0 && (
                <View key="featured-services-section" style={styles.section}>
                  {renderSectionHeader('Featured Services', 'Top-rated services')}
                  {renderHorizontalServiceList(featuredServices, 'featured-services')}
                </View>
              )}

              {/* Popular Services Section */}
              {popularServices.length > 0 && (
                <View key="popular-services-section" style={styles.section}>
                  {renderSectionHeader('Popular Services', 'Most reviewed')}
                  {renderHorizontalServiceList(popularServices, 'popular-services')}
                </View>
              )}

              {/* Nearby Services Section */}
              {nearbyServices.length > 0 && (
                <View key="nearby-services-section" style={styles.section}>
                  {renderSectionHeader('Nearby Services', 'Services near you')}
                  {renderHorizontalServiceList(nearbyServices, 'nearby-services')}
                </View>
              )}

              {/* All Services Header */}
              <View key="all-services-header" style={styles.section}>
                {renderSectionHeader('All Services', `${filteredServices.length} services available`)}
              </View>
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
          ListFooterComponent={
            loadingMore && filteredServices.length > 0 ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          maintainVisibleContentPosition={
            filteredServices.length > 0
              ? {
                  minIndexForVisible: 0,
                }
              : undefined
          }
        />
      </SafeAreaView>
    </>
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 4, android: 6 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.primary[200],
  },
  roleText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 16,
    color: Colors.primary[600],
    marginLeft: 4,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  card: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickActionItem: {
    width: '33.33%',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  quickActionIcon: {
    width: Platform.select({ ios: 56, android: 56 }),
    height: Platform.select({ ios: 56, android: 56 }),
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  // Marketplace-specific styles
  marketplaceHeader: {
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    // marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Shadows.sm,
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  filterButton: {
    width: Platform.select({ ios: 44, android: 48 }),
    height: Platform.select({ ios: 44, android: 48 }),
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  viewModeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
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
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  horizontalListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  horizontalServiceCard: {
    width: 160,
    marginRight: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
  },
  horizontalServiceImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  horizontalServiceImage: {
    width: '100%',
    height: '100%',
  },
  horizontalServiceContent: {
    padding: Spacing.sm,
  },
  horizontalServiceTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 20,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  horizontalServicePrice: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 22,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  serviceCardGrid: {
    flex: 1,
    margin: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
  },
  serviceCardList: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  serviceCardListContent: {
    flexDirection: 'row',
  },
  serviceImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImageList: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray100,
  },
  serviceCardContent: {
    padding: Spacing.sm,
  },
  serviceCardListInfo: {
    flex: 1,
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  serviceProvider: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 24,
    color: Colors.primary[600],
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  serviceCardListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  serviceCardListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  ratingBadgeSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 16,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  ratingTextSmall: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 14,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  emptyStateSubtext: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  loadingFooter: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
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
  sortContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  createServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    minHeight: Platform.select({ ios: 36, android: 40 }),
  },
  createServiceText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 20,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  myServicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.semibold || 'System',
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
  jobRemoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  jobRemoteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
  },
  jobRemoteToggleActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  jobRemoteLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobHeaderCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
  },
  jobHeaderTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  jobStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  jobStatCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  jobStatValue: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  jobStatLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
    textAlign: 'center',
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
  jobDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
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
  jobApplyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[600],
  },
  jobApplyButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
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
  jobFooterText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});
