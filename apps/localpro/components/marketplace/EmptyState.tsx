import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export function EmptyState({
  icon = 'search-outline',
  title,
  subtitle,
  loading = false,
}: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={loading ? 'hourglass-outline' : icon}
        size={64}
        color={colors.text.tertiary}
      />
      <Text style={styles.emptyStateText}>
        {loading ? 'Loading services...' : title}
      </Text>
      {subtitle && (
        <Text style={styles.emptyStateSubtext}>
          {loading ? 'Please wait while we fetch services' : subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  emptyStateSubtext: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

