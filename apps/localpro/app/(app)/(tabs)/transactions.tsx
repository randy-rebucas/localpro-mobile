import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

type FilterType = 'all' | 'credit' | 'debit';
type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';

export default function TransactionsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<FilterType>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterStatus>('all');

  // Mock transactions data - replace with actual API call
  const transactions: Transaction[] = [];

  const typeFilters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'credit' as const, label: 'Income', icon: 'arrow-down-circle-outline' as const },
    { key: 'debit' as const, label: 'Expenses', icon: 'arrow-up-circle-outline' as const },
  ];

  const statusFilters = [
    { key: 'all' as const, label: 'All Status', icon: 'checkmark-done-outline' as const },
    { key: 'completed' as const, label: 'Completed', icon: 'checkmark-circle-outline' as const },
    { key: 'pending' as const, label: 'Pending', icon: 'time-outline' as const },
    { key: 'failed' as const, label: 'Failed', icon: 'close-circle-outline' as const },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTypeFilter === 'all' || transaction.type === activeTypeFilter;
    const matchesStatus = activeStatusFilter === 'all' || transaction.status === activeStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

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
      case 'withdrawal':
        return 'arrow-up-circle';
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotals = () => {
    const credits = filteredTransactions
      .filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const debits = filteredTransactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return { credits, debits, net: credits - debits };
  };

  const totals = calculateTotals();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>View your transaction history</Text>
          </View>

          {/* Summary Cards */}
          {filteredTransactions.length > 0 && (
            <View style={styles.summaryCards}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={[styles.summaryValue, { color: colors.semantic.success }]}>
                  +${totals.credits.toFixed(2)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
                <Text style={[styles.summaryValue, { color: colors.semantic.error }]}>
                  -${totals.debits.toFixed(2)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Net Amount</Text>
                <Text style={[styles.summaryValue, { color: totals.net >= 0 ? colors.semantic.success : colors.semantic.error }]}>
                  {totals.net >= 0 ? '+' : ''}${totals.net.toFixed(2)}
                </Text>
              </Card>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.text.secondary} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search transactions..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {typeFilters.map((filter) => {
              const isActive = activeTypeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveTypeFilter(filter.key)}
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

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {statusFilters.map((filter) => {
              const isActive = activeStatusFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveStatusFilter(filter.key)}
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

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                <View key={date} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>{date}</Text>
                  <Card style={styles.transactionsCard}>
                    {dateTransactions.map((transaction) => {
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
                            <View style={styles.transactionMeta}>
                              <Text style={styles.transactionCategory}>{transaction.category}</Text>
                              <Text style={styles.transactionTime}>{formatTime(transaction.createdAt)}</Text>
                            </View>
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
                  </Card>
                </View>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'receipt-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Transactions Found' : 'No Transactions Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Your transaction history will appear here'}
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
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
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
  transactionsList: {
    gap: Spacing.lg,
  },
  dateGroup: {
    marginBottom: Spacing.md,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  transactionsCard: {
    padding: Spacing.md,
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
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  transactionCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  transactionTime: {
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

