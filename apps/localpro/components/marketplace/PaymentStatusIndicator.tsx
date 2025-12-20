import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface PaymentStatusIndicatorProps {
  bookingId: string;
  status: PaymentStatus;
  amount?: number;
}

export function PaymentStatusIndicator({
  bookingId,
  status,
  amount,
}: PaymentStatusIndicatorProps) {
  const colors = useThemeColors();

  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          color: colors.secondary[600],
          icon: 'checkmark-circle' as const,
          label: 'Paid',
          bgColor: colors.secondary[50],
        };
      case 'pending':
        return {
          color: colors.semantic.warning,
          icon: 'time-outline' as const,
          label: 'Pending',
          bgColor: colors.semantic.warning + '20',
        };
      case 'failed':
        return {
          color: colors.semantic.error,
          icon: 'close-circle' as const,
          label: 'Failed',
          bgColor: colors.semantic.error + '20',
        };
      case 'refunded':
        return {
          color: colors.text.secondary,
          icon: 'arrow-back-circle' as const,
          label: 'Refunded',
          bgColor: Colors.neutral.gray100,
        };
      default:
        return {
          color: colors.text.secondary,
          icon: 'help-circle-outline' as const,
          label: 'Unknown',
          bgColor: Colors.neutral.gray100,
        };
    }
  };

  const config = getStatusConfig();
  const formatCurrency = (amt: number) => `$${amt.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
      {amount !== undefined && (
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

