import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  isDefault: boolean;
}

export default function WalletTabScreen() {
  const colors = useThemeColors();
  const [showBalance, setShowBalance] = useState(true);

  // Mock wallet data - replace with actual API call
  const walletBalance = 0;
  const currency = 'USD';

  // Mock transactions - replace with actual API call
  const transactions: Transaction[] = [];

  // Mock payment methods - replace with actual API call
  const paymentMethods: PaymentMethod[] = [];

  const recentTransactions = transactions.slice(0, 5);

  const getTransactionIcon = (type: Transaction['type'], category: string): keyof typeof Ionicons.glyphMap => {
    if (type === 'credit') {
      return 'arrow-down-circle';
    }
    switch (category.toLowerCase()) {
      case 'payment':
      case 'purchase':
        return 'card';
      case 'transfer':
        return 'swap-horizontal';
      case 'refund':
        return 'arrow-back-circle';
      default:
        return 'arrow-up-circle';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    return type === 'credit' ? colors.semantic.success : colors.semantic.error;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'failed':
      case 'cancelled':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddFunds = () => {
    // TODO: Navigate to add funds screen
    // router.push('/(app)/add-funds');
    console.log('Add funds');
  };

  const handleWithdraw = () => {
    // TODO: Navigate to withdraw screen
    // router.push('/(app)/withdraw');
    console.log('Withdraw');
  };

  const handleViewTransactions = () => {
    router.push('/(app)/(tabs)/transactions');
  };

  const handleManagePaymentMethods = () => {
    router.push('/(app)/(tabs)/payments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Wallet</Text>
            <Text style={styles.subtitle}>Manage your finances</Text>
          </View>

          {/* Balance Card */}
          <Card style={StyleSheet.flatten([styles.balanceCard, { backgroundColor: colors.primary[600] }] as ViewStyle[])}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color={colors.text.inverse} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {showBalance ? `$${walletBalance.toFixed(2)}` : '••••••'}
            </Text>
            <Text style={styles.balanceCurrency}>{currency}</Text>
          </Card>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.semantic.success }]}
              onPress={handleAddFunds}
            >
              <Ionicons name="add-circle" size={24} color={colors.text.inverse} />
              <Text style={styles.quickActionText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionButtonSecondary, { borderColor: colors.primary[600] }]}
              onPress={handleWithdraw}
            >
              <Ionicons name="arrow-up-circle" size={24} color={colors.primary[600]} />
              <Text style={[styles.quickActionText, { color: colors.primary[600] }]}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionButtonSecondary, { borderColor: colors.secondary[600] }]}
              onPress={handleManagePaymentMethods}
            >
              <Ionicons name="card" size={24} color={colors.secondary[600]} />
              <Text style={[styles.quickActionText, { color: colors.secondary[600] }]}>Payment Methods</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Methods Preview */}
          {paymentMethods.length > 0 && (
            <Card style={styles.paymentMethodsCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <TouchableOpacity onPress={handleManagePaymentMethods}>
                  <Text style={[styles.seeAllText, { color: colors.primary[600] }]}>Manage</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.paymentMethodsList}>
                {paymentMethods.slice(0, 2).map((method) => (
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
            </Card>
          )}

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {transactions.length > 0 && (
                <TouchableOpacity onPress={handleViewTransactions}>
                  <Text style={[styles.seeAllText, { color: colors.primary[600] }]}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentTransactions.length > 0 ? (
              <Card style={styles.transactionsCard}>
                <View style={styles.transactionsList}>
                  {recentTransactions.map((transaction) => {
                    const transactionColor = getTransactionColor(transaction.type);
                    const statusColor = getStatusColor(transaction.status);
                    return (
                      <View key={transaction.id} style={styles.transactionItem}>
                        <View style={[styles.transactionIconContainer, { backgroundColor: `${transactionColor}15` }]}>
                          <Ionicons 
                            name={getTransactionIcon(transaction.type, transaction.category)} 
                            size={20} 
                            color={transactionColor} 
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription} numberOfLines={1}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionCategory}>{transaction.category}</Text>
                          <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text 
                            style={[
                              styles.transactionAmount,
                              { color: transactionColor },
                            ]}
                          >
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {transaction.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Your transaction history will appear here
                  </Text>
                </View>
              </Card>
            )}
          </View>
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
  balanceCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  balanceCurrency: {
    fontSize: 16,
    color: Colors.text.inverse,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  quickActionButtonSecondary: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
    textAlign: 'center',
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
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
  transactionsSection: {
    marginBottom: Spacing.lg,
  },
  transactionsCard: {
    padding: Spacing.md,
  },
  transactionsList: {
    gap: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  transactionCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

