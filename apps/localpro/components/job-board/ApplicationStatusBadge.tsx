import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

type ApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pending: { label: 'Application Pending', icon: 'time-outline', color: Colors.neutral.gray600 },
  reviewed: { label: 'Under Review', icon: 'eye-outline', color: Colors.primary[600] },
  interview: { label: 'Interview Scheduled', icon: 'calendar-outline', color: Colors.secondary[600] },
  accepted: { label: 'Application Accepted', icon: 'checkmark-circle', color: Colors.secondary[600] },
  rejected: { label: 'Application Rejected', icon: 'close-circle', color: Colors.semantic.error[600] },
};

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const colors = useThemeColors();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}15`, borderColor: `${config.color}40` }]}>
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

