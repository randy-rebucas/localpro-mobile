import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface BookingCTAProps {
  serviceId: string;
  price: number;
  onBook?: () => void;
}

export function BookingCTA({ serviceId, price, onBook }: BookingCTAProps) {
  const colors = useThemeColors();
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleBook = () => {
    if (onBook) {
      onBook();
    } else {
      // Navigate to booking screen
      router.push(`/(app)/booking/create?serviceId=${serviceId}` as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={[styles.price, { color: colors.primary[600] }]}>
          {formatCurrency(price)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: colors.primary[600] }]}
        onPress={handleBook}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={20} color={Colors.text.inverse} />
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.md,
    ...Shadows.md,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minWidth: 140,
    minHeight: 44,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

