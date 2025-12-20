import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  serviceCount?: number;
}

export default function LocationsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Mock locations data - replace with actual API call
  const locations: Location[] = [];

  const popularLocations = [
    { id: 'current', name: 'Current Location', icon: 'location' as const },
    { id: 'nearby', name: 'Nearby', icon: 'navigate' as const },
    { id: 'city', name: 'My City', icon: 'business' as const },
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationPress = (locationId: string) => {
    setSelectedLocation(locationId);
    // TODO: Filter services by location
    // router.push(`/(app)/location/${locationId}`);
    console.log('Location selected:', locationId);
  };

  const handleUseCurrentLocation = () => {
    // TODO: Get current location using geolocation API
    console.log('Using current location');
  };

  const handleSearchLocation = () => {
    if (searchQuery.trim()) {
      // TODO: Search for locations
      console.log('Searching for location:', searchQuery);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search by Location</Text>
            <Text style={styles.subtitle}>Find services and providers near you</Text>
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
                placeholder="Search city, address, or zip code..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleSearchLocation}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Location Options */}
          <Card style={styles.quickOptionsCard}>
            <Text style={styles.sectionTitle}>Quick Options</Text>
            <View style={styles.quickOptionsGrid}>
              {popularLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.quickOption}
                  onPress={() => {
                    if (location.id === 'current') {
                      handleUseCurrentLocation();
                    } else {
                      handleLocationPress(location.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickOptionIcon, { backgroundColor: `${colors.primary[600]}15` }]}>
                    <Ionicons name={location.icon} size={24} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.quickOptionText}>{location.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Locations List */}
          {filteredLocations.length > 0 ? (
            <View style={styles.locationsList}>
              <Text style={styles.sectionTitle}>Locations</Text>
              {filteredLocations.map((location) => {
                const isSelected = selectedLocation === location.id;
                return (
                  <View key={location.id} style={[styles.locationCard, isSelected && { borderColor: colors.primary[600], borderWidth: 2 }]}>
                    <TouchableOpacity
                      onPress={() => handleLocationPress(location.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.locationHeader}>
                        <View style={[styles.locationIcon, { backgroundColor: `${colors.primary[600]}15` }]}>
                          <Ionicons name="location" size={24} color={colors.primary[600]} />
                        </View>
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationName}>{location.name}</Text>
                          <Text style={styles.locationAddress} numberOfLines={2}>
                            {location.address}
                          </Text>
                          <Text style={styles.locationCity}>
                            {location.city}, {location.state} {location.zipCode}
                          </Text>
                          {location.serviceCount !== undefined && (
                            <View style={styles.locationMeta}>
                              <Ionicons name="business-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.locationMetaText}>
                                {location.serviceCount} {location.serviceCount === 1 ? 'service' : 'services'}
                              </Text>
                            </View>
                          )}
                        </View>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: colors.primary[600] }]}>
                            <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'location-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Locations Found' : 'No Locations Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or use quick options above'
                    : 'Use the quick options above or search for a specific location'}
                </Text>
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
    marginBottom: Spacing.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
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
  searchButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  quickOptionsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  quickOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  locationsList: {
    marginBottom: Spacing.md,
  },
  locationCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    position: 'relative',
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  locationCity: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  locationMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

