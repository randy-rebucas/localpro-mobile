import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  description: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface BillingMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  isDefault: boolean;
  expiryDate?: string;
}

export default function BillingTabScreen() {
  const colors = useThemeColors();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Mock invoices - replace with actual API call
  const invoices: Invoice[] = [];

  // Mock billing methods - replace with actual API call
  const billingMethods: BillingMethod[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'paid' as const, label: 'Paid', icon: 'checkmark-circle-outline' as const },
    { key: 'pending' as const, label: 'Pending', icon: 'time-outline' as const },
    { key: 'overdue' as const, label: 'Overdue', icon: 'alert-circle-outline' as const },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    return selectedFilter === 'all' || invoice.status === selectedFilter;
  });

  const handleAddPaymentMethod = () => {
    // TODO: Navigate to add payment method screen
    // router.push('/(app)/add-payment-method');
    console.log('Add payment method');
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // TODO: Download invoice PDF
      await Share.share({
        message: `Invoice ${invoiceId}`,
        title: 'Download Invoice',
      });
    } catch {
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  const handlePayInvoice = (invoiceId: string) => {
    // TODO: Navigate to payment screen
    // router.push(`/(app)/pay-invoice/${invoiceId}`);
    console.log('Pay invoice:', invoiceId);
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'overdue':
        return colors.semantic.error;
      case 'cancelled':
        return colors.neutral.gray500;
    }
  };

  const getStatusIcon = (status: Invoice['status']): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'overdue':
        return 'alert-circle';
      case 'cancelled':
        return 'close-circle';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Billing</Text>
            <Text style={styles.subtitle}>Manage your billing information</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryCards}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryValue, { color: colors.semantic.success }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={[styles.summaryValue, { color: colors.semantic.warning }]}>
                {formatCurrency(totalPending)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Overdue</Text>
              <Text style={[styles.summaryValue, { color: colors.semantic.error }]}>
                {formatCurrency(totalOverdue)}
              </Text>
            </Card>
          </View>

          {/* Payment Methods */}
          <Card style={styles.paymentMethodsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
                onPress={handleAddPaymentMethod}
              >
                <Ionicons name="add" size={16} color={colors.text.inverse} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {billingMethods.length > 0 ? (
              <View style={styles.paymentMethodsList}>
                {billingMethods.map((method) => (
                  <View key={method.id} style={styles.paymentMethodItem}>
                    <View style={styles.paymentMethodLeft}>
                      <Ionicons 
                        name={method.type === 'card' ? 'card' : method.type === 'bank' ? 'business' : 'wallet'} 
                        size={20} 
                        color={colors.text.secondary} 
                      />
                      <View style={styles.paymentMethodInfo}>
                        <Text style={styles.paymentMethodType}>
                          {method.type === 'card' ? 'Card' : method.type === 'bank' ? 'Bank Account' : 'Wallet'}
                        </Text>
                        {method.last4 && (
                          <Text style={styles.paymentMethodLast4}>•••• {method.last4}</Text>
                        )}
                        {method.expiryDate && (
                          <Text style={styles.paymentMethodExpiry}>Expires {method.expiryDate}</Text>
                        )}
                      </View>
                    </View>
                    {method.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary[600]}15` }]}>
                        <Text style={[styles.defaultBadgeText, { color: colors.primary[600] }]}>Default</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPaymentMethods}>
                <Ionicons name="card-outline" size={32} color={colors.text.tertiary} />
                <Text style={styles.emptyPaymentMethodsText}>No payment methods</Text>
                <Text style={styles.emptyPaymentMethodsSubtext}>Add a payment method to pay invoices</Text>
              </View>
            )}
          </Card>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
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

          {/* Invoices List */}
          {filteredInvoices.length > 0 ? (
            <View style={styles.invoicesList}>
              {filteredInvoices.map((invoice) => {
                const statusColor = getStatusColor(invoice.status);
                return (
                  <Card key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceHeader}>
                      <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceNumber}>Invoice #{invoice.invoiceNumber}</Text>
                        <Text style={styles.invoiceDescription}>{invoice.description}</Text>
                        <Text style={styles.invoiceDate}>
                          Due: {formatDate(invoice.dueDate)}
                          {invoice.paidDate && ` • Paid: ${formatDate(invoice.paidDate)}`}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <Ionicons name={getStatusIcon(invoice.status)} size={12} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.invoiceAmount}>
                      <Text style={styles.amountLabel}>Total Amount</Text>
                      <Text style={[styles.amountValue, { color: statusColor }]}>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </Text>
                    </View>

                    {invoice.items.length > 0 && (
                      <View style={styles.invoiceItems}>
                        {invoice.items.map((item, index) => (
                          <View key={index} style={styles.invoiceItem}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                            <Text style={styles.itemPrice}>
                              {formatCurrency(item.price * item.quantity, invoice.currency)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.invoiceActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.downloadButton, { borderColor: colors.secondary[600] }]}
                        onPress={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Ionicons name="download-outline" size={16} color={colors.secondary[600]} />
                        <Text style={[styles.actionButtonText, { color: colors.secondary[600] }]}>
                          Download
                        </Text>
                      </TouchableOpacity>
                      {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.payButton, { backgroundColor: colors.primary[600] }]}
                          onPress={() => handlePayInvoice(invoice.id)}
                        >
                          <Ionicons name="card-outline" size={16} color={colors.text.inverse} />
                          <Text style={[styles.actionButtonText, { color: colors.text.inverse }]}>
                            Pay Now
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Invoices</Text>
                <Text style={styles.emptyStateText}>
                  Your billing invoices will appear here
                </Text>
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
  summaryCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentMethodsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  paymentMethodsList: {
    gap: Spacing.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  paymentMethodLast4: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  paymentMethodExpiry: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
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
  emptyPaymentMethods: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyPaymentMethodsText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyPaymentMethodsSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
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
    fontWeight: '600',
  },
  invoicesList: {
    gap: Spacing.md,
  },
  invoiceCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  invoiceInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  invoiceDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  invoiceDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  invoiceAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  invoiceItems: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  itemName: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.sm,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  invoiceActions: {
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
  downloadButton: {
    backgroundColor: Colors.background.primary,
  },
  payButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    paddingHorizontal: Spacing.lg,
  },
});

