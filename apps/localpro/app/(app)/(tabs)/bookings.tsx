import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { usePackageContext } from '../../../contexts/PackageContext';
import { useThemeColors } from '../../../hooks/use-theme';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export default function BookingsTabScreen() {
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
  const { activePackage } = usePackageContext();
  const colors = useThemeColors();

  // Mock bookings data - replace with actual API call
  const bookings: any[] = [];

  const filters: { key: BookingStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'in-progress', label: 'Active', icon: 'play-circle-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  const filteredBookings = activeFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'confirmed':
        return colors.primary[600];
      case 'in-progress':
        return colors.secondary[600];
      case 'completed':
        return colors.secondary[600];
      case 'cancelled':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'in-progress':
        return 'play-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{getPackageTitle()}</Text>
            <Text style={styles.subtitle}>{getPackageSubtitle()}</Text>
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
                    color={isActive ? colors.text.inverse : colors.text.secondary}
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

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <View style={styles.bookingsList}>
              {filteredBookings.map((booking) => (
                <Card key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingHeaderLeft}>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                        <Ionicons
                          name={getStatusIcon(booking.status)}
                          size={16}
                          color={getStatusColor(booking.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.bookingAmount}>
                      ${booking.totalAmount?.toFixed(2) || '0.00'}
                    </Text>
                  </View>

                  <View style={styles.bookingContent}>
                    <Text style={styles.bookingTitle}>
                      {booking.service?.name || booking.rental?.name || 'Service'}
                    </Text>
                    <View style={styles.bookingInfo}>
                      <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.bookingInfoText}>
                        {formatDate(booking.scheduledDate || booking.startDate || booking.createdAt)}
                      </Text>
                    </View>
                    {booking.service?.provider?.name && (
                      <View style={styles.bookingInfo}>
                        <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.bookingInfoText}>
                          {booking.service.provider.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.bookingActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    {booking.status === 'pending' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                      >
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeFilter === 'all' ? 'calendar-outline' : getStatusIcon(activeFilter)} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeFilter === 'all' ? 'No Bookings Yet' : `No ${filters.find(f => f.key === activeFilter)?.label} Bookings`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'all' 
                    ? 'Your bookings will appear here when you make a reservation'
                    : `You don't have any ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} bookings at the moment`}
                </Text>
                <TouchableOpacity 
                  style={[styles.exploreButton, { backgroundColor: colors.primary[600] }]}
                >
                  <Text style={styles.exploreButtonText}>Explore Services</Text>
                </TouchableOpacity>
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
  filtersContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  filtersContent: {
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  bookingsList: {
    gap: Spacing.md,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bookingHeaderLeft: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  bookingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  bookingContent: {
    marginBottom: Spacing.md,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bookingInfoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  cancelButton: {
    backgroundColor: Colors.neutral.gray100,
    borderColor: Colors.border.light,
  },
  cancelButtonText: {
    color: Colors.semantic.error,
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
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  exploreButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  exploreButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
