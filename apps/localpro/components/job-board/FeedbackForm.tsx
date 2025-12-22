import { Ionicons } from '@expo/vector-icons';
import type { JobApplication } from '@localpro/types';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface FeedbackFormProps {
  visible: boolean;
  application: JobApplication | null;
  onSubmit: (feedback: string, rating?: number) => Promise<void>;
  onClose: () => void;
}

export function FeedbackForm({ visible, application, onSubmit, onClose }: FeedbackFormProps) {
  const colors = useThemeColors();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(feedback.trim(), rating);
      setFeedback('');
      setRating(undefined);
      onClose();
    } catch {
      // Error handling is done in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Submit Feedback</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Rating (Optional)</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(rating === star ? undefined : star)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons
                  name={rating && star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={rating && star <= rating ? Colors.semantic.warning[600] : colors.text.tertiary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Feedback *</Text>
          <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
            Provide feedback for the applicant about their application
          </Text>
          <TextInput
            style={[
              styles.feedbackInput,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.light,
                color: colors.text.primary,
              },
            ]}
            placeholder="Enter your feedback..."
            placeholderTextColor={colors.text.tertiary}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border.light }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border.light }]}
            onPress={onClose}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: feedback.trim() ? colors.primary[600] : colors.neutral.gray300,
              },
            ]}
            onPress={handleSubmit}
            disabled={!feedback.trim() || submitting}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  helperText: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  feedbackInput: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 120,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  submitButton: {
    flex: 2,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

