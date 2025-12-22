import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export interface JobFilters {
  categoryId?: string;
  jobTypes?: string[];
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  location?: string;
  radius?: number;
  companyName?: string;
  featured?: boolean;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company';
}

interface JobFilterSheetProps {
  visible: boolean;
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
  onClose: () => void;
  categories?: { id: string; name: string }[];
}

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'];
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date Posted' },
  { value: 'salary', label: 'Salary' },
  { value: 'company', label: 'Company' },
];

export function JobFilterSheet({ visible, filters, onApply, onClose, categories = [] }: JobFilterSheetProps) {
  const colors = useThemeColors();
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  // Filter out invalid categories and ensure unique IDs
  const validCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      if (!category || !category.id || !category.name || seen.has(category.id)) {
        return false;
      }
      seen.add(category.id);
      return true;
    });
  }, [categories]);

  const toggleJobType = (type: string) => {
    const currentTypes = localFilters.jobTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    setLocalFilters({ ...localFilters, jobTypes: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const toTitleCase = (str: string) => str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Modal visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Filter Jobs</Text>
              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text style={[styles.resetText, { color: colors.primary[600] }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Category Selection */}
            {validCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.chipContainer}>
                  {validCategories.map((category) => {
                    const isSelected = localFilters.categoryId === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                            borderColor: isSelected ? colors.primary[600] : colors.border.medium,
                          },
                        ]}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            categoryId: isSelected ? undefined : category.id,
                          })
                        }
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Job Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Type</Text>
              <View style={styles.chipContainer}>
                {JOB_TYPES.map((type) => {
                  const isSelected = localFilters.jobTypes?.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                          borderColor: isSelected ? colors.primary[600] : colors.border.medium,
                        },
                      ]}
                      onPress={() => toggleJobType(type)}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                        ]}
                      >
                        {toTitleCase(type)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Experience Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience Level</Text>
              <View style={styles.chipContainer}>
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = localFilters.experienceLevel === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                          borderColor: isSelected ? colors.primary[600] : colors.border.medium,
                        },
                      ]}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          experienceLevel: isSelected ? undefined : level,
                        })
                      }
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                        ]}
                      >
                        {toTitleCase(level)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Salary Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Salary Range</Text>
              <View style={styles.salaryRangeContainer}>
                <View style={styles.salaryInputRow}>
                  <View style={styles.salaryInput}>
                    <Text style={[styles.salaryLabel, { color: colors.text.tertiary }]}>Min</Text>
                    <TextInput
                      style={[styles.salaryInputField, {
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border.medium,
                        color: colors.text.primary
                      }]}
                      placeholder="0"
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="numeric"
                      value={localFilters.salaryMin?.toString() || ''}
                      onChangeText={(text) => {
                        const value = text ? parseInt(text, 10) : undefined;
                        setLocalFilters({ ...localFilters, salaryMin: value && value > 0 ? value : undefined });
                      }}
                    />
                  </View>
                  <View style={styles.salaryInput}>
                    <Text style={[styles.salaryLabel, { color: colors.text.tertiary }]}>Max</Text>
                    <TextInput
                      style={[styles.salaryInputField, {
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border.medium,
                        color: colors.text.primary
                      }]}
                      placeholder="100000"
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="numeric"
                      value={localFilters.salaryMax?.toString() || ''}
                      onChangeText={(text) => {
                        const value = text ? parseInt(text, 10) : undefined;
                        setLocalFilters({ ...localFilters, salaryMax: value && value > 0 ? value : undefined });
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Location Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.medium,
                  color: colors.text.primary
                }]}
                placeholder="Enter city or location"
                placeholderTextColor={colors.text.tertiary}
                value={localFilters.location || ''}
                onChangeText={(text) => setLocalFilters({ ...localFilters, location: text || undefined })}
              />
              {localFilters.location && (
                <View style={styles.radiusContainer}>
                  <Text style={[styles.radiusLabel, { color: colors.text.tertiary }]}>Radius (miles)</Text>
                  <View style={styles.radiusInputRow}>
                    {[5, 10, 25, 50, 100].map((radius) => (
                      <TouchableOpacity
                        key={radius}
                        style={[
                          styles.radiusChip,
                          {
                            backgroundColor:
                              localFilters.radius === radius ? colors.primary[600] : colors.background.secondary,
                            borderColor: localFilters.radius === radius ? colors.primary[600] : colors.border.medium,
                          },
                        ]}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            radius: localFilters.radius === radius ? undefined : radius,
                          })
                        }
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text
                          style={[
                            styles.radiusChipText,
                            { color: localFilters.radius === radius ? Colors.text.inverse : colors.text.secondary },
                          ]}
                        >
                          {radius}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Company Name Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Name</Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.medium,
                  color: colors.text.primary
                }]}
                placeholder="Search by company name"
                placeholderTextColor={colors.text.tertiary}
                value={localFilters.companyName || ''}
                onChangeText={(text) => setLocalFilters({ ...localFilters, companyName: text || undefined })}
              />
            </View>

            {/* Remote Work */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.sectionTitle}>Remote Work</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
                    Show only remote jobs
                  </Text>
                </View>
                <Switch
                  value={localFilters.remote || false}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, remote: value || undefined })}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary[200] }}
                  thumbColor={localFilters.remote ? colors.primary[600] : colors.neutral.gray400}
                />
              </View>
            </View>

            {/* Featured Jobs */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.sectionTitle}>Featured Jobs</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
                    Show only featured jobs
                  </Text>
                </View>
                <Switch
                  value={localFilters.featured || false}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, featured: value || undefined })}
                  trackColor={{ false: colors.neutral.gray300, true: colors.primary[200] }}
                  thumbColor={localFilters.featured ? colors.primary[600] : colors.neutral.gray400}
                />
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {SORT_OPTIONS.map((option) => {
                const isSelected = localFilters.sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionRow,
                      { borderBottomColor: colors.border.light },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        sortBy: isSelected ? undefined : (option.value as JobFilters['sortBy']),
                      })
                    }
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Text style={[styles.optionText, { color: colors.text.secondary }]}>{option.label}</Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary[600]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: Colors.border.light }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: Colors.border.medium }]}
              onPress={onClose}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleApply}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '90%',
    flexDirection: 'column',
    ...Shadows.xl,
    ...Platform.select({
      android: {
        elevation: Shadows.xl.elevation,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderBottomColor: Colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 28,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  resetText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    minHeight: Platform.select({ ios: 36, android: 40 }),
  },
  chipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: Spacing.md, android: Spacing.md + 2 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  cancelText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  applyButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: Spacing.md, android: Spacing.md + 2 }),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  applyText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  salaryRangeContainer: {
    marginTop: Spacing.sm,
  },
  salaryInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  salaryInput: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  salaryInputField: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    lineHeight: 20,
    minHeight: Platform.select({ ios: 44, android: 48 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
    ...Platform.select({
      android: {
        paddingVertical: Spacing.sm + 2,
      },
    }),
  },
  textInput: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
    minHeight: Platform.select({ ios: 44, android: 48 }),
    fontFamily: Typography.fontFamily?.regular || 'System',
    ...Platform.select({
      android: {
        paddingVertical: Spacing.sm + 2,
      },
    }),
  },
  radiusContainer: {
    marginTop: Spacing.sm,
  },
  radiusLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  radiusInputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, android: Spacing.sm + 2 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    minWidth: 60,
    alignItems: 'center',
    minHeight: Platform.select({ ios: 36, android: 40 }),
  },
  radiusChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 16,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

