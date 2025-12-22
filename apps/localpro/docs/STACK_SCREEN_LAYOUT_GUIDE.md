# Stack Screen Layout Guide

## Overview
This document provides detailed specifications for implementing **Header Actions** and **Action Buttons** in stack screens. These patterns are based on the job detail screen implementation and should be used as a reference for creating consistent layouts across all stack screens.

---

## 1. Header Actions

### Purpose
Header Actions provide quick access to navigation and utility functions at the top of a detail screen. They float above the content and remain accessible while scrolling.

### Location
- Positioned at the top of the `ScrollView` content
- First element inside the scrollable content area
- Uses transparent background to overlay content

### Structure

```tsx
<View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
  {/* Left: Back Button */}
  <TouchableOpacity
    style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
    onPress={() => router.back()}
    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
  >
    <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
  </TouchableOpacity>

  {/* Right: Action Buttons Group */}
  <View style={styles.headerRight}>
    {/* Share Button */}
    <TouchableOpacity
      style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
      onPress={handleShare}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      <Ionicons name="share-outline" size={26} color={colors.text.primary} />
    </TouchableOpacity>

    {/* Save/Bookmark Button */}
    <TouchableOpacity
      style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
      onPress={handleSaveJob}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      <Ionicons
        name={isSaved ? 'bookmark' : 'bookmark-outline'}
        size={26}
        color={isSaved ? colors.primary[600] : colors.text.secondary}
      />
    </TouchableOpacity>

    {/* Report Button */}
    <TouchableOpacity
      style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
      onPress={handleReportJob}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      <Ionicons name="flag-outline" size={26} color={colors.semantic.error[600]} />
    </TouchableOpacity>
  </View>
</View>
```

### Styling Specifications

#### Container (`headerActions`)
```typescript
headerActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: Spacing.lg,        // 24px
  paddingVertical: Spacing.md,           // 16px
  paddingTop: Platform.select({
    ios: Spacing.lg,                      // 24px iOS
    android: Spacing.xl                   // 32px Android
  }),
  backgroundColor: 'transparent',        // Overlay on content
  ...Shadows.md,                         // Medium shadow for depth
  ...Platform.select({
    android: {
      elevation: Shadows.md.elevation,   // 3 on Android
    },
  }),
}
```

#### Individual Button (`headerButton`)
```typescript
headerButton: {
  width: Platform.select({
    ios: 48,
    android: 48
  }),
  height: Platform.select({
    ios: 48,
    android: 48
  }),
  borderRadius: Platform.select({
    ios: 24,                              // Full circle (48/2)
    android: 24
  }),
  backgroundColor: colors.background.primary,  // White background
  justifyContent: 'center',
  alignItems: 'center',
  ...Shadows.lg,                         // Large shadow for prominence
  ...Platform.select({
    android: {
      elevation: Shadows.lg.elevation,   // 5 on Android
    },
  }),
}
```

#### Right Actions Container (`headerRight`)
```typescript
headerRight: {
  flexDirection: 'row',
  gap: Spacing.sm,                       // 8px between buttons
}
```

### Design Principles

1. **Circular Buttons**: All header action buttons are circular (48x48px) for a modern, touch-friendly design
2. **White Background**: Buttons use `colors.background.primary` (white) to stand out against content
3. **Shadow Depth**: Large shadows (`Shadows.lg`) create visual separation from background
4. **Icon Size**: 26px icons provide good visibility and touch targets
5. **State Indicators**: 
   - Saved state: Filled icon (`bookmark`) with primary color
   - Unsaved state: Outline icon (`bookmark-outline`) with secondary text color
   - Error actions: Use semantic error color (red) for destructive actions
6. **Platform Differences**:
   - iOS: Slightly less padding top (24px vs 32px)
   - Android: More padding top to account for status bar
   - Active opacity: iOS 0.7, Android 0.8

### Icon Guidelines

| Action | Icon Name | Color | Notes |
|--------|-----------|-------|-------|
| Back | `arrow-back` | `colors.text.primary` | Always on left |
| Share | `share-outline` | `colors.text.primary` | Standard action |
| Save | `bookmark-outline` / `bookmark` | `colors.text.secondary` / `colors.primary[600]` | Toggles based on state |
| Report | `flag-outline` | `colors.semantic.error[600]` | Destructive action |

