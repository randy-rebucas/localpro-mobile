/**
 * Theme configuration based on the brand logo
 * Colors derived from: Blue location pin, Green house/handshake, White accents, Beige background
 */

import { Platform, StyleSheet } from 'react-native';

// Primary Colors from Logo
export const Colors = {
  // Blue - Primary (from location pin)
  primary: {
    50: '#EFF6FF',   // Very light blue
    100: '#DBEAFE',  // Light blue
    200: '#BFDBFE',  // Lighter blue
    300: '#93C5FD',  // Light medium blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Base blue
    600: '#2563EB',  // Medium-dark blue (logo primary)
    700: '#1D4ED8',  // Dark blue
    800: '#1E40AF',  // Darker blue
    900: '#1E3A8A',  // Very dark blue
  },
  
  // Green - Secondary/Accent (from house and handshake)
  secondary: {
    50: '#F0FDF4',   // Very light green
    100: '#DCFCE7',  // Light green
    200: '#BBF7D0',  // Lighter green
    300: '#86EFAC',  // Light medium green
    400: '#4ADE80',  // Medium green
    500: '#22C55E',  // Base green
    600: '#16A34A',  // Fresh green (logo secondary)
    700: '#15803D',  // Dark green
    800: '#166534',  // Darker green
    900: '#14532D',  // Very dark green
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    beige: '#F5F5F0',      // Light beige background (from logo)
    beigeLight: '#FAFAF5', // Lighter beige
    beigeDark: '#E8E8E3',  // Darker beige
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
  
  // Semantic Colors
  semantic: {
    success: '#16A34A',    // Using secondary green
    error: '#DC2626',      // Red for errors
    warning: '#F59E0B',    // Amber for warnings
    info: '#2563EB',       // Using primary blue
  },
  
  // Text Colors
  text: {
    primary: '#1F2937',    // Dark gray for primary text
    secondary: '#6B7280',  // Medium gray for secondary text
    tertiary: '#9CA3AF',   // Light gray for tertiary text
    inverse: '#FFFFFF',    // White for text on dark backgrounds
    link: '#2563EB',       // Primary blue for links
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',    // White
    secondary: '#F5F5F0',  // Beige (from logo)
    tertiary: '#F9FAFB',   // Light gray
    inverse: '#1F2937',    // Dark for inverse backgrounds
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',      // Light gray
    medium: '#D1D5DB',     // Medium gray
    dark: '#9CA3AF',       // Dark gray
    primary: '#2563EB',    // Primary blue
    secondary: '#16A34A',  // Secondary green
  },
};

// Typography
export const Typography = {
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semibold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 32,
    '3xl': 40,
    '4xl': 44,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Style Presets
export const StylePresets = StyleSheet.create({
  // Container Presets
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  containerWhite: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  // Card Presets
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  cardFlat: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  
  // Button Presets
  buttonPrimary: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary[600],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  // Text Presets
  textHeading1: {
    fontSize: Typography.fontSize['4xl'],
    lineHeight: Typography.lineHeight['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  textHeading2: {
    fontSize: Typography.fontSize['3xl'],
    lineHeight: Typography.lineHeight['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  textHeading3: {
    fontSize: Typography.fontSize['2xl'],
    lineHeight: Typography.lineHeight['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  textHeading4: {
    fontSize: Typography.fontSize.xl,
    lineHeight: Typography.lineHeight.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  textBody: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.primary,
  },
  textBodyMedium: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  textBodySemibold: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  textSmall: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  textSmallMedium: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  textXSmall: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
  },
  textLink: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.link,
  },
  
  // Input Presets
  input: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: Colors.border.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  
  // Badge Presets
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgePrimary: {
    backgroundColor: Colors.primary[100],
  },
  badgeSecondary: {
    backgroundColor: Colors.secondary[100],
  },
  badgeSuccess: {
    backgroundColor: Colors.secondary[100],
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  
  // Divider Presets
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: Colors.border.light,
  },
});

// Export theme object for easy access
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  presets: StylePresets,
};

export default Theme;

