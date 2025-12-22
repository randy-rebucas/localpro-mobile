import { Ionicons } from '@expo/vector-icons';
import type { JobApplication } from '@localpro/types';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface StatusUpdateModalProps {
  visible: boolean;
  application: JobApplication | null;
  currentStatus: JobApplication['status'];
  onUpdate: (status: JobApplication['status'], notes?: string, rating?: number) => Promise<void>;
  onClose: () => void;
}

const STATUS_OPTIONS: {
  value: JobApplication['status'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 'pending', label: 'Pending', icon: 'time-outline', color: Colors.neutral.gray600 },
  { value: 'reviewed', label: 'Reviewed', icon: 'eye-outline', color: Colors.primary[600] },
  { value: 'interview', label: 'Interview', icon: 'calendar-outline', color: Colors.secondary[600] },
  { value: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline', color: Colors.semantic.success[600] },
  { value: 'rejected', label: 'Rejected', icon: 'close-circle-outline', color: Colors.semantic.error[600] },
];

export function StatusUpdateModal({
  visible,
  application,
  currentStatus,
  onUpdate,
  onClose,
}: StatusUpdateModalProps) {
  const colors = useThemeColors();
  const [selectedStatus, setSelectedStatus] = useState<JobApplication['status']>(currentStatus);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      Alert.alert('No Change', 'Please select a different status');
      return;
    }

    try {
      setUpdating(true);
      await onUpdate(selectedStatus, notes.trim() || undefined, rating);
      setNotes('');
      setRating(undefined);
      onClose();
    } catch {
      // Error handling is done in parent
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Update Application Status</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Select New Status</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedStatus === option.value;
              const isCurrent = currentStatus === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: isSelected ? option.color : colors.background.secondary,
                      borderColor: isSelected ? option.color : colors.border.light,
                      opacity: isCurrent ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => !isCurrent && setSelectedStatus(option.value)}
                  disabled={isCurrent}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={isSelected ? Colors.text.inverse : option.color}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: isSelected ? Colors.text.inverse : colors.text.primary },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isCurrent && (
                    <Text style={[styles.currentLabel, { color: colors.text.tertiary }]}>(Current)</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

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

          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.light,
                color: colors.text.primary,
              },
            ]}
            placeholder="Add notes about this application..."
            placeholderTextColor={colors.text.tertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
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
            style={[styles.updateButton, { backgroundColor: colors.primary[600] }]}
            onPress={handleUpdate}
            disabled={updating || selectedStatus === currentStatus}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text style={styles.updateButtonText}>{updating ? 'Updating...' : 'Update Status'}</Text>
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
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  statusOptions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  currentLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  notesInput: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 100,
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
  updateButton: {
    flex: 2,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

