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

export default function BrowsePartnersTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const colors = useThemeColors();

  // Mock partners data - replace with actual API call
  const partners: Partner[] = [];

  const categories = ['All', 'Technology', 'Marketing', 'Finance', 'Services', 'Other'];
  const partnershipTypes = [
    { key: null, label: 'All Types' },
    { key: 'sponsor', label: 'Sponsor' },
    { key: 'integration', label: 'Integration' },
    { key: 'affiliate', label: 'Affiliate' },
    { key: 'strategic', label: 'Strategic' },
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || selectedCategory === 'All' || partner.category === selectedCategory;
    const matchesType = selectedType === null || partner.partnershipType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
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

  const getPartnershipTypeIcon = (type: Partner['partnershipType']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'sponsor':
        return 'star';
      case 'integration':
        return 'link';
      case 'affiliate':
        return 'people';
      case 'strategic':
        return 'business';
      default:
        return 'people';
    }
  };

  const handlePartnerPress = (partnerId: string) => {
    // TODO: Navigate to partner detail screen
    // router.push(`/(app)/partner/${partnerId}`);
    console.log('View partner:', partnerId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Browse Partners</Text>
            <Text style={styles.subtitle}>Discover partnership opportunities</Text>
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
                placeholder="Search partners..."
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
              const isActive = selectedCategory === category || (selectedCategory === null && category === 'All');
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    isActive && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
                  ]}
                  onPress={() => setSelectedCategory(category === 'All' ? null : category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Partnership Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {partnershipTypes.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key || 'all'}
                  style={[
                    styles.filterChip,
                    isActive && [styles.filterChipActive, { backgroundColor: colors.primary[600] }],
                  ]}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Partners List */}
          {filteredPartners.length > 0 ? (
            <View style={styles.partnersList}>
              {filteredPartners.map((partner) => {
                const typeColor = getPartnershipTypeColor(partner.partnershipType);
                return (
                  <Card key={partner.id} style={styles.partnerCard}>
                    <TouchableOpacity
                      onPress={() => handlePartnerPress(partner.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.partnerHeader}>
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
                            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                              <Ionicons 
                                name={getPartnershipTypeIcon(partner.partnershipType)} 
                                size={12} 
                                color={typeColor} 
                              />
                              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                                {partner.partnershipType}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.partnerMeta}>
                            <View style={styles.partnerMetaItem}>
                              <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.partnerMetaText}>{partner.category}</Text>
                            </View>
                            {partner.status === 'active' && (
                              <View style={[styles.statusBadge, { backgroundColor: `${colors.semantic.success}15` }]}>
                                <Text style={[styles.statusBadgeText, { color: colors.semantic.success }]}>
                                  Active
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </View>
                      {partner.description && (
                        <Text style={styles.partnerDescription} numberOfLines={2}>
                          {partner.description}
                        </Text>
                      )}
                      {partner.benefits.length > 0 && (
                        <View style={styles.benefitsContainer}>
                          <Text style={styles.benefitsLabel}>Benefits:</Text>
                          <View style={styles.benefitsList}>
                            {partner.benefits.slice(0, 3).map((benefit, index) => (
                              <View key={index} style={styles.benefitItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                                <Text style={styles.benefitText}>{benefit}</Text>
                              </View>
                            ))}
                            {partner.benefits.length > 3 && (
                              <Text style={styles.moreBenefitsText}>
                                +{partner.benefits.length - 3} more
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
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
                  {searchQuery ? 'No Partners Found' : 'No Partners Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Check back later for new partnership opportunities'}
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
    marginBottom: Spacing.md,
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
    borderWidth: 0,
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
  partnersList: {
    gap: Spacing.md,
  },
  partnerCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  partnerHeader: {
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
  partnerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
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
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  partnerDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  benefitsContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  benefitsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  benefitText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  moreBenefitsText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
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

