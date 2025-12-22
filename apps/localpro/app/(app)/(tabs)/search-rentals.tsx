import { Ionicons } from '@expo/vector-icons';
import type { Rental } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    EmptyState,
    LoadingSkeleton,
    SearchHistory,
    SearchInput,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

const POPULAR_SEARCHES_RENTALS = [
  'Power Tools',
  'Construction Equipment',
  'Vehicles',
  'Machinery',
  'Garden Tools',
  'Event Equipment',
  'Camera Gear',
  'Party Supplies',
];

const RENTAL_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps-outline' as const },
  { id: 'tools', name: 'Tools', icon: 'hammer-outline' as const },
  { id: 'vehicles', name: 'Vehicles', icon: 'car-outline' as const },
  { id: 'equipment', name: 'Equipment', icon: 'construct-outline' as const },
  { id: 'machinery', name: 'Machinery', icon: 'settings-outline' as const },
];

const formatPrice = (price: number, period: string, currency = 'USD') => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
  return `${formatted}/${period}`;
};

export default function SearchRentalsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Rentals state
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalsError, setRentalsError] = useState<string | null>(null);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const { SecureStorage } = await import('@localpro/storage');
        const history = await SecureStorage.getItem('rentals_search_history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (err) {
        console.error('Error loading search history:', err);
      }
    };
    loadSearchHistory();
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matches = POPULAR_SEARCHES_RENTALS.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Fetch rentals (mock for now - replace with actual API call)
  useEffect(() => {
    const fetchRentals = async () => {
      setRentalsLoading(true);
      setRentalsError(null);
      try {
        // TODO: Replace with actual RentalsService.getRentals() call
        // const { RentalsService } = await import('@localpro/rentals');
        // const data = await RentalsService.getRentals({
        //   search: searchQuery || undefined,
        //   category: selectedCategory === 'all' ? undefined : selectedCategory,
        //   available: availableOnly ? true : undefined,
        //   sort: sortBy,
        // });
        // setRentals(data);
        
        // Mock data for now
        setRentals([]);
      } catch (error: any) {
        setRentalsError(error?.message || 'Unable to load rentals');
      } finally {
        setRentalsLoading(false);
      }
    };

    fetchRentals();
  }, [searchQuery, selectedCategory, availableOnly, sortBy]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        const { SecureStorage } = await import('@localpro/storage');
        const updatedHistory = [
          query,
          ...searchHistory.filter((item) => item !== query),
        ].slice(0, 10);
        setSearchHistory(updatedHistory);
        try {
          await SecureStorage.setItem('rentals_search_history', JSON.stringify(updatedHistory));
        } catch (err) {
          console.error('Error saving search history:', err);
        }
      }
    },
    [searchHistory]
  );

  const handleClearHistory = useCallback(async () => {
    setSearchHistory([]);
    try {
      const { SecureStorage } = await import('@localpro/storage');
      await SecureStorage.removeItem('rentals_search_history');
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  }, []);

  const handleRentalPress = useCallback(
    (rentalId: string) => {
      router.push(`/(stack)/rental/${rentalId}` as any);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Refetch rentals
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredRentals = useMemo(() => {
    let result = [...rentals];

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // Apply available filter
    if (availableOnly) {
      result = result.filter((r) => r.available);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return 0; // TODO: Use averageRating when available
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [rentals, selectedCategory, availableOnly, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || availableOnly;

  const renderRentalCard = useCallback(
    ({ item }: { item: Rental }) => {
      const rentalImage = item.images && item.images.length > 0 
        ? (typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as any)?.url || (item.images[0] as any)?.thumbnail)
        : null;

      return (
        <TouchableOpacity
          style={[
            styles.rentalCard,
            viewMode === 'grid' ? styles.rentalCardGrid : styles.rentalCardList,
          ]}
          onPress={() => handleRentalPress(item.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Card style={styles.rentalCardContent}>
            <View style={styles.rentalImageContainer}>
              {rentalImage ? (
                <Image source={{ uri: rentalImage }} style={styles.rentalImage} resizeMode="cover" />
              ) : (
                <View style={[styles.rentalImagePlaceholder, { backgroundColor: colors.neutral.gray200 }]}>
                  <Ionicons name="home-outline" size={32} color={colors.text.tertiary} />
                </View>
              )}
              {!item.available && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Unavailable</Text>
                </View>
              )}
            </View>
            <View style={styles.rentalInfo}>
              <Text style={styles.rentalTitle} numberOfLines={viewMode === 'grid' ? 2 : 1}>
                {item.title}
              </Text>
              {viewMode === 'list' && (
                <Text style={styles.rentalDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View style={styles.rentalFooter}>
                <View style={styles.rentalPriceContainer}>
                  <Text style={[styles.rentalPrice, { color: colors.primary[600] }]}>
                    {formatPrice(item.price, item.period)}
                  </Text>
                </View>
                <View style={styles.rentalLocation}>
                  <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.rentalLocationText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              </View>
              {item.ownerName && (
                <Text style={styles.rentalOwner} numberOfLines={1}>
                  by {item.ownerName}
                </Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [viewMode, colors, handleRentalPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        key={viewMode}
        data={filteredRentals}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderRentalCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search Rentals</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search rentals, equipment, tools..."
                suggestions={suggestions}
                onSuggestionSelect={handleSearch}
                showFilterButton={false}
              />
            </View>

            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <View style={styles.activeFiltersContainer}>
                <TouchableOpacity
                  style={[styles.activeFiltersBadge, { backgroundColor: colors.primary[50] }]}
                  onPress={() => {
                    setSelectedCategory('all');
                    setAvailableOnly(false);
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="close-circle" size={14} color={colors.primary[600]} />
                  <Text style={[styles.activeFiltersText, { color: colors.primary[600] }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {RENTAL_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: colors.primary[600],
                        borderColor: colors.primary[600],
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={isSelected ? Colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && { color: Colors.text.inverse },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Filters Row */}
            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  availableOnly && {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                  },
                ]}
                onPress={() => setAvailableOnly(!availableOnly)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons
                  name={availableOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={availableOnly ? colors.primary[600] : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    availableOnly && { color: colors.primary[600] },
                  ]}
                >
                  Available Only
                </Text>
              </TouchableOpacity>

              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => {
                    const sortOptions: ('newest' | 'price-asc' | 'price-desc' | 'rating')[] = [
                      'newest',
                      'price-asc',
                      'price-desc',
                      'rating',
                    ];
                    const currentIndex = sortOptions.indexOf(sortBy);
                    const nextIndex = (currentIndex + 1) % sortOptions.length;
                    setSortBy(sortOptions[nextIndex]);
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="swap-vertical-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.sortButtonText}>
                    {sortBy === 'newest'
                      ? 'Newest'
                      : sortBy === 'price-asc'
                      ? 'Price: Low to High'
                      : sortBy === 'price-desc'
                      ? 'Price: High to Low'
                      : 'Rating'}
                  </Text>
                </TouchableOpacity>
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

            {/* Search History / Popular Searches */}
            {!searchQuery && filteredRentals.length === 0 && !rentalsLoading && (
              <View style={styles.suggestionsContainer}>
                {searchHistory.length > 0 && (
                  <SearchHistory
                    searches={searchHistory}
                    onSearchSelect={handleSearch}
                    onClearHistory={handleClearHistory}
                  />
                )}
                <View style={styles.popularSearches}>
                  <Text style={styles.popularSearchesTitle}>Popular Searches</Text>
                  <View style={styles.popularSearchesGrid}>
                    {POPULAR_SEARCHES_RENTALS.map((term) => (
                      <TouchableOpacity
                        key={term}
                        style={[styles.popularSearchChip, { backgroundColor: colors.background.primary }]}
                        onPress={() => handleSearch(term)}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text style={styles.popularSearchText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          rentalsLoading ? (
            <LoadingSkeleton viewMode={viewMode} count={6} />
          ) : rentalsError ? (
            <EmptyState
              icon="warning-outline"
              title="Unable to load rentals"
              subtitle={rentalsError}
            />
          ) : (
            <EmptyState
              icon="home-outline"
              title={searchQuery ? 'No rentals found' : 'Start searching'}
              subtitle={
                searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : 'Search for rental equipment, tools, or vehicles'
              }
            />
          )
        }
        ListFooterComponent={
          filteredRentals.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {filteredRentals.length} {filteredRentals.length === 1 ? 'rental' : 'rentals'} found
              </Text>
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
  headerContent: {
    paddingBottom: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  activeFiltersContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  activeFiltersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 4, android: 6 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.xs,
  },
  activeFiltersText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  sortContainer: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
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
  suggestionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  popularSearches: {
    marginTop: Spacing.lg,
  },
  popularSearchesTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  popularSearchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularSearchChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
  },
  popularSearchText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  rentalCard: {
    marginBottom: Spacing.md,
  },
  rentalCardGrid: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  rentalCardList: {
    marginHorizontal: Spacing.lg,
  },
  rentalCardContent: {
    padding: 0,
    overflow: 'hidden',
  },
  rentalImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    marginBottom: Spacing.sm,
  },
  rentalImage: {
    width: '100%',
    height: '100%',
  },
  rentalImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.semantic.error[600],
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    textTransform: 'uppercase',
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  rentalInfo: {
    padding: Spacing.sm,
  },
  rentalTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  rentalDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  rentalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  rentalPriceContainer: {
    flex: 1,
  },
  rentalPrice: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  rentalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  rentalLocationText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  rentalOwner: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

