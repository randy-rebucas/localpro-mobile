import { Ionicons } from '@expo/vector-icons';
import type { Booking } from '@localpro/types';
import { Card } from '@localpro/ui';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';
import { PaymentStatusIndicator } from './PaymentStatusIndicator';
import { StatusBadge } from './StatusBadge';

interface BookingCardProps {
  booking: Booking;
  onPress?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
}

export function BookingCard({
  booking,
  onPress,
  onCancel,
  onViewDetails,
}: BookingCardProps) {
  const colors = useThemeColors();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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

  const handlePress = () => {
    if (onPress) {
      onPress(booking.id);
    } else if (onViewDetails) {
      onViewDetails(booking.id);
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.header}>
          <StatusBadge status={booking.status} />
          <Text style={styles.amount}>{formatCurrency(booking.totalAmount)}</Text>
        </View>

        {/* Service Image and Info */}
        <View style={styles.content}>
          {booking.service.images && booking.service.images.length > 0 ? (
            <Image
              source={{ uri: booking.service.images[0] }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.serviceImagePlaceholder, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="image-outline" size={24} color={colors.primary[400]} />
            </View>
          )}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle} numberOfLines={2}>
              {booking.service.title}
            </Text>
            <View style={styles.serviceMeta}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.serviceMetaText}>
                {formatDate(booking.scheduledDate)}
              </Text>
            </View>
            <View style={styles.serviceMeta}>
              <Ionicons name="person-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.serviceMetaText}>{booking.service.providerName}</Text>
            </View>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.paymentSection}>
          <PaymentStatusIndicator bookingId={booking.id} status="paid" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onViewDetails && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[50] }]}
              onPress={() => onViewDetails(booking.id)}
            >
              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                View Details
              </Text>
            </TouchableOpacity>
          )}
          {booking.status === 'pending' && onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancel(booking.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  serviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  serviceMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  paymentSection: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.gray100,
    borderColor: Colors.border.light,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.semantic.error,
  },
});

