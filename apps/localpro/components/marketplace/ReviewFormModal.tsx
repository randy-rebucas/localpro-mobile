import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ReviewFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  serviceTitle?: string;
}

export function ReviewFormModal({
  visible,
  onClose,
  onSubmit,
  serviceTitle,
}: ReviewFormModalProps) {
  const colors = useThemeColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stars = [1, 2, 3, 4, 5];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setComment('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Write a Review</Text>
              {serviceTitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {serviceTitle}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} disabled={submitting}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.label}>Rating *</Text>
              <View style={styles.starsContainer}>
                {stars.map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starButton}
                    onPress={() => setRating(star)}
                    disabled={submitting}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? colors.semantic.warning : colors.text.tertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 5
                    ? 'Excellent'
                    : rating === 4
                    ? 'Very Good'
                    : rating === 3
                    ? 'Good'
                    : rating === 2
                    ? 'Fair'
                    : 'Poor'}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.label}>Your Review</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { borderColor: colors.border.medium, color: colors.text.primary },
                ]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.text.tertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!submitting}
              />
              <Text style={styles.charCount}>
                {comment.length} / 500 characters
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: Colors.border.light }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: Colors.border.medium }]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary[600] },
                submitting && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
            >
              <Text style={styles.submitText}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.xl,
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
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 120,
    marginBottom: Spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

