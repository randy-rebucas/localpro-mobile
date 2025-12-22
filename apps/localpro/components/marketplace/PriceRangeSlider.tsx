import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  initialMin?: number;
  initialMax?: number;
  onPriceChange: (min: number, max: number) => void;
}

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  initialMin,
  initialMax,
  onPriceChange,
}: PriceRangeSliderProps) {
  const colors = useThemeColors();
  const [min] = useState(initialMin ?? minPrice);
  const [max] = useState(initialMax ?? maxPrice);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(0)}`;
  };

  // Reserved for future use - direct slider handlers
  // const handleMinChange = (value: number) => {
  //   const newMin = Math.min(value, max - 1);
  //   setMin(newMin);
  //   onPriceChange(newMin, max);
  // };

  // const handleMaxChange = (value: number) => {
  //   const newMax = Math.max(value, min + 1);
  //   setMax(newMax);
  //   onPriceChange(min, newMax);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Price Range</Text>
        <Text style={[styles.rangeText, { color: colors.primary[600] }]}>
          {formatCurrency(min)} - {formatCurrency(max)}
        </Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <View
            style={[
              styles.activeTrack,
              {
                left: `${((min - minPrice) / (maxPrice - minPrice)) * 100}%`,
                width: `${((max - min) / (maxPrice - minPrice)) * 100}%`,
                backgroundColor: colors.primary[600],
              },
            ]}
          />
        </View>
        
        {/* Min thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${((min - minPrice) / (maxPrice - minPrice)) * 100}%`,
              backgroundColor: colors.primary[600],
            },
          ]}
        />
        
        {/* Max thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${((max - minPrice) / (maxPrice - minPrice)) * 100}%`,
              backgroundColor: colors.primary[600],
            },
          ]}
        />
      </View>
      
      <View style={styles.labels}>
        <Text style={styles.minLabel}>{formatCurrency(minPrice)}</Text>
        <Text style={styles.maxLabel}>{formatCurrency(maxPrice)}</Text>
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
    fontWeight: '600',
    color: Colors.text.primary,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  track: {
    height: 4,
    backgroundColor: Colors.neutral.gray200,
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
    color: Colors.text.tertiary,
  },
  maxLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

