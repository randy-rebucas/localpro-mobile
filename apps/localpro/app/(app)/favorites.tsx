import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

type FavoriteType = 'all' | 'services' | 'products' | 'jobs' | 'rentals' | 'courses' | 'agencies' | 'partners';

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
}

export default function FavoritesScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FavoriteType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const favoriteTypes: { key: FavoriteType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'star-outline' },
    { key: 'services', label: 'Services', icon: 'construct-outline' },
    { key: 'products', label: 'Products', icon: 'cube-outline' },
    { key: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
    { key: 'rentals', label: 'Rentals', icon: 'home-outline' },
    { key: 'courses', label: 'Courses', icon: 'school-outline' },
    { key: 'agencies', label: 'Agencies', icon: 'business-outline' },
    { key: 'partners', label: 'Partners', icon: 'people-outline' },
  ];

  // Mock favorites data - replace with actual API call
  const favorites: FavoriteItem[] = [];

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (favorite.description && favorite.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || favorite.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleItemPress = (item: FavoriteItem) => {
    // TODO: Navigate to item detail based on type
    // switch (item.type) {
    //   case 'services':
    //     router.push(`/(app)/service/${item.id}`);
    //     break;
    //   case 'products':
    //     router.push(`/(app)/product/${item.id}`);
    //     break;
    //   ...
    // }
    console.log('View favorite:', item);
  };

  const handleRemoveFavorite = (itemId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this item from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Remove from favorites API call
            console.log('Remove favorite:', itemId);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all items from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear all favorites API call
            console.log('Clear all favorites');
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const getTypeColor = (type: FavoriteType) => {
    switch (type) {
      case 'services':
        return colors.primary[600];
      case 'products':
        return colors.secondary[600];
      case 'jobs':
        return colors.primary[600];
      case 'rentals':
        return colors.semantic.warning;
      case 'courses':
        return colors.secondary[600];
      case 'agencies':
        return colors.primary[600];
      case 'partners':
        return colors.secondary[600];
      default:
        return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Favorites</Text>
              <Text style={styles.subtitle}>Your saved items ({favorites.length})</Text>
            </View>
            {favorites.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.semantic.error }]}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={18} color={colors.text.inverse} />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.text.secondary} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search favorites..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.viewModeButton, { backgroundColor: colors.background.primary }]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {favoriteTypes.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Favorites List/Grid */}
          {filteredFavorites.length > 0 ? (
            <View style={viewMode === 'grid' ? styles.favoritesGrid : styles.favoritesList}>
              {filteredFavorites.map((item) => {
                const typeColor = getTypeColor(item.type);
                return (
                  <Card
                    key={item.id}
                    style={viewMode === 'grid' ? styles.favoriteCardGrid : styles.favoriteCardList}
                  >
                    <TouchableOpacity
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.7}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.favoriteImage} />
                          ) : (
                            <View style={[styles.favoriteImagePlaceholder, { backgroundColor: `${typeColor}15` }]}>
                              <Ionicons name={favoriteTypes.find(t => t.key === item.type)?.icon || 'star'} size={32} color={typeColor} />
                            </View>
                          )}
                          <View style={styles.favoriteContent}>
                            <View style={styles.favoriteHeader}>
                              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                                <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                                  {favoriteTypes.find(t => t.key === item.type)?.label}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleRemoveFavorite(item.id)}
                                style={styles.removeButton}
                              >
                                <Ionicons name="heart" size={18} color={colors.semantic.error} />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.favoriteTitle} numberOfLines={2}>
                              {item.title}
                            </Text>
                            {item.price && (
                              <Text style={[styles.favoritePrice, { color: typeColor }]}>
                                {formatCurrency(item.price)}
                              </Text>
                            )}
                            {item.rating && (
                              <View style={styles.favoriteRating}>
                                <Ionicons name="star" size={14} color={colors.semantic.warning} />
                                <Text style={styles.favoriteRatingText}>{item.rating.toFixed(1)}</Text>
                              </View>
                            )}
                          </View>
                        </>
                      ) : (
                        <View style={styles.favoriteRow}>
                          {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.favoriteImageList} />
                          ) : (
                            <View style={[styles.favoriteImagePlaceholderList, { backgroundColor: `${typeColor}15` }]}>
                              <Ionicons name={favoriteTypes.find(t => t.key === item.type)?.icon || 'star'} size={24} color={typeColor} />
                            </View>
                          )}
                          <View style={styles.favoriteInfo}>
                            <View style={styles.favoriteHeader}>
                              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                                <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                                  {favoriteTypes.find(t => t.key === item.type)?.label}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleRemoveFavorite(item.id)}
                                style={styles.removeButton}
                              >
                                <Ionicons name="heart" size={18} color={colors.semantic.error} />
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
                                  <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                                  <Text style={styles.favoriteLocationText}>{item.location}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.favoriteDate}>
                              Saved {formatDate(item.savedAt)}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'star-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Favorites Found' : 'No Favorites Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Start saving items you like to see them here'}
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  favoritesList: {
    gap: Spacing.md,
  },
  favoriteCardGrid: {
    width: '47%',
    padding: 0,
    overflow: 'hidden',
  },
  favoriteCardList: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  favoriteImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background.secondary,
  },
  favoriteImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteImageList: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  favoriteImagePlaceholderList: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContent: {
    padding: Spacing.md,
  },
  favoriteRow: {
    flexDirection: 'row',
    gap: Spacing.md,
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
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  removeButton: {
    padding: Spacing.xs,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  favoriteDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  favoritePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  favoriteRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  favoriteRatingText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  favoriteLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  favoriteLocationText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  favoriteDate: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

