import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export type JobSortOption = 'relevance' | 'date' | 'salary' | 'company';

interface JobSortOptionItem {
  value: JobSortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SORT_OPTIONS: JobSortOptionItem[] = [
  { value: 'relevance', label: 'Relevance', icon: 'star-outline' },
  { value: 'date', label: 'Date Posted', icon: 'time-outline' },
  { value: 'salary', label: 'Salary', icon: 'cash-outline' },
  { value: 'company', label: 'Company', icon: 'business-outline' },
];

interface JobSortDropdownProps {
  selectedSort?: JobSortOption;
  onSortChange: (sort: JobSortOption) => void;
}

export function JobSortDropdown({ selectedSort, onSortChange }: JobSortDropdownProps) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === selectedSort) || SORT_OPTIONS[0];

  const handleSelect = (option: JobSortOption) => {
    onSortChange(option);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        <View style={styles.dropdownContent}>
          <Ionicons name="swap-vertical-outline" size={20} color={colors.text.secondary} />
          <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
            Sort: {selectedOption.label}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Sort By</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((option) => {
              const isSelected = selectedSort === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    isSelected && { backgroundColor: colors.primary[50] },
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={isSelected ? colors.primary[600] : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? colors.primary[600] : colors.text.primary,
                        fontWeight: isSelected ? Typography.fontWeight.semibold : Typography.fontWeight.regular,
                        fontFamily: isSelected
                          ? Typography.fontFamily?.semibold || 'System'
                          : Typography.fontFamily?.regular || 'System',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    ...Shadows.sm,
    minHeight: Platform.select({ ios: 44, android: 48 }),
    ...Platform.select({
      android: {
        elevation: Shadows.sm.elevation,
      },
    }),
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

