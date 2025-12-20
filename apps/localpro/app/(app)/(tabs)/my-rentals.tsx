import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Rental {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: number;
  period: 'daily' | 'weekly' | 'monthly';
  images: string[];
  available: boolean;
  createdAt: Date;
}

export default function MyRentalsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Mock rentals data - replace with actual API call
  const rentals: Rental[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'available' as const, label: 'Available', icon: 'checkmark-circle-outline' as const },
    { key: 'unavailable' as const, label: 'Unavailable', icon: 'close-circle-outline' as const },
  ];

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rental.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rental.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'available' && rental.available) ||
                         (activeFilter === 'unavailable' && !rental.available);
    return matchesSearch && matchesFilter;
  });

  const getPeriodLabel = (period: Rental['period']) => {
    switch (period) {
      case 'daily':
        return '/day';
      case 'weekly':
        return '/week';
      case 'monthly':
        return '/month';
      default:
        return '';
    }
  };

  const handleAddRental = () => {
    // TODO: Navigate to add rental screen
    // router.push('/(app)/add-rental');
    console.log('Add rental');
  };

  const handleEditRental = (rentalId: string) => {
    // TODO: Navigate to edit rental screen
    // router.push(`/(app)/edit-rental/${rentalId}`);
    console.log('Edit rental:', rentalId);
  };

  const handleRentalPress = (rentalId: string) => {
    // TODO: Navigate to rental detail screen
    // router.push(`/(app)/rental/${rentalId}`);
    console.log('View rental:', rentalId);
  };

  const handleToggleAvailability = (rentalId: string, currentStatus: boolean) => {
    // TODO: Implement toggle availability functionality
    console.log('Toggle availability:', rentalId, !currentStatus);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Rentals</Text>
            <Text style={styles.subtitle}>Manage your rental listings</Text>
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
                placeholder="Search rentals..."
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

          {/* Add Rental Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
            onPress={handleAddRental}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.addButtonText}>Add New Rental</Text>
          </TouchableOpacity>

          {/* Rentals List */}
          {filteredRentals.length > 0 ? (
            <View style={styles.rentalsList}>
              {filteredRentals.map((rental) => (
                <Card key={rental.id} style={styles.rentalCard}>
                  <TouchableOpacity
                    onPress={() => handleRentalPress(rental.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rentalHeader}>
                      <View style={styles.rentalImageContainer}>
                        {rental.images && rental.images.length > 0 ? (
                          <Image 
                            source={{ uri: rental.images[0] }} 
                            style={styles.rentalImage}
                          />
                        ) : (
                          <View style={[styles.rentalImagePlaceholder, { backgroundColor: colors.neutral.gray200 }]}>
                            <Ionicons name="home-outline" size={32} color={colors.text.tertiary} />
                          </View>
                        )}
                        {!rental.available && (
                          <View style={styles.unavailableOverlay}>
                            <Text style={styles.unavailableOverlayText}>Unavailable</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.rentalInfo}>
                        <View style={styles.rentalNameRow}>
                          <Text style={styles.rentalName} numberOfLines={1}>
                            {rental.title}
                          </Text>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleEditRental(rental.id);
                            }}
                          >
                            <Ionicons name="create-outline" size={18} color={colors.primary[600]} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.rentalDescription} numberOfLines={2}>
                          {rental.description}
                        </Text>
                        <View style={styles.rentalMeta}>
                          <View style={styles.rentalMetaItem}>
                            <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.rentalMetaText} numberOfLines={1}>
                              {rental.location}
                            </Text>
                          </View>
                          <View style={styles.rentalMetaItem}>
                            <Ionicons name="grid-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.rentalMetaText}>{rental.category}</Text>
                          </View>
                        </View>
                        <View style={styles.rentalFooter}>
                          <View style={styles.rentalPriceContainer}>
                            <Text style={styles.rentalPrice}>
                              ${rental.price.toFixed(2)}
                            </Text>
                            <Text style={styles.rentalPeriod}>
                              {getPeriodLabel(rental.period)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.availabilityToggle,
                              rental.available 
                                ? { backgroundColor: `${colors.semantic.success}15` }
                                : { backgroundColor: `${colors.semantic.error}15` },
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleAvailability(rental.id, rental.available);
                            }}
                          >
                            <Ionicons 
                              name={rental.available ? 'checkmark-circle' : 'close-circle'} 
                              size={16} 
                              color={rental.available ? colors.semantic.success : colors.semantic.error} 
                            />
                            <Text 
                              style={[
                                styles.availabilityText,
                                { color: rental.available ? colors.semantic.success : colors.semantic.error },
                              ]}
                            >
                              {rental.available ? 'Available' : 'Unavailable'}
                            </Text>
                          </TouchableOpacity>
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
                  name={searchQuery ? 'search-outline' : 'home-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Rentals Found' : 'No Rentals Listed Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add your first rental to start listing'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleAddRental}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Add Rental</Text>
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
  rentalsList: {
    gap: Spacing.md,
  },
  rentalCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  rentalHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rentalImageContainer: {
    position: 'relative',
  },
  rentalImage: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray200,
  },
  rentalImagePlaceholder: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableOverlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  rentalInfo: {
    flex: 1,
  },
  rentalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  rentalName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    padding: Spacing.xs,
  },
  rentalDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  rentalMeta: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  rentalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rentalMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  rentalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  rentalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rentalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  rentalPeriod: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  availabilityText: {
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

