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
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    EmptyState,
    OrderApprovalButton,
    PayPalPaymentButton,
    PaymentStatusIndicator,
    PhotoUpload,
    ReviewFormModal,
    StatusBadge,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading booking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="alert-circle-outline"
          title="Booking not found"
          subtitle="The booking you're looking for doesn't exist or has been removed."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.placeholder} />
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
            
            {/* PayPal Payment Button */}
            {((booking as any).paymentStatus === 'pending' || !(booking as any).paymentStatus) && isClient && (
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

          {/* Actions */}
          {canUpdateStatus && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Actions</Text>
              {booking.status === 'pending' && isProvider && (
                <Button
                  title="Confirm Booking"
                  onPress={() => handleUpdateStatus('confirmed')}
                  variant="primary"
                  loading={updating}
                  disabled={updating}
                />
              )}
              {booking.status === 'confirmed' && isProvider && (
                <Button
                  title="Start Service"
                  onPress={() => handleUpdateStatus('in-progress')}
                  variant="primary"
                  loading={updating}
                  disabled={updating}
                />
              )}
              {booking.status === 'in-progress' && isProvider && (
                <Button
                  title="Complete Service"
                  onPress={() => handleUpdateStatus('completed')}
                  variant="primary"
                  loading={updating}
                  disabled={updating}
                />
              )}
              {canCancel && (
                <View style={styles.cancelButtonContainer}>
                  <Button
                    title="Cancel Booking"
                    onPress={handleCancel}
                    variant="outline"
                    loading={updating}
                    disabled={updating}
                  />
                </View>
              )}
              {canReview && (
                <View style={styles.reviewButtonContainer}>
                  <Button
                    title="Write Review"
                    onPress={() => setReviewModalVisible(true)}
                    variant="primary"
                  />
                </View>
              )}
            </Card>
          )}
        </View>
      </ScrollView>

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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
  cancelButtonContainer: {
    marginTop: Spacing.md,
  },
  reviewButtonContainer: {
    marginTop: Spacing.md,
  },
  paymentButtonContainer: {
    marginTop: Spacing.md,
  },
});

