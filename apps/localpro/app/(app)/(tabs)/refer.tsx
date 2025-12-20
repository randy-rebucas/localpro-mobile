import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Referral {
  id: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  reward?: number;
  createdAt: Date;
  completedAt?: Date;
}

export default function ReferTabScreen() {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  // Mock referral code - replace with actual API call
  const referralCode = 'LOCALPRO2024';
  const referralLink = `https://localpro.asia/invite/${referralCode}`;

  // Mock referral stats - replace with actual API call
  const stats = {
    total: 0,
    completed: 0,
    pending: 0,
    rewards: 0,
  };

  // Mock referrals list - replace with actual API call
  const referrals: Referral[] = [];

  const handleCopyCode = async () => {
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
      } else {
        // For native platforms, use Share API as a fallback
        // In production, install @react-native-clipboard/clipboard for better clipboard support
        await Share.share({
          message: referralCode,
          title: 'Referral Code',
        });
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch {
      // Fallback: show the code in an alert
      Alert.alert('Referral Code', referralCode, [
        { text: 'OK' },
      ]);
    }
  };

  const handleShare = async (method: 'share' | 'whatsapp' | 'sms' | 'email') => {
    const message = `Join LocalPro using my referral code: ${referralCode}\n\n${referralLink}\n\nGet amazing rewards when you sign up!`;

    try {
      if (method === 'share') {
        await Share.share({
          message,
          title: 'Join LocalPro',
        });
      } else if (method === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      } else if (method === 'sms') {
        const url = `sms:?body=${encodeURIComponent(message)}`;
        await Linking.openURL(url);
      } else if (method === 'email') {
        const url = `mailto:?subject=Join LocalPro&body=${encodeURIComponent(message)}`;
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const getStatusColor = (status: 'pending' | 'completed' | 'expired') => {
    switch (status) {
      case 'completed':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'expired':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const getStatusLabel = (status: 'pending' | 'completed' | 'expired') => {
    switch (status) {
      case 'completed':
        return 'Completed';
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Refer & Earn</Text>
            <Text style={styles.subtitle}>Invite friends and get rewards</Text>
          </View>

          {/* Referral Code Card */}
          <Card style={styles.referralCodeCard}>
            <View style={styles.referralCodeHeader}>
              <Ionicons name="gift-outline" size={32} color={colors.primary[600]} />
              <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
            </View>
            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCode}>{referralCode}</Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary[600] }]}
                onPress={handleCopyCode}
              >
                <Ionicons 
                  name={copied ? 'checkmark' : 'copy-outline'} 
                  size={18} 
                  color={colors.text.inverse} 
                />
                <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.referralCodeHint}>
              Share this code with friends to earn rewards
            </Text>
          </Card>

          {/* Share Options */}
          <View style={styles.shareSection}>
            <Text style={styles.sectionTitle}>Share via</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.background.primary }]}
                onPress={() => handleShare('share')}
              >
                <Ionicons name="share-social-outline" size={24} color={colors.primary[600]} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.background.primary }]}
                onPress={() => handleShare('whatsapp')}
              >
                <Ionicons name="logo-whatsapp" size={24} color={colors.semantic.success} />
                <Text style={styles.shareButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.background.primary }]}
                onPress={() => handleShare('sms')}
              >
                <Ionicons name="chatbubble-outline" size={24} color={colors.primary[600]} />
                <Text style={styles.shareButtonText}>SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.background.primary }]}
                onPress={() => handleShare('email')}
              >
                <Ionicons name="mail-outline" size={24} color={colors.primary[600]} />
                <Text style={styles.shareButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.semantic.success }]}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.semantic.warning }]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.primary[600] }]}>
                ${stats.rewards.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Rewards Earned</Text>
            </Card>
          </View>

          {/* Referrals List */}
          <View style={styles.referralsSection}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            {referrals.length > 0 ? (
              <View style={styles.referralsList}>
                {referrals.map((referral) => {
                  const statusColor = getStatusColor(referral.status);
                  return (
                    <Card key={referral.id} style={styles.referralItem}>
                      <View style={styles.referralItemHeader}>
                        <View style={styles.referralItemLeft}>
                          <View style={[styles.referralCodeBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Text style={[styles.referralCodeBadgeText, { color: statusColor }]}>
                              {referral.code}
                            </Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {getStatusLabel(referral.status)}
                            </Text>
                          </View>
                        </View>
                        {referral.reward && (
                          <Text style={[styles.rewardAmount, { color: colors.primary[600] }]}>
                            +${referral.reward.toFixed(2)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.referralItemMeta}>
                        <Text style={styles.referralItemDate}>
                          {formatDate(referral.createdAt)}
                        </Text>
                        {referral.completedAt && (
                          <Text style={styles.referralItemDate}>
                            Completed: {formatDate(referral.completedAt)}
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
                  <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
                  <Text style={styles.emptyStateTitle}>No Referrals Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Start sharing your referral code to earn rewards
                  </Text>
                </View>
              </Card>
            )}
          </View>

          {/* How It Works */}
          <Card style={styles.howItWorksCard}>
            <Text style={styles.howItWorksTitle}>How It Works</Text>
            <View style={styles.stepsList}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary[600] }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Share your referral code with friends</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary[600] }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>They sign up using your code</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary[600] }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>You both earn rewards!</Text>
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
  referralCodeCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  referralCodeHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  referralCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: Colors.text.primary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  referralCodeHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  shareSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  shareButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  referralsSection: {
    marginBottom: Spacing.lg,
  },
  referralsList: {
    gap: Spacing.md,
  },
  referralItem: {
    padding: Spacing.md,
  },
  referralItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  referralItemLeft: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  referralCodeBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  referralCodeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  referralItemMeta: {
    gap: 4,
  },
  referralItemDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateTitle: {
    fontSize: 18,
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
  howItWorksCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  stepsList: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    paddingTop: 4,
  },
});

