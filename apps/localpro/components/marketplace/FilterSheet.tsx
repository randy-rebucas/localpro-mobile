import { Ionicons } from '@expo/vector-icons';
import type { Category } from './CategoryFilter';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SortDropdown, type SortOption } from './SortDropdown';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sort: SortOption;
  radius?: number;
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
  const [priceRange, setPriceRange] = useState({
    min: initialFilters?.minPrice ?? minPrice,
    max: initialFilters?.maxPrice ?? maxPrice,
  });
  const [minRating, setMinRating] = useState(initialFilters?.minRating ?? 0);
  const [sort, setSort] = useState<SortOption>(initialFilters?.sort ?? 'newest');

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating,
      sort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setPriceRange({ min: minPrice, max: maxPrice });
    setMinRating(0);
    setSort('newest');
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
              <TouchableOpacity onPress={handleReset}>
                <Text style={[styles.resetText, { color: colors.primary[600] }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
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
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: Colors.border.light }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: Colors.border.medium }]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleApply}
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
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  ratingSection: {
    marginVertical: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
  },
  ratingText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

