import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface InterviewSchedulerProps {
  applicationId: string;
  applicantName: string;
  onSchedule: (data: {
    date: Date;
    time: Date;
    location?: string;
    type: 'in-person' | 'video' | 'phone';
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  existingInterview?: {
    date: Date;
    time: Date;
    location?: string;
    type: 'in-person' | 'video' | 'phone';
    notes?: string;
  };
}

export function InterviewScheduler({
  applicationId,
  applicantName,
  onSchedule,
  onCancel,
  existingInterview,
}: InterviewSchedulerProps) {
  const colors = useThemeColors();
  const [date, setDate] = useState<Date>(existingInterview?.date || new Date());
  const [time, setTime] = useState<Date>(existingInterview?.time || new Date());
  const [location, setLocation] = useState(existingInterview?.location || '');
  const [type, setType] = useState<'in-person' | 'video' | 'phone'>(existingInterview?.type || 'in-person');
  const [notes, setNotes] = useState(existingInterview?.notes || '');
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    if (date < new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date for the interview.');
      return;
    }

    try {
      setScheduling(true);
      await onSchedule({
        date,
        time,
        location: type === 'in-person' ? location : undefined,
        type,
        notes: notes.trim() || undefined,
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.title}>Schedule Interview</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{applicantName}</Text>
      </Card>

      <View style={styles.content}>
        {/* Interview Type */}
        <Card style={styles.section}>
          <Text style={styles.label}>Interview Type *</Text>
          <View style={styles.typeContainer}>
            {(['in-person', 'video', 'phone'] as const).map((interviewType) => (
              <Button
                key={interviewType}
                variant={type === interviewType ? 'primary' : 'outline'}
                onPress={() => setType(interviewType)}
                style={styles.typeButton}
              >
                <Ionicons
                  name={
                    interviewType === 'in-person'
                      ? 'location-outline'
                      : interviewType === 'video'
                      ? 'videocam-outline'
                      : 'call-outline'
                  }
                  size={18}
                  color={type === interviewType ? Colors.text.inverse : colors.primary[600]}
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === interviewType ? Colors.text.inverse : colors.primary[600],
                    },
                  ]}
                >
                  {interviewType === 'in-person' ? 'In Person' : interviewType === 'video' ? 'Video Call' : 'Phone Call'}
                </Text>
              </Button>
            ))}
          </View>
        </Card>

        {/* Date Input */}
        <Card style={styles.section}>
          <Text style={styles.label}>Date *</Text>
          <Text style={[styles.hint, { color: colors.text.tertiary }]}>
            Format: YYYY-MM-DD (e.g., 2024-12-25)
          </Text>
          <Input
            value={date.toISOString().split('T')[0]}
            onChangeText={(text) => {
              const newDate = new Date(text);
              if (!isNaN(newDate.getTime())) {
                setDate(newDate);
              }
            }}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={[styles.currentDate, { color: colors.text.secondary }]}>
            Selected: {formatDate(date)}
          </Text>
        </Card>

        {/* Time Input */}
        <Card style={styles.section}>
          <Text style={styles.label}>Time *</Text>
          <Text style={[styles.hint, { color: colors.text.tertiary }]}>
            Format: HH:MM (24-hour format, e.g., 14:30)
          </Text>
          <Input
            value={formatTime(time)}
            onChangeText={(text) => {
              const [hours, minutes] = text.split(':').map(Number);
              if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                const newTime = new Date(time);
                newTime.setHours(hours, minutes);
                setTime(newTime);
              }
            }}
            placeholder="HH:MM"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={[styles.currentDate, { color: colors.text.secondary }]}>
            Selected: {formatTime(time)}
          </Text>
        </Card>

        {/* Location (for in-person) */}
        {type === 'in-person' && (
          <Card style={styles.section}>
            <Text style={styles.label}>Location *</Text>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder="Enter interview location"
              style={styles.input}
            />
          </Card>
        )}

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <Input
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes or instructions..."
            style={[styles.textArea, { color: colors.text.primary }]}
            textAlignVertical="top"
          />
        </Card>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.background.primary, borderTopColor: colors.border.light }]}>
        <Button variant="outline" onPress={onCancel} style={styles.cancelButton} disabled={scheduling}>
          Cancel
        </Button>
        <Button
          onPress={handleSchedule}
          style={[styles.scheduleButton, { backgroundColor: colors.primary[600] }]}
          disabled={scheduling || (type === 'in-person' && !location.trim())}
        >
          {scheduling ? 'Scheduling...' : 'Schedule Interview'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerCard: {
    padding: Spacing.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  typeText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  dateTimeText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  hint: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  currentDate: {
    fontSize: 13,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  input: {
    marginTop: Spacing.xs,
  },
  textArea: {
    minHeight: 100,
    marginTop: Spacing.xs,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cancelButton: {
    flex: 1,
  },
  scheduleButton: {
    flex: 2,
  },
});

