import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const colors = useThemeColors();

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? colors.primary[600] : colors.background.primary,
            borderColor: isSelected ? colors.primary[600] : colors.border.light,
          },
        ]}
        onPress={() => onSelectCategory(isSelected ? undefined : item.id)}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        {item.icon && (
          <Ionicons
            name={item.icon as any}
            size={16}
            color={isSelected ? Colors.text.inverse : colors.text.secondary}
          />
        )}
        <Text
          style={[
            styles.categoryText,
            {
              color: isSelected ? Colors.text.inverse : colors.text.secondary,
            },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

