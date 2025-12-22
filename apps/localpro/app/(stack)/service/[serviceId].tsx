import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { MarketplaceService, useService } from '@localpro/marketplace';
import type { Review } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import {
  BookingCTA,
  EmptyState,
  ImageCarousel,
  ProviderCard,
  ReviewList,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

function ServiceDetailScreenContent() {
  const params = useLocalSearchParams<{ serviceId: string }>();
  // Extract serviceId from params - handle both serviceId and id for compatibility
  const rawServiceId = Array.isArray(params.serviceId) 
    ? params.serviceId[0] 
    : (params.serviceId || (params as any).id);
  
  // Ensure serviceId is a valid string, not empty
  const serviceId = rawServiceId && typeof rawServiceId === 'string' && rawServiceId.trim() !== '' 
    ? rawServiceId.trim() 
    : '';
  
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const { activeRole } = useRoleContext();
  const { service, loading, error } = useService(serviceId);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<Error | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  
  // Check if current user is the service provider
  const isServiceOwner = activeRole === 'provider' && service?.providerId === user?.id;

  // Reset reviews when service changes
  useEffect(() => {
    if (service?.id) {
      setReviews([]);
      setReviewsPage(1);
      setHasMoreReviews(false);
      setReviewsError(null);
    }
  }, [service?.id]);

  // Fetch reviews when service is loaded
  useEffect(() => {
    if (!service?.id) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const result = await MarketplaceService.getServiceReviews(service.id ? String(service.id) : '', reviewsPage, 10);
        if (reviewsPage === 1) {
          setReviews(result.reviews);
        } else {
          setReviews((prev) => [...prev, ...result.reviews]);
        }
        setHasMoreReviews(result.hasMore);
      } catch (err: any) {
        setReviewsError(err);
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [service?.id, reviewsPage]);

  const handleLoadMoreReviews = () => {
    if (!reviewsLoading && hasMoreReviews) {
      setReviewsPage((prev) => prev + 1);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  const handleShare = async () => {
    if (!service) return;

    try {
      await Share.share({
        message: `Check out ${service.title} - ${formatCurrency(service.price)}`,
        title: service.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Service',
      'Are you sure you want to report this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement report functionality
            Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
          },
        },
      ]
    );
  };

  const handleBook = () => {
    if (!service?.id) return;
    const id = String(service.id);
    router.push(`/(stack)/booking/create?serviceId=${id}` as any);
  };

  const handleEdit = () => {
    if (!service?.id) return;
    const id = String(service.id);
    router.push(`/(stack)/service/${id}/edit` as any);
  };

  const handleDelete = () => {
    if (!service?.id) return;
    
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const id = String(service.id);
              await MarketplaceService.deleteService(id);
              Alert.alert('Success', 'Service deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', error.message || 'Failed to delete service');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async () => {
    if (!service?.id) return;
    
    setIsTogglingStatus(true);
    try {
      const currentStatus = service.status || 'published';
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const id = String(service.id);
      await MarketplaceService.updateService(id, { status: newStatus });
      Alert.alert('Success', `Service ${newStatus === 'published' ? 'published' : 'saved as draft'}`);
      // Refresh service data
      router.replace(`/(stack)/service/${id}` as any);
    } catch (error: any) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', error.message || 'Failed to update service status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service || !service.id) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title="Service not found"
          subtitle="The service you're looking for doesn't exist or has been removed."
        />
      </SafeAreaView>
    );
  }

  // Ensure all critical service properties exist before rendering
  const safeServiceId = service.id ? String(service.id) : '';
  if (!safeServiceId) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title="Service not found"
          subtitle="Invalid service ID."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            {isServiceOwner ? (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleEdit}
                  disabled={isDeleting || isTogglingStatus}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="create-outline" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleDelete}
                  disabled={isDeleting || isTogglingStatus}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.semantic.error} />
                  ) : (
                    <Ionicons name="trash-outline" size={24} color={colors.semantic.error} />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleShare}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="share-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleReport}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="flag-outline" size={24} color={colors.semantic.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Image Carousel */}
        <ImageCarousel images={service.images || []} height={300} />

        {/* Service Info */}
        <View style={[styles.content, { paddingTop: Platform.select({ ios: 60, android: 70 }) }]}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{service.title || 'Untitled Service'}</Text>
            <Text style={[styles.price, { color: colors.primary[600] }]}>
              {formatCurrency(service.price || 0)}
            </Text>
          </View>

          {/* Rating and Category */}
          <View style={styles.metaRow}>
            {service.rating != null && service.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.semantic.warning} />
                <Text style={styles.ratingText}>
                  {typeof service.rating === 'number' ? service.rating.toFixed(1) : String(service.rating || '0.0')}
                </Text>
                {service.reviewCount !== undefined && service.reviewCount > 0 && (
                  <Text style={styles.reviewCountText}>
                    ({service.reviewCount} reviews)
                  </Text>
                )}
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.categoryText}>{service.category || 'Uncategorized'}</Text>
            </View>
          </View>

          {/* Description */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description || 'No description available'}</Text>
          </Card>

          {/* Service Area */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Service Area</Text>
            <View style={styles.serviceAreaRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary[600]} />
              <View style={styles.serviceAreaInfo}>
                <Text style={styles.serviceAreaText}>
                  Available in your area
                </Text>
                <Text style={styles.serviceAreaSubtext}>
                  Service radius: 25 miles
                </Text>
              </View>
            </View>
          </Card>

          {/* Provider Card */}
          {service.providerId && (
            <ProviderCard
              providerId={service.providerId ? String(service.providerId) : ''}
              providerName={service.providerName ? String(service.providerName) : 'Unknown Provider'}
              rating={service.rating}
              reviewCount={service.reviewCount}
              verified={true}
              location="San Francisco, CA"
            />
          )}

          {/* Provider Actions - Only visible to service owner */}
          {isServiceOwner && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Manage Service</Text>
              
              {/* Status Toggle */}
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Service Status</Text>
                  <Text style={[styles.statusText, { color: (service.status || 'published') === 'published' ? colors.semantic.success : colors.text.secondary }]}>
                    {(service.status || 'published') === 'published' ? 'Published' : 'Draft'}
                  </Text>
                </View>
                <Switch
                  value={(service.status || 'published') === 'published'}
                  onValueChange={handleToggleStatus}
                  disabled={isTogglingStatus}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary[400] }}
                  thumbColor={(service.status || 'published') === 'published' ? colors.primary[600] : colors.neutral.gray500}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.providerActions}>
                <TouchableOpacity
                  style={[styles.providerActionButton, { borderColor: colors.primary[600] }]}
                  onPress={handleEdit}
                  disabled={isDeleting || isTogglingStatus}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary[600]} />
                  <Text style={[styles.providerActionText, { color: colors.primary[600] }]}>
                    Edit Service
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.providerActionButton, { borderColor: colors.semantic.error }]}
                  onPress={handleDelete}
                  disabled={isDeleting || isTogglingStatus}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.semantic.error} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
                  )}
                  <Text style={[styles.providerActionText, { color: colors.semantic.error }]}>
                    Delete Service
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Reviews Section */}
          <Card style={styles.card}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {service.rating != null && service.rating > 0 && (
                <View style={styles.overallRating}>
                  <Ionicons name="star" size={20} color={colors.semantic.warning} />
                  <Text style={styles.overallRatingText}>
                    {typeof service.rating === 'number' ? service.rating.toFixed(1) : String(service.rating || '0.0')}
                  </Text>
                </View>
              )}
            </View>
            {reviewsLoading && reviews.length === 0 ? (
              <View style={styles.reviewsLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Text style={styles.reviewsLoadingText}>Loading reviews...</Text>
              </View>
            ) : reviewsError ? (
              <View style={styles.reviewsErrorContainer}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.semantic.error} />
                <Text style={styles.reviewsErrorText}>
                  Failed to load reviews. Please try again.
                </Text>
              </View>
            ) : (
              <ReviewList
                reviews={reviews}
                serviceId={safeServiceId}
                onLoadMore={handleLoadMoreReviews}
                hasMore={hasMoreReviews}
              />
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Booking CTA - Only show if not service owner */}
      {!isServiceOwner && safeServiceId && (
        <BookingCTA serviceId={safeServiceId} price={service.price || 0} onBook={handleBook} />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  titleSection: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ratingContainer: {
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  card: {
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  serviceAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceAreaInfo: {
    flex: 1,
  },
  serviceAreaText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceAreaSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  reviewsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  reviewsLoadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reviewsErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  reviewsErrorText: {
    fontSize: 14,
    color: Colors.semantic.error,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  providerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  providerActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  providerActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function ServiceDetailScreen() {
  return (
    <ErrorBoundary>
      <ServiceDetailScreenContent />
    </ErrorBoundary>
  );
}

