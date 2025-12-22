import { MarketplaceService } from '@localpro/marketplace';
import { Button } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

interface PayPalPaymentButtonProps {
  bookingId: string;
  amount: number;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PayPalPaymentButton({
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: PayPalPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      // Create PayPal order
      const { orderId, approvalUrl } = await MarketplaceService.createPayPalOrder(
        bookingId,
        amount
      );

      // Open PayPal approval URL
      const canOpen = await Linking.canOpenURL(approvalUrl);
      if (canOpen) {
        await Linking.openURL(approvalUrl);
        
        // Show confirmation dialog
        Alert.alert(
          'Complete Payment',
          'After completing payment on PayPal, please return to approve the order.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'I\'ve Paid',
              onPress: async () => {
                try {
                  await MarketplaceService.approvePayPalOrder(orderId);
                  Alert.alert('Success', 'Payment approved successfully!');
                  onPaymentSuccess?.();
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to approve payment');
                  onPaymentError?.(error.message);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Cannot open PayPal. Please check your internet connection.');
        onPaymentError?.('Cannot open PayPal URL');
      }
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      Alert.alert('Error', error.message || 'Failed to initiate PayPal payment');
      onPaymentError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={`Pay $${amount.toFixed(2)} with PayPal`}
        onPress={handlePayPalPayment}
        variant="primary"
        loading={loading}
        disabled={loading}
      />
      <Text style={styles.disclaimer}>
        You will be redirected to PayPal to complete your payment securely.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

