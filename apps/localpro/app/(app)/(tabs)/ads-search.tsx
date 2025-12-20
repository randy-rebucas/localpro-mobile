import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Ad {
  id: string;
  title: string;
  description: string;
  advertiserId: string;
  advertiserName: string;
  category: string;
  images: string[];
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  impressions: number;
  clicks: number;
}

export default function AdsSearchTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState<string[]>([]);
  const colors = useThemeColors();

  // Mock search results - replace with actual API call
  const searchResults: Ad[] = [];

  const categories = [
    { icon: 'business-outline', label: 'Services', color: colors.primary[600] },
    { icon: 'cube-outline', label: 'Products', color: colors.secondary[600] },
    { icon: 'briefcase-outline', label: 'Jobs', color: colors.primary[600] },
    { icon: 'calendar-outline', label: 'Events', color: colors.secondary[600] },
    { icon: 'home-outline', label: 'Real Estate', color: colors.primary[600] },
    { icon: 'car-outline', label: 'Automotive', color: colors.secondary[600] },
    { icon: 'restaurant-outline', label: 'Food & Dining', color: colors.primary[600] },
    { icon: 'fitness-outline', label: 'Health & Fitness', color: colors.secondary[600] },
  ];

  const popularSearches = [
    'Home Services',
    'Job Opportunities',
    'Real Estate',
    'Automotive',
    'Electronics',
    'Fashion',
    'Food & Dining',
    'Health & Wellness',
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for ads:', searchQuery);
    }
  };

  const handleCategoryPress = (category: string) => {
    setSearchQuery(category);
    // TODO: Filter by category
    handleSearch();
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    // TODO: Execute search
    handleSearch();
  };

  const handleAdPress = (adId: string) => {
    // TODO: Navigate to ad detail screen
    // router.push(`/(app)/ad/${adId}`);
    console.log('View ad:', adId);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getStatusColor = (status: Ad['status']) => {
    switch (status) {
      case 'active':
        return colors.semantic.success;
      case 'paused':
        return colors.semantic.warning;
      case 'completed':
        return colors.primary[600];
      case 'cancelled':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const showResults = searchQuery.trim().length > 0 && searchResults.length > 0;
  const showEmptyResults = searchQuery.trim().length > 0 && searchResults.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search Ads</Text>
            <Text style={styles.subtitle}>Find advertisements</Text>
          </View>

          {/* Search Input */}
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
                placeholder="Search ads, advertisers, categories..."
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {showResults ? (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsHeader}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              <View style={styles.resultsList}>
                {searchResults.map((ad) => {
                  const statusColor = getStatusColor(ad.status);
                  return (
                    <Card key={ad.id} style={styles.resultCard}>
                      <TouchableOpacity
                        onPress={() => handleAdPress(ad.id)}
                        activeOpacity={0.7}
                      >
                        {ad.images.length > 0 && (
                          <Image 
                            source={{ uri: ad.images[0] }} 
                            style={styles.resultImage}
                            resizeMode="cover"
                          />
                        )}
                        <View style={styles.resultContent}>
                          <Text style={styles.resultTitle} numberOfLines={2}>
                            {ad.title}
                          </Text>
                          <Text style={styles.resultDescription} numberOfLines={2}>
                            {ad.description}
                          </Text>
                          <View style={styles.resultMeta}>
                            <View style={styles.resultMetaItem}>
                              <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.resultMetaText}>{ad.advertiserName}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {ad.status}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.resultStats}>
                            <View style={styles.resultStatItem}>
                              <Ionicons name="eye-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.resultStatText}>{formatNumber(ad.impressions)}</Text>
                            </View>
                            <View style={styles.resultStatItem}>
                              <Ionicons name="hand-left-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.resultStatText}>{formatNumber(ad.clicks)}</Text>
                            </View>
                            <View style={styles.resultStatItem}>
                              <Ionicons name="cash-outline" size={14} color={colors.primary[600]} />
                              <Text style={[styles.resultStatText, { color: colors.primary[600] }]}>
                                {formatCurrency(ad.budget)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Card>
                  );
                })}
              </View>
            </View>
          ) : showEmptyResults ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Results Found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search terms or browse categories below
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Categories */}
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.categoryItem}
                      onPress={() => handleCategoryPress(category.label)}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                        <Ionicons name={category.icon as any} size={24} color={category.color} />
                      </View>
                      <Text style={styles.categoryLabel}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              {/* Popular Searches */}
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Popular Searches</Text>
                <View style={styles.popularSearches}>
                  {popularSearches.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularSearchItem}
                      onPress={() => handlePopularSearch(term)}
                    >
                      <Ionicons name="trending-up-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.popularSearchText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <Card style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.recentSearches}>
                    {recentSearches.map((term, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentSearchItem}
                        onPress={() => handlePopularSearch(term)}
                      >
                        <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.recentSearchText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              )}
            </>
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
    marginBottom: Spacing.sm,
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
  clearButton: {
    padding: Spacing.xs,
  },
  searchButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary[600],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  popularSearches: {
    gap: Spacing.sm,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    gap: Spacing.sm,
  },
  popularSearchText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  recentSearches: {
    gap: Spacing.sm,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    gap: Spacing.sm,
  },
  recentSearchText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  resultsSection: {
    marginBottom: Spacing.lg,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  resultsList: {
    gap: Spacing.md,
  },
  resultCard: {
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  resultImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.background.secondary,
  },
  resultContent: {
    padding: Spacing.md,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  resultDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  resultMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  resultStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultStatText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
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

