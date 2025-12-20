import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
}

export default function MyAdsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'>('all');

  // Mock ads data - replace with actual API call
  const ads: Ad[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'draft' as const, label: 'Draft', icon: 'document-text-outline' as const },
    { key: 'active' as const, label: 'Active', icon: 'play-circle-outline' as const },
    { key: 'paused' as const, label: 'Paused', icon: 'pause-circle-outline' as const },
    { key: 'completed' as const, label: 'Completed', icon: 'checkmark-circle-outline' as const },
    { key: 'cancelled' as const, label: 'Cancelled', icon: 'close-circle-outline' as const },
  ];

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || ad.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateAd = () => {
    // TODO: Navigate to create ad screen
    // router.push('/(app)/create-ad');
    console.log('Create ad');
  };

  const handleEditAd = (adId: string) => {
    // TODO: Navigate to edit ad screen
    // router.push(`/(app)/edit-ad/${adId}`);
    console.log('Edit ad:', adId);
  };

  const handlePauseAd = (adId: string) => {
    // TODO: Implement pause ad functionality
    Alert.alert('Success', 'Ad paused successfully');
    console.log('Pause ad:', adId);
  };

  const handleResumeAd = (adId: string) => {
    // TODO: Implement resume ad functionality
    Alert.alert('Success', 'Ad resumed successfully');
    console.log('Resume ad:', adId);
  };

  const handleDeleteAd = (adId: string) => {
    Alert.alert(
      'Delete Ad',
      'Are you sure you want to delete this ad? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete ad functionality
            Alert.alert('Success', 'Ad deleted successfully');
            console.log('Delete ad:', adId);
          },
        },
      ]
    );
  };

  const handleViewStats = (adId: string) => {
    // TODO: Navigate to ad stats screen
    // router.push(`/(app)/ad-stats/${adId}`);
    console.log('View stats:', adId);
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

  const getStatusLabel = (status: Ad['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Ads</Text>
              <Text style={styles.subtitle}>Manage your advertisements</Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleCreateAd}
            >
              <Ionicons name="add" size={20} color={colors.text.inverse} />
              <Text style={styles.createButtonText}>Create Ad</Text>
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
                placeholder="Search your ads..."
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
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
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

          {/* Ads List */}
          {filteredAds.length > 0 ? (
            <View style={styles.adsList}>
              {filteredAds.map((ad) => {
                const statusColor = getStatusColor(ad.status);
                const ctr = calculateCTR(ad.clicks, ad.impressions);
                return (
                  <Card key={ad.id} style={styles.adCard}>
                    {/* Ad Image */}
                    {ad.images.length > 0 && (
                      <View style={styles.adImageContainer}>
                        <Image 
                          source={{ uri: ad.images[0] }} 
                          style={styles.adImage}
                          resizeMode="cover"
                        />
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusLabel(ad.status)}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Ad Content */}
                    <View style={styles.adContent}>
                      <View style={styles.adHeader}>
                        <View style={styles.adTitleSection}>
                          <Text style={styles.adTitle} numberOfLines={2}>
                            {ad.title}
                          </Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{ad.category}</Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.adDescription} numberOfLines={2}>
                        {ad.description}
                      </Text>

                      {/* Ad Stats */}
                      <View style={styles.adStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="eye-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.statValue}>{formatNumber(ad.impressions)}</Text>
                          <Text style={styles.statLabel}>Impressions</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="hand-left-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.statValue}>{formatNumber(ad.clicks)}</Text>
                          <Text style={styles.statLabel}>Clicks</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="trending-up-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.statValue}>{ctr}%</Text>
                          <Text style={styles.statLabel}>CTR</Text>
                        </View>
                      </View>

                      {/* Budget */}
                      <View style={styles.budgetRow}>
                        <Ionicons name="cash-outline" size={16} color={colors.primary[600]} />
                        <Text style={styles.budgetText}>
                          Budget: {formatCurrency(ad.budget)}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.viewStatsButton, { borderColor: colors.primary[600] }]}
                          onPress={() => handleViewStats(ad.id)}
                        >
                          <Ionicons name="stats-chart-outline" size={16} color={colors.primary[600]} />
                          <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                            Stats
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton, { borderColor: colors.secondary[600] }]}
                          onPress={() => handleEditAd(ad.id)}
                        >
                          <Ionicons name="create-outline" size={16} color={colors.secondary[600]} />
                          <Text style={[styles.actionButtonText, { color: colors.secondary[600] }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                        {ad.status === 'active' ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.pauseButton, { borderColor: colors.semantic.warning }]}
                            onPress={() => handlePauseAd(ad.id)}
                          >
                            <Ionicons name="pause-outline" size={16} color={colors.semantic.warning} />
                            <Text style={[styles.actionButtonText, { color: colors.semantic.warning }]}>
                              Pause
                            </Text>
                          </TouchableOpacity>
                        ) : ad.status === 'paused' ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.resumeButton, { borderColor: colors.semantic.success }]}
                            onPress={() => handleResumeAd(ad.id)}
                          >
                            <Ionicons name="play-outline" size={16} color={colors.semantic.success} />
                            <Text style={[styles.actionButtonText, { color: colors.semantic.success }]}>
                              Resume
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton, { borderColor: colors.semantic.error }]}
                          onPress={() => handleDeleteAd(ad.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
                          <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'megaphone-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Ads Found' : 'No Ads Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Create your first advertisement to get started'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleCreateAd}
                  >
                    <Ionicons name="add" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Create Your First Ad</Text>
                  </TouchableOpacity>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
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
  adsList: {
    gap: Spacing.md,
  },
  adCard: {
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  adImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.secondary,
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
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
  adContent: {
    padding: Spacing.md,
  },
  adHeader: {
    marginBottom: Spacing.sm,
  },
  adTitleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  adTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  adDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  adStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '22%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  viewStatsButton: {
    backgroundColor: Colors.background.primary,
  },
  editButton: {
    backgroundColor: Colors.background.primary,
  },
  pauseButton: {
    backgroundColor: Colors.background.primary,
  },
  resumeButton: {
    backgroundColor: Colors.background.primary,
  },
  deleteButton: {
    backgroundColor: Colors.background.primary,
  },
  actionButtonText: {
    fontSize: 12,
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
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

