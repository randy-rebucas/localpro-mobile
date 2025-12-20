import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type VerificationType = 'identity' | 'business' | 'professional' | 'background';
type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface Verification {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  documents: string[];
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

interface TrustScore {
  score: number;
  factors: {
    verified: boolean;
    reviews: number;
    completedJobs: number;
    responseRate: number;
  };
}

export default function VerifyTabScreen() {
  const colors = useThemeColors();

  // Mock trust score - replace with actual API call
  const trustScore: TrustScore = {
    score: 0,
    factors: {
      verified: false,
      reviews: 0,
      completedJobs: 0,
      responseRate: 0,
    },
  };

  // Mock verifications - replace with actual API call
  const verifications: Verification[] = [];

  const verificationTypes: { key: VerificationType; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
    {
      key: 'identity',
      label: 'Identity Verification',
      icon: 'person-outline',
      description: 'Verify your identity with government-issued ID',
    },
    {
      key: 'business',
      label: 'Business Verification',
      icon: 'business-outline',
      description: 'Verify your business registration and credentials',
    },
    {
      key: 'professional',
      label: 'Professional License',
      icon: 'school-outline',
      description: 'Verify your professional licenses and certifications',
    },
    {
      key: 'background',
      label: 'Background Check',
      icon: 'shield-checkmark-outline',
      description: 'Complete a background check for enhanced trust',
    },
  ];

  const getVerificationStatus = (type: VerificationType): VerificationStatus | null => {
    const verification = verifications.find(v => v.type === type);
    return verification ? verification.status : null;
  };

  const handleStartVerification = (type: VerificationType) => {
    const existingStatus = getVerificationStatus(type);
    if (existingStatus === 'approved') {
      Alert.alert('Already Verified', 'You have already completed this verification.');
      return;
    }
    if (existingStatus === 'pending') {
      Alert.alert('Verification Pending', 'Your verification request is currently being reviewed.');
      return;
    }
    // TODO: Navigate to verification submission screen
    // router.push(`/(app)/verify/${type}`);
    console.log('Start verification:', type);
  };

  const getStatusColor = (status: VerificationStatus | null) => {
    if (!status) return colors.text.secondary;
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'rejected':
        return colors.semantic.error;
      case 'expired':
        return colors.neutral.gray500;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: VerificationStatus | null): keyof typeof Ionicons.glyphMap => {
    if (!status) return 'ellipse-outline';
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'rejected':
        return 'close-circle';
      case 'expired':
        return 'calendar-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusLabel = (status: VerificationStatus | null) => {
    if (!status) return 'Not Verified';
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return colors.semantic.success;
    if (score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify</Text>
            <Text style={styles.subtitle}>Get verified and build trust</Text>
          </View>

          {/* Trust Score Card */}
          <Card style={[styles.trustScoreCard, { backgroundColor: colors.primary[600] }] as any}>
            <View style={styles.trustScoreHeader}>
              <Ionicons name="shield-checkmark" size={32} color={colors.text.inverse} />
              <View style={styles.trustScoreInfo}>
                <Text style={styles.trustScoreLabel}>Trust Score</Text>
                <Text style={styles.trustScoreValue}>
                  {trustScore.score}
                  <Text style={styles.trustScoreMax}>/100</Text>
                </Text>
                <Text style={[styles.trustScoreStatus, { color: getTrustScoreColor(trustScore.score) }]}>
                  {getTrustScoreLabel(trustScore.score)}
                </Text>
              </View>
            </View>
            <View style={styles.trustScoreFactors}>
              <View style={styles.factorItem}>
                <Ionicons 
                  name={trustScore.factors.verified ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={trustScore.factors.verified ? colors.semantic.success : colors.text.inverse} 
                />
                <Text style={styles.factorText}>Verified</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="star-outline" size={16} color={colors.text.inverse} />
                <Text style={styles.factorText}>{trustScore.factors.reviews} Reviews</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="checkmark-done-outline" size={16} color={colors.text.inverse} />
                <Text style={styles.factorText}>{trustScore.factors.completedJobs} Jobs</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.text.inverse} />
                <Text style={styles.factorText}>{trustScore.factors.responseRate}% Response</Text>
              </View>
            </View>
          </Card>

          {/* Benefits Card */}
          <Card style={styles.benefitsCard}>
            <View style={styles.benefitsHeader}>
              <Ionicons name="star-outline" size={24} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>Benefits of Verification</Text>
            </View>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                <Text style={styles.benefitText}>Build trust with clients and partners</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                <Text style={styles.benefitText}>Get verified badge on your profile</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                <Text style={styles.benefitText}>Increase visibility in search results</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                <Text style={styles.benefitText}>Access premium features and opportunities</Text>
              </View>
            </View>
          </Card>

          {/* Verification Types */}
          <View style={styles.verificationsSection}>
            <Text style={styles.sectionTitle}>Verification Types</Text>
            <View style={styles.verificationsList}>
              {verificationTypes.map((type) => {
                const status = getVerificationStatus(type.key);
                const statusColor = getStatusColor(status);
                return (
                  <Card key={type.key} style={styles.verificationCard}>
                    <View style={styles.verificationHeader}>
                      <View style={[styles.verificationIconContainer, { backgroundColor: `${colors.primary[600]}15` }]}>
                        <Ionicons name={type.icon} size={24} color={colors.primary[600]} />
                      </View>
                      <View style={styles.verificationInfo}>
                        <Text style={styles.verificationName}>{type.label}</Text>
                        <Text style={styles.verificationDescription}>{type.description}</Text>
                      </View>
                      <View style={[styles.statusIndicator, { backgroundColor: `${statusColor}15` }]}>
                        <Ionicons name={getStatusIcon(status)} size={20} color={statusColor} />
                      </View>
                    </View>
                    <View style={styles.verificationFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {getStatusLabel(status)}
                        </Text>
                      </View>
                      {status === 'approved' && verifications.find(v => v.type === type.key)?.expiresAt && (
                        <Text style={styles.expiryText}>
                          Expires: {formatDate(verifications.find(v => v.type === type.key)?.expiresAt)}
                        </Text>
                      )}
                      {status === 'pending' && (
                        <Text style={styles.pendingText}>
                          Submitted: {formatDate(verifications.find(v => v.type === type.key)?.createdAt)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        status === 'approved' && styles.verifyButtonDisabled,
                        { backgroundColor: status === 'approved' ? Colors.background.secondary : colors.primary[600] },
                      ]}
                      onPress={() => handleStartVerification(type.key)}
                      disabled={status === 'approved'}
                    >
                      <Ionicons 
                        name={status === 'approved' ? 'checkmark-circle' : 'arrow-forward-outline'} 
                        size={16} 
                        color={status === 'approved' ? colors.text.secondary : colors.text.inverse} 
                      />
                      <Text style={[
                        styles.verifyButtonText,
                        status === 'approved' && styles.verifyButtonTextDisabled,
                      ]}>
                        {status === 'approved' ? 'Verified' : status === 'pending' ? 'View Status' : 'Get Verified'}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
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
  trustScoreCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  trustScoreInfo: {
    flex: 1,
  },
  trustScoreLabel: {
    fontSize: 14,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  trustScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  trustScoreMax: {
    fontSize: 20,
    opacity: 0.8,
  },
  trustScoreStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  trustScoreFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    minWidth: '45%',
  },
  factorText: {
    fontSize: 13,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  benefitsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  verificationsSection: {
    marginBottom: Spacing.lg,
  },
  verificationsList: {
    gap: Spacing.md,
  },
  verificationCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  verificationHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  verificationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationInfo: {
    flex: 1,
  },
  verificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  verificationDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expiryText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  pendingText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  verifyButtonTextDisabled: {
    color: Colors.text.secondary,
  },
});

