import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { useServices } from '@localpro/marketplace';
import type { Service } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
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
import PackageSelectionModal from '../../../components/PackageSelectionModal';
import { BorderRadius, Colors, Shadows, Spacing } from '../../../constants/theme';
import { PackageType, usePackageContext } from '../../../contexts/PackageContext';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

type ViewMode = 'grid' | 'list';

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

  // Fetch services
  const { services, loading } = useServices({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
    page,
  });

  // Detect if a package is selected and show modal if not
  useEffect(() => {
    if (!activePackage) {
      setShowPackageModal(true);
    } else {
      setShowPackageModal(false);
    }
  }, [activePackage]);

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

  // Filter and categorize services
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Render service card
  const renderServiceCard = ({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      viewMode={viewMode}
      onPress={handleServicePress}
    />
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

  // Render horizontal service list
  const renderHorizontalServiceList = (services: Service[]) => (
    <FlatList
      horizontal
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.horizontalServiceCard}
          onPress={() => handleServicePress(item.id)}
          activeOpacity={0.7}
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
            {item.rating && (
              <View style={styles.ratingBadgeSmall}>
                <Ionicons name="star" size={10} color={colors.semantic.warning} />
                <Text style={styles.ratingTextSmall}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <View style={styles.horizontalServiceContent}>
            <Text style={styles.horizontalServiceTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.horizontalServicePrice}>{formatCurrency(item.price)}</Text>
          </View>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalListContent}
    />
  );

  // If not marketplace package, show default dashboard
  if (activePackage !== 'marketplace') {
    const getPackageContent = () => {
      switch (activePackage) {
        case 'job-board':
          return {
            title: 'Browse Jobs',
            subtitle: 'Find your next opportunity',
            quickActions: [
              { icon: 'search', label: 'Search Jobs', route: '/(app)/(tabs)/search' },
              { icon: 'document-text', label: 'Applications', route: '/(app)/(tabs)/applications' },
              { icon: 'add-circle', label: 'Post Job', route: '/(app)/(tabs)/post-job' },
            ],
          };
        default:
          return {
            title: `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`,
            subtitle: 'Your LocalPro Dashboard',
            quickActions: [
              { icon: 'search', label: 'Search', route: '/(app)/(tabs)/search' },
              { icon: 'calendar', label: 'Bookings', route: '/(app)/(tabs)/bookings' },
              { icon: 'person', label: 'Profile', route: '/(app)/(tabs)/profile' },
            ],
          };
      }
    };

    const content = getPackageContent();

    return (
      <>
        <PackageSelectionModal
          visible={showPackageModal}
          onSelectPackage={handlePackageSelect}
        />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={filteredServices}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          ListHeaderComponent={
            <View style={styles.marketplaceHeader}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Browse Services</Text>
                  <Text style={styles.subtitle}>Find and book services near you</Text>
                </View>
                {activeRole && (
                  <View style={styles.roleBadge}>
                    <Ionicons name="briefcase-outline" size={14} color={colors.primary[600]} />
                    <Text style={styles.roleText}>{activeRole}</Text>
                  </View>
                )}
              </View>

              {/* Search Bar */}
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search services..."
              />

              {/* Category Filter Chips */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />

              {/* View Mode Toggle */}
              <View style={styles.viewModeContainer}>
                <Text style={styles.viewModeLabel}>View:</Text>
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

              {/* Featured Services Section */}
              {featuredServices.length > 0 && (
                <View style={styles.section}>
                  {renderSectionHeader('Featured Services', 'Top-rated services')}
                  {renderHorizontalServiceList(featuredServices)}
                </View>
              )}

              {/* Popular Services Section */}
              {popularServices.length > 0 && (
                <View style={styles.section}>
                  {renderSectionHeader('Popular Services', 'Most reviewed')}
                  {renderHorizontalServiceList(popularServices)}
                </View>
              )}

              {/* Nearby Services Section */}
              {nearbyServices.length > 0 && (
                <View style={styles.section}>
                  {renderSectionHeader('Nearby Services', 'Services near you')}
                  {renderHorizontalServiceList(nearbyServices)}
                </View>
              )}

              {/* All Services Header */}
              <View style={styles.section}>
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
            loading && filteredServices.length > 0 ? (
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
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[600],
    marginLeft: 4,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  // Marketplace-specific styles
  marketplaceHeader: {
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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
    marginBottom: Spacing.md,
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  horizontalListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  horizontalServiceCard: {
    width: 160,
    marginRight: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
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
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  horizontalServicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  serviceCardGrid: {
    flex: 1,
    margin: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  serviceCardList: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  serviceProvider: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[600],
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
    gap: Spacing.sm,
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
    gap: 2,
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
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ratingTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  listContent: {
    paddingBottom: Spacing.xl,
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
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
