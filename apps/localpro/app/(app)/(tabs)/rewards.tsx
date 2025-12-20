import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Reward {
  id: string;
  type: 'referral' | 'bonus' | 'promotion' | 'achievement' | 'cashback';
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'available' | 'claimed' | 'expired';
  source?: string;
  createdAt: Date;
  claimedAt?: Date;
  expiresAt?: Date;
}

export default function RewardsTabScreen() {
  const colors = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'claimed' | 'pending'>('all');

  // Mock rewards data - replace with actual API call
  const rewards: Reward[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'available' as const, label: 'Available', icon: 'gift-outline' as const },
    { key: 'claimed' as const, label: 'Claimed', icon: 'checkmark-circle-outline' as const },
    { key: 'pending' as const, label: 'Pending', icon: 'time-outline' as const },
  ];

  const filteredRewards = rewards.filter(reward => {
    if (activeFilter === 'all') return true;
    return reward.status === activeFilter;
  });

  const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  const availableRewards = rewards
    .filter(r => r.status === 'available')
    .reduce((sum, reward) => sum + reward.amount, 0);
  const claimedRewards = rewards
    .filter(r => r.status === 'claimed')
    .reduce((sum, reward) => sum + reward.amount, 0);
  const pendingRewards = rewards
    .filter(r => r.status === 'pending')
    .reduce((sum, reward) => sum + reward.amount, 0);

  const getRewardIcon = (type: Reward['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'referral':
        return 'people';
      case 'bonus':
        return 'star';
      case 'promotion':
        return 'pricetag';
      case 'achievement':
        return 'trophy';
      case 'cashback':
        return 'cash';
      default:
        return 'gift';
    }
  };

  const getRewardColor = (type: Reward['type']) => {
    switch (type) {
      case 'referral':
        return colors.primary[600];
      case 'bonus':
        return colors.secondary[600];
      case 'promotion':
        return colors.semantic.warning;
      case 'achievement':
        return colors.semantic.success;
      case 'cashback':
        return colors.semantic.info;
      default:
        return colors.neutral.gray500;
    }
  };

  const getStatusColor = (status: Reward['status']) => {
    switch (status) {
      case 'available':
        return colors.semantic.success;
      case 'claimed':
        return colors.primary[600];
      case 'pending':
        return colors.semantic.warning;
      case 'expired':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const getStatusLabel = (status: Reward['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'claimed':
        return 'Claimed';
      case 'pending':
        return 'Pending';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClaimReward = (rewardId: string) => {
    // TODO: Implement claim reward functionality
    console.log('Claim reward:', rewardId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rewards</Text>
            <Text style={styles.subtitle}>Your rewards and earnings</Text>
          </View>

          {/* Total Rewards Card */}
          <Card style={styles.totalRewardsCard}>
            <View style={styles.totalRewardsHeader}>
              <Ionicons name="wallet-outline" size={32} color={colors.primary[600]} />
              <Text style={styles.totalRewardsLabel}>Total Rewards</Text>
            </View>
            <Text style={styles.totalRewardsAmount}>${totalRewards.toFixed(2)}</Text>
            <View style={styles.totalRewardsBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Available</Text>
                <Text style={[styles.breakdownValue, { color: colors.semantic.success }]}>
                  ${availableRewards.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Claimed</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary[600] }]}>
                  ${claimedRewards.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Pending</Text>
                <Text style={[styles.breakdownValue, { color: colors.semantic.warning }]}>
                  ${pendingRewards.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

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

          {/* Rewards List */}
          {filteredRewards.length > 0 ? (
            <View style={styles.rewardsList}>
              {filteredRewards.map((reward) => {
                const rewardColor = getRewardColor(reward.type);
                const statusColor = getStatusColor(reward.status);
                return (
                  <Card key={reward.id} style={styles.rewardCard}>
                    <View style={styles.rewardHeader}>
                      <View style={[styles.rewardIconContainer, { backgroundColor: `${rewardColor}15` }]}>
                        <Ionicons name={getRewardIcon(reward.type)} size={24} color={rewardColor} />
                      </View>
                      <View style={styles.rewardInfo}>
                        <View style={styles.rewardTitleRow}>
                          <Text style={styles.rewardTitle} numberOfLines={1}>
                            {reward.title}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {getStatusLabel(reward.status)}
                            </Text>
                          </View>
                        </View>
                        {reward.description && (
                          <Text style={styles.rewardDescription} numberOfLines={2}>
                            {reward.description}
                          </Text>
                        )}
                        {reward.source && (
                          <Text style={styles.rewardSource}>From: {reward.source}</Text>
                        )}
                      </View>
                      <View style={styles.rewardAmountContainer}>
                        <Text style={[styles.rewardAmount, { color: rewardColor }]}>
                          +${reward.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rewardFooter}>
                      <Text style={styles.rewardDate}>
                        {formatDate(reward.createdAt)}
                      </Text>
                      {reward.status === 'available' && (
                        <TouchableOpacity
                          style={[styles.claimButton, { backgroundColor: colors.primary[600] }]}
                          onPress={() => handleClaimReward(reward.id)}
                        >
                          <Text style={styles.claimButtonText}>Claim</Text>
                        </TouchableOpacity>
                      )}
                      {reward.claimedAt && (
                        <Text style={styles.rewardDate}>
                          Claimed: {formatDate(reward.claimedAt)}
                        </Text>
                      )}
                      {reward.expiresAt && reward.status !== 'claimed' && (
                        <Text style={[styles.rewardDate, { color: colors.semantic.error }]}>
                          Expires: {formatDate(reward.expiresAt)}
                        </Text>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeFilter === 'all' ? 'gift-outline' : 'filter-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeFilter === 'all' ? 'No Rewards Yet' : `No ${filters.find(f => f.key === activeFilter)?.label} Rewards`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'all'
                    ? 'Start earning rewards by referring friends and completing activities'
                    : `You don't have any ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} rewards yet`}
                </Text>
              </View>
            </Card>
          )}

          {/* How to Earn */}
          <Card style={styles.howToEarnCard}>
            <Text style={styles.howToEarnTitle}>How to Earn Rewards</Text>
            <View style={styles.earnMethodsList}>
              <View style={styles.earnMethod}>
                <Ionicons name="people" size={20} color={colors.primary[600]} />
                <Text style={styles.earnMethodText}>Refer friends and earn rewards</Text>
              </View>
              <View style={styles.earnMethod}>
                <Ionicons name="checkmark-circle" size={20} color={colors.secondary[600]} />
                <Text style={styles.earnMethodText}>Complete bookings and services</Text>
              </View>
              <View style={styles.earnMethod}>
                <Ionicons name="star" size={20} color={colors.semantic.warning} />
                <Text style={styles.earnMethodText}>Achieve milestones and goals</Text>
              </View>
              <View style={styles.earnMethod}>
                <Ionicons name="pricetag" size={20} color={colors.semantic.success} />
                <Text style={styles.earnMethodText}>Participate in promotions</Text>
              </View>
            </View>
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
  totalRewardsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  totalRewardsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalRewardsLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  totalRewardsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary[600],
    marginBottom: Spacing.md,
  },
  totalRewardsBreakdown: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
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
  rewardsList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rewardCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rewardDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  rewardSource: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  rewardAmountContainer: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rewardDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  claimButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
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
  howToEarnCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  howToEarnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  earnMethodsList: {
    gap: Spacing.md,
  },
  earnMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  earnMethodText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

