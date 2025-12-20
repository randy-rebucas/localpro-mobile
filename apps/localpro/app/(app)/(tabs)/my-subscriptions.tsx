import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type SubscriptionStatus = 'all' | 'active' | 'trial' | 'cancelled' | 'expired';

interface Subscription {
  id: string;
  planName: string;
  planDescription: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
  features: string[];
}

export default function MySubscriptionsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SubscriptionStatus>('all');

  // Mock subscriptions - replace with actual API call
  const subscriptions: Subscription[] = [];

  const filters: { key: SubscriptionStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'active', label: 'Active', icon: 'checkmark-circle-outline' },
    { key: 'trial', label: 'Trial', icon: 'time-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
    { key: 'expired', label: 'Expired', icon: 'calendar-outline' },
  ];

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subscription.planDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || subscription.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSubscriptionPress = (subscriptionId: string) => {
    // TODO: Navigate to subscription detail screen
    // router.push(`/(app)/subscription/${subscriptionId}`);
    console.log('View subscription:', subscriptionId);
  };

  const handleToggleAutoRenew = (subscriptionId: string, currentValue: boolean) => {
    Alert.alert(
      'Auto-Renew',
      currentValue 
        ? 'Disable automatic renewal for this subscription?'
        : 'Enable automatic renewal for this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: currentValue ? 'Disable' : 'Enable',
          onPress: () => {
            // TODO: Implement toggle auto-renew functionality
            Alert.alert('Success', `Auto-renew ${currentValue ? 'disabled' : 'enabled'}`);
            console.log('Toggle auto-renew:', subscriptionId, !currentValue);
          },
        },
      ]
    );
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? You will lose access at the end of the current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cancel subscription functionality
            Alert.alert('Success', 'Subscription cancelled');
            console.log('Cancel subscription:', subscriptionId);
          },
        },
      ]
    );
  };

  const handleRenewSubscription = (subscriptionId: string) => {
    Alert.alert(
      'Renew Subscription',
      'Are you sure you want to renew this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: () => {
            // TODO: Implement renew subscription functionality
            Alert.alert('Success', 'Subscription renewed');
            console.log('Renew subscription:', subscriptionId);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return colors.semantic.success;
      case 'trial':
        return colors.semantic.warning;
      case 'cancelled':
        return colors.semantic.error;
      case 'expired':
        return colors.neutral.gray500;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
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

  const getBillingPeriodLabel = (period: 'monthly' | 'yearly') => {
    return period === 'monthly' ? '/month' : '/year';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Subscriptions</Text>
            <Text style={styles.subtitle}>View and manage your active subscriptions</Text>
          </View>

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
                placeholder="Search subscriptions..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
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

          {/* Subscriptions List */}
          {filteredSubscriptions.length > 0 ? (
            <View style={styles.subscriptionsList}>
              {filteredSubscriptions.map((subscription) => {
                const statusColor = getStatusColor(subscription.status);
                return (
                  <Card key={subscription.id} style={styles.subscriptionCard}>
                    <TouchableOpacity
                      onPress={() => handleSubscriptionPress(subscription.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.subscriptionHeader}>
                        <View style={styles.subscriptionTitleSection}>
                          <Text style={styles.subscriptionTitle} numberOfLines={2}>
                            {subscription.planName}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Ionicons 
                              name={subscription.status === 'active' ? 'checkmark-circle-outline' :
                                    subscription.status === 'trial' ? 'time-outline' :
                                    subscription.status === 'cancelled' ? 'close-circle-outline' :
                                    'calendar-outline'} 
                              size={12} 
                              color={statusColor} 
                            />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.subscriptionDescription} numberOfLines={2}>
                        {subscription.planDescription}
                      </Text>

                      <View style={styles.subscriptionPricing}>
                        <Text style={styles.subscriptionPrice}>
                          {formatCurrency(subscription.price)}
                          <Text style={styles.subscriptionPeriod}>
                            {getBillingPeriodLabel(subscription.billingPeriod)}
                          </Text>
                        </Text>
                        {subscription.billingPeriod === 'yearly' && (
                          <View style={styles.yearlyBadge}>
                            <Text style={styles.yearlyBadgeText}>Annual</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.subscriptionDates}>
                        <View style={styles.dateItem}>
                          <Text style={styles.dateLabel}>Started</Text>
                          <Text style={styles.dateValue}>{formatDate(subscription.startDate)}</Text>
                        </View>
                        {subscription.endDate && (
                          <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>
                              {subscription.status === 'cancelled' ? 'Ends' : 'Expires'}
                            </Text>
                            <Text style={styles.dateValue}>{formatDate(subscription.endDate)}</Text>
                          </View>
                        )}
                        {subscription.nextBillingDate && subscription.status === 'active' && (
                          <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>Next Billing</Text>
                            <Text style={[styles.dateValue, { color: colors.primary[600] }]}>
                              {formatDate(subscription.nextBillingDate)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Features */}
                      {subscription.features.length > 0 && (
                        <View style={styles.featuresSection}>
                          <Text style={styles.featuresLabel}>Features:</Text>
                          <View style={styles.featuresList}>
                            {subscription.features.slice(0, 3).map((feature, index) => (
                              <View key={index} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                                <Text style={styles.featureText}>{feature}</Text>
                              </View>
                            ))}
                            {subscription.features.length > 3 && (
                              <Text style={styles.moreFeaturesText}>
                                +{subscription.features.length - 3} more
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Auto-Renew Toggle */}
                      {subscription.status === 'active' && (
                        <View style={styles.autoRenewSection}>
                          <View style={styles.autoRenewInfo}>
                            <Ionicons name="refresh-outline" size={16} color={colors.text.secondary} />
                            <Text style={styles.autoRenewLabel}>Auto-Renew</Text>
                          </View>
                          <Switch
                            value={subscription.autoRenew}
                            onValueChange={() => handleToggleAutoRenew(subscription.id, subscription.autoRenew)}
                            trackColor={{ false: Colors.border.light, true: colors.primary[600] }}
                            thumbColor={Colors.background.primary}
                          />
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        {subscription.status === 'active' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton, { borderColor: colors.semantic.error }]}
                            onPress={() => handleCancelSubscription(subscription.id)}
                          >
                            <Ionicons name="close-outline" size={16} color={colors.semantic.error} />
                            <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        )}
                        {subscription.status === 'expired' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.renewButton, { borderColor: colors.primary[600] }]}
                            onPress={() => handleRenewSubscription(subscription.id)}
                          >
                            <Ionicons name="refresh-outline" size={16} color={colors.primary[600]} />
                            <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                              Renew
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'card-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Subscriptions Found' : 'No Subscriptions Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Your active subscriptions will appear here'}
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
  subscriptionsList: {
    gap: Spacing.md,
  },
  subscriptionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  subscriptionHeader: {
    marginBottom: Spacing.md,
  },
  subscriptionTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  subscriptionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
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
  subscriptionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  subscriptionPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  subscriptionPeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: Colors.text.secondary,
  },
  yearlyBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
  },
  yearlyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary[600],
    textTransform: 'uppercase',
  },
  subscriptionDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  featuresSection: {
    marginBottom: Spacing.md,
  },
  featuresLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    minWidth: '45%',
  },
  featureText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  moreFeaturesText: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  autoRenewSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  autoRenewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  autoRenewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  actionButtons: {
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
  cancelButton: {
    backgroundColor: Colors.background.primary,
  },
  renewButton: {
    backgroundColor: Colors.background.primary,
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

