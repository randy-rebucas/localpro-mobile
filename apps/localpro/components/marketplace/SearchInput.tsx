import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilterButton?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showSuggestions?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search services...',
  onFilterPress,
  showFilterButton = true,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
}: SearchInputProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      router.push('/(app)/(tabs)/search' as any);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setIsFocused(false);
  };

  const shouldShowSuggestions = showSuggestions && isFocused && suggestions.length > 0 && value.length > 0;

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <View style={[styles.searchInput, { backgroundColor: colors.background.primary }]}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInputText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
        {shouldShowSuggestions && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.background.primary }]}>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons name="search-outline" size={16} color={colors.text.tertiary} />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
      {showFilterButton && (
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.background.primary }]}
          onPress={handleFilterPress}
        >
          <Ionicons name="options-outline" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.lg,
    maxHeight: 200,
    ...Shadows.md,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
});

