import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Partner {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  category: string;
  partnershipType: 'sponsor' | 'integration' | 'affiliate' | 'strategic';
  status: 'active' | 'inactive' | 'pending';
  benefits: string[];
}

interface UserPartnership {
  partner: Partner;
  partnershipType: 'sponsor' | 'integration' | 'affiliate' | 'strategic';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  usageCount?: number;
}

export default function MyPartnersTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  // Mock user partnerships data - replace with actual API call
  const partnerships: UserPartnership[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'active' as const, label: 'Active', icon: 'checkmark-circle-outline' as const },
    { key: 'inactive' as const, label: 'Inactive', icon: 'close-circle-outline' as const },
    { key: 'pending' as const, label: 'Pending', icon: 'time-outline' as const },
  ];

  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = partnership.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partnership.partner.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || partnership.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getPartnershipTypeColor = (type: Partner['partnershipType']) => {
    switch (type) {
      case 'sponsor':
        return colors.primary[600];
      case 'integration':
        return colors.secondary[600];
      case 'affiliate':
        return colors.semantic.success;
      case 'strategic':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: UserPartnership['status']) => {
    switch (status) {
      case 'active':
        return colors.semantic.success;
      case 'inactive':
        return colors.text.tertiary;
      case 'pending':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
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

  const handlePartnerPress = (partnerId: string) => {
    // TODO: Navigate to partner detail/management screen
    // router.push(`/(app)/partner/${partnerId}`);
    console.log('View partner:', partnerId);
  };

  const handleBrowsePartners = () => {
    router.push('/(app)/(tabs)/browse-partners');
  };

  const handleOnboardPartner = () => {
    router.push('/(app)/(tabs)/onboarding');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Partners</Text>
              <Text style={styles.subtitle}>Manage your partnerships</Text>
            </View>
            <TouchableOpacity
              style={[styles.newButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleOnboardPartner}
            >
              <Ionicons name="add" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
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
                placeholder="Search partnerships..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleOnboardPartner}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Onboard Partner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.primary[600] }]}
              onPress={handleBrowsePartners}
            >
              <Ionicons name="search-outline" size={20} color={colors.primary[600]} />
              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>Browse Partners</Text>
            </TouchableOpacity>
          </View>

          {/* Partnerships List */}
          {filteredPartnerships.length > 0 ? (
            <View style={styles.partnershipsList}>
              {filteredPartnerships.map((partnership) => {
                const { partner } = partnership;
                const typeColor = getPartnershipTypeColor(partnership.partnershipType);
                const statusColor = getStatusColor(partnership.status);
                return (
                  <Card key={partner.id} style={styles.partnershipCard}>
                    <TouchableOpacity
                      onPress={() => handlePartnerPress(partner.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.partnershipHeader}>
                        <View style={styles.partnerLogoContainer}>
                          {partner.logo ? (
                            <Image source={{ uri: partner.logo }} style={styles.partnerLogo} />
                          ) : (
                            <View style={styles.partnerLogoPlaceholder}>
                              <Ionicons name="business" size={32} color={colors.primary[600]} />
                            </View>
                          )}
                        </View>
                        <View style={styles.partnerInfo}>
                          <View style={styles.partnerNameRow}>
                            <Text style={styles.partnerName} numberOfLines={1}>
                              {partner.name}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                                {partnership.status}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.partnerMeta}>
                            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                              <Ionicons 
                                name="star" 
                                size={12} 
                                color={typeColor} 
                              />
                              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                                {partnership.partnershipType}
                              </Text>
                            </View>
                            <View style={styles.partnerMetaItem}>
                              <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.partnerMetaText}>{partner.category}</Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </View>
                      {partner.description && (
                        <Text style={styles.partnerDescription} numberOfLines={2}>
                          {partner.description}
                        </Text>
                      )}
                      <View style={styles.partnershipFooter}>
                        <View style={styles.partnershipMeta}>
                          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                          <Text style={styles.partnershipMetaText}>
                            Joined {formatDate(partnership.joinedAt)}
                          </Text>
                        </View>
                        {partnership.usageCount !== undefined && (
                          <View style={styles.partnershipMeta}>
                            <Ionicons name="stats-chart-outline" size={14} color={colors.text.tertiary} />
                            <Text style={styles.partnershipMetaText}>
                              {partnership.usageCount} uses
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'people-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Partnerships Found' : 'No Partnerships Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Onboard a new partner or browse available partnerships to get started'}
                </Text>
                {!searchQuery && (
                  <View style={styles.emptyStateActions}>
                    <TouchableOpacity
                      style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                      onPress={handleOnboardPartner}
                    >
                      <Ionicons name="person-add-outline" size={20} color={colors.text.inverse} />
                      <Text style={styles.emptyStateButtonText}>Onboard Partner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.emptyStateButton, styles.emptyStateButtonSecondary, { borderColor: colors.primary[600] }]}
                      onPress={handleBrowsePartners}
                    >
                      <Ionicons name="search-outline" size={20} color={colors.primary[600]} />
                      <Text style={[styles.emptyStateButtonText, { color: colors.primary[600] }]}>Browse Partners</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  filtersContainer: {
    marginBottom: Spacing.md,
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
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  partnershipsList: {
    gap: Spacing.md,
  },
  partnershipCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  partnershipHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  partnerLogoContainer: {
    position: 'relative',
  },
  partnerLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  partnerLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  partnerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  partnerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  partnerMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  partnerDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  partnershipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  partnershipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  partnershipMetaText: {
    fontSize: 12,
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
    marginBottom: Spacing.lg,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  emptyStateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  emptyStateButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

