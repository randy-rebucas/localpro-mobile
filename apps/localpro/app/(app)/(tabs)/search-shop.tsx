import { Ionicons } from '@expo/vector-icons';
import type { Supply } from '@localpro/types';
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
    View
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

const POPULAR_SEARCHES_SHOP = [
  'Power Tools',
  'Cleaning Supplies',
  'Safety Equipment',
  'Building Materials',
  'Paint & Brushes',
  'Hardware',
  'Electrical Supplies',
  'Plumbing Tools',
];

const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps-outline' as const },
  { id: 'tools', name: 'Tools', icon: 'hammer-outline' as const },
  { id: 'materials', name: 'Materials', icon: 'cube-outline' as const },
  { id: 'equipment', name: 'Equipment', icon: 'construct-outline' as const },
  { id: 'safety', name: 'Safety', icon: 'shield-outline' as const },
  { id: 'cleaning_supplies', name: 'Cleaning', icon: 'sparkles-outline' as const },
];

const formatPrice = (price: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

export default function SearchShopScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Products state
  const [products, setProducts] = useState<Supply[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const { SecureStorage } = await import('@localpro/storage');
        const history = await SecureStorage.getItem('shop_search_history');
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
      const matches = POPULAR_SEARCHES_SHOP.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Fetch products (mock for now - replace with actual API call)
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        // TODO: Replace with actual SuppliesService.getSupplies() call
        // const { SuppliesService } = await import('@localpro/supplies');
        // const data = await SuppliesService.getSupplies({
        //   search: searchQuery || undefined,
        //   category: selectedCategory === 'all' ? undefined : selectedCategory,
        //   inStock: inStockOnly ? true : undefined,
        //   sort: sortBy,
        // });
        // setProducts(data);
        
        // Mock data for now
        setProducts([]);
      } catch (error: any) {
        setProductsError(error?.message || 'Unable to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, inStockOnly, sortBy]);

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
          await SecureStorage.setItem('shop_search_history', JSON.stringify(updatedHistory));
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
      await SecureStorage.removeItem('shop_search_history');
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  }, []);

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(stack)/product/${productId}` as any);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Refetch products
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Apply in-stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          // TODO: Use averageRating when available
          return 0;
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [products, selectedCategory, inStockOnly, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || inStockOnly;

  const renderProductCard = useCallback(
    ({ item }: { item: Supply }) => {
      const productImage = item.images && item.images.length > 0 
        ? (typeof item.images[0] === 'string' 
            ? item.images[0] 
            : (item.images[0] as any)?.url || (item.images[0] as any)?.thumbnail)
        : null;

      return (
        <TouchableOpacity
          style={[
            styles.productCard,
            viewMode === 'grid' ? styles.productCardGrid : styles.productCardList,
          ]}
          onPress={() => handleProductPress(item.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Card style={styles.productCardContent}>
            <View style={styles.productImageContainer}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.productImage} resizeMode="cover" />
              ) : (
                <View style={[styles.productImagePlaceholder, { backgroundColor: colors.neutral.gray200 }]}>
                  <Ionicons name="cube-outline" size={32} color={colors.text.tertiary} />
                </View>
              )}
              {!item.inStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={viewMode === 'grid' ? 2 : 1}>
                {item.name}
              </Text>
              {viewMode === 'list' && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <View style={styles.productFooter}>
                <View style={styles.productPriceContainer}>
                  <Text style={[styles.productPrice, { color: colors.primary[600] }]}>
                    {formatPrice(item.price)}
                  </Text>
                  <Text style={styles.productUnit}>/{item.unit}</Text>
                </View>
                {item.supplierName && (
                  <Text style={styles.productSupplier} numberOfLines={1}>
                    by {item.supplierName}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [viewMode, colors, handleProductPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        key={viewMode}
        data={filteredProducts}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search Products</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products, brands, suppliers..."
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
                    setInStockOnly(false);
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
              {PRODUCT_CATEGORIES.map((category) => {
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
                  inStockOnly && {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                  },
                ]}
                onPress={() => setInStockOnly(!inStockOnly)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons
                  name={inStockOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={inStockOnly ? colors.primary[600] : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    inStockOnly && { color: colors.primary[600] },
                  ]}
                >
                  In Stock Only
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
            {!searchQuery && filteredProducts.length === 0 && !productsLoading && (
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
                    {POPULAR_SEARCHES_SHOP.map((term) => (
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
          productsLoading ? (
            <LoadingSkeleton viewMode={viewMode} count={6} />
          ) : productsError ? (
            <EmptyState
              icon="warning-outline"
              title="Unable to load products"
              subtitle={productsError}
            />
          ) : (
            <EmptyState
              icon="cube-outline"
              title={searchQuery ? 'No products found' : 'Start searching'}
              subtitle={
                searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : 'Search for products, brands, or suppliers'
              }
            />
          )
        }
        ListFooterComponent={
          filteredProducts.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
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
  productCard: {
    marginBottom: Spacing.md,
  },
  productCardGrid: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  productCardList: {
    marginHorizontal: Spacing.lg,
  },
  productCardContent: {
    padding: 0,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    marginBottom: Spacing.sm,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.semantic.error[600],
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    textTransform: 'uppercase',
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  productDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  productUnit: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  productSupplier: {
    fontSize: 11,
    color: Colors.text.tertiary,
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

