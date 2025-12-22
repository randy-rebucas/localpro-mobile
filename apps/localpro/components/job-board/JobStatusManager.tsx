import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

type JobStatus = 'open' | 'closed' | 'filled';

interface JobStatusManagerProps {
  currentStatus: JobStatus;
  onStatusChange: (status: JobStatus) => Promise<void>;
  updating?: boolean;
}

const STATUS_OPTIONS: { value: JobStatus; label: string; icon: string; color: string }[] = [
  { value: 'open', label: 'Open', icon: 'checkmark-circle-outline', color: Colors.secondary[600] },
  { value: 'closed', label: 'Closed', icon: 'lock-closed-outline', color: Colors.neutral.gray600 },
  { value: 'filled', label: 'Filled', icon: 'people-outline', color: Colors.primary[600] },
];

export function JobStatusManager({ currentStatus, onStatusChange, updating }: JobStatusManagerProps) {
  const colors = useThemeColors();

  const handleStatusChange = (newStatus: JobStatus) => {
    if (newStatus === currentStatus) return;

    const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;

    Alert.alert(
      'Change Job Status',
      `Are you sure you want to change the job status to "${statusLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await onStatusChange(newStatus);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to update job status');
            }
          },
        },
      ]
    );
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Job Status</Text>
      <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
        Update the status of this job posting
      </Text>

      <View style={styles.statusContainer}>
        {STATUS_OPTIONS.map((option) => {
          const isSelected = currentStatus === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusButton,
                {
                  backgroundColor: isSelected ? option.color : colors.background.secondary,
                  borderColor: isSelected ? option.color : colors.border.light,
                },
              ]}
              onPress={() => handleStatusChange(option.value)}
              disabled={updating || isSelected}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={isSelected ? Colors.text.inverse : option.color}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isSelected ? Colors.text.inverse : option.color,
                  },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={Colors.text.inverse} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {updating && (
        <View style={styles.updatingIndicator}>
          <Text style={[styles.updatingText, { color: colors.text.tertiary }]}>Updating status...</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.select({ ios: 10, android: 12 }),
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  checkIcon: {
    marginLeft: Spacing.xs,
  },
  updatingIndicator: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

