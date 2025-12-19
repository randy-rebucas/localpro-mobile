# Theme Usage Guide

This theme system is based on the brand logo colors:
- **Blue** (#2563EB) - Primary color from the location pin
- **Green** (#16A34A) - Secondary/accent color from the house and handshake
- **White** (#FFFFFF) - For contrast and backgrounds
- **Beige** (#F5F5F0) - Background color from the logo

## Basic Usage

### Import the theme

```typescript
import { Theme, Colors, Typography, Spacing, StylePresets } from '../constants/theme';
// or
import { useTheme, useThemeColors, useStylePresets } from '../hooks/use-theme';
```

### Using Colors

```typescript
import { Colors } from '../constants/theme';

// Primary colors (Blue)
const primaryBlue = Colors.primary[600]; // #2563EB - Main brand blue
const lightBlue = Colors.primary[100];   // Light blue for backgrounds

// Secondary colors (Green)
const primaryGreen = Colors.secondary[600]; // #16A34A - Main brand green
const lightGreen = Colors.secondary[100];   // Light green for backgrounds

// Neutral colors
const white = Colors.neutral.white;
const beige = Colors.neutral.beige;        // Background color
const gray = Colors.neutral.gray600;       // Text color

// Semantic colors
const success = Colors.semantic.success;   // Green
const error = Colors.semantic.error;       // Red
const warning = Colors.semantic.warning;   // Amber
const info = Colors.semantic.info;         // Blue
```

### Using Style Presets

```typescript
import { StylePresets } from '../constants/theme';
import { View, Text } from 'react-native';

// Container
<View style={StylePresets.container}>
  {/* Beige background */}
</View>

<View style={StylePresets.containerWhite}>
  {/* White background */}
</View>

// Cards
<View style={StylePresets.card}>
  {/* Card with shadow */}
</View>

<View style={StylePresets.cardFlat}>
  {/* Card without shadow */}
</View>

// Text
<Text style={StylePresets.textHeading1}>Large Heading</Text>
<Text style={StylePresets.textHeading2}>Medium Heading</Text>
<Text style={StylePresets.textBody}>Body text</Text>
<Text style={StylePresets.textSmall}>Small text</Text>
<Text style={StylePresets.textLink}>Link text</Text>
```

### Using with Hooks

```typescript
import { useTheme, useThemeColors, useStylePresets } from '../hooks/use-theme';

function MyComponent() {
  const theme = useTheme();
  const colors = useThemeColors();
  const presets = useStylePresets();

  return (
    <View style={[presets.container, { backgroundColor: colors.background.secondary }]}>
      <Text style={[presets.textHeading1, { color: colors.primary[600] }]}>
        Hello World
      </Text>
    </View>
  );
}
```

### Custom Styles with Theme Values

```typescript
import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const styles = StyleSheet.create({
  customButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  customText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
```

## Color Palette Reference

### Primary (Blue)
- `primary[50]` - #EFF6FF (Very light)
- `primary[100]` - #DBEAFE (Light)
- `primary[200]` - #BFDBFE (Lighter)
- `primary[300]` - #93C5FD (Light medium)
- `primary[400]` - #60A5FA (Medium)
- `primary[500]` - #3B82F6 (Base)
- `primary[600]` - #2563EB ⭐ **Main brand color**
- `primary[700]` - #1D4ED8 (Dark)
- `primary[800]` - #1E40AF (Darker)
- `primary[900]` - #1E3A8A (Very dark)

### Secondary (Green)
- `secondary[50]` - #F0FDF4 (Very light)
- `secondary[100]` - #DCFCE7 (Light)
- `secondary[200]` - #BBF7D0 (Lighter)
- `secondary[300]` - #86EFAC (Light medium)
- `secondary[400]` - #4ADE80 (Medium)
- `secondary[500]` - #22C55E (Base)
- `secondary[600]` - #16A34A ⭐ **Main brand color**
- `secondary[700]` - #15803D (Dark)
- `secondary[800]` - #166534 (Darker)
- `secondary[900]` - #14532D (Very dark)

## Best Practices

1. **Use style presets** when possible for consistency
2. **Use theme colors** instead of hardcoded hex values
3. **Use spacing constants** for consistent padding/margins
4. **Use typography constants** for consistent text sizing
5. **Use border radius constants** for consistent rounded corners

## Migration from Hardcoded Colors

Replace hardcoded colors with theme colors:

```typescript
// Before
backgroundColor: '#007AFF'
color: '#666'

// After
backgroundColor: Colors.primary[600]
color: Colors.text.secondary
```

