import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count?: number;
  description?: string;
}

export default function CategoriesTabScreen() {
  const colors = useThemeColors();
  const { activePackage } = usePackageContext();
  const [searchQuery, setSearchQuery] = useState('');

  const getAllCategories = (): Category[] => {
    const baseCategories: Category[] = [
      { id: 'all', name: 'All', icon: 'grid-outline', color: colors.primary[600] },
      { id: 'services', name: 'Services', icon: 'construct-outline', color: colors.primary[600], count: 0 },
      { id: 'products', name: 'Products', icon: 'cube-outline', color: colors.secondary[600], count: 0 },
      { id: 'jobs', name: 'Jobs', icon: 'briefcase-outline', color: colors.primary[600], count: 0 },
      { id: 'rentals', name: 'Rentals', icon: 'home-outline', color: colors.secondary[600], count: 0 },
      { id: 'education', name: 'Education', icon: 'school-outline', color: colors.primary[600], count: 0 },
      { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline', color: colors.semantic.error, count: 0 },
      { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: colors.semantic.warning, count: 0 },
      { id: 'automotive', name: 'Automotive', icon: 'car-outline', color: colors.secondary[600], count: 0 },
      { id: 'beauty', name: 'Beauty & Wellness', icon: 'sparkles-outline', color: colors.primary[600], count: 0 },
      { id: 'fitness', name: 'Fitness', icon: 'fitness-outline', color: colors.semantic.success, count: 0 },
      { id: 'technology', name: 'Technology', icon: 'hardware-chip-outline', color: colors.secondary[600], count: 0 },
      { id: 'finance', name: 'Finance', icon: 'card-outline', color: colors.primary[600], count: 0 },
      { id: 'legal', name: 'Legal', icon: 'document-text-outline', color: colors.text.secondary, count: 0 },
      { id: 'real-estate', name: 'Real Estate', icon: 'business-outline', color: colors.secondary[600], count: 0 },
      { id: 'events', name: 'Events', icon: 'calendar-outline', color: colors.primary[600], count: 0 },
    ];

    // Filter categories based on active package
    switch (activePackage) {
      case 'marketplace':
        return baseCategories.filter(c => ['all', 'services', 'products', 'food', 'beauty', 'fitness', 'automotive', 'healthcare'].includes(c.id));
      case 'job-board':
        return baseCategories.filter(c => ['all', 'jobs', 'technology', 'finance', 'legal', 'healthcare', 'education'].includes(c.id));
      case 'rentals':
        return baseCategories.filter(c => ['all', 'rentals', 'real-estate', 'automotive', 'technology'].includes(c.id));
      case 'supplies':
        return baseCategories.filter(c => ['all', 'products', 'technology', 'automotive', 'services'].includes(c.id));
      default:
        return baseCategories;
    }
  };

  const categories = getAllCategories();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (categoryId: string) => {
    // TODO: Navigate to category detail or filter by category
    // router.push(`/(app)/category/${categoryId}`);
    console.log('Category selected:', categoryId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Browse Categories</Text>
            <Text style={styles.subtitle}>Explore services and products by category</Text>
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
                placeholder="Search categories..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories Grid */}
          {filteredCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.categoryCardContent}>
                    <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}15` }]}>
                      <Ionicons name={category.icon} size={32} color={category.color} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {category.name}
                    </Text>
                    {category.count !== undefined && (
                      <Text style={styles.categoryCount}>
                        {category.count} {category.count === 1 ? 'item' : 'items'}
                      </Text>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Categories Found</Text>
                <Text style={styles.emptyStateText}>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
  },
  categoryCardContent: {
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 140,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
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

