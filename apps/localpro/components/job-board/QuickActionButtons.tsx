import { Ionicons } from '@expo/vector-icons';
import type { Job } from '@localpro/types';
import React from 'react';
import { ActionSheetIOS, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface QuickActionButtonsProps {
  job: Job;
  onEdit: (jobId: string) => void;
  onPause: (jobId: string) => void;
  onClose: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onView?: (jobId: string) => void;
  onViewApplications?: (jobId: string) => void;
}

export function QuickActionButtons({
  job,
  onEdit,
  onPause,
  onClose,
  onDelete,
  onView,
  onViewApplications,
}: QuickActionButtonsProps) {
  const colors = useThemeColors();

  const handleMorePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', job.status === 'open' ? 'Pause' : 'Resume', 'Close', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onEdit(job.id);
          else if (buttonIndex === 2) onPause(job.id);
          else if (buttonIndex === 3) onClose(job.id);
          else if (buttonIndex === 4) handleDelete();
        }
      );
    } else {
      Alert.alert(
        'Job Actions',
        'Choose an action',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit', onPress: () => onEdit(job.id) },
          {
            text: job.status === 'open' ? 'Pause' : 'Resume',
            onPress: () => onPause(job.id),
          },
          { text: 'Close', onPress: () => onClose(job.id) },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ],
        { cancelable: true }
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Job',
      `Are you sure you want to delete "${job.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(job.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {onView && (
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton, { borderColor: colors.border.light }]}
          onPress={() => onView(job.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons name="eye-outline" size={16} color={colors.primary[600]} />
          <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>View</Text>
        </TouchableOpacity>
      )}

      {onViewApplications && (
        <TouchableOpacity
          style={[styles.actionButton, styles.applicationsButton, { backgroundColor: colors.primary[600] }]}
          onPress={() => onViewApplications(job.id)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons name="people-outline" size={16} color={Colors.text.inverse} />
          <Text style={styles.actionButtonTextPrimary}>Applications</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionButton, styles.moreButton, { borderColor: colors.border.light }]}
        onPress={handleMorePress}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.xs,
    minWidth: 80,
  },
  viewButton: {
    backgroundColor: Colors.background.secondary,
  },
  applicationsButton: {
    flex: 1,
    borderWidth: 0,
  },
  moreButton: {
    width: 44,
    paddingHorizontal: 0,
    backgroundColor: Colors.background.secondary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

