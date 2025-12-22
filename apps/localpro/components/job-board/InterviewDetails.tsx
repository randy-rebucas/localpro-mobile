import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface InterviewDetailsProps {
  date?: Date | string;
  time?: Date | string;
  location?: string;
  type?: 'in-person' | 'video' | 'phone';
  notes?: string;
  meetingLink?: string;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'Not specified';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const formatTime = (time: Date | string | undefined): string => {
  if (!time) return 'Not specified';
  try {
    const timeObj = typeof time === 'string' ? new Date(time) : time;
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid time';
  }
};

const getTypeIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'video':
      return 'videocam-outline';
    case 'phone':
      return 'call-outline';
    case 'in-person':
    default:
      return 'location-outline';
  }
};

const getTypeLabel = (type?: string): string => {
  switch (type) {
    case 'video':
      return 'Video Call';
    case 'phone':
      return 'Phone Call';
    case 'in-person':
      return 'In-Person';
    default:
      return 'Interview';
  }
};

export function InterviewDetails({
  date,
  time,
  location,
  type,
  notes,
  meetingLink,
}: InterviewDetailsProps) {
  const colors = useThemeColors();

  if (!date && !time && !location && !type) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No interview scheduled</Text>
        </View>
      </Card>
    );
  }

  const handleOpenLink = async () => {
    if (!meetingLink) return;
    try {
      const canOpen = await Linking.canOpenURL(meetingLink);
      if (canOpen) {
        await Linking.openURL(meetingLink);
      } else {
        // Handle error
      }
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={24} color={colors.primary[600]} />
        <Text style={styles.title}>Interview Details</Text>
      </View>

      <View style={styles.detailsContainer}>
        {date && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>{formatDate(date)}</Text>
            </View>
          </View>
        )}

        {time && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Time</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>{formatTime(time)}</Text>
            </View>
          </View>
        )}

        {type && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name={getTypeIcon(type)} size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Type</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>{getTypeLabel(type)}</Text>
            </View>
          </View>
        )}

        {location && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="location-outline" size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Location</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>{location}</Text>
            </View>
          </View>
        )}

        {meetingLink && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}
            onPress={handleOpenLink}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="link-outline" size={18} color={colors.primary[600]} />
            <Text style={[styles.linkButtonText, { color: colors.primary[600] }]}>Join Meeting</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        )}

        {notes && (
          <View style={[styles.notesContainer, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.notesLabel, { color: colors.text.secondary }]}>Additional Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text.primary }]}>{notes}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  detailsContainer: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginTop: Spacing.xs,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  notesContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

