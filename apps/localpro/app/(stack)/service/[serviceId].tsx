import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService, useService } from '@localpro/marketplace';
import type { Review } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookingCTA,
  EmptyState,
  ImageCarousel,
  ProviderCard,
  ReviewList,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { service, loading, error } = useService(id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<Error | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

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
        const result = await MarketplaceService.getServiceReviews(service.id, reviewsPage, 10);
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

  const formatCurrency = (amount: number) => {
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
    if (!service) return;
    router.push(`/(stack)/booking/create?serviceId=${service.id}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title="Service not found"
          subtitle="The service you're looking for doesn't exist or has been removed."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color={colors.semantic.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Carousel */}
        <ImageCarousel images={service.images || []} height={300} />

        {/* Service Info */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={[styles.price, { color: colors.primary[600] }]}>
              {formatCurrency(service.price)}
            </Text>
          </View>

          {/* Rating and Category */}
          <View style={styles.metaRow}>
            {service.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.semantic.warning} />
                <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
                {service.reviewCount !== undefined && service.reviewCount > 0 && (
                  <Text style={styles.reviewCountText}>
                    ({service.reviewCount} reviews)
                  </Text>
                )}
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
          </View>

          {/* Description */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
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
          <ProviderCard
            providerId={service.providerId}
            providerName={service.providerName}
            rating={service.rating}
            reviewCount={service.reviewCount}
            verified={true}
            location="San Francisco, CA"
          />

          {/* Reviews Section */}
          <Card style={styles.card}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {service.rating && (
                <View style={styles.overallRating}>
                  <Ionicons name="star" size={20} color={colors.semantic.warning} />
                  <Text style={styles.overallRatingText}>
                    {service.rating.toFixed(1)}
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
                serviceId={service.id}
                onLoadMore={handleLoadMoreReviews}
                hasMore={hasMoreReviews}
              />
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Booking CTA */}
      <BookingCTA serviceId={service.id} price={service.price} onBook={handleBook} />
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
    color: Colors.text.secondary,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
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
    ...Shadows.md,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
});