### Customization Options

- **Add/Remove Actions**: Modify the `headerRight` container to include/exclude buttons
- **Icon Variants**: Use filled icons for active states, outline for inactive
- **Color Variations**: Use semantic colors for different action types:
  - Primary: Standard actions
  - Secondary: Alternative actions
  - Error: Destructive/reporting actions
  - Success: Confirmation actions

---

## 2. Action Buttons (Bottom Action Bar)

### Purpose
Action Buttons provide the primary call-to-action at the bottom of detail screens. They remain fixed at the bottom while content scrolls above.

### Location
- Fixed at the bottom of the screen
- Outside the `ScrollView` but inside `SafeAreaView`
- Positioned after all scrollable content

### Structure

```tsx
{/* Action Buttons */}
<View style={[styles.actionBar, { 
  backgroundColor: 'transparent', 
  borderTopColor: colors.border.light 
}]}>
  {isJobOwner ? (
    // Owner-specific action
    <TouchableOpacity
      style={[styles.applyButton, { backgroundColor: colors.secondary[600] }]}
      onPress={() => router.push(`/(stack)/job/${job.id}/applications`)}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      <Text style={styles.applyButtonText}>View Applicants</Text>
    </TouchableOpacity>
  ) : (
    // User action with state variations
    <TouchableOpacity
      style={[
        styles.applyButton,
        { 
          backgroundColor: isJobClosed 
            ? colors.neutral.gray400 
            : colors.primary[600] 
        },
        isJobClosed && styles.applyButtonDisabled,
        existingApplication && { backgroundColor: colors.secondary[600] },
      ]}
      onPress={existingApplication 
        ? () => router.push(`/(stack)/application/${existingApplication.id}`)
        : handleApply
      }
      disabled={isJobClosed || applying}
      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
    >
      {applying ? (
        <ActivityIndicator size="small" color={Colors.text.inverse} />
      ) : (
        <Text style={styles.applyButtonText}>
          {existingApplication
            ? 'View Application'
            : isJobClosed
              ? 'Job Unavailable'
              : 'Apply Now'}
        </Text>
      )}
    </TouchableOpacity>
  )}
</View>
```

### Styling Specifications

#### Container (`actionBar`)
```typescript
actionBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: Spacing.lg,                   // 24px all sides
  paddingBottom: Platform.select({
    ios: Spacing.lg,                     // 24px iOS
    android: Spacing.lg + 4              // 28px Android (extra for navigation bar)
  }),
  backgroundColor: 'transparent',         // Overlay on content
  borderTopWidth: Platform.select({
    ios: 1,
    android: 1.5
  }),
  borderTopColor: colors.border.light,   // Subtle separation
  ...Shadows.md,                         // Medium shadow for elevation
  ...Platform.select({
    android: {
      elevation: Shadows.md.elevation,   // 3 on Android
    },
  }),
}
```

#### Primary Button (`applyButton`)
```typescript
applyButton: {
  flex: 1,                               // Takes full width
  height: Platform.select({
    ios: 48,
    android: 50
  }),
  borderRadius: BorderRadius.full,       // Fully rounded (9999)
  justifyContent: 'center',
  alignItems: 'center',
  ...Platform.select({
    android: {
      elevation: 2,                      // Subtle elevation
    },
  }),
}
```

#### Button Text (`applyButtonText`)
```typescript
applyButtonText: {
  fontSize: Platform.select({
    ios: 16,
    android: 15
  }),
  fontWeight: Typography.fontWeight.semibold,  // 600
  color: Colors.text.inverse,            // White text
  fontFamily: Typography.fontFamily?.semibold || 'System',
  ...Platform.select({
    android: {
      letterSpacing: 0.3,                // Better readability on Android
    },
  }),
}
```

#### Disabled State (`applyButtonDisabled`)
```typescript
applyButtonDisabled: {
  opacity: 0.6,                          // Reduced visibility
}
```

### Design Principles

