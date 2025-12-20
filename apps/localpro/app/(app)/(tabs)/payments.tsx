import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  brand?: string; // For cards: 'visa', 'mastercard', etc.
  bankName?: string; // For bank accounts
  isDefault: boolean;
}

export default function PaymentsTabScreen() {
  const colors = useThemeColors();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Mock payment methods data - replace with actual API call
  // const paymentMethods: PaymentMethod[] = [];

  const handleAddPaymentMethod = (type: PaymentMethod['type']) => {
    // TODO: Navigate to add payment method screen
    // router.push(`/(app)/add-payment-method?type=${type}`);
    console.log('Add payment method:', type);
  };

  const handleSetDefault = (methodId: string) => {
    // TODO: Implement set default functionality
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            Alert.alert('Success', 'Payment method deleted');
          },
        },
      ]
    );
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type'], brand?: string): keyof typeof Ionicons.glyphMap => {
    if (type === 'card') {
      // Note: Ionicons may not have logo-visa/logo-mastercard, using card as fallback
      return 'card';
    }
    if (type === 'bank') return 'business';
    return 'wallet';
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return method.brand ? `${method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} Card` : 'Credit/Debit Card';
    }
    if (method.type === 'bank') {
      return method.bankName || 'Bank Account';
    }
    return 'Wallet';
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'card' && method.last4) {
      return `•••• •••• •••• ${method.last4}`;
    }
    if (method.type === 'bank' && method.last4) {
      return `•••• ${method.last4}`;
    }
    return '•••• •••• •••• ••••';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment Methods</Text>
            <Text style={styles.subtitle}>Manage your payment options</Text>
          </View>

          {/* Add Payment Method Options */}
          <Card style={styles.addMethodsCard}>
            <Text style={styles.sectionTitle}>Add Payment Method</Text>
            <View style={styles.addMethodsGrid}>
              <TouchableOpacity
                style={[styles.addMethodButton, { borderColor: colors.primary[600] }]}
                onPress={() => handleAddPaymentMethod('card')}
              >
                <Ionicons name="card" size={32} color={colors.primary[600]} />
                <Text style={[styles.addMethodText, { color: colors.primary[600] }]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addMethodButton, { borderColor: colors.secondary[600] }]}
                onPress={() => handleAddPaymentMethod('bank')}
              >
                <Ionicons name="business" size={32} color={colors.secondary[600]} />
                <Text style={[styles.addMethodText, { color: colors.secondary[600] }]}>Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addMethodButton, { borderColor: colors.semantic.info }]}
                onPress={() => handleAddPaymentMethod('wallet')}
              >
                <Ionicons name="wallet" size={32} color={colors.semantic.info} />
                <Text style={[styles.addMethodText, { color: colors.semantic.info }]}>Wallet</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Payment Methods List */}
          {paymentMethods.length > 0 ? (
            <View style={styles.paymentMethodsSection}>
              <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
              <View style={styles.paymentMethodsList}>
                {paymentMethods.map((method) => (
                  <Card key={method.id} style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodHeader}>
                      <View style={styles.paymentMethodLeft}>
                        <View style={[styles.paymentMethodIconContainer, { backgroundColor: colors.primary[100] }]}>
                          <Ionicons 
                            name={getPaymentMethodIcon(method.type, method.brand)} 
                            size={24} 
                            color={colors.primary[600]} 
                          />
                        </View>
                        <View style={styles.paymentMethodInfo}>
                          <View style={styles.paymentMethodTitleRow}>
                            <Text style={styles.paymentMethodType}>
                              {getPaymentMethodLabel(method)}
                            </Text>
                            {method.isDefault && (
                              <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary[600]}15` }]}>
                                <Text style={[styles.defaultBadgeText, { color: colors.primary[600] }]}>
                                  Default
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.paymentMethodDisplay} numberOfLines={1}>
                            {getPaymentMethodDisplay(method)}
                          </Text>
                          {method.bankName && (
                            <Text style={styles.paymentMethodBank}>{method.bankName}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.paymentMethodActions}>
                      {!method.isDefault && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.setDefaultButton, { borderColor: colors.primary[600] }]}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[600]} />
                          <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                            Set Default
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton, { borderColor: colors.semantic.error }]}
                        onPress={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
                        <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
                <Text style={styles.emptyStateText}>
                  Add a payment method to make payments faster and easier
                </Text>
              </View>
            </Card>
          )}

          {/* Security Notice */}
          <Card style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.secondary[600]} />
              <Text style={styles.securityTitle}>Secure Payment</Text>
            </View>
            <Text style={styles.securityText}>
              Your payment information is encrypted and securely stored. We never share your payment details with third parties.
            </Text>
          </Card>
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
  addMethodsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  addMethodsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addMethodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  addMethodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethodsSection: {
    marginBottom: Spacing.lg,
  },
  paymentMethodsList: {
    gap: Spacing.md,
  },
  paymentMethodCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  paymentMethodHeader: {
    marginBottom: Spacing.md,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  paymentMethodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  paymentMethodType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  defaultBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentMethodDisplay: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  paymentMethodBank: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  setDefaultButton: {
    backgroundColor: Colors.background.primary,
  },
  deleteButton: {
    backgroundColor: Colors.background.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
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
    paddingHorizontal: Spacing.lg,
  },
  securityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  securityText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});

