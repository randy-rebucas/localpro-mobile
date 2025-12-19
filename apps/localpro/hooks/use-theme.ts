/**
 * Hook for accessing theme values
 * Provides easy access to colors, typography, spacing, and style presets
 */

import { Theme } from '../constants/theme';

export function useTheme() {
  return Theme;
}

/**
 * Hook for accessing theme colors
 */
export function useThemeColors() {
  return Theme.colors;
}

/**
 * Hook for accessing style presets
 */
export function useStylePresets() {
  return Theme.presets;
}