1. **Full Width**: Primary action button uses `flex: 1` to span the entire width
2. **Rounded Corners**: Fully rounded (`BorderRadius.full`) for modern appearance
3. **Height**: 
   - iOS: 48px (standard touch target)
   - Android: 50px (slightly larger for better touch)
4. **Color States**:
   - **Primary** (`colors.primary[600]`): Default active state (blue)
   - **Secondary** (`colors.secondary[600]`): Alternative action (green)
   - **Disabled** (`colors.neutral.gray400`): Inactive/unavailable state
5. **Loading State**: Shows `ActivityIndicator` when processing
6. **Border Top**: Subtle 1px border separates from content
7. **Shadow**: Medium shadow provides elevation without being too prominent

### State Variations

| State | Background Color | Text | Disabled | Notes |
|-------|-----------------|------|----------|-------|
| Default | `colors.primary[600]` | "Apply Now" | No | Standard primary action |
| Loading | `colors.primary[600]` | `<ActivityIndicator>` | Yes | Shows spinner |
| Applied | `colors.secondary[600]` | "View Application" | No | Navigate to application |
| Unavailable | `colors.neutral.gray400` | "Job Unavailable" | Yes | Opacity 0.6 |
| Owner View | `colors.secondary[600]` | "View Applicants" | No | Different action for owner |

### Button Text Guidelines

- **Action-Oriented**: Use verbs (Apply, View, Save, etc.)
- **Clear State**: Text should reflect current state (e.g., "View Application" vs "Apply Now")
- **Concise**: Keep text short (1-3 words)
- **Semibold Weight**: 600 weight for emphasis
- **White Text**: Always use `Colors.text.inverse` for contrast

### Platform Considerations

1. **iOS**:
   - Height: 48px
   - Border width: 1px
   - Padding bottom: 24px
   - No letter spacing

2. **Android**:
   - Height: 50px
   - Border width: 1.5px
   - Padding bottom: 28px (extra for navigation bar)
   - Letter spacing: 0.3 for readability

---

## 3. Complete Layout Structure

### Screen Container
```tsx
import { WavyBackground } from '../../../components/WavyBackground';

<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  {/* Optional: Background decoration */}
  <WavyBackground />
  
  {/* Scrollable Content */}
  <ScrollView
    style={styles.scrollView}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {/* Header Actions - First element */}
    <View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
      {/* ... header actions ... */}
    </View>

    {/* Main Content */}
    <View style={styles.content}>
      {/* ... content cards and sections ... */}
    </View>
  </ScrollView>

  {/* Action Buttons - Fixed at bottom */}
  <View style={[styles.actionBar, { 
    backgroundColor: 'transparent', 
    borderTopColor: colors.border.light 
  }]}>
    {/* ... action buttons ... */}
  </View>
</SafeAreaView>
```

### Key Layout Points

1. **SafeAreaView**: Wraps entire screen with top/bottom safe area insets
2. **WavyBackground** (Optional): Decorative background component, positioned absolutely behind content
3. **ScrollView**: Contains all scrollable content
4. **Header Actions**: First element in ScrollView, transparent background
5. **Content**: Main content area with padding
6. **Action Bar**: Outside ScrollView, fixed at bottom

---

## 4. Spacing and Padding Reference

### Header Actions
- **Horizontal Padding**: `Spacing.lg` (24px)
- **Vertical Padding**: `Spacing.md` (16px)
- **Top Padding**: 
  - iOS: `Spacing.lg` (24px)
  - Android: `Spacing.xl` (32px)
- **Button Gap**: `Spacing.sm` (8px)

### Action Bar
- **Padding**: `Spacing.lg` (24px) all sides
- **Bottom Padding**:
  - iOS: `Spacing.lg` (24px)
  - Android: `Spacing.lg + 4` (28px)
- **Border Width**:
  - iOS: 1px
  - Android: 1.5px

### Content Area
- **Padding**: `Spacing.lg` (24px)
- **Top Padding**: `Spacing.md` (16px) or adjusted for header overlap

---

## 5. Theme Integration

### Color Usage

