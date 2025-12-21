import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import type { Review, Service } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import {
  ReviewList,
  ServiceCard
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Provider {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  phone?: string;
  email?: string;
  servicesCount?: number;
}

function ProviderProfileScreenContent() {
  const params = useLocalSearchParams<{ providerId: string }>();
  // Extract serviceId from params - handle both serviceId and id for compatibility
  const rawProviderId = Array.isArray(params.providerId) 
    ? params.providerId[0] 
    : (params.providerId || (params as any).id);
  const providerId = rawProviderId && typeof rawProviderId === 'string' && rawProviderId.trim() !== '' 
    ? rawProviderId.trim() 
    : undefined;
  const router = useRouter();
  const colors = useThemeColors();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [error, setError] = useState<{ status?: number; message?: string } | null>(null);

  useEffect(() => {
    if (providerId) {
      loadProvider();
      loadServices();
      loadReviews();
    }
  }, [providerId]);

  useEffect(() => {
    if (providerId && reviewsPage > 1) {
      loadMoreReviews();
    }
  }, [reviewsPage]);

  const loadProvider = async () => {
    if (!providerId) return;
    setLoading(true);
    try {
      const providerData = await MarketplaceService.getProvider(providerId as string);
      if (providerData) {
        setProvider(providerData);
        // If services are included in the provider response, use them
        if (providerData._raw?.services && Array.isArray(providerData._raw.services)) {
          const mappedServices = providerData._raw.services.map((service: any) => {
            // Map API service format to Service type
            const serviceId = service._id || service.id;
            return {
              id: serviceId ? String(serviceId) : '',
              title: service.title ? String(service.title) : 'Untitled Service',
              description: service.description ? String(service.description) : '',
              category: service.category ? String(service.category) : '',
              subcategory: service.subcategory ? String(service.subcategory) : undefined,
              price: service.pricing?.basePrice || 0,
              pricing: service.pricing,
              providerId: providerId ? String(providerId) : '',
              providerName: providerData.name ? String(providerData.name) : 'Unknown Provider',
              images: Array.isArray(service.images) ? service.images : [],
              rating: service.rating?.average,
              reviewCount: service.rating?.count,
              status: service.isActive ? 'published' : 'draft',
              availability: service.availability,
              estimatedDuration: service.estimatedDuration,
              serviceType: service.serviceType,
              createdAt: service.createdAt ? new Date(service.createdAt) : new Date(),
            } as Service;
          });
          setServices(mappedServices);
          setServicesLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error loading provider:', error);
      
      // Extract error details
      const errorStatus = error?.status || error?.response?.status;
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load provider profile';
      
      setError({
        status: errorStatus,
        message: errorMessage,
      });
      
      // Don't show alert, let the UI handle it
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    if (!providerId) return;
    // Only load services if not already loaded from provider response
    if (services.length > 0) {
      setServicesLoading(false);
      return;
    }
    setServicesLoading(true);
    try {
      const servicesData = await MarketplaceService.getProviderServices(providerId as string);
      setServices(servicesData);
    } catch (error: any) {
      console.error('Error loading services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!providerId) return;
    setReviewsLoading(true);
    try {
      const result = await MarketplaceService.getProviderReviews(providerId as string, 1, 10);
      setReviews(result.reviews);
      setHasMoreReviews(result.hasMore);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!providerId) return;
    try {
      const result = await MarketplaceService.getProviderReviews(providerId as string, reviewsPage, 10);
      setReviews((prev) => [...prev, ...result.reviews]);
      setHasMoreReviews(result.hasMore);
    } catch (error: any) {
      console.error('Error loading more reviews:', error);
    }
  };

  const handleLoadMoreReviews = () => {
    if (!reviewsLoading && hasMoreReviews) {
      setReviewsPage((prev) => prev + 1);
    }
  };

  const handleContact = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    } else if (provider?.email) {
      Linking.openURL(`mailto:${provider.email}`);
    } else {
      Alert.alert('Contact', 'Contact information not available');
    }
  };

  const handleMessage = () => {
    // TODO: Navigate to messaging screen
    Alert.alert('Message', 'Messaging feature coming soon');
  };

  const handleServicePress = (serviceId: string) => {
    if (!serviceId) return;
    router.push(`/(stack)/service/${String(serviceId)}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading provider...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle specific error cases
  if (error) {
    const isInactiveProvider = error.status === 403 && error.message?.toLowerCase().includes('not active');
    const isPendingProvider = error.message?.toLowerCase().includes('pending');
    
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.semantic.warning + '20' }]}>
            <Ionicons 
              name={isPendingProvider ? "time-outline" : "lock-closed-outline"} 
              size={64} 
              color={colors.semantic.warning} 
            />
          </View>
          
          <Text style={styles.errorTitle}>
            {isPendingProvider ? 'Profile Under Review' : 'Profile Not Available'}
          </Text>
          
          <Text style={styles.errorMessage}>
            {isPendingProvider 
              ? 'This provider profile is currently pending approval. Please check back later.'
              : error.message || 'This provider profile is not currently active or available.'}
          </Text>
          
          {isPendingProvider && (
            <View style={[styles.infoBox, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary[600]} />
              <Text style={[styles.infoText, { color: colors.primary[700] }]}>
                The provider is completing their profile setup. Once approved, their services will be available.
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.backButtonLarge, { backgroundColor: colors.primary[600] }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.inverse} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || !providerId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.semantic.error + '20' }]}>
            <Ionicons name="person-remove-outline" size={64} color={colors.semantic.error} />
          </View>
          
          <Text style={styles.errorTitle}>Provider Not Found</Text>
          
          <Text style={styles.errorMessage}>
            The provider you're looking for doesn't exist or has been removed.
          </Text>
          
          <TouchableOpacity
            style={[styles.backButtonLarge, { backgroundColor: colors.primary[600] }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.inverse} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Provider Header Card */}
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary[100] }]}>
                {provider.avatar ? (
                  <Image source={{ uri: provider.avatar }} style={styles.avatar} />
                ) : (
                  <Ionicons name="person" size={40} color={colors.primary[600]} />
                )}
                {provider.verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.secondary[600] }]}>
                    <Ionicons name="checkmark" size={12} color={Colors.text.inverse} />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.providerName}>{provider.name || 'Unknown Provider'}</Text>
                  {provider.verified && (
                    <Ionicons name="shield-checkmark" size={20} color={colors.secondary[600]} />
                  )}
                </View>
                {provider.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                    <Text style={styles.locationText}>{String(provider.location)}</Text>
                  </View>
                )}
                {(provider.rating != null || provider.reviewCount != null) && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color={colors.semantic.warning} />
                    <Text style={styles.ratingText}>
                      {provider.rating != null && typeof provider.rating === 'number' 
                        ? provider.rating.toFixed(1) 
                        : 'N/A'}
                    </Text>
                    {provider.reviewCount !== undefined && provider.reviewCount > 0 && (
                      <Text style={styles.reviewCountText}>
                        ({provider.reviewCount} {provider.reviewCount === 1 ? 'review' : 'reviews'})
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
            {provider.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{String(provider.bio)}</Text>
              </View>
            )}
          </Card>

          {/* Contact Actions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleContact}
            >
              <Ionicons name="call-outline" size={20} color={Colors.text.inverse} />
              <Text style={styles.actionButtonText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton, { borderColor: colors.primary[600] }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary[600]} />
              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <Card style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{String(services.length || 0)}</Text>
                <Text style={styles.statLabel}>Services</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{String(provider.reviewCount || 0)}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {provider.rating != null && typeof provider.rating === 'number' 
                    ? provider.rating.toFixed(1) 
                    : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </Card>

          {/* Services Offered */}
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              <Text style={styles.sectionSubtitle}>{String(services.length || 0)} services</Text>
            </View>
            {servicesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
              </View>
            ) : services.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>No services available</Text>
              </View>
            ) : (
              <View style={styles.servicesGrid}>
                {services.map((service) => (
                  <ServiceCard
                        key={service.id}
                        service={service}
                        onPress={() => handleServicePress(service.id)} viewMode={'grid'}                  />
                ))}
              </View>
            )}
          </Card>

          {/* Reviews */}
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {provider.rating != null && provider.rating > 0 && (
                <View style={styles.overallRating}>
                  <Ionicons name="star" size={20} color={colors.semantic.warning} />
                  <Text style={styles.overallRatingText}>
                    {typeof provider.rating === 'number' ? provider.rating.toFixed(1) : String(provider.rating || '0.0')}
                  </Text>
                </View>
              )}
            </View>
            {reviewsLoading && reviews.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : (
              <ReviewList
                reviews={reviews}
                serviceId={providerId ? String(providerId) : ''}
                onLoadMore={handleLoadMoreReviews}
                hasMore={hasMoreReviews}
              />
            )}
          </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: Spacing.lg,
  },
  profileCard: {
    marginBottom: Spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Shadows.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviewCountText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  bioContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  card: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  overallRatingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  servicesGrid: {
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    maxWidth: 400,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  backButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    minWidth: 200,
    ...Shadows.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

export default function ProviderProfileScreen() {
  return (
    <ErrorBoundary>
      <ProviderProfileScreenContent />
    </ErrorBoundary>
  );
}

