import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'job' | 'product' | 'rental' | 'course' | 'agency' | 'partner';
  category?: string;
  location?: string;
  image?: string;
}

type SearchType = 'all' | 'service' | 'job' | 'product' | 'rental' | 'course' | 'agency' | 'partner';

export default function GlobalSearchTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SearchType>('all');
  const [showResults, setShowResults] = useState(false);

  const searchTypes: { key: SearchType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'search-outline' },
    { key: 'service', label: 'Services', icon: 'construct-outline' },
    { key: 'job', label: 'Jobs', icon: 'briefcase-outline' },
    { key: 'product', label: 'Products', icon: 'cube-outline' },
    { key: 'rental', label: 'Rentals', icon: 'home-outline' },
    { key: 'course', label: 'Courses', icon: 'school-outline' },
    { key: 'agency', label: 'Agencies', icon: 'business-outline' },
    { key: 'partner', label: 'Partners', icon: 'people-outline' },
  ];

  // Mock search results - replace with actual API call
  const searchResults: SearchResult[] = [];

  const filteredResults = searchResults.filter(result => {
    const matchesSearch = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (result.category && result.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || result.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
      // TODO: Execute global search
      console.log('Global search:', searchQuery, selectedType);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // TODO: Navigate to result detail based on type
    // switch (result.type) {
    //   case 'service':
    //     router.push(`/(app)/service/${result.id}`);
    //     break;
    //   case 'job':
    //     router.push(`/(app)/job/${result.id}`);
    //     break;
    //   ...
    // }
    console.log('Result selected:', result);
  };

  const getTypeIcon = (type: SearchResult['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'service':
        return 'construct';
      case 'job':
        return 'briefcase';
      case 'product':
        return 'cube';
      case 'rental':
        return 'home';
      case 'course':
        return 'school';
      case 'agency':
        return 'business';
      case 'partner':
        return 'people';
      default:
        return 'search';
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'service':
        return colors.primary[600];
      case 'job':
        return colors.secondary[600];
      case 'product':
        return colors.semantic.success;
      case 'rental':
        return colors.semantic.warning;
      case 'course':
        return colors.primary[600];
      case 'agency':
        return colors.secondary[600];
      case 'partner':
        return colors.primary[600];
      default:
        return colors.text.secondary;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'service':
        return 'Service';
      case 'job':
        return 'Job';
      case 'product':
        return 'Product';
      case 'rental':
        return 'Rental';
      case 'course':
        return 'Course';
      case 'agency':
        return 'Agency';
      case 'partner':
        return 'Partner';
      default:
        return 'Result';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Global Search</Text>
            <Text style={styles.subtitle}>Search across all platforms and services</Text>
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
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowResults(false);
                }}
                placeholder="Search everything..."
                placeholderTextColor={colors.text.tertiary}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}>
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

          {/* Search Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {searchTypes.map((type) => {
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

          {/* Search Results */}
          {showResults && searchQuery.trim() ? (
            filteredResults.length > 0 ? (
              <View style={styles.resultsList}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                  </Text>
                </View>
                {filteredResults.map((result) => {
                  const typeColor = getTypeColor(result.type);
                  return (
                    <Card key={result.id} style={styles.resultCard}>
                      <TouchableOpacity
                        onPress={() => handleResultPress(result)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.resultHeader}>
                          <View style={[styles.resultTypeIcon, { backgroundColor: `${typeColor}15` }]}>
                            <Ionicons name={getTypeIcon(result.type)} size={24} color={typeColor} />
                          </View>
                          <View style={styles.resultInfo}>
                            <View style={styles.resultTitleRow}>
                              <Text style={styles.resultTitle} numberOfLines={1}>
                                {result.title}
                              </Text>
                              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                                <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                                  {getTypeLabel(result.type)}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.resultDescription} numberOfLines={2}>
                              {result.description}
                            </Text>
                            <View style={styles.resultMeta}>
                              {result.category && (
                                <View style={styles.resultMetaItem}>
                                  <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
                                  <Text style={styles.resultMetaText}>{result.category}</Text>
                                </View>
                              )}
                              {result.location && (
                                <View style={styles.resultMetaItem}>
                                  <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                                  <Text style={styles.resultMetaText}>{result.location}</Text>
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
                  <Text style={styles.emptyStateTitle}>No Results Found</Text>
                  <Text style={styles.emptyStateText}>
                    Try adjusting your search terms or filters
                  </Text>
                </View>
              </Card>
            )
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>Start Your Search</Text>
                <Text style={styles.emptyStateText}>
                  Enter a search term above to find services, jobs, products, and more across all platforms
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
  resultsList: {
    gap: Spacing.md,
  },
  resultsHeader: {
    marginBottom: Spacing.sm,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  resultCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  resultTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
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
  resultDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  resultMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultMetaText: {
    fontSize: 12,
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

