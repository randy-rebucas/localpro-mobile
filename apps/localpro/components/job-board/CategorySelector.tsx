import { JobBoardService } from '@localpro/job-board';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  required?: boolean;
}

export function CategorySelector({ selectedCategoryId, onSelectCategory, required = false }: CategorySelectorProps) {
  const colors = useThemeColors();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await JobBoardService.getCategories();
        console.log('Fetched categories:', data);
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          console.warn('No categories returned from API');
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        // Show error to user if needed
        if (err?.message) {
          console.error('Category fetch error details:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading categories...</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          Category {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
          No categories available. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Category {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                  borderColor: isSelected ? colors.primary[600] : colors.border.light,
                },
              ]}
              onPress={() => onSelectCategory(isSelected ? undefined : category.id)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  required: {
    color: Colors.semantic.error[600],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  categoryText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});

