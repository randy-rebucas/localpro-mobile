import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Rental {
  id: string;
  title: string;
  description: string;
  category: string;
  ownerName: string;
  location: string;
  price: number;
  period: 'daily' | 'weekly' | 'monthly';
  images: string[];
  available: boolean;
}

export default function BrowseRentalsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePeriod, setActivePeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock rentals data - replace with actual API call
  const rentals: Rental[] = [];

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-outline' as const },
    { key: 'apartment', label: 'Apartments', icon: 'home-outline' as const },
    { key: 'house', label: 'Houses', icon: 'business-outline' as const },
    { key: 'office', label: 'Office', icon: 'briefcase-outline' as const },
    { key: 'warehouse', label: 'Warehouse', icon: 'cube-outline' as const },
    { key: 'equipment', label: 'Equipment', icon: 'construct-outline' as const },
  ];

  const periods = [
    { key: 'all', label: 'All Periods' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rental.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rental.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || rental.category === activeCategory;
    const matchesPeriod = activePeriod === 'all' || rental.period === activePeriod;
    return matchesSearch && matchesCategory && matchesPeriod;
  });

  const getPeriodLabel = (period: Rental['period']) => {
    switch (period) {
      case 'daily':
        return '/day';
      case 'weekly':
        return '/week';
      case 'monthly':
        return '/month';
      default:
        return '';
    }
  };

  const handleRentalPress = (rentalId: string) => {
    // TODO: Navigate to rental detail screen
    // router.push(`/(app)/rental/${rentalId}`);
    console.log('View rental:', rentalId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Browse Rentals</Text>
            <Text style={styles.subtitle}>Find rental properties and items</Text>
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
                placeholder="Search rentals..."
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

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveCategory(category.key)}
                >
                  <Ionicons
                    name={category.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.categoryTabText,
                      isActive && styles.categoryTabTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Period Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodsContainer}
            contentContainerStyle={styles.periodsContent}
          >
            {periods.map((period) => {
              const isActive = activePeriod === period.key;
              return (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActivePeriod(period.key)}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      isActive && styles.periodTabTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Rentals Grid/List */}
          {filteredRentals.length > 0 ? (
            <View style={viewMode === 'grid' ? styles.rentalsGrid : styles.rentalsList}>
              {filteredRentals.map((rental) => (
                <Card
                  key={rental.id}
                  style={viewMode === 'grid' ? styles.rentalCardGrid : styles.rentalCardList}
                >
                  <TouchableOpacity
                    onPress={() => handleRentalPress(rental.id)}
                    activeOpacity={0.7}
                  >
                    <View style={viewMode === 'grid' ? styles.rentalImageContainerGrid : styles.rentalImageContainerList}>
                      {rental.images && rental.images.length > 0 ? (
                        <Image 
                          source={{ uri: rental.images[0] }} 
                          style={viewMode === 'grid' ? styles.rentalImageGrid : styles.rentalImageList}
                        />
                      ) : (
                        <View style={[viewMode === 'grid' ? styles.rentalImagePlaceholderGrid : styles.rentalImagePlaceholderList, { backgroundColor: colors.neutral.gray200 }]}>
                          <Ionicons name="home-outline" size={32} color={colors.text.tertiary} />
                        </View>
                      )}
                      {!rental.available && (
                        <View style={styles.unavailableBadge}>
                          <Text style={styles.unavailableText}>Unavailable</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.rentalInfo}>
                      <Text style={styles.rentalTitle} numberOfLines={viewMode === 'grid' ? 2 : 1}>
                        {rental.title}
                      </Text>
                      {viewMode === 'list' && (
                        <Text style={styles.rentalDescription} numberOfLines={2}>
                          {rental.description}
                        </Text>
                      )}
                      <View style={styles.rentalMeta}>
                        <View style={styles.rentalMetaItem}>
                          <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                          <Text style={styles.rentalMetaText} numberOfLines={1}>
                            {rental.location}
                          </Text>
                        </View>
                        {viewMode === 'list' && (
                          <View style={styles.rentalMetaItem}>
                            <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.rentalMetaText} numberOfLines={1}>
                              {rental.ownerName}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.rentalFooter}>
                        <View style={styles.rentalPriceContainer}>
                          <Text style={styles.rentalPrice}>${rental.price.toFixed(2)}</Text>
                          <Text style={styles.rentalPeriod}>{getPeriodLabel(rental.period)}</Text>
                        </View>
                        {rental.available && (
                          <View style={[styles.availableBadge, { backgroundColor: `${colors.semantic.success}15` }]}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.semantic.success} />
                            <Text style={[styles.availableText, { color: colors.semantic.success }]}>
                              Available
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'home-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Rentals Found' : 'No Rentals Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Check back later for new rental listings'}
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
  categoriesContainer: {
    marginBottom: Spacing.sm,
  },
  categoriesContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  categoryTab: {
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
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  categoryTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  periodsContainer: {
    marginBottom: Spacing.lg,
  },
  periodsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  periodTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  periodTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  rentalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  rentalsList: {
    gap: Spacing.md,
  },
  rentalCardGrid: {
    width: '47%',
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  rentalCardList: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  rentalImageContainerGrid: {
    position: 'relative',
    width: '100%',
    height: 160,
    marginBottom: Spacing.sm,
  },
  rentalImageContainerList: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: Spacing.sm,
  },
  rentalImageGrid: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral.gray200,
  },
  rentalImageList: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral.gray200,
  },
  rentalImagePlaceholderGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentalImagePlaceholderList: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.semantic.error,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  rentalInfo: {
    padding: Spacing.sm,
  },
  rentalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  rentalDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  rentalMeta: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  rentalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rentalMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  rentalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rentalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  rentalPeriod: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
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

