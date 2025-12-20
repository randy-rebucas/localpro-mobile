import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

interface PopularSearch {
  id: string;
  term: string;
  category?: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change?: number;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function PopularTabScreen() {
  const colors = useThemeColors();
  const { activePackage } = usePackageContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  const getPopularSearches = (): PopularSearch[] => {
    const baseSearches: PopularSearch[] = [
      { id: '1', term: 'Plumbing Services', category: 'Services', count: 1250, trend: 'up', change: 15 },
      { id: '2', term: 'Electrician', category: 'Services', count: 980, trend: 'up', change: 8 },
      { id: '3', term: 'Home Cleaning', category: 'Services', count: 850, trend: 'stable' },
      { id: '4', term: 'Landscaping', category: 'Services', count: 720, trend: 'up', change: 12 },
      { id: '5', term: 'Painting', category: 'Services', count: 650, trend: 'down', change: -5 },
      { id: '6', term: 'Software Developer', category: 'Jobs', count: 540, trend: 'up', change: 20 },
      { id: '7', term: 'Marketing Manager', category: 'Jobs', count: 480, trend: 'up', change: 10 },
      { id: '8', term: 'Graphic Designer', category: 'Jobs', count: 420, trend: 'stable' },
      { id: '9', term: 'Apartment Rental', category: 'Rentals', count: 380, trend: 'up', change: 18 },
      { id: '10', term: 'Office Space', category: 'Rentals', count: 320, trend: 'up', change: 7 },
    ];

    // Filter based on active package
    switch (activePackage) {
      case 'marketplace':
        return baseSearches.filter(s => s.category === 'Services');
      case 'job-board':
        return baseSearches.filter(s => s.category === 'Jobs');
      case 'rentals':
        return baseSearches.filter(s => s.category === 'Rentals');
      default:
        return baseSearches;
    }
  };

  const popularSearches = getPopularSearches();

  const filteredSearches = popularSearches.filter(search =>
    search.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (search.category && search.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchPress = (term: string) => {
    // TODO: Navigate to search results
    // router.push(`/(app)/(tabs)/search?q=${encodeURIComponent(term)}`);
    console.log('Popular search selected:', term);
  };

  const getTrendIcon = (trend: PopularSearch['trend']): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: PopularSearch['trend']) => {
    switch (trend) {
      case 'up':
        return colors.semantic.success;
      case 'down':
        return colors.semantic.error;
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
            <Text style={styles.title}>Popular Searches</Text>
            <Text style={styles.subtitle}>Discover what&apos;s trending right now</Text>
          </View>

          {/* Time Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {timeFilters.map((filter) => {
              const isActive = timeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setTimeFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isActive && styles.filterTabTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
                placeholder="Search popular terms..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Popular Searches List */}
          {filteredSearches.length > 0 ? (
            <View style={styles.searchesList}>
              {filteredSearches.map((search, index) => {
                const trendColor = getTrendColor(search.trend);
                return (
                  <Card key={search.id} style={styles.searchCard}>
                    <TouchableOpacity
                      onPress={() => handleSearchPress(search.term)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.searchHeader}>
                        <View style={styles.rankContainer}>
                          <View style={[styles.rankBadge, index < 3 && { backgroundColor: colors.primary[600] }]}>
                            <Text style={[styles.rankText, index < 3 && styles.rankTextActive]}>
                              {index + 1}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.searchInfo}>
                          <View style={styles.searchTermRow}>
                            <Text style={styles.searchTerm}>{search.term}</Text>
                            {index < 3 && (
                              <Ionicons name="flame" size={16} color={colors.semantic.warning} />
                            )}
                          </View>
                          {search.category && (
                            <Text style={styles.searchCategory}>{search.category}</Text>
                          )}
                          <View style={styles.searchMeta}>
                            <View style={styles.searchMetaItem}>
                              <Ionicons name="search-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.searchMetaText}>
                                {search.count.toLocaleString()} searches
                              </Text>
                            </View>
                            {search.change !== undefined && (
                              <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
                                <Ionicons name={getTrendIcon(search.trend)} size={12} color={trendColor} />
                                <Text style={[styles.trendText, { color: trendColor }]}>
                                  {Math.abs(search.change)}%
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Popular Searches Found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search terms or time filter
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
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchInputWrapper: {
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
  searchesList: {
    gap: Spacing.md,
  },
  searchCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  rankTextActive: {
    color: Colors.text.inverse,
  },
  searchInfo: {
    flex: 1,
  },
  searchTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  searchTerm: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  searchCategory: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  searchMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  searchMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  trendText: {
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

