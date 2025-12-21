import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import type { Service } from '@localpro/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';
import { ServiceCard } from './ServiceCard';

interface NaturalLanguageSearchProps {
  onServiceSelect?: (service: Service) => void;
  placeholder?: string;
}

export function NaturalLanguageSearch({
  onServiceSelect,
  placeholder = 'Ask me anything... e.g., "Find a plumber near me"',
}: NaturalLanguageSearchProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Service[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const commonQueries = [
    'Find a plumber near me',
    'Best house cleaning service',
    'Affordable electrician',
    'Same-day delivery service',
    'Professional photographer',
  ];

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const services = await MarketplaceService.naturalLanguageSearch(searchQuery);
      setResults(services);
      
      // Generate suggestions based on query
      if (services.length === 0) {
        setSuggestions([
          'Try: "plumber"',
          'Try: "cleaning service"',
          'Try: "electrician"',
        ]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to perform search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const renderResult = ({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      onPress={() => onServiceSelect?.(item)} viewMode={'grid'}    />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor: colors.border.medium }]}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.primary[600]} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.semantic.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {query.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          {commonQueries.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { backgroundColor: colors.primary[50] }]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons name="bulb-outline" size={16} color={colors.primary[600]} />
              <Text style={[styles.suggestionText, { color: colors.primary[700] }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {suggestions.length > 0 && results.length === 0 && !loading && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { backgroundColor: colors.primary[50] }]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: colors.primary[700] }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Found {results.length} {results.length === 1 ? 'service' : 'services'}
          </Text>
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.semantic.error + '20',
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    fontSize: 14,
    color: Colors.semantic.error,
  },
  suggestionsContainer: {
    gap: Spacing.sm,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  suggestionText: {
    fontSize: 14,
  },
  resultsContainer: {
    gap: Spacing.sm,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  separator: {
    height: Spacing.sm,
  },
});

