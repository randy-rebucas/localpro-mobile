import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { useBookings } from '@localpro/marketplace';
import type { Booking } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookingCard,
  EmptyState,
  LoadingSkeleton,
  ReviewFormModal,
  type BookingStatus,
} from '../../../components/marketplace';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

type FilterStatus = 'all' | BookingStatus;

export default function BookingsTabScreen() {
  const { user } = useAuthContext();
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  // Fetch bookings
  const { bookings, loading } = useBookings(user?.id || '');

  const filters: { key: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'in-progress', label: 'Active', icon: 'play-circle-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'all') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === activeFilter);
  }, [bookings, activeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/(stack)/booking/${bookingId}` as any);
  };

  const handleCancel = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel this booking?${booking ? `\n\nService: ${booking.service.title}` : ''}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to cancel booking
              // await MarketplaceService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReview = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedBookingForReview) return;

    try {
      // TODO: Implement API call to submit review
      // await MarketplaceService.submitReview(selectedBookingForReview.id, { rating, comment });
      Alert.alert('Success', 'Thank you for your review!');
      setReviewModalVisible(false);
      setSelectedBookingForReview(null);
    } catch (error) {
      throw error;
    }
  };

  const handleUploadPhotos = (bookingId: string) => {
    // Navigate to booking detail where photo upload is available
    router.push(`/(stack)/booking/${bookingId}` as any);
  };

  const getPackageTitle = () => {
    switch (activePackage) {
      case 'marketplace':
        return 'My Bookings';
      case 'rentals':
        return 'My Rentals';
      case 'facility-care':
        return 'My Contracts';
      default:
        return 'My Bookings';
    }
  };

  const getPackageSubtitle = () => {
    switch (activePackage) {
      case 'marketplace':
        return 'View and manage your service bookings';
      case 'rentals':
        return 'View and manage your rental bookings';
      case 'facility-care':
        return 'View and manage your facility care contracts';
      default:
        return 'View and manage your bookings';
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onViewDetails={handleViewDetails}
      onCancel={handleCancel}
    />
  );

  // If not marketplace package, show default bookings
  if (activePackage !== 'marketplace') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{getPackageTitle()}</Text>
              <Text style={styles.subtitle}>{getPackageSubtitle()}</Text>
            </View>
            <EmptyState
              icon="calendar-outline"
              title="No bookings yet"
              subtitle="Your bookings will appear here"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Marketplace-specific bookings UI
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ReviewFormModal
        visible={reviewModalVisible}
        onClose={() => {
          setReviewModalVisible(false);
          setSelectedBookingForReview(null);
        }}
        onSubmit={handleSubmitReview}
        serviceTitle={selectedBookingForReview?.service.title}
      />

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        ListHeaderComponent={
          <View style={styles.marketplaceHeader}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{getPackageTitle()}</Text>
                <Text style={styles.subtitle}>{getPackageSubtitle()}</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterTab,
                      isActive && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Ionicons
                      name={filter.icon}
                      size={16}
                      color={isActive ? Colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSkeleton viewMode="list" count={3} />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={
                  activeFilter === 'all'
                    ? 'calendar-outline'
                    : activeFilter === 'pending'
                    ? 'time-outline'
                    : activeFilter === 'completed'
                    ? 'checkmark-done-outline'
                    : activeFilter === 'cancelled'
                    ? 'close-circle-outline'
                    : 'play-circle-outline'
                }
                title={
                  activeFilter === 'all'
                    ? 'No Bookings Yet'
                    : `No ${filters.find((f) => f.key === activeFilter)?.label} Bookings`
                }
                subtitle={
                  activeFilter === 'all'
                    ? 'Your bookings will appear here when you make a reservation'
                    : `You don't have any ${filters.find((f) => f.key === activeFilter)?.label.toLowerCase()} bookings at the moment`
                }
              />
              {activeFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.primary[600] }]}
                  onPress={() => router.push('/(app)/(tabs)')}
                >
                  <Text style={styles.exploreButtonText}>Explore Services</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
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
  marketplaceHeader: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    paddingTop: Spacing['2xl'],
  },
  exploreButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  exploreButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
