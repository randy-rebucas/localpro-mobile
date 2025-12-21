import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import { Button } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface OrderApprovalButtonProps {
  bookingId: string;
  orderId: string;
  amount: number;
  onApprovalSuccess?: () => void;
  onApprovalError?: (error: string) => void;
}

export function OrderApprovalButton({
  bookingId,
  orderId,
  amount,
  onApprovalSuccess,
  onApprovalError,
}: OrderApprovalButtonProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    Alert.alert(
      'Approve Payment',
      `Are you sure you want to approve this payment of $${amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await MarketplaceService.approvePayPalOrder(orderId);
              Alert.alert('Success', 'Payment approved successfully!');
              onApprovalSuccess?.();
            } catch (error: any) {
              console.error('Approval error:', error);
              Alert.alert('Error', error.message || 'Failed to approve payment');
              onApprovalError?.(error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color={colors.semantic.info} />
        <Text style={styles.infoText}>
          Payment has been processed. Please approve to confirm the booking.
        </Text>
      </View>
      <Button
        title="Approve Payment"
        onPress={handleApprove}
        variant="primary"
        loading={loading}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.semantic.info + '20',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

