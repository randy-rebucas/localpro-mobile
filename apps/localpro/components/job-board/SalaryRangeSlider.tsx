import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SalaryRangeSliderProps {
  minSalary: number;
  maxSalary: number;
  initialMin?: number;
  initialMax?: number;
  currency?: string;
  onSalaryChange: (min: number, max: number) => void;
}

export function SalaryRangeSlider({
  minSalary,
  maxSalary,
  initialMin,
  initialMax,
  currency = '$',
  onSalaryChange,
}: SalaryRangeSliderProps) {
  const colors = useThemeColors();
  const [min, setMin] = useState(initialMin ?? minSalary);
  const [max, setMax] = useState(initialMax ?? maxSalary);

  useEffect(() => {
    if (initialMin !== undefined) setMin(initialMin);
    if (initialMax !== undefined) setMax(initialMax);
  }, [initialMin, initialMax]);

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    return `${currency}${formatter.format(amount)}`;
  };

  // Reserved for future use - direct slider handlers
  // const handleMinChange = (value: number) => {
  //   const newMin = Math.min(value, max - 1);
  //   setMin(newMin);
  //   onSalaryChange(newMin, max);
  // };

  // const handleMaxChange = (value: number) => {
  //   const newMax = Math.max(value, min + 1);
  //   setMax(newMax);
  //   onSalaryChange(min, newMax);
  // };

  const minPercentage = ((min - minSalary) / (maxSalary - minSalary)) * 100;
  const maxPercentage = ((max - minSalary) / (maxSalary - minSalary)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Salary Range</Text>
        <Text style={[styles.rangeText, { color: colors.primary[600] }]}>
          {formatCurrency(min)} - {formatCurrency(max)}
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={[styles.track, { backgroundColor: colors.neutral.gray200 }]}>
          <View
            style={[
              styles.activeTrack,
              {
                left: `${minPercentage}%`,
                width: `${maxPercentage - minPercentage}%`,
                backgroundColor: colors.primary[600],
              },
            ]}
          />
        </View>

        {/* Min thumb */}
        <TouchableOpacity
          style={[
            styles.thumb,
            {
              left: `${minPercentage}%`,
              backgroundColor: colors.primary[600],
            },
          ]}
          onPress={() => {}}
          activeOpacity={1}
        />

        {/* Max thumb */}
        <TouchableOpacity
          style={[
            styles.thumb,
            {
              left: `${maxPercentage}%`,
              backgroundColor: colors.primary[600],
            },
          ]}
          onPress={() => {}}
          activeOpacity={1}
        />
      </View>

      <View style={styles.labels}>
        <Text style={[styles.minLabel, { color: colors.text.tertiary }]}>
          {formatCurrency(minSalary)}
        </Text>
        <Text style={[styles.maxLabel, { color: colors.text.tertiary }]}>
          {formatCurrency(maxSalary)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  rangeText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    marginLeft: -10,
    ...Shadows.md,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  maxLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

