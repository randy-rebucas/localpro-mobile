import { Ionicons } from '@expo/vector-icons';
import { useServices } from '@localpro/marketplace';
import type { Service } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    CategoryFilter,
    EmptyState,
    LoadingSkeleton,
    SearchInput,
    ServiceCard,
    type Category,
} from '../../../components/marketplace';
import { Colors, Shadows, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type ViewMode = 'grid' | 'list';

export default function ServiceIndexScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch services
  const { services, loading } = useServices({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
    page,
  });

  // Mock categories - replace with actual API call
  const categories: Category[] = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
    { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
    { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
    { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
    { id: 'landscaping', name: 'Landscaping', icon: 'leaf-outline' },
    { id: 'painting', name: 'Painting', icon: 'brush-outline' },
    { id: 'handyman', name: 'Handyman', icon: 'construct-outline' },
  ];

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    let filtered = services;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [services, searchQuery]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const handleServicePress = (serviceId: string) => {
    router.push(`/(stack)/service/${serviceId}` as any);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Render service card
  const renderServiceCard = ({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      viewMode={viewMode}
      onPress={handleServicePress}
    />
  );

  // Render list item separator
  const renderItemSeparator = () => <View style={styles.separator} />;

  // Render list footer
  const renderListFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <LoadingSkeleton viewMode={viewMode} count={6} />
        </View>
      );
    }

    if (searchQuery || selectedCategory !== 'all') {
      return (
        <EmptyState
          icon="search-outline"
          title="No services found"
          subtitle={`Try adjusting your ${searchQuery ? 'search' : 'category'} filters`}
        />
      );
    }

    return (
      <EmptyState
        icon="construct-outline"
        title="No services available"
        subtitle="Check back later for new services"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Services
        </Text>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={toggleViewMode}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
            size={24}
            color={colors.primary[600]}
          />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search services..."
        showFilterButton={false}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategoryChange}
      />

      {/* Services List */}
      <FlatList
        data={filteredServices}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceCard}
        contentContainerStyle={[
          styles.listContent,
          filteredServices.length === 0 && styles.emptyListContent,
        ]}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        ItemSeparatorComponent={viewMode === 'list' ? renderItemSeparator : undefined}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  separator: {
    height: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.lg,
  },
});