```typescript
// From useThemeColors hook
const colors = useThemeColors();

// Header Actions
backgroundColor: colors.background.primary      // White buttons
iconColor: colors.text.primary                   // Dark icons
savedColor: colors.primary[600]                  // Blue when saved
errorColor: colors.semantic.error[600]          // Red for report

// Action Buttons
primaryBackground: colors.primary[600]          // Blue primary
secondaryBackground: colors.secondary[600]       // Green secondary
disabledBackground: colors.neutral.gray400      // Gray disabled
borderColor: colors.border.light                 // Light border
textColor: Colors.text.inverse                   // White text
```

### Shadow Usage

- **Header Actions Container**: `Shadows.md` (elevation 3)
- **Header Action Buttons**: `Shadows.lg` (elevation 5)
- **Action Bar**: `Shadows.md` (elevation 3)
- **Action Button**: `elevation: 2` (Android only)

---

## 6. Implementation Checklist

When creating a new stack screen, ensure:

- [ ] Header Actions container uses `headerActions` style
- [ ] Back button on left with `arrow-back` icon
- [ ] Action buttons grouped in `headerRight` container
- [ ] All header buttons are 48x48px circular
- [ ] Icons are 26px size
- [ ] Action Bar uses `actionBar` style
- [ ] Primary button uses `applyButton` style
- [ ] Button text uses `applyButtonText` style
- [ ] Platform-specific padding applied
- [ ] Shadows applied correctly
- [ ] State variations handled (loading, disabled, etc.)
- [ ] Colors from theme hook used
- [ ] SafeAreaView wraps entire screen
- [ ] WavyBackground component imported and used (optional)
- [ ] ScrollView contains header actions and content
- [ ] Action bar is outside ScrollView

---

## 7. Example Variations

### Minimal Header (Back Only)
```tsx
<View style={[styles.headerActions, { backgroundColor: 'transparent' }]}>
  <TouchableOpacity
    style={[styles.headerButton, { backgroundColor: colors.background.primary }]}
    onPress={() => router.back()}
  >
    <Ionicons name="arrow-back" size={26} color={colors.text.primary} />
  </TouchableOpacity>
</View>
```

### Multiple Action Buttons
```tsx
<View style={[styles.actionBar, { 
  backgroundColor: 'transparent', 
  borderTopColor: colors.border.light 
}]}>
  <TouchableOpacity
    style={[styles.secondaryButton, { 
      flex: 1,
      backgroundColor: colors.background.primary,
      borderColor: colors.primary[600]
    }]}
  >
    <Text style={[styles.secondaryButtonText, { color: colors.primary[600] }]}>
      Save Draft
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.applyButton, { backgroundColor: colors.primary[600] }]}
  >
    <Text style={styles.applyButtonText}>Submit</Text>
  </TouchableOpacity>
</View>
```

---

## 8. Accessibility Considerations

1. **Touch Targets**: All buttons meet minimum 44x44px touch target
2. **Color Contrast**: White text on colored backgrounds meets WCAG AA
3. **State Feedback**: Visual and haptic feedback on press
4. **Loading States**: ActivityIndicator provides visual feedback
5. **Disabled States**: Reduced opacity clearly indicates unavailable actions

---

## 9. Common Patterns

### Pattern 1: Detail Screen with Save
- Header: Back, Share, Save, More
- Action: Primary action button

### Pattern 2: Edit Screen
- Header: Back, Save
- Action: Save/Cancel buttons

### Pattern 3: View-Only Screen
- Header: Back, Share
- Action: Secondary action (if any)

### Pattern 4: Owner/Admin Screen
- Header: Back, Edit, More
- Action: Owner-specific action

---

## 10. Troubleshooting

### Issue: Header Actions Not Visible
- **Solution**: Ensure `backgroundColor: 'transparent'` and proper z-index
- **Check**: Shadows applied correctly

### Issue: Action Bar Overlaps Content
- **Solution**: Add `paddingBottom` to `ScrollView` `contentContainerStyle`
- **Value**: `Platform.select({ ios: Spacing['3xl'], android: Spacing['3xl'] + 8 })`

### Issue: Buttons Not Aligned
- **Solution**: Verify `justifyContent` and `alignItems` in containers
- **Check**: Platform-specific padding values

### Issue: Shadows Not Showing on Android
- **Solution**: Ensure `elevation` property is set in Platform.select
- **Check**: Background color is not transparent where shadow should appear

