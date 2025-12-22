import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'];

interface JobTypeMultiSelectProps {
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
}

const toTitleCase = (str: string) => str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function JobTypeMultiSelect({ selectedTypes, onSelectionChange }: JobTypeMultiSelectProps) {
  const colors = useThemeColors();

  const toggleType = (type: string) => {
    // For single selection, if clicking the same type, deselect it
    // Otherwise, select only the new type
    if (selectedTypes.includes(type)) {
      onSelectionChange([]);
    } else {
      onSelectionChange([type]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Type</Text>
      <View style={styles.chipContainer}>
        {JOB_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                  borderColor: isSelected ? colors.primary[600] : colors.border.light,
                },
              ]}
              onPress={() => toggleType(type)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {isSelected && <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />}
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  chipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

