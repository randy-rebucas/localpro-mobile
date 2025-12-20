import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface FacilityService {
  id: string;
  facilityId: string;
  facilityName: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  providerId: string;
  providerName: string;
  category?: string;
  rating?: number;
}

export default function ServicesFcTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const colors = useThemeColors();

  // Mock services data - replace with actual API call
  const services: FacilityService[] = [];

  const categories = [
    { key: 'all', label: 'All Services', icon: 'list-outline' as const },
    { key: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' as const },
    { key: 'maintenance', label: 'Maintenance', icon: 'construct-outline' as const },
    { key: 'security', label: 'Security', icon: 'shield-outline' as const },
    { key: 'landscaping', label: 'Landscaping', icon: 'leaf-outline' as const },
    { key: 'waste', label: 'Waste Management', icon: 'trash-outline' as const },
    { key: 'utilities', label: 'Utilities', icon: 'flash-outline' as const },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServicePress = (serviceId: string) => {
    // TODO: Navigate to service detail screen
    // router.push(`/(app)/facility-service/${serviceId}`);
    console.log('View service:', serviceId);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Services</Text>
            <Text style={styles.subtitle}>Browse facility care services</Text>
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
                placeholder="Search services, facilities, providers..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <Ionicons
                    name={category.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Services List */}
          {filteredServices.length > 0 ? (
            <View style={styles.servicesList}>
              {filteredServices.map((service) => (
                <Card key={service.id} style={styles.serviceCard}>
                  <TouchableOpacity
                    onPress={() => handleServicePress(service.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceIconContainer}>
                        <Ionicons 
                          name={service.category === 'cleaning' ? 'sparkles' :
                                service.category === 'maintenance' ? 'construct' :
                                service.category === 'security' ? 'shield' :
                                service.category === 'landscaping' ? 'leaf' :
                                service.category === 'waste' ? 'trash' :
                                service.category === 'utilities' ? 'flash' : 'build'} 
                          size={32} 
                          color={colors.primary[600]} 
                        />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName} numberOfLines={2}>
                          {service.name}
                        </Text>
                        <View style={styles.serviceMeta}>
                          <View style={styles.serviceMetaItem}>
                            <Ionicons name="business-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.serviceMetaText} numberOfLines={1}>
                              {service.facilityName}
                            </Text>
                          </View>
                          <View style={styles.serviceMetaItem}>
                            <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.serviceMetaText} numberOfLines={1}>
                              {service.providerName}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {service.description}
                    </Text>

                    <View style={styles.serviceFooter}>
                      <View style={styles.servicePricing}>
                        <Text style={styles.servicePrice}>
                          {formatCurrency(service.price)}
                        </Text>
                        <Text style={styles.serviceDuration}>
                          {formatDuration(service.duration)}
                        </Text>
                      </View>
                      {service.rating && (
                        <View style={styles.serviceRating}>
                          <Ionicons name="star" size={14} color={colors.semantic.warning} />
                          <Text style={styles.serviceRatingText}>
                            {service.rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'construct-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Services Found' : 'No Services Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'There are no facility care services available at the moment'}
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
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
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
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  servicesList: {
    gap: Spacing.md,
  },
  serviceCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceMeta: {
    gap: Spacing.xs,
  },
  serviceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  serviceMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  servicePricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  serviceDuration: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  serviceRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
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

