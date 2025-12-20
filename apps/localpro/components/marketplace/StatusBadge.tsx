import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const colors = useThemeColors();

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: colors.semantic.warning,
          icon: 'time-outline' as const,
          label: 'Pending',
        };
      case 'confirmed':
        return {
          color: colors.primary[600],
          icon: 'checkmark-circle-outline' as const,
          label: 'Confirmed',
        };
      case 'in-progress':
        return {
          color: colors.secondary[600],
          icon: 'play-circle-outline' as const,
          label: 'In Progress',
        };
      case 'completed':
        return {
          color: colors.secondary[600],
          icon: 'checkmark-done-outline' as const,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          color: colors.semantic.error,
          icon: 'close-circle-outline' as const,
          label: 'Cancelled',
        };
      default:
        return {
          color: colors.text.secondary,
          icon: 'help-circle-outline' as const,
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 16;
  const fontSize = size === 'small' ? 10 : size === 'large' ? 14 : 12;
  const padding = size === 'small' ? 2 : size === 'large' ? 6 : 4;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${config.color}15`,
          paddingVertical: padding,
          paddingHorizontal: Spacing.sm,
        },
      ]}
    >
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize,
            marginLeft: Spacing.xs,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

