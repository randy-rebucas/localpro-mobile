import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface RemoteWorkToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RemoteWorkToggle({ enabled, onToggle }: RemoteWorkToggleProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="wifi-outline"
            size={24}
            color={enabled ? colors.primary[600] : colors.text.tertiary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Remote Work</Text>
          <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
            Show only remote jobs
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.neutral.gray300, true: colors.primary[200] }}
          thumbColor={enabled ? colors.primary[600] : colors.neutral.gray400}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

