import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  rejectionReason?: string;
}

export default function VerificationStatusTabScreen() {
  const colors = useThemeColors();
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);

  // Mock verifications - replace with actual API call
  const verifications: Verification[] = [];

  const getTypeLabel = (type: VerificationType) => {
    switch (type) {
      case 'identity':
        return 'Identity Verification';
      case 'business':
        return 'Business Verification';
      case 'professional':
        return 'Professional License';
      case 'background':
        return 'Background Check';
    }
  };

  const getTypeIcon = (type: VerificationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'identity':
        return 'person-outline';
      case 'business':
        return 'business-outline';
      case 'professional':
        return 'school-outline';
      case 'background':
        return 'shield-checkmark-outline';
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'rejected':
        return colors.semantic.error;
      case 'expired':
        return colors.neutral.gray500;
    }
  };

  const getStatusIcon = (status: VerificationStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'rejected':
        return 'close-circle';
      case 'expired':
        return 'calendar-outline';
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const isExpiringSoon = (expiresAt: Date | undefined) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verification Status</Text>
            <Text style={styles.subtitle}>Track your verification requests</Text>
          </View>

          {/* Verifications List */}
          {verifications.length > 0 ? (
            <View style={styles.verificationsList}>
              {verifications.map((verification) => {
                const statusColor = getStatusColor(verification.status);
                const isExpiring = isExpiringSoon(verification.expiresAt);
                const isExpanded = selectedVerification === verification.id;
                return (
                  <Card key={verification.id} style={styles.verificationCard}>
                    <TouchableOpacity
                      onPress={() => setSelectedVerification(isExpanded ? null : verification.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.verificationHeader}>
                        <View style={[styles.verificationIconContainer, { backgroundColor: `${colors.primary[600]}15` }]}>
                          <Ionicons name={getTypeIcon(verification.type)} size={24} color={colors.primary[600]} />
                        </View>
                        <View style={styles.verificationInfo}>
                          <Text style={styles.verificationType}>{getTypeLabel(verification.type)}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Ionicons name={getStatusIcon(verification.status)} size={12} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={colors.text.secondary}
                        />
                      </View>

                      {isExpanded && (
                        <View style={styles.verificationDetails}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Submitted:</Text>
                            <Text style={styles.detailValue}>{formatDate(verification.createdAt)}</Text>
                          </View>
                          {verification.verifiedAt && (
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Verified:</Text>
                              <Text style={styles.detailValue}>{formatDate(verification.verifiedAt)}</Text>
                            </View>
                          )}
                          {verification.expiresAt && (
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Expires:</Text>
                              <Text style={[styles.detailValue, isExpiring && { color: colors.semantic.warning }]}>
                                {formatDate(verification.expiresAt)}
                                {isExpiring && ' ⚠️'}
                              </Text>
                            </View>
                          )}
                          {verification.rejectionReason && (
                            <View style={styles.rejectionSection}>
                              <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                              <Text style={styles.rejectionText}>{verification.rejectionReason}</Text>
                            </View>
                          )}
                          {verification.documents.length > 0 && (
                            <View style={styles.documentsSection}>
                              <Text style={styles.documentsLabel}>Documents ({verification.documents.length}):</Text>
                              {verification.documents.map((doc, index) => (
                                <View key={index} style={styles.documentItem}>
                                  <Ionicons name="document-outline" size={16} color={colors.text.secondary} />
                                  <Text style={styles.documentText} numberOfLines={1}>{doc}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Verifications</Text>
                <Text style={styles.emptyStateText}>
                  You haven&apos;t submitted any verification requests yet
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
  verificationsList: {
    gap: Spacing.md,
  },
  verificationCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  verificationType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  verificationDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  rejectionSection: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  rejectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.semantic.error,
    marginBottom: Spacing.xs,
  },
  rejectionText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  documentsSection: {
    marginTop: Spacing.sm,
  },
  documentsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  documentText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
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

