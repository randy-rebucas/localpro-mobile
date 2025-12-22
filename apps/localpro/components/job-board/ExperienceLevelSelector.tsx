import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];

interface ExperienceLevelSelectorProps {
  selectedLevel?: string;
  onLevelChange: (level?: string) => void;
}

const toTitleCase = (str: string) => str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function ExperienceLevelSelector({
  selectedLevel,
  onLevelChange,
}: ExperienceLevelSelectorProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experience Level</Text>
      <View style={styles.chipContainer}>
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = selectedLevel === level;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                  borderColor: isSelected ? colors.primary[600] : colors.border.light,
                },
              ]}
              onPress={() => onLevelChange(isSelected ? undefined : level)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {isSelected && <Ionicons name="checkmark-circle" size={16} color={Colors.text.inverse} />}
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

