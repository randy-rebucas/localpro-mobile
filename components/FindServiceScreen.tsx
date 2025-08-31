import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getServicesWithProviders, getTopProviders, Provider, Service } from '../lib/firestore';

const { width, height } = Dimensions.get('window');

// Default featured services (fallback)
const defaultFeaturedServices = [
  { id: '1', name: 'House Cleaning', icon: 'home-outline', rating: 4.8, providers: 24, color: '#FF6B6B', description: 'Professional cleaning services' },
  { id: '2', name: 'Plumbing', icon: 'water-outline', rating: 4.6, providers: 18, color: '#4ECDC4', description: 'Expert plumbing solutions' },
];

const ProviderCard = ({ provider }: { provider: any }) => (
  <TouchableOpacity style={styles.providerCard} activeOpacity={0.8}>
    <View style={styles.providerAvatar}>
      <Ionicons name={provider.avatar} size={24} color="#667eea" />
    </View>
    <Text style={styles.providerName}>{provider.name}</Text>
    <Text style={styles.providerService}>{provider.service}</Text>
    <View style={styles.providerStats}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.providerRating}>{provider.rating}</Text>
      </View>
      <Text style={styles.providerReviews}>({provider.reviews})</Text>
    </View>
  </TouchableOpacity>
);

const ServiceCard = ({ service, isFeatured = false }: { service: any; isFeatured?: boolean }) => (
  <TouchableOpacity style={[styles.serviceCard, isFeatured && styles.featuredCard]} activeOpacity={0.8}>
    <LinearGradient
      colors={[service.color, service.color + '80']}
      style={styles.serviceIconContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={service.icon} size={isFeatured ? 32 : 28} color="#fff" />
    </LinearGradient>
    <Text style={[styles.serviceName, isFeatured && styles.featuredServiceName]}>{service.name}</Text>
    {isFeatured && (
      <Text style={styles.serviceDescription}>{service.description}</Text>
    )}
    <View style={styles.serviceStats}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.serviceRating}>{service.rating}</Text>
      </View>
      <Text style={styles.serviceProviders}>{service.providers} providers</Text>
    </View>
  </TouchableOpacity>
);

const FeaturedServiceCard = ({ service }: { service: any }) => (
  <TouchableOpacity style={styles.featuredServiceCard} activeOpacity={0.8}>
    <LinearGradient
      colors={[service.color, service.color + 'CC']}
      style={styles.featuredGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.featuredContent}>
        <View style={styles.featuredIconContainer}>
          <Ionicons name={service.icon} size={40} color="#fff" />
        </View>
        <View style={styles.featuredTextContainer}>
          <Text style={styles.featuredTitle}>{service.name}</Text>
          <Text style={styles.featuredDescription}>{service.description}</Text>
          <View style={styles.featuredStats}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.featuredRating}>{service.rating}</Text>
            </View>
            <Text style={styles.featuredProviders}>{service.providers} providers</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.featuredArrow} />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const ActivityCard = ({ activity }: { activity: any }) => (
  <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
    <View style={styles.activityIconContainer}>
      <Ionicons name={activity.icon} size={20} color={activity.iconColor || '#28a745'} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#ccc" />
  </TouchableOpacity>
);

// Mock data for recent activity
const activityList = [
  { id: '1', title: 'House cleaning completed', time: '2 hours ago', icon: 'checkmark-circle', iconColor: '#28a745' },
  { id: '2', title: 'Review submitted for Sarah Johnson', time: 'Yesterday', icon: 'star', iconColor: '#ffc107' },
  { id: '3', title: 'Booking confirmed with Mike Wilson', time: '2 days ago', icon: 'calendar', iconColor: '#007bff' },
  { id: '4', title: 'Payment processed', time: '3 days ago', icon: 'card', iconColor: '#6f42c1' },
];

export const FindServiceScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [topProviders, setTopProviders] = useState<Provider[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, providersData] = await Promise.all([
          getServicesWithProviders(),
          getTopProviders()
        ]);
        
        setServices(servicesData);
        setFilteredServices(servicesData);
        setTopProviders(providersData);
        
        // Set featured services (first 2 services)
        setFeaturedServices(servicesData.slice(0, 2));
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load services. Please try again.');
        // Use default data as fallback
        setServices([]);
        setFeaturedServices(defaultFeaturedServices);
        setTopProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>What category do you need?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, searchQuery.length > 0 && styles.searchInputContainerActive]}>
            <Ionicons name="search" size={20} color={searchQuery.length > 0 ? "#667eea" : "#999"} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for categories..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderFeaturedSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.featuredScrollContainer}>
        {featuredServices.map((service) => (
          <FeaturedServiceCard key={service.id} service={service} />
        ))}
      </View>
    </View>
  );

  const renderAllServicesSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'All Categories'}
        </Text>
        <Text style={styles.serviceCount}>
          {filteredServices.length} {searchQuery ? 'results' : 'categories available'}
        </Text>
      </View>
      {filteredServices.length === 0 && searchQuery ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color="#ccc" />
                  <Text style={styles.noResultsText}>No categories found</Text>
        <Text style={styles.noResultsSubtext}>Try a different search term</Text>
        </View>
      ) : (
        <View style={styles.servicesGrid}>
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>
      )}
    </View>
  );

  const renderTopProvidersSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Providers</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.providersGrid}>
        {topProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </View>
    </View>
  );
  
  const renderRecentActivitySection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activityList}>
        {activityList.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {renderHeader()}
        {renderFeaturedSection()}
        {renderAllServicesSection()}
        {renderTopProvidersSection()}
        {renderRecentActivitySection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  searchContainer: {
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  searchInputContainerActive: {
    borderColor: '#667eea',
    borderWidth: 1,
  },
  clearButton: {
    padding: 4,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  serviceCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  featuredScrollContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  featuredServiceCard: {
    width: width * 0.8,
    height: 120,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  featuredGradient: {
    flex: 1,
    padding: 20,
  },
  featuredContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featuredRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  featuredProviders: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredArrow: {
    marginLeft: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  serviceCard: {
    width: (width - 52) / 2, // Account for container padding and margins
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 140,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  featuredServiceName: {
    fontSize: 18,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  serviceStats: {
    alignItems: 'center',
  },
  serviceRating: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceProviders: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  providerCard: {
    width: (width - 52) / 2, // Account for container padding and margins
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 120,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  providerService: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRating: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginLeft: 2,
  },
  providerReviews: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  activityList: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
