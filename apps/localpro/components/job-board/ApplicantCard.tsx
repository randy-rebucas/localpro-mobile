import { Ionicons } from '@expo/vector-icons';
import type { JobApplication } from '@localpro/types';
import { Card } from '@localpro/ui';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { useThemeColors } from '../../hooks/use-theme';

interface ApplicantCardProps {
  application: JobApplication & {
    applicant?: {
      id: string;
      name?: string;
      email?: string;
      phoneNumber?: string;
      avatar?: string;
    };
  };
  onPress: () => void;
  onResumePress: (resumeUrl?: string) => void;
  onStatusUpdate: () => void;
  onScheduleInterview: () => void;
  onFeedback: () => void;
  showCoverLetter?: boolean;
}

const getRelativeTime = (isoDate?: string | number | Date) => {
  if (!isoDate) return 'Date unknown';
  const timestamp = typeof isoDate === 'number' ? isoDate : new Date(isoDate).getTime();
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ApplicantCard({
  application,
  onPress,
  onResumePress,
  onStatusUpdate,
  onScheduleInterview,
  onFeedback,
  showCoverLetter = true,
}: ApplicantCardProps) {
  const colors = useThemeColors();
  const applicantName = application.applicant?.name || 'Unknown Applicant';
  const applicantEmail = application.applicant?.email || 'No email';
  const appliedAgo = getRelativeTime(application.appliedAt);

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {application.applicant?.avatar ? (
              <Image
                source={{ uri: application.applicant.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="person" size={24} color={colors.primary[600]} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {applicantName}
              </Text>
              <Text style={[styles.email, { color: colors.text.tertiary }]} numberOfLines={1}>
                {applicantEmail}
              </Text>
              {application.applicant?.phoneNumber && (
                <TouchableOpacity
                  style={styles.phoneRow}
                  onPress={() => Linking.openURL(`tel:${application.applicant?.phoneNumber}`)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="call-outline" size={14} color={colors.primary[600]} />
                  <Text style={[styles.phone, { color: colors.primary[600] }]}>
                    {application.applicant.phoneNumber}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <ApplicationStatusBadge status={application.status} />
        </View>

        {showCoverLetter && application.coverLetter && (
          <View style={styles.coverLetterContainer}>
            <Text style={[styles.coverLetterLabel, { color: colors.text.secondary }]}>Cover Letter:</Text>
            <Text style={[styles.coverLetterPreview, { color: colors.text.secondary }]} numberOfLines={3}>
              {application.coverLetter}
            </Text>
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: colors.border.light }]}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={[styles.metaText, { color: colors.text.tertiary }]}>{appliedAgo}</Text>
          </View>
          <View style={styles.actions}>
            {application.resume && (
              <TouchableOpacity
                style={[styles.actionButton, styles.resumeButton, { borderColor: colors.primary[200] }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onResumePress(application.resume);
                }}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="document-text-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>Resume</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.statusButton, { backgroundColor: colors.primary[600] }]}
              onPress={(e) => {
                e.stopPropagation();
                onStatusUpdate();
              }}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="swap-vertical-outline" size={16} color={Colors.text.inverse} />
            </TouchableOpacity>
            {application.status === 'reviewed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.scheduleButton, { backgroundColor: colors.secondary[600] }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onScheduleInterview();
                }}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="calendar-outline" size={16} color={Colors.text.inverse} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.feedbackButton, { borderColor: colors.border.light }]}
              onPress={(e) => {
                e.stopPropagation();
                onFeedback();
              }}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  email: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  phone: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  coverLetterContainer: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  coverLetterLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  coverLetterPreview: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  resumeButton: {
    backgroundColor: Colors.background.secondary,
  },
  statusButton: {
    borderWidth: 0,
    paddingHorizontal: Spacing.sm,
  },
  scheduleButton: {
    borderWidth: 0,
    paddingHorizontal: Spacing.sm,
  },
  feedbackButton: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

