import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Supply {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  createdAt: Date;
}

export default function MySuppliesTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Mock supplies data - replace with actual API call
  const supplies: Supply[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'in-stock' as const, label: 'In Stock', icon: 'checkmark-circle-outline' as const },
    { key: 'out-of-stock' as const, label: 'Out of Stock', icon: 'close-circle-outline' as const },
  ];

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supply.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'in-stock' && supply.inStock) ||
                         (activeFilter === 'out-of-stock' && !supply.inStock);
    return matchesSearch && matchesFilter;
  });

  const handleAddSupply = () => {
    // TODO: Navigate to add supply screen
    // router.push('/(app)/add-supply');
    console.log('Add supply');
  };

  const handleEditSupply = (supplyId: string) => {
    // TODO: Navigate to edit supply screen
    // router.push(`/(app)/edit-supply/${supplyId}`);
    console.log('Edit supply:', supplyId);
  };

  const handleSupplyPress = (supplyId: string) => {
    // TODO: Navigate to supply detail screen
    // router.push(`/(app)/supply/${supplyId}`);
    console.log('View supply:', supplyId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Supplies</Text>
            <Text style={styles.subtitle}>Manage your products and inventory</Text>
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
                placeholder="Search supplies..."
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

          {/* Add Supply Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
            onPress={handleAddSupply}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.addButtonText}>Add New Supply</Text>
          </TouchableOpacity>

          {/* Supplies List */}
          {filteredSupplies.length > 0 ? (
            <View style={styles.suppliesList}>
              {filteredSupplies.map((supply) => (
                <Card key={supply.id} style={styles.supplyCard}>
                  <TouchableOpacity
                    onPress={() => handleSupplyPress(supply.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.supplyHeader}>
                      <View style={styles.supplyImageContainer}>
                        {supply.images && supply.images.length > 0 ? (
                          <Image 
                            source={{ uri: supply.images[0] }} 
                            style={styles.supplyImage}
                          />
                        ) : (
                          <View style={[styles.supplyImagePlaceholder, { backgroundColor: colors.neutral.gray200 }]}>
                            <Ionicons name="cube-outline" size={32} color={colors.text.tertiary} />
                          </View>
                        )}
                        {!supply.inStock && (
                          <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.supplyInfo}>
                        <View style={styles.supplyNameRow}>
                          <Text style={styles.supplyName} numberOfLines={1}>
                            {supply.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleEditSupply(supply.id);
                            }}
                          >
                            <Ionicons name="create-outline" size={18} color={colors.primary[600]} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.supplyDescription} numberOfLines={2}>
                          {supply.description}
                        </Text>
                        <View style={styles.supplyMeta}>
                          <View style={styles.supplyMetaItem}>
                            <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.supplyMetaText}>
                              ${supply.price.toFixed(2)}/{supply.unit}
                            </Text>
                          </View>
                          <View style={styles.supplyMetaItem}>
                            <Ionicons name="grid-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.supplyMetaText}>{supply.category}</Text>
                          </View>
                        </View>
                        <View style={styles.stockInfo}>
                          {supply.inStock ? (
                            <View style={[styles.stockBadge, { backgroundColor: `${colors.semantic.success}15` }]}>
                              <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                              <Text style={[styles.stockText, { color: colors.semantic.success }]}>
                                {supply.stockQuantity !== undefined 
                                  ? `${supply.stockQuantity} in stock`
                                  : 'In Stock'}
                              </Text>
                            </View>
                          ) : (
                            <View style={[styles.stockBadge, { backgroundColor: `${colors.semantic.error}15` }]}>
                              <Ionicons name="close-circle" size={14} color={colors.semantic.error} />
                              <Text style={[styles.stockText, { color: colors.semantic.error }]}>
                                Out of Stock
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'cube-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Supplies Found' : 'No Supplies Listed Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add your first supply to start selling'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleAddSupply}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Add Supply</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  suppliesList: {
    gap: Spacing.md,
  },
  supplyCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  supplyHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  supplyImageContainer: {
    position: 'relative',
  },
  supplyImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray200,
  },
  supplyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.semantic.error,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  supplyInfo: {
    flex: 1,
  },
  supplyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  supplyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    padding: Spacing.xs,
  },
  supplyDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  supplyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  supplyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  supplyMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  stockInfo: {
    marginTop: Spacing.xs,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  stockText: {
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
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

