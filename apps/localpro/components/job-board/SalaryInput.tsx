import React from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SalaryInputProps {
  min?: number;
  max?: number;
  currency?: string;
  period?: string;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  onCurrencyChange: (currency: string) => void;
  onPeriodChange: (period: string) => void;
  error?: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];
const PERIODS = ['hour', 'day', 'week', 'month', 'year'];

export function SalaryInput({
  min,
  max,
  currency = 'USD',
  period = 'year',
  onMinChange,
  onMaxChange,
  onCurrencyChange,
  onPeriodChange,
  error,
}: SalaryInputProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Salary (Optional)</Text>
      
      <View style={styles.salaryRow}>
        <View style={styles.salaryInputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Min</Text>
          <TextInput
            style={[
              styles.salaryInput,
              {
                borderColor: error ? colors.semantic.error[600] : colors.border.light,
                color: colors.text.primary,
                backgroundColor: colors.background.secondary,
              },
            ]}
            placeholder="0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={min?.toString() || ''}
            onChangeText={(text) => {
              const value = text ? parseFloat(text) : undefined;
              onMinChange(value && value >= 0 ? value : undefined);
            }}
          />
        </View>

        <View style={styles.salaryInputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Max</Text>
          <TextInput
            style={[
              styles.salaryInput,
              {
                borderColor: error ? colors.semantic.error[600] : colors.border.light,
                color: colors.text.primary,
                backgroundColor: colors.background.secondary,
              },
            ]}
            placeholder="0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={max?.toString() || ''}
            onChangeText={(text) => {
              const value = text ? parseFloat(text) : undefined;
              onMaxChange(value && value >= 0 ? value : undefined);
            }}
          />
        </View>
      </View>

      <View style={styles.currencyRow}>
        <View style={styles.currencyContainer}>
          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Currency</Text>
          <View style={styles.currencyChips}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyChip,
                  {
                    backgroundColor: currency === curr ? colors.primary[600] : colors.background.secondary,
                    borderColor: currency === curr ? colors.primary[600] : colors.border.light,
                  },
                ]}
                onPress={() => onCurrencyChange(curr)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text
                  style={[
                    styles.currencyChipText,
                    { color: currency === curr ? Colors.text.inverse : colors.text.secondary },
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.periodContainer}>
          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Period</Text>
          <View style={styles.periodChips}>
            {PERIODS.map((per) => (
              <TouchableOpacity
                key={per}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: period === per ? colors.primary[600] : colors.background.secondary,
                    borderColor: period === per ? colors.primary[600] : colors.border.light,
                  },
                ]}
                onPress={() => onPeriodChange(per)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    { color: period === per ? Colors.text.inverse : colors.text.secondary },
                  ]}
                >
                  {per}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {error && <Text style={[styles.errorText, { color: colors.semantic.error[600] }]}>{error}</Text>}
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
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  salaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  salaryInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  salaryInput: {
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 10, android: 12 }),
    fontSize: 15,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  currencyRow: {
    gap: Spacing.md,
  },
  currencyContainer: {
    marginBottom: Spacing.sm,
  },
  currencyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  currencyChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  currencyChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  periodContainer: {
    marginBottom: Spacing.sm,
  },
  periodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  periodChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

