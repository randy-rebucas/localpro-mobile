import { MarketplaceService } from '@localpro/marketplace';
import { Button } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

interface PayMongoPaymentButtonProps {
  bookingId: string;
  providerId: string;
  amount: number;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PayMongoPaymentButton({
  bookingId,
  providerId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: PayMongoPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayMongoPayment = async () => {
    setLoading(true);
    try {
      // Create PayMongo payment intent
      const { intentId } = await MarketplaceService.createPayMongoIntent(
        bookingId,
        providerId,
        amount,
        'PHP'
      );

      // Note: In a real implementation, you would integrate PayMongo.js SDK here
      // to collect payment method (card, GCash, Maya, etc.) on the client side
      // For now, we'll show an alert with instructions
      
      Alert.alert(
        'PayMongo Payment',
        'PayMongo payment integration requires the PayMongo.js SDK. Please integrate the SDK to collect payment methods (cards, GCash, Maya, banks) and then call confirmPayMongoPayment with the paymentMethodId.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: () => {
              // TODO: Integrate PayMongo.js SDK
              // Example flow:
              // 1. Use publishableKey to initialize PayMongo.js
              // 2. Collect payment method using PayMongo payment form
              // 3. Get paymentMethodId from PayMongo
              // 4. Call confirmPayMongoPayment(intentId, paymentMethodId, bookingId, providerId, amount)
              Alert.alert(
                'Integration Required',
                'PayMongo SDK integration needed. Payment intent created: ' + intentId
              );
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('PayMongo payment error:', error);
      Alert.alert('Error', error.message || 'Failed to initiate PayMongo payment');
      onPaymentError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Button
        title={`Pay ${formatCurrency(amount)} with PayMongo`}
        onPress={handlePayMongoPayment}
        variant="primary"
        loading={loading}
        disabled={loading}
      />
      <Text style={styles.disclaimer}>
        Pay with cards, GCash, Maya, or bank transfer. Secure payment powered by PayMongo.
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

