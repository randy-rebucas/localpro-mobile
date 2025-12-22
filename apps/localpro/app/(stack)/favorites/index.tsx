import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { SecureStorage } from '@localpro/storage';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { WavyBackground } from '../../../components/WavyBackground';
import { EmptyState, LoadingSkeleton, SearchInput } from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type FavoriteType = 'all' | 'services' | 'products' | 'jobs' | 'rentals' | 'agencies';

interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  location?: string;
  rating?: number;
  savedAt: Date;
  // Additional metadata for navigation
  metadata?: {
    serviceId?: string;
    jobId?: string;
    productId?: string;
    rentalId?: string;
    agencyId?: string;
  };
}

const FAVORITE_STORAGE_KEYS: Record<FavoriteType, string> = {
  all: '',
  services: 'saved_services',
  products: 'saved_products',
  jobs: 'saved_jobs',
  rentals: 'saved_rentals',
  agencies: 'saved_agencies',
};

export default function FavoritesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FavoriteType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [allFavorites, setAllFavorites] = useState<FavoriteItem[]>([]);

  const favoriteTypes = useMemo<{ key: FavoriteType; label: string; icon: keyof typeof Ionicons.glyphMap }[]>(() => [
    { key: 'all', label: 'All', icon: 'star-outline' },
    { key: 'services', label: 'Services', icon: 'construct-outline' },
    { key: 'products', label: 'Products', icon: 'cube-outline' },
    { key: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
    { key: 'rentals', label: 'Rentals', icon: 'home-outline' },
    { key: 'agencies', label: 'Agencies', icon: 'business-outline' },
  ], []);

  // Load all favorites from SecureStorage
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const allFavs: FavoriteItem[] = [];

        // Load saved services
        try {
          const savedServices = await SecureStorage.getItem('saved_services');
          if (savedServices) {
            const serviceIds = JSON.parse(savedServices) as string[];
            // TODO: Fetch service details from API
            // For now, create placeholder items
            serviceIds.forEach((id) => {
              allFavs.push({
                id: `service-${id}`,
                type: 'services',
                title: 'Service',
                savedAt: new Date(),
                metadata: { serviceId: id },
              });
            });
          }
        } catch (err) {
          console.error('Error loading saved services:', err);
        }

        // Load saved jobs
        try {
          const savedJobs = await SecureStorage.getItem('saved_jobs');
          if (savedJobs) {
            const jobIds = JSON.parse(savedJobs) as string[];
            // Fetch job details
            const jobPromises = jobIds.map(async (id) => {
              try {
                const job = await JobBoardService.getJob(id);
                if (!job) return null;
                return {
                  id: `job-${id}`,
                  type: 'jobs' as FavoriteType,
                  title: job.title,
                  description: job.description,
                  location: job.location,
                  price: job.salary?.min,
                  savedAt: new Date(job.postedAt || Date.now()),
                  metadata: { jobId: id },
                } as FavoriteItem;
              } catch {
                return null;
              }
            });
            const jobs = await Promise.all(jobPromises);
            allFavs.push(...jobs.filter((j): j is FavoriteItem => j !== null));
          }
        } catch (err) {
          console.error('Error loading saved jobs:', err);
        }

        // Load saved products
        try {
          const savedProducts = await SecureStorage.getItem('saved_products');
          if (savedProducts) {
            const productIds = JSON.parse(savedProducts) as string[];
            productIds.forEach((id) => {
              allFavs.push({
                id: `product-${id}`,
                type: 'products',
                title: 'Product',
                savedAt: new Date(),
                metadata: { productId: id },
              });
            });
          }
        } catch (err) {
          console.error('Error loading saved products:', err);
        }

        // Load saved rentals
        try {
          const savedRentals = await SecureStorage.getItem('saved_rentals');
          if (savedRentals) {
            const rentalIds = JSON.parse(savedRentals) as string[];
            rentalIds.forEach((id) => {
              allFavs.push({
                id: `rental-${id}`,
                type: 'rentals',
                title: 'Rental',
                savedAt: new Date(),
                metadata: { rentalId: id },
              });
            });
          }
        } catch (err) {
          console.error('Error loading saved rentals:', err);
        }

        // Load saved agencies
        try {
          const savedAgencies = await SecureStorage.getItem('saved_agencies');
          if (savedAgencies) {
            const agencyIds = JSON.parse(savedAgencies) as string[];
            agencyIds.forEach((id) => {
              allFavs.push({
                id: `agency-${id}`,
                type: 'agencies',
                title: 'Agency',
                savedAt: new Date(),
                metadata: { agencyId: id },
              });
            });
          }
        } catch (err) {
          console.error('Error loading saved agencies:', err);
        }

        // Sort by savedAt (newest first)
        allFavs.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());

        setAllFavorites(allFavs);
        setAllFavorites(allFavs);
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Filter favorites based on search and type
  const filteredFavorites = useMemo(() => {
    let result = [...allFavorites];

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((fav) => fav.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (fav) =>
          fav.title.toLowerCase().includes(query) ||
          fav.description?.toLowerCase().includes(query) ||
          fav.location?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allFavorites, selectedType, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reload favorites
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleItemPress = useCallback(
    (item: FavoriteItem) => {
      if (!item.metadata) return;

      switch (item.type) {
        case 'services':
          if (item.metadata.serviceId) {
            router.push(`/(stack)/service/${item.metadata.serviceId}` as any);
          }
          break;
        case 'jobs':
          if (item.metadata.jobId) {
            router.push(`/(stack)/job/${item.metadata.jobId}` as any);
          }
          break;
        case 'products':
          if (item.metadata.productId) {
            router.push(`/(stack)/product/${item.metadata.productId}` as any);
          }
          break;
        case 'rentals':
          if (item.metadata.rentalId) {
            router.push(`/(stack)/rental/${item.metadata.rentalId}` as any);
          }
          break;
        case 'agencies':
          if (item.metadata.agencyId) {
            router.push(`/(stack)/agency/${item.metadata.agencyId}` as any);
          }
          break;
      }
    },
    [router]
  );

  const handleRemoveFavorite = useCallback(
    async (item: FavoriteItem) => {
      Alert.alert(
        'Remove Favorite',
        `Are you sure you want to remove "${item.title}" from your favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const storageKey = FAVORITE_STORAGE_KEYS[item.type];
                if (!storageKey || !item.metadata) return;

                // Get current saved items
                const saved = await SecureStorage.getItem(storageKey);
                if (saved) {
                  const ids = JSON.parse(saved) as string[];
                  const itemId =
                    item.metadata.serviceId ||
                    item.metadata.jobId ||
                    item.metadata.productId ||
                    item.metadata.rentalId ||
                    item.metadata.agencyId;

                  if (itemId) {
                    const updated = ids.filter((id) => id !== itemId);
                    await SecureStorage.setItem(storageKey, JSON.stringify(updated));
                  }
                }

                // Update local state
                setAllFavorites((prev) => prev.filter((f) => f.id !== item.id));
              } catch (err) {
                console.error('Error removing favorite:', err);
                Alert.alert('Error', 'Failed to remove favorite. Please try again.');
              }
            },
          },
        ]
      );
    },
    []
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Favorites',
      `Are you sure you want to remove all ${selectedType === 'all' ? '' : selectedType} favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (selectedType === 'all') {
                // Clear all types
                await Promise.all(
                  Object.values(FAVORITE_STORAGE_KEYS)
                    .filter((key) => key)
                    .map((key) => SecureStorage.removeItem(key))
                );
              } else {
                // Clear specific type
                const storageKey = FAVORITE_STORAGE_KEYS[selectedType];
                if (storageKey) {
                  await SecureStorage.removeItem(storageKey);
                }
              }

              // Update local state
              if (selectedType === 'all') {
                setAllFavorites([]);
              } else {
                setAllFavorites((prev) => prev.filter((f) => f.type !== selectedType));
              }
            } catch (err) {
              console.error('Error clearing favorites:', err);
              Alert.alert('Error', 'Failed to clear favorites. Please try again.');
            }
          },
        },
      ]
    );
  }, [selectedType]);

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeColor = useCallback((type: FavoriteType) => {
    switch (type) {
      case 'services':
        return colors.primary[600];
      case 'products':
        return colors.secondary[600];
      case 'jobs':
        return colors.primary[600];
      case 'rentals':
        return colors.semantic.warning[600];
      case 'agencies':
        return colors.primary[600];
      default:
        return colors.text.secondary;
    }
  }, [colors]);

  const renderFavoriteCard = useCallback(
    ({ item }: { item: FavoriteItem }) => {
      const typeColor = getTypeColor(item.type);
      const typeInfo = favoriteTypes.find((t) => t.key === item.type);

      if (viewMode === 'grid') {
        return (
          <TouchableOpacity
            style={styles.favoriteCardGrid}
            onPress={() => handleItemPress(item)}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Card style={styles.favoriteCardContent}>
              <View style={styles.favoriteImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.favoriteImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.favoriteImagePlaceholder, { backgroundColor: `${typeColor}15` }]}>
                    <Ionicons name={typeInfo?.icon || 'star'} size={32} color={typeColor} />
                  </View>
                )}
                <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                  <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeInfo?.label}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(item);
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="heart" size={18} color={colors.semantic.error[600]} />
                </TouchableOpacity>
              </View>
              <View style={styles.favoriteContent}>
                <Text style={styles.favoriteTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.price && (
                  <Text style={[styles.favoritePrice, { color: typeColor }]}>
                    {formatCurrency(item.price)}
                  </Text>
                )}
                {item.location && (
                  <View style={styles.favoriteLocation}>
                    <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
                    <Text style={styles.favoriteLocationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                )}
                <Text style={styles.favoriteDate}>Saved {formatDate(item.savedAt)}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      }

      // List view
      return (
        <TouchableOpacity
          style={styles.favoriteCardList}
          onPress={() => handleItemPress(item)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Card style={styles.favoriteCardContent}>
            <View style={styles.favoriteRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.favoriteImageList} resizeMode="cover" />
              ) : (
                <View style={[styles.favoriteImagePlaceholderList, { backgroundColor: `${typeColor}15` }]}>
                  <Ionicons name={typeInfo?.icon || 'star'} size={24} color={typeColor} />
                </View>
              )}
              <View style={styles.favoriteInfo}>
                <View style={styles.favoriteHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeInfo?.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(item);
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons name="heart" size={18} color={colors.semantic.error[600]} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.favoriteTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={styles.favoriteDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.favoriteMeta}>
                  {item.price && (
                    <Text style={[styles.favoritePrice, { color: typeColor }]}>
                      {formatCurrency(item.price)}
                    </Text>
                  )}
                  {item.location && (
                    <View style={styles.favoriteLocation}>
                      <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
                      <Text style={styles.favoriteLocationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.favoriteDate}>Saved {formatDate(item.savedAt)}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [viewMode, colors, handleItemPress, handleRemoveFavorite, favoriteTypes, getTypeColor]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <WavyBackground />
      <FlatList
        key={viewMode}
        data={filteredFavorites}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header Actions */}
            <View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
                onPress={() => router.back()}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Favorites</Text>
                <Text style={styles.subtitle}>
                  {allFavorites.length} {allFavorites.length === 1 ? 'item' : 'items'} saved
                </Text>
              </View>
              {allFavorites.length > 0 && (
                <TouchableOpacity
                  style={[styles.clearButton, { backgroundColor: colors.semantic.error[600] }]}
                  onPress={handleClearAll}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.text.inverse} />
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search favorites..."
                showFilterButton={false}
              />
            </View>

            {/* Type Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              {favoriteTypes.map((type) => {
                const isActive = selectedType === type.key;
                const count = selectedType === 'all' 
                  ? allFavorites.length 
                  : allFavorites.filter((f) => f.type === type.key).length;
                
                return (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.filterTab,
                      isActive && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setSelectedType(type.key)}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons
                      name={type.icon}
                      size={16}
                      color={isActive ? Colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                        <Text style={[styles.countText, isActive && styles.countTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* View Mode Toggle */}
            <View style={styles.viewModeContainer}>
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
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSkeleton viewMode={viewMode} count={6} />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={searchQuery ? 'search-outline' : 'star-outline'}
                title={searchQuery ? 'No Favorites Found' : 'No Favorites Yet'}
                subtitle={
                  searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Start saving items you like to see them here'
                }
              />
            </View>
          )
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.select({
      ios: Spacing.lg,
      android: Spacing.xl
    }),
    backgroundColor: 'transparent',
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  headerButton: {
    width: Platform.select({
      ios: 48,
      android: 48
    }),
    height: Platform.select({
      ios: 48,
      android: 48
    }),
    borderRadius: Platform.select({
      ios: 24,
      android: 24
    }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    ...Platform.select({
      android: {
        elevation: Shadows.lg.elevation,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: Colors.text.inverse + '30',
  },
  countText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  countTextActive: {
    color: Colors.text.inverse,
  },
  viewModeContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: 2,
    gap: Spacing.xs,
    alignSelf: 'flex-end',
    ...Shadows.sm,
  },
  viewModeButton: {
    width: Platform.select({ ios: 36, android: 40 }),
    height: Platform.select({ ios: 36, android: 40 }),
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  favoriteCardGrid: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  favoriteCardList: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  favoriteCardContent: {
    padding: 0,
    overflow: 'hidden',
  },
  favoriteImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  favoriteImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteImageList: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  favoriteImagePlaceholderList: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.primary + 'E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContent: {
    padding: Spacing.sm,
  },
  favoriteRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.sm,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  favoriteDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  favoritePrice: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  favoriteLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteLocationText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  favoriteDate: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  emptyContainer: {
    paddingTop: Spacing['2xl'],
  },
});

