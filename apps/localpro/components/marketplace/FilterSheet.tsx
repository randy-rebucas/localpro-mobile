import { Ionicons } from '@expo/vector-icons';
import { safeReverseGeocode } from '@localpro/utils/location';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';
import type { Category } from './CategoryFilter';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SortDropdown, type SortOption } from './SortDropdown';

export interface FilterState {
  categories: string[];
  subcategories?: string[];
  location?: string; // Text-based location filter
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sort: SortOption;
  sortBy?: string; // Custom sort field
  sortOrder?: 'asc' | 'desc'; // Sort direction
  radius?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  groupByCategory?: boolean;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  categories: Category[];
  initialFilters?: Partial<FilterState>;
  minPrice?: number;
  maxPrice?: number;
}

export function FilterSheet({
  visible,
  onClose,
  onApply,
  categories,
  initialFilters,
  minPrice = 0,
  maxPrice = 1000,
}: FilterSheetProps) {
  const colors = useThemeColors();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    initialFilters?.subcategories || []
  );
  const [locationText, setLocationText] = useState(initialFilters?.location ?? '');
  const [priceRange, setPriceRange] = useState({
    min: initialFilters?.minPrice ?? minPrice,
    max: initialFilters?.maxPrice ?? maxPrice,
  });
  const [minRating, setMinRating] = useState(initialFilters?.minRating ?? 0);
  const [sort, setSort] = useState<SortOption>(initialFilters?.sort ?? 'newest');
  const [radius, setRadius] = useState(initialFilters?.radius ?? 25);
  const [locationName, setLocationName] = useState(initialFilters?.locationName ?? '');
  const [latitude, setLatitude] = useState<number | undefined>(initialFilters?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialFilters?.longitude);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(initialFilters?.groupByCategory ?? false);

  // Sync state when initialFilters change (e.g., when modal reopens)
  useEffect(() => {
    if (visible && initialFilters) {
      setSelectedCategories(initialFilters.categories || []);
      setSelectedSubcategories(initialFilters.subcategories || []);
      setLocationText(initialFilters.location ?? '');
      setPriceRange({
        min: initialFilters.minPrice ?? minPrice,
        max: initialFilters.maxPrice ?? maxPrice,
      });
      setMinRating(initialFilters.minRating ?? 0);
      setSort(initialFilters.sort ?? 'newest');
      setRadius(initialFilters.radius ?? 25);
      setLocationName(initialFilters.locationName ?? '');
      setLatitude(initialFilters.latitude);
      setLongitude(initialFilters.longitude);
      setGroupByCategory(initialFilters.groupByCategory ?? false);
    }
  }, [visible, initialFilters, minPrice, maxPrice]);

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
      location: locationText || undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating,
      sort,
      radius,
      latitude,
      longitude,
      locationName,
      groupByCategory,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setLocationText('');
    setPriceRange({ min: minPrice, max: maxPrice });
    setMinRating(0);
    setSort('newest');
    setRadius(25);
    setLocationName('');
    setLatitude(undefined);
    setLongitude(undefined);
    setGroupByCategory(false);
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location. Please enable it in your device settings.'
        );
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat);
      setLongitude(lng);

      // Reverse geocode to get location name with rate limit handling
      const reverseGeocode = await safeReverseGeocode(lat, lng);
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const city = address.city || address.district || address.subregion || '';
        const state = address.region || '';
        setLocationName(city && state ? `${city}, ${state}` : city || state || 'Current Location');
      } else {
        setLocationName('Current Location');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error || '');
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        Alert.alert(
          'Rate Limit Exceeded',
          'Too many location requests. Please wait a moment and try again.'
        );
      } else {
        Alert.alert('Error', 'Failed to get your location. Please try again.');
        console.error('Location error:', error);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const renderRatingFilter = () => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <View style={styles.ratingSection}>
        <Text style={styles.label}>Minimum Rating</Text>
        <View style={styles.ratingContainer}>
          {stars.map((star) => (
            <TouchableOpacity
              key={star}
              style={[
                styles.ratingButton,
                minRating >= star && {
                  backgroundColor: colors.primary[600],
                },
              ]}
              onPress={() => setMinRating(star === minRating ? 0 : star)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons
                name={minRating >= star ? 'star' : 'star-outline'}
                size={24}
                color={minRating >= star ? Colors.text.inverse : colors.text.tertiary}
              />
            </TouchableOpacity>
          ))}
          {minRating > 0 && (
            <Text style={styles.ratingText}>{minRating}+ stars</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity 
                onPress={handleReset}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text style={[styles.resetText, { color: colors.primary[600] }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Sort */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <SortDropdown selectedSort={sort} onSortChange={setSort} />
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <CategoryMultiSelect
                categories={categories}
                selectedCategories={selectedCategories}
                onSelectionChange={setSelectedCategories}
              />
            </View>

            {/* Location Text Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location (Text Search)</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                }]}
                placeholder="Enter city, state, or area"
                placeholderTextColor={colors.text.tertiary}
                value={locationText}
                onChangeText={setLocationText}
              />
              <Text style={[styles.hintText, { color: colors.text.tertiary }]}>
                Search for services in a specific location
              </Text>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <PriceRangeSlider
                minPrice={minPrice}
                maxPrice={maxPrice}
                initialMin={priceRange.min}
                initialMax={priceRange.max}
                onPriceChange={(min, max) => setPriceRange({ min, max })}
              />
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>{renderRatingFilter()}</View>

            {/* Location Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: colors.background.secondary }]}
                onPress={handleUseCurrentLocation}
                disabled={isGettingLocation}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons
                  name={isGettingLocation ? 'hourglass-outline' : 'location-outline'}
                  size={20}
                  color={colors.primary[600]}
                />
                <Text style={[styles.locationButtonText, { color: colors.primary[600] }]}>
                  {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
              {locationName ? (
                <View style={styles.locationInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                  <Text style={styles.locationName}>{locationName}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setLocationName('');
                      setLatitude(undefined);
                      setLongitude(undefined);
                    }}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.radiusContainer}>
                <Text style={styles.label}>Search Radius: {radius} km</Text>
                <View style={styles.radiusButtons}>
                  {[5, 10, 25, 50, 100].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.radiusButton,
                        radius === r && { backgroundColor: colors.primary[600] },
                        { borderColor: colors.border.medium },
                      ]}
                      onPress={() => setRadius(r)}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text
                        style={[
                          styles.radiusButtonText,
                          radius === r && { color: Colors.text.inverse },
                        ]}
                      >
                        {r} km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Group By Category */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.checkboxContainer, { backgroundColor: colors.background.secondary }]}
                onPress={() => setGroupByCategory(!groupByCategory)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <View style={[
                  styles.checkbox,
                  groupByCategory && { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
                  !groupByCategory && { borderColor: colors.border.medium },
                ]}>
                  {groupByCategory && (
                    <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text.primary }]}>
                  Group results by category
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: Colors.border.light }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: Colors.border.medium }]}
              onPress={onClose}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleApply}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '90%',
    flexDirection: 'column',
    ...Shadows.xl,
    ...Platform.select({
      android: {
        elevation: Shadows.xl.elevation,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderBottomColor: Colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  resetText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  ratingSection: {
    marginVertical: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
  },
  ratingText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: Spacing.md, android: Spacing.md + 2 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  cancelText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applyButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: Spacing.md, android: Spacing.md + 2 }),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  applyText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  radiusContainer: {
    marginTop: Spacing.sm,
  },
  radiusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  radiusButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    minWidth: 60,
    alignItems: 'center',
    minHeight: Platform.select({ ios: 36, android: 40 }),
  },
  radiusButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 16,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  textInput: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
    minHeight: Platform.select({ ios: 44, android: 48 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
    ...Platform.select({
      android: {
        paddingVertical: Spacing.sm + 2,
      },
    }),
  },
  hintText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

