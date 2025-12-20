import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SearchHistoryProps {
  searches: string[];
  onSearchSelect: (query: string) => void;
  onClearHistory?: () => void;
}

export function SearchHistory({
  searches,
  onSearchSelect,
  onClearHistory,
}: SearchHistoryProps) {
  const colors = useThemeColors();

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        {onClearHistory && (
          <TouchableOpacity onPress={onClearHistory}>
            <Text style={[styles.clearText, { color: colors.primary[600] }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={searches}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.searchItem}
            onPress={() => onSearchSelect(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={colors.text.tertiary} />
            <Text style={styles.searchText}>{item}</Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                // TODO: Remove individual search from history
              }}
            >
              <Ionicons name="close" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
});

