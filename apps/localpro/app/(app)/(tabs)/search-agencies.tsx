import { Ionicons } from '@expo/vector-icons';
import type { Agency } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    EmptyState,
    LoadingSkeleton,
    SearchHistory,
    SearchInput,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

const POPULAR_SEARCHES_AGENCIES = [
  'Cleaning Services',
  'Construction',
  'Landscaping',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Handyman',
];

export default function SearchAgenciesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'members'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Agencies state
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [agenciesError, setAgenciesError] = useState<string | null>(null);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const { SecureStorage } = await import('@localpro/storage');
        const history = await SecureStorage.getItem('agencies_search_history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (err) {
        console.error('Error loading search history:', err);
      }
    };
    loadSearchHistory();
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const matches = POPULAR_SEARCHES_AGENCIES.filter((term) =>
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Fetch agencies (mock for now - replace with actual API call)
  useEffect(() => {
    const fetchAgencies = async () => {
      setAgenciesLoading(true);
      setAgenciesError(null);
      try {
        // TODO: Replace with actual AgenciesService.getAgencies() call
        // const { AgenciesService } = await import('@localpro/agencies');
        // const data = await AgenciesService.getAgencies({
        //   search: searchQuery || undefined,
        //   verified: verifiedOnly ? true : undefined,
        //   sort: sortBy,
        // });
        // setAgencies(data);
        
        // Mock data for now
        setAgencies([]);
      } catch (error: any) {
        setAgenciesError(error?.message || 'Unable to load agencies');
      } finally {
        setAgenciesLoading(false);
      }
    };

    fetchAgencies();
  }, [searchQuery, verifiedOnly, sortBy]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        const { SecureStorage } = await import('@localpro/storage');
        const updatedHistory = [
          query,
          ...searchHistory.filter((item) => item !== query),
        ].slice(0, 10);
        setSearchHistory(updatedHistory);
        try {
          await SecureStorage.setItem('agencies_search_history', JSON.stringify(updatedHistory));
        } catch (err) {
          console.error('Error saving search history:', err);
        }
      }
    },
    [searchHistory]
  );

  const handleClearHistory = useCallback(async () => {
    setSearchHistory([]);
    try {
      const { SecureStorage } = await import('@localpro/storage');
      await SecureStorage.removeItem('agencies_search_history');
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  }, []);

  const handleAgencyPress = useCallback(
    (agencyId: string) => {
      router.push(`/(stack)/agency/${agencyId}` as any);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Refetch agencies
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredAgencies = useMemo(() => {
    let result = [...agencies];

    // Apply verified filter
    if (verifiedOnly) {
      result = result.filter((a) => a.verified);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'members':
          return b.memberCount - a.memberCount;
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [agencies, verifiedOnly, sortBy]);

  const hasActiveFilters = verifiedOnly;

  const renderAgencyCard = useCallback(
    ({ item }: { item: Agency }) => {
      return (
        <TouchableOpacity
          style={styles.agencyCard}
          onPress={() => handleAgencyPress(item.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Card style={styles.agencyCardContent}>
            <View style={styles.agencyHeader}>
              {item.logo ? (
                <Image source={{ uri: item.logo }} style={styles.agencyLogo} resizeMode="cover" />
              ) : (
                <View style={[styles.agencyLogoPlaceholder, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="business-outline" size={32} color={colors.primary[600]} />
                </View>
              )}
              <View style={styles.agencyInfo}>
                <View style={styles.agencyTitleRow}>
                  <Text style={styles.agencyName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.verified && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
                  )}
                </View>
                {item.rating && (
                  <View style={styles.agencyRating}>
                    <Ionicons name="star" size={14} color={colors.semantic.warning[600]} />
                    <Text style={styles.agencyRatingText}>
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {item.description && (
              <Text style={styles.agencyDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.agencyFooter}>
              <View style={styles.agencyMeta}>
                <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.agencyLocation} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              <View style={styles.agencyMeta}>
                <Ionicons name="people-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.agencyMembers}>
                  {item.memberCount} {item.memberCount === 1 ? 'member' : 'members'}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [colors, handleAgencyPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredAgencies}
        keyExtractor={(item) => item.id}
        renderItem={renderAgencyCard}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Search Agencies</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search agencies, services, locations..."
                suggestions={suggestions}
                onSuggestionSelect={handleSearch}
                showFilterButton={false}
              />
            </View>

            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <View style={styles.activeFiltersContainer}>
                <TouchableOpacity
                  style={[styles.activeFiltersBadge, { backgroundColor: colors.primary[50] }]}
                  onPress={() => setVerifiedOnly(false)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="close-circle" size={14} color={colors.primary[600]} />
                  <Text style={[styles.activeFiltersText, { color: colors.primary[600] }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Filters Row */}
            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  verifiedOnly && {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                  },
                ]}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons
                  name={verifiedOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={16}
                  color={verifiedOnly ? colors.primary[600] : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    verifiedOnly && { color: colors.primary[600] },
                  ]}
                >
                  Verified Only
                </Text>
              </TouchableOpacity>

              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => {
                    const sortOptions: ('newest' | 'rating' | 'members')[] = [
                      'newest',
                      'rating',
                      'members',
                    ];
                    const currentIndex = sortOptions.indexOf(sortBy);
                    const nextIndex = (currentIndex + 1) % sortOptions.length;
                    setSortBy(sortOptions[nextIndex]);
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="swap-vertical-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.sortButtonText}>
                    {sortBy === 'newest'
                      ? 'Newest'
                      : sortBy === 'rating'
                      ? 'Highest Rated'
                      : 'Most Members'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Search History / Popular Searches */}
            {!searchQuery && filteredAgencies.length === 0 && !agenciesLoading && (
              <View style={styles.suggestionsContainer}>
                {searchHistory.length > 0 && (
                  <SearchHistory
                    searches={searchHistory}
                    onSearchSelect={handleSearch}
                    onClearHistory={handleClearHistory}
                  />
                )}
                <View style={styles.popularSearches}>
                  <Text style={styles.popularSearchesTitle}>Popular Searches</Text>
                  <View style={styles.popularSearchesGrid}>
                    {POPULAR_SEARCHES_AGENCIES.map((term) => (
                      <TouchableOpacity
                        key={term}
                        style={[styles.popularSearchChip, { backgroundColor: colors.background.primary }]}
                        onPress={() => handleSearch(term)}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text style={styles.popularSearchText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          agenciesLoading ? (
            <LoadingSkeleton viewMode="list" count={6} />
          ) : agenciesError ? (
            <EmptyState
              icon="warning-outline"
              title="Unable to load agencies"
              subtitle={agenciesError}
            />
          ) : (
            <EmptyState
              icon="business-outline"
              title={searchQuery ? 'No agencies found' : 'Start searching'}
              subtitle={
                searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : 'Search for agencies, services, or locations'
              }
            />
          )
        }
        ListFooterComponent={
          filteredAgencies.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {filteredAgencies.length} {filteredAgencies.length === 1 ? 'agency' : 'agencies'} found
              </Text>
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  activeFiltersContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  activeFiltersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 4, android: 6 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.xs,
  },
  activeFiltersText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  sortContainer: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  suggestionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  popularSearches: {
    marginTop: Spacing.lg,
  },
  popularSearchesTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  popularSearchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularSearchChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
  },
  popularSearchText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  agencyCard: {
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  agencyCardContent: {
    padding: Spacing.md,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  agencyLogo: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  agencyLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agencyInfo: {
    flex: 1,
  },
  agencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  agencyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyRatingText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  agencyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  agencyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  agencyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  agencyLocation: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  agencyMembers: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

