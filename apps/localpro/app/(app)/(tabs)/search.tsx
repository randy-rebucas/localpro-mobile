import { Ionicons } from '@expo/vector-icons';
import { useServices } from '@localpro/marketplace';
import type { Service } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EmptyState,
  FilterSheet,
  LoadingSkeleton,
  SearchHistory,
  SearchInput,
  ServiceCard,
  type Category,
  type FilterState
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing } from '../../../constants/theme';
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

const POPULAR_SEARCHES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Landscaping',
  'Handyman',
  'Painting',
];

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

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matches = POPULAR_SEARCHES.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory((prev) => [query.trim(), ...prev].slice(0, 10));
    }
  }, [searchHistory]);

  const handleSearchSelect = (query: string) => {
    handleSearch(query);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleServicePress = (serviceId: string) => {
    router.push(`/(app)/service/${serviceId}` as any);
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

  // If not marketplace package, show default search
  if (activePackage !== 'marketplace') {
    const getSearchConfig = () => {
      switch (activePackage) {
        case 'job-board':
          return {
            placeholder: 'Search jobs, companies...',
            emptyMessage: 'No jobs found',
            emptySubtext: 'Try adjusting your search or filters',
          };
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
              <View style={styles.searchInputWrapper}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search services, providers..."
                  showFilterButton={true}
                  onFilterPress={() => setFilterSheetVisible(true)}
                />
              </View>
              
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

            {/* Popular Searches */}
            {!searchQuery && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Popular Searches</Text>
                <View style={styles.popularSearches}>
                  {POPULAR_SEARCHES.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularSearchItem}
                      onPress={() => handleSearchSelect(term)}
                    >
                      <Ionicons
                        name="trending-up"
                        size={16}
                        color={colors.primary[600]}
                      />
                      <Text style={styles.popularSearchText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
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
});
