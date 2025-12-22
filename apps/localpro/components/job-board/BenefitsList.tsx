import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface BenefitsListProps {
  benefits: string[];
}

export function BenefitsList({ benefits }: BenefitsListProps) {
  const colors = useThemeColors();

  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Benefits & Perks</Text>
      <View style={styles.benefitsList}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
            <Text style={[styles.benefitText, { color: colors.text.secondary }]}>{benefit}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

