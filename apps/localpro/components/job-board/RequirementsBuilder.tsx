import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface RequirementsBuilderProps {
  requirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
}

const REQUIREMENT_TYPES = {
  skills: 'Skills',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
  languages: 'Languages',
};

export function RequirementsBuilder({ requirements, onRequirementsChange }: RequirementsBuilderProps) {
  const colors = useThemeColors();
  const [selectedType, setSelectedType] = useState<keyof typeof REQUIREMENT_TYPES>('skills');
  const [inputValue, setInputValue] = useState('');

  const addRequirement = () => {
    if (inputValue.trim()) {
      const requirement = `[${REQUIREMENT_TYPES[selectedType]}] ${inputValue.trim()}`;
      if (!requirements.includes(requirement)) {
        onRequirementsChange([...requirements, requirement]);
        setInputValue('');
      }
    }
  };

  const removeRequirement = (requirement: string) => {
    onRequirementsChange(requirements.filter((r) => r !== requirement));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Requirements</Text>
      <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
        Add specific requirements for this position
      </Text>

      <View style={styles.typeSelector}>
        {Object.entries(REQUIREMENT_TYPES).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.typeChip,
              {
                backgroundColor:
                  selectedType === key ? colors.primary[600] : colors.background.secondary,
                borderColor: selectedType === key ? colors.primary[600] : colors.border.light,
              },
            ]}
            onPress={() => setSelectedType(key as keyof typeof REQUIREMENT_TYPES)}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Text
              style={[
                styles.typeText,
                { color: selectedType === key ? Colors.text.inverse : colors.text.secondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border.light,
              color: colors.text.primary,
              backgroundColor: colors.background.secondary,
            },
          ]}
          placeholder={`Enter ${REQUIREMENT_TYPES[selectedType].toLowerCase()}...`}
          placeholderTextColor={colors.text.tertiary}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={addRequirement}
          multiline
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
          onPress={addRequirement}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons name="add" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {requirements.length > 0 && (
        <View style={styles.requirementsList}>
          {requirements.map((requirement, index) => (
            <View
              key={index}
              style={[styles.requirementItem, { backgroundColor: colors.background.secondary, borderColor: colors.border.light }]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.primary[600]} />
              <Text style={[styles.requirementText, { color: colors.text.primary }]}>{requirement}</Text>
              <TouchableOpacity
                onPress={() => removeRequirement(requirement)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="close-circle" size={18} color={colors.semantic.error[600]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  helperText: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  typeChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  typeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 10, android: 12 }),
    fontSize: 15,
    minHeight: 44,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsList: {
    gap: Spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

