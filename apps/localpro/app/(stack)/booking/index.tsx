import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { MarketplaceService, useBookings } from '@localpro/marketplace';
import type { Booking } from '@localpro/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  BookingCalendar,
  BookingCard,
  EmptyState,
  LoadingSkeleton,
  SearchInput,
  type BookingStatus,
} from '../../../components/marketplace';
import { Colors, Shadows, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type FilterStatus = 'all' | BookingStatus;

export default function BookingIndexScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const colors = useThemeColors();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch bookings
  const { bookings, loading } = useBookings(user?.id || '');

  // Status filters
  const statusFilters: { key: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'in-progress', label: 'Active', icon: 'play-circle-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  // Filter bookings based on search query and status
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((booking) => booking.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.service.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [bookings, selectedStatus, searchQuery]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Wait a bit for the refresh animation
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleViewDetails = (bookingId: string) => {
    router.push(`/(stack)/booking/${bookingId}` as any);
  };

  const handleCancel = async (bookingId: string) => {
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
              await MarketplaceService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (status: FilterStatus) => {
    setSelectedStatus(status);
  };

  // Render booking card
  const renderBookingCard = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onViewDetails={handleViewDetails}
      onCancel={handleCancel}
    />
  );

  // Render list item separator
  const renderItemSeparator = () => <View style={styles.separator} />;

  // Render list footer
  const renderListFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <LoadingSkeleton viewMode="list" count={3} />
        </View>
      );
    }

    const activeFilter = statusFilters.find((f) => f.key === selectedStatus);
    const icon = selectedStatus === 'all'
      ? 'calendar-outline'
      : selectedStatus === 'pending'
      ? 'time-outline'
      : selectedStatus === 'completed'
      ? 'checkmark-done-outline'
      : selectedStatus === 'cancelled'
      ? 'close-circle-outline'
      : 'play-circle-outline';

    if (searchQuery || selectedStatus !== 'all') {
      return (
        <EmptyState
          icon={icon}
          title={`No ${activeFilter?.label || ''} bookings found`}
          subtitle={`Try adjusting your ${searchQuery ? 'search' : 'status'} filters`}
        />
      );
    }

    return (
      <EmptyState
        icon="calendar-outline"
        title="No bookings yet"
        subtitle="Your bookings will appear here when you make a reservation"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Bookings
        </Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          style={styles.viewToggle}
        >
          <Ionicons
            name={viewMode === 'list' ? 'calendar-outline' : 'list-outline'}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search bookings..."
        showFilterButton={false}
      />

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => {
          const isActive = selectedStatus === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                isActive && { backgroundColor: colors.primary[600] },
              ]}
              onPress={() => handleStatusChange(filter.key)}
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

      {/* Bookings List or Calendar */}
      {viewMode === 'calendar' ? (
        <ScrollView
          style={styles.calendarContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[600]}
              colors={[colors.primary[600]]}
            />
          }
        >
          <BookingCalendar
            bookings={filteredBookings}
            onDateSelect={(date) => {
              // Filter bookings by selected date
              console.log('Date selected:', date);
            }}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={[
            styles.listContent,
            filteredBookings.length === 0 && styles.emptyListContent,
          ]}
          ItemSeparatorComponent={renderItemSeparator}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderListFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[600]}
              colors={[colors.primary[600]]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  viewToggle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    flex: 1,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
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
    borderRadius: 20,
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
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.lg,
  },
});

