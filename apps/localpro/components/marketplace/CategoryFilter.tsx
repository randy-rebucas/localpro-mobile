import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  const colors = useThemeColors();

  // Filter out invalid categories and ensure unique IDs
  const validCategories = React.useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      if (!category || !category.id || !category.name || seen.has(category.id)) {
        return false;
      }
      seen.add(category.id);
      return true;
    });
  }, [categories]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      {validCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && {
              backgroundColor: colors.primary[600],
            },
          ]}
          onPress={() => onCategorySelect(category.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons
            name={category.icon}
            size={16}
            color={selectedCategory === category.id ? Colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: Colors.text.inverse },
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
    minHeight: Platform.select({ ios: 36, android: 40 }),
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

