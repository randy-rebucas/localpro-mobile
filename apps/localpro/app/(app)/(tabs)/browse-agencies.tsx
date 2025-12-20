import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Agency {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  verified: boolean;
  rating?: number;
  memberCount: number;
}

export default function BrowseAgenciesTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const colors = useThemeColors();

  // Mock agencies data - replace with actual API call
  const agencies: Agency[] = [];

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agency.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = filterVerified === null || agency.verified === filterVerified;
    return matchesSearch && matchesVerified;
  });

  const handleAgencyPress = (agencyId: string) => {
    // TODO: Navigate to agency detail screen
    // router.push(`/(app)/agency/${agencyId}`);
    console.log('View agency:', agencyId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Browse Agencies</Text>
            <Text style={styles.subtitle}>Discover professional agencies</Text>
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
                placeholder="Search agencies..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterVerified === null && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
              ]}
              onPress={() => setFilterVerified(null)}
            >
              <Text style={[
                styles.filterChipText,
                filterVerified === null && styles.filterChipTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterVerified === true && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
              ]}
              onPress={() => setFilterVerified(true)}
            >
              <Ionicons 
                name="shield-checkmark" 
                size={14} 
                color={filterVerified === true ? colors.text.inverse : colors.secondary[600]} 
              />
              <Text style={[
                styles.filterChipText,
                filterVerified === true && styles.filterChipTextActive,
              ]}>
                Verified
              </Text>
            </TouchableOpacity>
          </View>

          {/* Agencies List */}
          {filteredAgencies.length > 0 ? (
            <View style={styles.agenciesList}>
              {filteredAgencies.map((agency) => (
                <Card key={agency.id} style={styles.agencyCard}>
                  <TouchableOpacity
                    onPress={() => handleAgencyPress(agency.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.agencyHeader}>
                      <View style={styles.agencyLogoContainer}>
                        {agency.logo ? (
                          <Image source={{ uri: agency.logo }} style={styles.agencyLogo} />
                        ) : (
                          <View style={styles.agencyLogoPlaceholder}>
                            <Ionicons name="business" size={32} color={colors.primary[600]} />
                          </View>
                        )}
                        {agency.verified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={12} color={colors.text.inverse} />
                          </View>
                        )}
                      </View>
                      <View style={styles.agencyInfo}>
                        <View style={styles.agencyNameRow}>
                          <Text style={styles.agencyName} numberOfLines={1}>
                            {agency.name}
                          </Text>
                        </View>
                        <View style={styles.agencyMeta}>
                          <View style={styles.agencyMetaItem}>
                            <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.agencyMetaText}>{agency.location}</Text>
                          </View>
                          <View style={styles.agencyMetaItem}>
                            <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.agencyMetaText}>{agency.memberCount} members</Text>
                          </View>
                          {agency.rating && (
                            <View style={styles.agencyMetaItem}>
                              <Ionicons name="star" size={14} color={colors.semantic.warning} />
                              <Text style={styles.agencyMetaText}>{agency.rating.toFixed(1)}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </View>
                    {agency.description && (
                      <Text style={styles.agencyDescription} numberOfLines={2}>
                        {agency.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'business-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Agencies Found' : 'No Agencies Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new agencies'}
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
  filtersRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
  },
  filterChipActive: {
    borderColor: Colors.primary[600],
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  agenciesList: {
    gap: Spacing.md,
  },
  agencyCard: {
    marginBottom: Spacing.md,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  agencyLogoContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  agencyLogo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral.gray200,
  },
  agencyLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  agencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  agencyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  agencyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  agencyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: Spacing.xs,
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

