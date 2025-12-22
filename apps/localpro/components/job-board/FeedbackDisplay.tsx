import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface FeedbackDisplayProps {
  feedback?: string;
  rating?: number;
  notes?: string;
}

export function FeedbackDisplay({ feedback, rating, notes }: FeedbackDisplayProps) {
  const colors = useThemeColors();

  if (!feedback && !rating && !notes) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={32} color={colors.text.tertiary} />
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No feedback provided</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Feedback</Text>

      {rating !== undefined && rating > 0 && (
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingLabel, { color: colors.text.secondary }]}>Rating:</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= rating ? 'star' : 'star-outline'}
                size={20}
                color={star <= rating ? colors.semantic.warning : colors.text.tertiary}
              />
            ))}
            <Text style={[styles.ratingValue, { color: colors.text.primary }]}>{rating}/5</Text>
          </View>
        </View>
      )}

      {feedback && (
        <View style={styles.feedbackSection}>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>Feedback:</Text>
          <View style={[styles.feedbackBox, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.feedbackText, { color: colors.text.primary }]}>{feedback}</Text>
          </View>
        </View>
      )}

      {notes && (
        <View style={styles.notesSection}>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>Notes:</Text>
          <View style={[styles.notesBox, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.notesText, { color: colors.text.primary }]}>{notes}</Text>
          </View>
        </View>
      )}
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  feedbackSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  feedbackBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  notesSection: {
    marginTop: Spacing.sm,
  },
  notesBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
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

