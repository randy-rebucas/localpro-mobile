import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface BenefitsSelectorProps {
  benefits: string[];
  onBenefitsChange: (benefits: string[]) => void;
}

const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  '401(k) Matching',
  'Paid Time Off',
  'Remote Work',
  'Flexible Hours',
  'Professional Development',
  'Stock Options',
  'Gym Membership',
  'Free Meals',
  'Transportation Allowance',
];

export function BenefitsSelector({ benefits, onBenefitsChange }: BenefitsSelectorProps) {
  const colors = useThemeColors();
  const [customBenefit, setCustomBenefit] = useState('');

  const toggleBenefit = (benefit: string) => {
    if (benefits.includes(benefit)) {
      onBenefitsChange(benefits.filter((b) => b !== benefit));
    } else {
      onBenefitsChange([...benefits, benefit]);
    }
  };

  const addCustomBenefit = () => {
    if (customBenefit.trim() && !benefits.includes(customBenefit.trim())) {
      onBenefitsChange([...benefits, customBenefit.trim()]);
      setCustomBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    onBenefitsChange(benefits.filter((b) => b !== benefit));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Benefits & Perks</Text>
      <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
        Select benefits offered with this position
      </Text>

      <View style={styles.benefitsGrid}>
        {COMMON_BENEFITS.map((benefit) => {
          const isSelected = benefits.includes(benefit);
          return (
            <TouchableOpacity
              key={benefit}
              style={[
                styles.benefitChip,
                {
                  backgroundColor: isSelected ? colors.primary[600] : colors.background.secondary,
                  borderColor: isSelected ? colors.primary[600] : colors.border.light,
                },
              ]}
              onPress={() => toggleBenefit(benefit)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              {isSelected && <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />}
              <Text
                style={[
                  styles.benefitText,
                  { color: isSelected ? Colors.text.inverse : colors.text.secondary },
                ]}
              >
                {benefit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.customBenefitContainer}>
        <TextInput
          style={[
            styles.customInput,
            {
              borderColor: colors.border.light,
              color: colors.text.primary,
              backgroundColor: colors.background.secondary,
            },
          ]}
          placeholder="Add custom benefit"
          placeholderTextColor={colors.text.tertiary}
          value={customBenefit}
          onChangeText={setCustomBenefit}
          onSubmitEditing={addCustomBenefit}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
          onPress={addCustomBenefit}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Ionicons name="add" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {benefits.length > 0 && (
        <View style={styles.selectedBenefits}>
          <Text style={[styles.selectedLabel, { color: colors.text.secondary }]}>Selected Benefits:</Text>
          <View style={styles.selectedChips}>
            {benefits.map((benefit) => (
              <View
                key={benefit}
                style={[styles.selectedChip, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}
              >
                <Text style={[styles.selectedChipText, { color: colors.primary[600] }]}>{benefit}</Text>
                <TouchableOpacity
                  onPress={() => removeBenefit(benefit)}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="close-circle" size={16} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  benefitText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  customBenefitContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  customInput: {
    flex: 1,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 10, android: 12 }),
    fontSize: 15,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBenefits: {
    marginTop: Spacing.sm,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  selectedChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
});

