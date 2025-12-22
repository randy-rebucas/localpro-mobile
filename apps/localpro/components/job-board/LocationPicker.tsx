import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface LocationPickerProps {
  location?: string;
  radius?: number;
  onLocationChange: (location?: string) => void;
  onRadiusChange: (radius?: number) => void;
  onLocationDetailsChange?: (details: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  }) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export function LocationPicker({
  location,
  radius,
  onLocationChange,
  onRadiusChange,
  onLocationDetailsChange,
}: LocationPickerProps) {
  const colors = useThemeColors();
  const [locationText, setLocationText] = useState(location || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    setLocationText(location || '');
  }, [location]);

  const handleLocationChange = async (text: string) => {
    setLocationText(text);
    onLocationChange(text || undefined);

    // Show autocomplete suggestions when user types
    if (text.length > 2) {
      await fetchLocationSuggestions(text);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    try {
      setIsGeocoding(true);
      // Use expo-location geocoding to get suggestions
      const results = await Location.geocodeAsync(query);
      
      if (results && results.length > 0) {
        const locationSuggestions = results.slice(0, 5).map((result) => {
          const parts = [];
          if (result.street) parts.push(result.street);
          if (result.city) parts.push(result.city);
          if (result.region) parts.push(result.region);
          if (result.country) parts.push(result.country);
          return parts.join(', ') || query;
        });
        setSuggestions(locationSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setLocationText(suggestion);
    setShowSuggestions(false);
    onLocationChange(suggestion);

    // Geocode the selected suggestion to get details
    try {
      const results = await Location.geocodeAsync(suggestion);
      if (results && results.length > 0) {
        const result = results[0];
        if (onLocationDetailsChange) {
          onLocationDetailsChange({
            address: suggestion,
            city: result.city || undefined,
            state: result.region || undefined,
            country: result.country || undefined,
            lat: result.latitude,
            lng: result.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error geocoding selected location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.border.light,
                color: colors.text.primary,
                backgroundColor: colors.background.secondary,
              },
            ]}
            placeholder="Enter city, state, or address"
            placeholderTextColor={colors.text.tertiary}
            value={locationText}
            onChangeText={handleLocationChange}
            onFocus={() => {
              if (locationText.length > 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding to allow suggestion selection
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {isGeocoding && (
            <ActivityIndicator size="small" color={colors.primary[600]} style={styles.loader} />
          )}
        </View>
        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.background.primary }]}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="location" size={16} color={colors.primary[600]} />
                <Text style={[styles.suggestionText, { color: colors.text.primary }]}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {location && (
        <View style={styles.radiusContainer}>
          <Text style={[styles.radiusLabel, { color: colors.text.tertiary }]}>
            Search Radius (miles)
          </Text>
          <View style={styles.radiusChips}>
            {RADIUS_OPTIONS.map((option) => {
              const isSelected = radius === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.radiusChip,
                    {
                      backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                      borderColor: isSelected ? colors.primary[600] : colors.border.light,
                    },
                  ]}
                  onPress={() => onRadiusChange(isSelected ? undefined : option)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                    ]}
                  >
                    {option} mi
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  loader: {
    marginLeft: Spacing.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 10, android: 12 }),
    fontSize: 15,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  radiusContainer: {
    marginTop: Spacing.sm,
  },
  radiusLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  radiusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

