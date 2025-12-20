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
  startDate: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
}

export default function BrowseAdsTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const colors = useThemeColors();

  // Mock ads data - replace with actual API call
  const ads: Ad[] = [];

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'services', label: 'Services' },
    { key: 'products', label: 'Products' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'events', label: 'Events' },
    { key: 'real-estate', label: 'Real Estate' },
  ];

  const statuses = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'completed', label: 'Completed' },
  ];

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.advertiserName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAdPress = (adId: string) => {
    // TODO: Navigate to ad detail screen
    // router.push(`/(app)/ad/${adId}`);
    console.log('View ad:', adId);
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
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Browse Ads</Text>
            <Text style={styles.subtitle}>Discover advertisements</Text>
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
                placeholder="Search ads, advertisers..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.filterChip,
                    isActive && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {statuses.map((status) => {
              const isActive = selectedStatus === status.key;
              return (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.filterChip,
                    isActive && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
                  ]}
                  onPress={() => setSelectedStatus(status.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                    {status.label}
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
                    <TouchableOpacity
                      onPress={() => handleAdPress(ad.id)}
                      activeOpacity={0.7}
                    >
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
                        <Text style={styles.adTitle} numberOfLines={2}>
                          {ad.title}
                        </Text>
                        <Text style={styles.adDescription} numberOfLines={2}>
                          {ad.description}
                        </Text>

                        {/* Advertiser Info */}
                        <View style={styles.advertiserInfo}>
                          <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                          <Text style={styles.advertiserName}>{ad.advertiserName}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{ad.category}</Text>
                          </View>
                        </View>

                        {/* Ad Stats */}
                        <View style={styles.adStats}>
                          <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.statText}>{formatNumber(ad.impressions)}</Text>
                            <Text style={styles.statLabel}>Impressions</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Ionicons name="hand-left-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.statText}>{formatNumber(ad.clicks)}</Text>
                            <Text style={styles.statLabel}>Clicks</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Ionicons name="trending-up-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.statText}>{ctr}%</Text>
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
                  name={searchQuery ? 'search-outline' : 'megaphone-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Ads Found' : 'No Ads Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'There are no advertisements available at the moment'}
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
  filtersContainer: {
    marginBottom: Spacing.sm,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    borderColor: 'transparent',
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
  adTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  adDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  advertiserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  advertiserName: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
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
  statText: {
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
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
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

