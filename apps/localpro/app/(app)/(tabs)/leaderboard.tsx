import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type TimePeriod = 'all' | 'month' | 'week';

interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  rank: number;
  score: number;
  referrals: number;
  rewards: number;
}

export default function LeaderboardTabScreen() {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('all');

  // Mock leaderboard data - replace with actual API call
  const leaderboard: LeaderboardEntry[] = [];

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
  ];

  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'trophy';
      case 2:
        return 'medal';
      case 3:
        return 'medal-outline';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return colors.semantic.warning; // Gold
      case 2:
        return colors.neutral.gray400; // Silver
      case 3:
        return colors.semantic.info; // Bronze
      default:
        return colors.text.secondary;
    }
  };

  const getTopThreeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { backgroundColor: `${colors.semantic.warning}15`, borderColor: colors.semantic.warning };
      case 2:
        return { backgroundColor: `${colors.neutral.gray400}15`, borderColor: colors.neutral.gray400 };
      case 3:
        return { backgroundColor: `${colors.semantic.info}15`, borderColor: colors.semantic.info };
      default:
        return {};
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Top referrers and rankings</Text>
          </View>

          {/* User's Rank Card */}
          {currentUserEntry ? (
            <Card style={StyleSheet.flatten([styles.userRankCard, { backgroundColor: colors.primary[50] }] as ViewStyle[])}>
              <View style={styles.userRankHeader}>
                <View style={styles.userRankLeft}>
                  <View style={styles.userRankNumber}>
                    <Text style={[styles.userRankNumberText, { color: colors.primary[600] }]}>
                      #{currentUserEntry.rank}
                    </Text>
                  </View>
                  <View style={styles.userRankInfo}>
                    <Text style={styles.userRankName}>Your Rank</Text>
                    <Text style={styles.userRankScore}>
                      {currentUserEntry.score} points • {currentUserEntry.referrals} referrals
                    </Text>
                  </View>
                </View>
                <View style={styles.userRankRight}>
                  <Text style={[styles.userRankRewards, { color: colors.primary[600] }]}>
                    ${currentUserEntry.rewards.toFixed(2)}
                  </Text>
                  <Text style={styles.userRankRewardsLabel}>Rewards</Text>
                </View>
              </View>
            </Card>
          ) : (
            <Card style={styles.userRankCard}>
              <View style={styles.userRankHeader}>
                <Ionicons name="trophy-outline" size={32} color={colors.text.tertiary} />
                <View style={styles.userRankInfo}>
                  <Text style={styles.userRankName}>Not Ranked Yet</Text>
                  <Text style={styles.userRankScore}>
                    Start referring to climb the leaderboard!
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Time Period Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodsContainer}
            contentContainerStyle={styles.periodsContent}
          >
            {timePeriods.map((period) => {
              const isActive = activePeriod === period.key;
              return (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActivePeriod(period.key)}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      isActive && styles.periodTabTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatarContainer, getTopThreeStyle(2)]}>
                  {leaderboard[1].avatar ? (
                    <Image source={{ uri: leaderboard[1].avatar }} style={styles.podiumAvatar} />
                  ) : (
                    <View style={styles.podiumAvatarPlaceholder}>
                      <Text style={styles.podiumAvatarText}>
                        {leaderboard[1].name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.podiumRankBadge, { backgroundColor: colors.neutral.gray400 }]}>
                    <Ionicons name="medal" size={16} color={colors.text.inverse} />
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[1].name}
                </Text>
                <Text style={styles.podiumScore}>{leaderboard[1].score}</Text>
                <Text style={styles.podiumLabel}>2nd</Text>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatarContainer, styles.podiumFirst, getTopThreeStyle(1)]}>
                  {leaderboard[0].avatar ? (
                    <Image source={{ uri: leaderboard[0].avatar }} style={styles.podiumAvatar} />
                  ) : (
                    <View style={styles.podiumAvatarPlaceholder}>
                      <Text style={styles.podiumAvatarText}>
                        {leaderboard[0].name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.podiumRankBadge, styles.podiumRankBadgeFirst, { backgroundColor: colors.semantic.warning }]}>
                    <Ionicons name="trophy" size={20} color={colors.text.inverse} />
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[0].name}
                </Text>
                <Text style={styles.podiumScore}>{leaderboard[0].score}</Text>
                <Text style={styles.podiumLabel}>1st</Text>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatarContainer, getTopThreeStyle(3)]}>
                  {leaderboard[2].avatar ? (
                    <Image source={{ uri: leaderboard[2].avatar }} style={styles.podiumAvatar} />
                  ) : (
                    <View style={styles.podiumAvatarPlaceholder}>
                      <Text style={styles.podiumAvatarText}>
                        {leaderboard[2].name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.podiumRankBadge, { backgroundColor: colors.semantic.info }]}>
                    <Ionicons name="medal-outline" size={16} color={colors.text.inverse} />
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[2].name}
                </Text>
                <Text style={styles.podiumScore}>{leaderboard[2].score}</Text>
                <Text style={styles.podiumLabel}>3rd</Text>
              </View>
            </View>
          )}

          {/* Leaderboard List */}
          {leaderboard.length > 0 ? (
            <View style={styles.leaderboardList}>
              <Text style={styles.sectionTitle}>Full Rankings</Text>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                const rankIcon = getRankIcon(entry.rank);
                const rankColor = getRankColor(entry.rank);
                const isTopThree = entry.rank <= 3;

                const cardStyle: ViewStyle[] = [
                  styles.leaderboardItem,
                ];
                if (isCurrentUser) {
                  cardStyle.push({ backgroundColor: colors.primary[50], borderColor: colors.primary[200] });
                }
                if (isTopThree) {
                  cardStyle.push(getTopThreeStyle(entry.rank));
                }

                return (
                  <Card
                    key={entry.id}
                    style={StyleSheet.flatten(cardStyle)}
                  >
                    <View style={styles.leaderboardItemLeft}>
                      <View style={styles.rankContainer}>
                        {rankIcon ? (
                          <Ionicons name={rankIcon} size={24} color={rankColor} />
                        ) : (
                          <Text style={[styles.rankNumber, { color: rankColor }]}>
                            {entry.rank}
                          </Text>
                        )}
                      </View>
                      {entry.avatar ? (
                        <Image source={{ uri: entry.avatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {entry.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.entryInfo}>
                        <View style={styles.entryNameRow}>
                          <Text style={styles.entryName} numberOfLines={1}>
                            {entry.name}
                          </Text>
                          {isCurrentUser && (
                            <View style={[styles.currentUserBadge, { backgroundColor: colors.primary[600] }]}>
                              <Text style={styles.currentUserBadgeText}>You</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.entryDetails}>
                          {entry.referrals} referrals • ${entry.rewards.toFixed(2)} rewards
                        </Text>
                      </View>
                    </View>
                    <View style={styles.entryScore}>
                      <Text style={[styles.entryScoreValue, { color: rankColor }]}>
                        {entry.score}
                      </Text>
                      <Text style={styles.entryScoreLabel}>points</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Rankings Yet</Text>
                <Text style={styles.emptyStateText}>
                  Be the first to start referring and climb to the top!
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
  userRankCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderWidth: 2,
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  userRankNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userRankNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userRankInfo: {
    flex: 1,
  },
  userRankName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  userRankScore: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  userRankRight: {
    alignItems: 'flex-end',
  },
  userRankRewards: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  userRankRewardsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  periodsContainer: {
    marginBottom: Spacing.lg,
  },
  periodsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  periodTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  periodTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  podiumAvatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  podiumFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.sm,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  podiumAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  podiumRankBadgeFirst: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  podiumLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  leaderboardList: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  leaderboardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.gray200,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  entryInfo: {
    flex: 1,
  },
  entryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  currentUserBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  currentUserBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  entryDetails: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  entryScore: {
    alignItems: 'flex-end',
  },
  entryScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  entryScoreLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
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

