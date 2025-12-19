import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

export default function SearchTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState<string[]>([]);
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();

  const getSearchCategories = () => {
    switch (activePackage) {
      case 'marketplace':
        return [
          { icon: 'home-outline', label: 'Home Services', color: colors.primary[600] },
          { icon: 'construct-outline', label: 'Repairs', color: colors.secondary[600] },
          { icon: 'car-outline', label: 'Automotive', color: colors.primary[600] },
          { icon: 'fitness-outline', label: 'Fitness', color: colors.secondary[600] },
          { icon: 'cut-outline', label: 'Beauty', color: colors.primary[600] },
          { icon: 'restaurant-outline', label: 'Food', color: colors.secondary[600] },
        ];
      case 'job-board':
        return [
          { icon: 'briefcase-outline', label: 'Full-time', color: colors.primary[600] },
          { icon: 'time-outline', label: 'Part-time', color: colors.secondary[600] },
          { icon: 'calendar-outline', label: 'Contract', color: colors.primary[600] },
          { icon: 'school-outline', label: 'Remote', color: colors.secondary[600] },
        ];
      case 'supplies':
        return [
          { icon: 'cube-outline', label: 'Equipment', color: colors.primary[600] },
          { icon: 'build-outline', label: 'Tools', color: colors.secondary[600] },
          { icon: 'hardware-chip-outline', label: 'Electronics', color: colors.primary[600] },
        ];
      case 'rentals':
        return [
          { icon: 'home-outline', label: 'Properties', color: colors.primary[600] },
          { icon: 'car-outline', label: 'Vehicles', color: colors.secondary[600] },
          { icon: 'boat-outline', label: 'Equipment', color: colors.primary[600] },
        ];
      case 'agencies':
        return [
          { icon: 'business-outline', label: 'Agencies', color: colors.primary[600] },
          { icon: 'people-outline', label: 'Teams', color: colors.secondary[600] },
        ];
      default:
        return [
          { icon: 'search-outline', label: 'All', color: colors.primary[600] },
        ];
    }
  };

  const getPopularSearches = () => {
    switch (activePackage) {
      case 'marketplace':
        return ['Plumbing', 'Electrical', 'Cleaning', 'Landscaping', 'Painting'];
      case 'job-board':
        return ['Software Developer', 'Marketing Manager', 'Sales Representative', 'Designer', 'Accountant'];
      default:
        return ['Popular Search 1', 'Popular Search 2', 'Popular Search 3'];
    }
  };

  const categories = getSearchCategories();
  const popularSearches = getPopularSearches();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleCategoryPress = (category: string) => {
    setSearchQuery(category);
    // TODO: Filter by category
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    // TODO: Execute search
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search</Text>
            <Text style={styles.subtitle}>
              {activePackage === 'marketplace' && 'Find services near you'}
              {activePackage === 'job-board' && 'Find your next opportunity'}
              {activePackage === 'supplies' && 'Browse supplies and equipment'}
              {activePackage === 'rentals' && 'Find rentals'}
              {activePackage === 'agencies' && 'Discover agencies'}
              {!['marketplace', 'job-board', 'supplies', 'rentals', 'agencies'].includes(activePackage) && 'Search for anything'}
            </Text>
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
                placeholder="Search..."
                placeholderTextColor={colors.text.tertiary}
                autoFocus={false}
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

          {/* Categories */}
          {categories.length > 0 && (
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
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
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
          )}

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

          {/* Search Results Placeholder */}
          {searchQuery.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>No results found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search terms
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
    marginBottom: Spacing.md,
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
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clearAllText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  categoryItem: {
    width: '33.33%',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    margin: Spacing.xs,
  },
  popularSearchText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  recentSearches: {
    gap: Spacing.xs,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  recentSearchText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
