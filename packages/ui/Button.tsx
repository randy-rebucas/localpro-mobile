import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

// Theme colors - matching logo brand colors
const themeColors = {
  primary: '#2563EB',      // Medium-dark blue from logo
  secondary: '#16A34A',    // Fresh green from logo
  white: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return themeColors.white;
      case 'outline':
        return themeColors.primary;
      case 'ghost':
        return themeColors.primary;
      default:
        return themeColors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: themeColors.primary,
  },
  secondary: {
    backgroundColor: themeColors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: themeColors.white,
  },
  secondaryText: {
    color: themeColors.white,
  },
  outlineText: {
    color: themeColors.primary,
  },
  ghostText: {
    color: themeColors.primary,
  },
});