---

## 11. WavyBackground Component

### Overview
The `WavyBackground` component provides an optional decorative background pattern for stack screens. It creates a subtle, animated wave effect using theme colors.

### Location
- **Component File**: `apps/localpro/components/WavyBackground.tsx`
- **Global Component**: Reusable across all screens

### Usage

```tsx
import { WavyBackground } from '../../../components/WavyBackground';

// In your component render:
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  <WavyBackground />
  {/* Rest of your content */}
</SafeAreaView>
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `colors` | `ReturnType<typeof useThemeColors>` | No | `useThemeColors()` | Optional custom colors object. If not provided, uses theme colors from `useThemeColors` hook. |

### Implementation Details

- **Position**: Absolute positioning, covers entire screen (`top: 0, left: 0, right: 0, bottom: 0`)
- **Z-Index**: `0` (behind content)
- **Pointer Events**: `none` (doesn't interfere with touch interactions)
- **Colors Used**:
  - Primary colors: `colors.primary[100]`, `colors.primary[200]`, `colors.primary[300]`
  - Secondary colors: `colors.secondary[100]`, `colors.secondary[200]`, `colors.secondary[300]`
- **Platform Differences**: Border radius values differ slightly between iOS and Android

### Customization

If you need custom colors, pass them as a prop:

```tsx
const customColors = {
  primary: { 100: '#custom1', 200: '#custom2', 300: '#custom3' },
  secondary: { 100: '#custom4', 200: '#custom5', 300: '#custom6' }
};

<WavyBackground colors={customColors} />
```

### When to Use

- **Optional**: Not required for all screens
- **Visual Enhancement**: Adds visual interest to detail screens
- **Consistent Branding**: Uses theme colors automatically
- **Performance**: Lightweight, doesn't impact scroll performance

---

## 12. Modal Styling with Opacity

### Overview
Modals in stack screens should use consistent opacity styling for backdrop overlays and content containers. This section covers the two main modal patterns used in the application.

### Modal Types

#### Type 1: Full-Screen Modal (PageSheet)
Used for full-screen forms and content that require the entire screen space.

**Structure:**
```tsx
<Modal
  visible={showModal}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setShowModal(false)}
>
  <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
    {/* Modal content */}
  </SafeAreaView>
</Modal>
```

**Styling:**
```typescript
modalContainer: {
  flex: 1,
  backgroundColor: Colors.background.secondary,
}
```

**Characteristics:**
- No backdrop overlay (full-screen on iOS)
- Uses `presentationStyle="pageSheet"` (iOS-specific)
- Solid background color
- No opacity needed for container

#### Type 2: Transparent Modal with Backdrop
Used for bottom sheets, date pickers, and overlay dialogs.

**Structure:**
```tsx
<Modal
  visible={showModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
      {/* Modal content */}
    </View>
  </View>
</Modal>
```

**Styling:**
```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 50% opacity black backdrop
  justifyContent: 'flex-end',              // For bottom sheets
  // or 'center' for centered modals
},
modalContent: {
  borderTopLeftRadius: BorderRadius.lg,
  borderTopRightRadius: BorderRadius.lg,
  maxHeight: '80%',                        // For bottom sheets
  paddingBottom: Spacing.xl,
  backgroundColor: Colors.background.primary,
}
```

### Opacity Specifications

#### Backdrop Overlay Opacity
- **Standard Backdrop**: `rgba(0, 0, 0, 0.5)` - 50% opacity black
  - Provides good contrast while keeping background visible
  - Standard for most overlay modals
- **Light Backdrop**: `rgba(0, 0, 0, 0.3)` - 30% opacity black
  - For less intrusive overlays
- **Dark Backdrop**: `rgba(0, 0, 0, 0.7)` - 70% opacity black
  - For critical actions requiring focus

#### Content Card Opacity
Cards within modals can use semi-transparent backgrounds to blend with the backdrop:

```typescript
modalCard: {
  backgroundColor: Platform.select({
    ios: 'rgba(255, 255, 255, 0.7)',      // 70% opacity white (iOS)
    android: 'rgba(255, 255, 255, 0.75)', // 75% opacity white (Android)
  }),
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
  ...Shadows.md,
}
```

**Platform Differences:**
- **iOS**: `rgba(255, 255, 255, 0.7)` - 70% opacity
- **Android**: `rgba(255, 255, 255, 0.75)` - 75% opacity (slightly more opaque for better visibility)

### Modal Header Styling

For modals with headers:

```typescript
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: Spacing.lg,
  borderBottomWidth: Platform.select({ ios: 1, android: 1.5 }),
  borderBottomColor: Colors.border.light,
},
modalTitle: {
  fontSize: Platform.select({ ios: 20, android: 19 }),
  fontWeight: Typography.fontWeight.bold,
  color: Colors.text.primary,
  fontFamily: Typography.fontFamily?.bold || 'System',
},
modalCloseButton: {
  width: 32,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
},
```

### Bottom Sheet Pattern

For bottom sheet modals (common for date pickers, filters, etc.):

```tsx
<Modal
  visible={showModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowModal(false)}
