import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import type { RentalBooking } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingSkeleton } from '../../../components/marketplace';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type FilterStatus = 'all' | RentalBooking['status'];

export default function BookingsRentalsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock bookings - replace with actual API call
  const [bookings] = useState<RentalBooking[]>([]);
  const [loading] = useState(false);

  const filters: { key: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'active', label: 'Active', icon: 'play-circle-outline' },
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
    // TODO: Refetch bookings
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/(stack)/rental-booking/${bookingId}` as any);
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Rental',
      `Are you sure you want to cancel this rental booking?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to cancel rental booking
              // await RentalsService.cancelBooking(bookingId);
              Alert.alert('Success', 'Rental booking cancelled successfully.');
            } catch {
              Alert.alert('Error', 'Failed to cancel rental booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderBookingCard = ({ item }: { item: RentalBooking }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'pending':
          return colors.semantic.warning[600];
        case 'confirmed':
        case 'active':
          return colors.primary[600];
        case 'completed':
          return colors.semantic.success[600];
        case 'cancelled':
          return colors.semantic.error[600];
        default:
          return colors.text.secondary;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.bookingCard, { backgroundColor: colors.background.primary }]}
        onPress={() => handleViewDetails(item.id)}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTitle}>Rental Booking</Text>
            <Text style={styles.bookingDates}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.bookingFooter}>
          <Text style={[styles.bookingAmount, { color: colors.primary[600] }]}>
            {formatCurrency(item.totalAmount)}
          </Text>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.semantic.error[600] }]}
              onPress={(e) => {
                e.stopPropagation();
                handleCancel(item.id);
              }}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={[styles.cancelButtonText, { color: colors.semantic.error[600] }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Header */}
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.title}>My Rentals</Text>
                <Text style={styles.subtitle}>View and manage your rental bookings</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filters}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.key;
                return (
                  <TouchableOpacity
                    style={[
                      styles.filterTab,
                      isActive && { backgroundColor: colors.primary[600] },
                    ]}
                    onPress={() => setActiveFilter(item.key)}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={isActive ? Colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.filtersContent}
            />
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
                    ? 'No Rentals Yet'
                    : `No ${filters.find((f) => f.key === activeFilter)?.label} Rentals`
                }
                subtitle={
                  activeFilter === 'all'
                    ? 'Your rental bookings will appear here when you make a reservation'
                    : `You don't have any ${filters.find((f) => f.key === activeFilter)?.label.toLowerCase()} rentals at the moment`
                }
              />
              {activeFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.primary[600] }]}
                  onPress={() => router.push('/(app)/(tabs)/browse-rentals' as any)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Text style={styles.exploreButtonText}>Browse Rentals</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
  header: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
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
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  bookingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  bookingDates: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  bookingAmount: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
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
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

