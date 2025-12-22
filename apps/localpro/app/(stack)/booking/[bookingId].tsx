import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { MarketplaceService } from '@localpro/marketplace';
import type { Booking } from '@localpro/types';
import { Button, Card } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WavyBackground } from '../../../components/WavyBackground';
import {
    EmptyState,
    OrderApprovalButton,
    PayMongoPaymentButton,
    PayPalPaymentButton,
    PaymentStatusIndicator,
    PhotoUpload,
    ReviewFormModal,
    StatusBadge,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

const statusTimeline: BookingStatus[] = ['pending', 'confirmed', 'in-progress', 'completed'];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const bookingData = await MarketplaceService.getBooking(id as string);
      setBooking(bookingData);
      if (bookingData) {
        // Load existing photos if any
        setPhotos((bookingData as any).photos || []);
      }
    } catch (error: any) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!booking || !id) return;

    const statusMessages: Record<BookingStatus, string> = {
      'pending': 'Mark as Pending?',
      'confirmed': 'Confirm this booking?',
      'in-progress': 'Start the service?',
      'completed': 'Mark as completed?',
      'cancelled': 'Cancel this booking?',
    };

    Alert.alert(
      'Update Status',
      statusMessages[newStatus],
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);
            try {
              const updated = await MarketplaceService.updateBookingStatus(id as string, newStatus);
              setBooking(updated);
              Alert.alert('Success', 'Booking status updated successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleUploadPhotos = async () => {
    if (!booking || !id || photos.length === 0) return;

    setUploadingPhotos(true);
    try {
      await MarketplaceService.uploadBookingPhotos(id as string, photos);
      Alert.alert('Success', 'Photos uploaded successfully');
      loadBooking(); // Reload to get updated booking
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!booking || !id) return;

    try {
      await MarketplaceService.submitBookingReview(id as string, { rating, comment });
      Alert.alert('Success', 'Thank you for your review!');
      setReviewModalVisible(false);
      loadBooking(); // Reload to get updated booking
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
      throw error;
    }
  };

  const handleCancel = () => {
    if (!booking || !id) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              const cancelled = await MarketplaceService.cancelBooking(id as string);
              setBooking(cancelled);
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentStatusIndex = () => {
    if (!booking) return -1;
    return statusTimeline.indexOf(booking.status);
  };

  const isProvider = booking?.service?.providerId === user?.id;
  const isClient = booking?.userId === user?.id;
  const canUpdateStatus = isProvider || isClient;
  const canCancel = booking?.status !== 'completed' && booking?.status !== 'cancelled';
  const canReview = booking?.status === 'completed' && isClient && !(booking as any).reviewed;

  const handleShare = async () => {
    if (!booking) return;

    try {
      await Share.share({
        message: `Booking #${booking.id.slice(0, 8)} - ${booking.service.title}`,
        title: 'Booking Details',
      });
    } catch (err) {
      console.error('Error sharing booking:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading booking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title="Booking not found"
          subtitle="The booking you're looking for doesn't exist or has been removed."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WavyBackground />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Actions */}
        <View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
            onPress={() => router.back()}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
              onPress={handleShare}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="share-outline" size={26} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Status Badge */}
          <View style={styles.statusSection}>
            <StatusBadge status={booking.status} size="large" />
            <Text style={styles.bookingId}>Booking #{booking.id.slice(0, 8)}</Text>
          </View>

          {/* Status Timeline */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            <View style={styles.timeline}>
              {statusTimeline.map((status, index) => {
                const currentIndex = getCurrentStatusIndex();
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <View key={status} style={styles.timelineItem}>
                    <View style={styles.timelineLine}>
                      <View
                        style={[
                          styles.timelineDot,
                          isCompleted && { backgroundColor: colors.primary[600] },
                          isCurrent && styles.timelineDotCurrent,
                        ]}
                      >
                        {isCompleted && (
                          <Ionicons name="checkmark" size={12} color={Colors.text.inverse} />
                        )}
                      </View>
                      {index < statusTimeline.length - 1 && (
                        <View
                          style={[
                            styles.timelineConnector,
                            isCompleted && { backgroundColor: colors.primary[600] },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineStatus,
                          isCompleted && { color: colors.primary[600] },
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Service Details */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(stack)/service/${booking.service.id}` as any)}
            >
              <View style={styles.serviceRow}>
                {booking.service.images && booking.service.images.length > 0 && (
                  <Image
                    source={{ uri: booking.service.images[0] }}
                    style={styles.serviceImage}
                  />
                )}
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{booking.service.title}</Text>
                  <Text style={styles.serviceCategory}>{booking.service.category}</Text>
                  <Text style={styles.servicePrice}>{formatCurrency(booking.service.price)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Booking Information */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Booking Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Scheduled Date</Text>
                <Text style={styles.infoValue}>{formatDate(booking.scheduledDate)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(booking.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Total Amount</Text>
                <Text style={[styles.infoValue, { color: colors.primary[600], fontWeight: 'bold' }]}>
                  {formatCurrency(booking.totalAmount)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Provider/Client Information */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              {isProvider ? 'Client Information' : 'Provider Information'}
            </Text>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="person" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {isProvider ? 'Client Name' : booking.service.providerName}
                </Text>
                {!isProvider && (
                  <TouchableOpacity
                    onPress={() => router.push(`/(stack)/provider/${booking.service.providerId}` as any)}
                    style={styles.viewProfileButton}
                  >
                    <Text style={[styles.viewProfileText, { color: colors.primary[600] }]}>
                      View Profile
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>

          {/* Payment Information */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <PaymentStatusIndicator
              bookingId={booking.id}
              status={(booking as any).paymentStatus || 'pending'}
              amount={booking.totalAmount}
            />
            
            {/* PayMongo Payment Button (Default) */}
            {((booking as any).paymentStatus === 'pending' || !(booking as any).paymentStatus) && isClient && 
              !(booking as any).paypalOrderId && (
              <View style={styles.paymentButtonContainer}>
                <PayMongoPaymentButton
                  bookingId={booking.id}
                  providerId={booking.service.providerId}
                  amount={booking.totalAmount}
                  onPaymentSuccess={() => {
                    loadBooking();
                  }}
                />
              </View>
            )}
            
            {/* PayPal Payment Button (Alternative) */}
            {((booking as any).paymentStatus === 'pending' || !(booking as any).paymentStatus) && isClient && 
              (booking as any).paymentMethod === 'paypal' && (
              <View style={styles.paymentButtonContainer}>
                <PayPalPaymentButton
                  bookingId={booking.id}
                  amount={booking.totalAmount}
                  onPaymentSuccess={() => {
                    loadBooking();
                  }}
                />
              </View>
            )}
            
            {/* Order Approval Button */}
            {(booking as any).paypalOrderId && (booking as any).paymentStatus === 'pending' && isProvider && (
              <View style={styles.paymentButtonContainer}>
                <OrderApprovalButton
                  bookingId={booking.id}
                  orderId={(booking as any).paypalOrderId}
                  amount={booking.totalAmount}
                  onApprovalSuccess={() => {
                    loadBooking();
                  }}
                />
              </View>
            )}
          </Card>

          {/* Photos Section */}
          {(booking.status === 'in-progress' || booking.status === 'completed') && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Service Photos</Text>
              <PhotoUpload
                onPhotosSelected={setPhotos}
                maxPhotos={10}
                existingPhotos={photos}
              />
              {photos.length > 0 && (
                <Button
                  title={uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                  onPress={handleUploadPhotos}
                  variant="primary"
                  loading={uploadingPhotos}
                  disabled={uploadingPhotos}
                />
              )}
            </Card>
          )}

        </View>
      </ScrollView>

      {/* Action Buttons */}
      {canUpdateStatus && (
        <View style={[styles.actionBar, { 
          backgroundColor: 'transparent', 
          borderTopColor: colors.border.light 
        }]}>
          {booking.status === 'pending' && isProvider && (
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => handleUpdateStatus('confirmed')}
              disabled={updating}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <Text style={styles.applyButtonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          )}
          {booking.status === 'confirmed' && isProvider && (
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => handleUpdateStatus('in-progress')}
              disabled={updating}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <Text style={styles.applyButtonText}>Start Service</Text>
              )}
            </TouchableOpacity>
          )}
          {booking.status === 'in-progress' && isProvider && (
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => handleUpdateStatus('completed')}
              disabled={updating}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <Text style={styles.applyButtonText}>Complete Service</Text>
              )}
            </TouchableOpacity>
          )}
          {canReview && (
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => setReviewModalVisible(true)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.applyButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.secondaryButton, { 
                backgroundColor: colors.background.primary,
                borderColor: colors.semantic.error[600]
              }]}
              onPress={handleCancel}
              disabled={updating}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {updating ? (
                <ActivityIndicator size="small" color={colors.semantic.error[600]} />
              ) : (
                <Text style={[styles.secondaryButtonText, { color: colors.semantic.error[600] }]}>
                  Cancel Booking
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Review Modal */}
      <ReviewFormModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        serviceTitle={booking.service.title}
      />
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.select({ ios: Spacing['3xl'], android: Spacing['3xl'] + 8 }),
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.select({
      ios: Spacing.lg,
      android: Spacing.xl
    }),
    backgroundColor: 'transparent',
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: Platform.select({
      ios: 48,
      android: 48
    }),
    height: Platform.select({
      ios: 48,
      android: 48
    }),
    borderRadius: Platform.select({
      ios: 24,
      android: 24
    }),
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    ...Platform.select({
      android: {
        elevation: Shadows.lg.elevation,
      },
    }),
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bookingId: {
    fontSize: 14,
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
  timeline: {
    gap: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineLine: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCurrent: {
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral.gray200,
    minHeight: 30,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceCategory: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  viewProfileButton: {
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentButtonContainer: {
    marginTop: Spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: Platform.select({
      ios: Spacing.lg,
      android: Spacing.lg + 4
    }),
    backgroundColor: 'transparent',
    borderTopWidth: Platform.select({
      ios: 1,
      android: 1.5
    }),
    gap: Spacing.md,
    ...Shadows.md,
    ...Platform.select({
      android: {
        elevation: Shadows.md.elevation,
      },
    }),
  },
  applyButton: {
    flex: 1,
    height: Platform.select({
      ios: 48,
      android: 50
    }),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryButton: {
    flex: 1,
    height: Platform.select({
      ios: 48,
      android: 50
    }),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Platform.select({
      ios: 1,
      android: 1.5
    }),
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  applyButtonText: {
    fontSize: Platform.select({
      ios: 16,
      android: 15
    }),
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
    ...Platform.select({
      android: {
        letterSpacing: 0.3,
      },
    }),
  },
  secondaryButtonText: {
    fontSize: Platform.select({
      ios: 16,
      android: 15
    }),
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
    ...Platform.select({
      android: {
        letterSpacing: 0.3,
      },
    }),
  },
});