>
  <View style={styles.modalOverlay}>
    <TouchableOpacity
      style={StyleSheet.absoluteFill}
      activeOpacity={1}
      onPress={() => setShowModal(false)}
    />
    <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
      {/* Content */}
    </View>
  </View>
</Modal>
```

**Key Points:**
- `justifyContent: 'flex-end'` in `modalOverlay` positions content at bottom
- `maxHeight: '80%'` prevents content from taking full screen
- Rounded top corners (`borderTopLeftRadius`, `borderTopRightRadius`)
- Dismissible by tapping backdrop (optional)

### Centered Modal Pattern

For centered dialog modals:

```tsx
<Modal
  visible={showModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
      {/* Content */}
    </View>
  </View>
</Modal>
```

**Styling:**
```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',              // Center content
  alignItems: 'center',
  padding: Spacing.lg,
},
modalContent: {
  borderRadius: BorderRadius.lg,
  width: '100%',
  maxWidth: 400,                         // Limit width on larger screens
  padding: Spacing.lg,
  backgroundColor: Colors.background.primary,
  ...Shadows.lg,
}
```

### Disabled State Opacity

For disabled buttons or elements within modals:

```typescript
disabledButton: {
  opacity: 0.6,                          // 60% opacity for disabled state
}
```

### Implementation Checklist

When creating a modal, ensure:

- [ ] Appropriate modal type selected (full-screen vs transparent)
- [ ] Backdrop opacity set to `rgba(0, 0, 0, 0.5)` for transparent modals
- [ ] Content background uses solid color or appropriate opacity
- [ ] Platform-specific opacity values applied (iOS: 0.7, Android: 0.75 for cards)
- [ ] SafeAreaView used for full-screen modals
- [ ] Proper animation type (`slide` for bottom sheets, `fade` for dialogs)
- [ ] `onRequestClose` handler implemented
- [ ] Disabled states use `opacity: 0.6`

### Common Patterns

| Modal Type | Backdrop | Content Background | Animation | Use Case |
|------------|----------|-------------------|-----------|----------|
| Full-Screen | None | Solid | `slide` | Forms, detail views |
| Bottom Sheet | `rgba(0, 0, 0, 0.5)` | Solid | `slide` | Date pickers, filters |
| Dialog | `rgba(0, 0, 0, 0.5)` | Solid | `fade` | Confirmations, alerts |
| Overlay Card | `rgba(0, 0, 0, 0.5)` | `rgba(255, 255, 255, 0.7/0.75)` | `fade` | Quick actions |

---

## References

- **Source File**: `apps/localpro/app/(stack)/job/[jobId].tsx`
- **WavyBackground Component**: `apps/localpro/components/WavyBackground.tsx`
- **Theme Constants**: `apps/localpro/constants/theme.ts`
- **Related Screens**: 
  - `apps/localpro/app/(stack)/company/[companyId].tsx`
  - `apps/localpro/app/(stack)/application/[applicationId].tsx`
  - `apps/localpro/app/(stack)/service/[serviceId].tsx`

---

**Last Updated**: Based on job detail screen implementation with global WavyBackground component and modal opacity specifications
**Version**: 1.2

