import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  tier: 'free' | 'localpro' | 'localpro-plus';
}

export default function BrowseSubscriptionsTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const colors = useThemeColors();

  // Mock subscription plans - replace with actual API call
  const plans: SubscriptionPlan[] = [];

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = plan.billingPeriod === selectedPeriod;
    return matchesSearch && matchesPeriod;
  });

  const handleSubscribe = (planId: string) => {
    // TODO: Navigate to subscription checkout screen
    // router.push(`/(app)/subscribe/${planId}`);
    console.log('Subscribe to plan:', planId);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getBillingPeriodLabel = (period: 'monthly' | 'yearly') => {
    return period === 'monthly' ? '/month' : '/year';
  };

  const getTierColor = (tier: SubscriptionPlan['tier']) => {
    switch (tier) {
      case 'localpro-plus':
        return colors.primary[600];
      case 'localpro':
        return colors.secondary[600];
      default:
        return colors.neutral.gray500;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Subscriptions</Text>
            <Text style={styles.subtitle}>Choose a plan that works for you</Text>
          </View>

          {/* Billing Period Toggle */}
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'monthly' && [styles.periodButtonActive, { backgroundColor: colors.primary[600] }],
              ]}
              onPress={() => setSelectedPeriod('monthly')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'monthly' && styles.periodButtonTextActive,
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'yearly' && [styles.periodButtonActive, { backgroundColor: colors.primary[600] }],
              ]}
              onPress={() => setSelectedPeriod('yearly')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'yearly' && styles.periodButtonTextActive,
              ]}>
                Yearly
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 20%</Text>
              </View>
            </TouchableOpacity>
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
                placeholder="Search plans..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Subscription Plans */}
          {filteredPlans.length > 0 ? (
            <View style={styles.plansList}>
              {filteredPlans.map((plan) => {
                const tierColor = getTierColor(plan.tier);
                const cardStyles: ViewStyle[] = [
                  styles.planCard,
                  ...(plan.isPopular ? [styles.popularPlanCard, { borderColor: tierColor, borderWidth: 2 }] : []),
                ];
                return (
                  <View key={plan.id} style={cardStyles}>
                    {plan.isPopular && (
                      <View style={[styles.popularBadge, { backgroundColor: tierColor }]}>
                        <Ionicons name="star" size={12} color={colors.text.inverse} />
                        <Text style={styles.popularBadgeText}>Most Popular</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.planPricing}>
                        <Text style={[styles.planPrice, { color: tierColor }]}>
                          {formatCurrency(plan.price)}
                        </Text>
                        <Text style={styles.planPeriod}>
                          {getBillingPeriodLabel(plan.billingPeriod)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                    <View style={styles.featuresSection}>
                      <Text style={styles.featuresTitle}>Features:</Text>
                      <View style={styles.featuresList}>
                        {plan.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        plan.isPopular && { backgroundColor: tierColor },
                        !plan.isPopular && { borderColor: tierColor, borderWidth: 1 },
                      ]}
                      onPress={() => handleSubscribe(plan.id)}
                    >
                      <Text style={[
                        styles.subscribeButtonText,
                        plan.isPopular && { color: colors.text.inverse },
                        !plan.isPopular && { color: tierColor },
                      ]}>
                        {plan.tier === 'free' ? 'Get Started' : 'Subscribe'}
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                  {searchQuery ? 'No Plans Found' : 'No Plans Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Subscription plans will appear here'}
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
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  periodButtonActive: {
    borderWidth: 0,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.semantic.success,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
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
  plansList: {
    gap: Spacing.md,
  },
  planCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  popularPlanCard: {
    paddingTop: Spacing.xl,
  },
  popularBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  planHeader: {
    marginBottom: Spacing.md,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  featuresSection: {
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },
  subscribeButtonText: {
    fontSize: 16,
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

