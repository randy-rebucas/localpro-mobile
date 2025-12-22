import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import type { JobApplication } from '@localpro/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ApplicationTimelineProps {
  application: JobApplication;
}

const STATUS_ORDER: JobApplication['status'][] = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];

const STATUS_LABELS: Record<JobApplication['status'], string> = {
  pending: 'Application Submitted',
  reviewed: 'Under Review',
  interview: 'Interview Scheduled',
  accepted: 'Application Accepted',
  rejected: 'Application Rejected',
};

const STATUS_ICONS: Record<JobApplication['status'], keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  reviewed: 'eye-outline',
  interview: 'calendar-outline',
  accepted: 'checkmark-circle',
  rejected: 'close-circle',
};

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const colors = useThemeColors();
  const currentStatusIndex = STATUS_ORDER.indexOf(application.status);
  const appliedDate = new Date(application.appliedAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: JobApplication['status'], isActive: boolean) => {
    if (!isActive) return colors.text.tertiary;
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'reviewed':
        return colors.primary[600];
      case 'interview':
        return colors.secondary[600];
      case 'accepted':
        return colors.secondary[600];
      case 'rejected':
        return colors.semantic.error[600];
      default:
        return colors.text.secondary;
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Application Timeline</Text>
      <View style={styles.timeline}>
        {STATUS_ORDER.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const statusColor = getStatusColor(status, isActive);

          return (
            <View key={status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isActive ? `${statusColor}15` : colors.background.secondary,
                      borderColor: isActive ? statusColor : colors.border.light,
                    },
                  ]}
                >
                  <Ionicons
                    name={STATUS_ICONS[status]}
                    size={20}
                    color={isActive ? statusColor : colors.text.tertiary}
                  />
                </View>
                {index < STATUS_ORDER.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: isActive && index < currentStatusIndex ? statusColor : colors.border.light,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: isActive ? colors.text.primary : colors.text.tertiary,
                      fontWeight: isCurrent ? Typography.fontWeight.semibold : Typography.fontWeight.regular,
                    },
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
                {isCurrent && (
                  <Text style={[styles.statusDate, { color: colors.text.tertiary }]}>
                    {status === 'pending' ? `Applied on ${formatDate(appliedDate)}` : 'Current status'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  timeline: {
    gap: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
    marginTop: Spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
  },
  statusLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  statusDate: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

