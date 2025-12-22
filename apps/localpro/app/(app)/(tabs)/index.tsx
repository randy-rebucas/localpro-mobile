import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { JobBoardService } from '@localpro/job-board';
import { useCategories, useMyServices, useServices } from '@localpro/marketplace';
import { SecureStorage } from '@localpro/storage';
import type { Job, Service, ServiceCategory } from '@localpro/types';
import { Card } from '@localpro/ui';
import { safeReverseGeocode } from '@localpro/utils/location';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
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
  FilterSheet,
  LoadingSkeleton,
  SearchInput,
  ServiceCard,
  SortDropdown,
  type Category,
  type FilterState,
  type SortOption,
} from '../../../components/marketplace';
import PackageSelectionModal from '../../../components/PackageSelectionModal';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { PackageType, usePackageContext } from '../../../contexts/PackageContext';
import { useRoleContext } from '../../../contexts/RoleContext';
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

// Reserved for future use
// const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'];
// const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
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

export default function HomeScreen() {
  const { user } = useAuthContext();
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
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('all');
  const [jobViewMode, setJobViewMode] = useState<ViewMode>('list');
  const [jobRefreshing, setJobRefreshing] = useState(false);
  const [jobSort, setJobSort] = useState<SortOption>('newest');
  const [jobFilterSheetVisible, setJobFilterSheetVisible] = useState(false);
  const [jobCategories, setJobCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  // const [jobs, setJobs] = useState<Job[]>([]); // Reserved for future use
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
    if (activePackage !== 'job-board') return;

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
  }, [activePackage]);

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
          setJobs(data);
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
    if (activePackage !== 'job-board') return;

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
  }, [activePackage]);

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

  const jobCount = accumulatedJobs.length;
  const jobRemoteCount = accumulatedJobs.filter((job) => job.remote).length;
  const jobNearbyCount = nearbyJobs.length;

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

  if (activePackage === 'job-board') {
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

                {accumulatedJobs.length > 0 && (
                  <Card key="job-header-card" style={styles.jobHeaderCard}>
                    <Text style={styles.jobHeaderTitle}>
                      {jobFiltersActive ? 'Filtered results' : 'Job board'} · {jobCount} {jobCount === 1 ? 'listing' : 'listings'}
                    </Text>
                    <View style={styles.jobStatsRow}>
                      <View key="stat-remote" style={styles.jobStatCard}>
                        <Ionicons name="wifi-outline" size={16} color={colors.primary[600]} />
                        <Text style={styles.jobStatValue}>{jobRemoteCount}</Text>
                        <Text style={styles.jobStatLabel}>Remote</Text>
                      </View>
                      <View key="stat-nearby" style={styles.jobStatCard}>
                        <Ionicons name="location" size={16} color={colors.secondary[600]} />
                        <Text style={styles.jobStatValue}>{jobNearbyCount}</Text>
                        <Text style={styles.jobStatLabel}>Nearby</Text>
                      </View>
                      <View key="stat-featured" style={styles.jobStatCard}>
                        <Ionicons name="star" size={16} color={colors.semantic.warning[600]} />
                        <Text style={styles.jobStatValue}>{featuredJobs.length}</Text>
                        <Text style={styles.jobStatLabel}>Featured</Text>
                      </View>
                    </View>
                  </Card>
                )}

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
      </>
    );
  }

  // If not marketplace package, show default dashboard
  if (activePackage !== 'marketplace') {
    const getPackageContent = () => ({
      title: `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`,
      subtitle: 'Your LocalPro Dashboard',
      quickActions: [
        { icon: 'search', label: 'Search', route: '/(app)/(tabs)/search' },
        { icon: 'calendar', label: 'Bookings', route: '/(app)/(tabs)/bookings' },
        { icon: 'person', label: 'Profile', route: '/(app)/(tabs)/profile' },
      ],
    });

    const content = getPackageContent();

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
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View key="job-board-content" style={styles.content}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>{content.title}</Text>
                  <Text style={styles.subtitle}>{content.subtitle}</Text>
                </View>
              </View>
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  {content.quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionItem}
                      onPress={() => router.push(action.route as any)}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons name={action.icon as any} size={24} color={colors.primary[600]} />
                      </View>
                      <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          </ScrollView>
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
