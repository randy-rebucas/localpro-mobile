/**
 * Example component demonstrating theme usage
 * This file shows how to use the theme system in your components
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, useThemeColors, useStylePresets } from '../hooks/use-theme';
import { Button } from '@localpro/ui';
import { Card } from '@localpro/ui';

export function ThemeExample() {
  const theme = useTheme();
  const colors = useThemeColors();
  const presets = useStylePresets();

  return (
    <ScrollView style={presets.container} contentContainerStyle={styles.content}>
      <Text style={presets.textHeading1}>Theme Example</Text>
      <Text style={presets.textBody}>
        This component demonstrates how to use the theme system based on your brand logo colors.
      </Text>

      {/* Color Palette Examples */}
      <Card style={styles.section}>
        <Text style={presets.textHeading3}>Primary Colors (Blue)</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.primary[600] }]}>
            <Text style={styles.colorLabel}>Primary 600</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.primary[400] }]}>
            <Text style={styles.colorLabel}>Primary 400</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.primary[200] }]}>
            <Text style={styles.colorLabel}>Primary 200</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={presets.textHeading3}>Secondary Colors (Green)</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.secondary[600] }]}>
            <Text style={styles.colorLabel}>Secondary 600</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.secondary[400] }]}>
            <Text style={styles.colorLabel}>Secondary 400</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: colors.secondary[200] }]}>
            <Text style={styles.colorLabel}>Secondary 200</Text>
          </View>
        </View>
      </Card>

      {/* Typography Examples */}
      <Card style={styles.section}>
        <Text style={presets.textHeading3}>Typography</Text>
        <Text style={presets.textHeading1}>Heading 1</Text>
        <Text style={presets.textHeading2}>Heading 2</Text>
        <Text style={presets.textHeading3}>Heading 3</Text>
        <Text style={presets.textBody}>Body text - Regular</Text>
        <Text style={presets.textBodyMedium}>Body text - Medium</Text>
        <Text style={presets.textBodySemibold}>Body text - Semibold</Text>
        <Text style={presets.textSmall}>Small text</Text>
        <Text style={presets.textLink}>Link text</Text>
      </Card>

      {/* Button Examples */}
      <Card style={styles.section}>
        <Text style={presets.textHeading3}>Buttons</Text>
        <View style={styles.buttonRow}>
          <Button title="Primary" onPress={() => {}} variant="primary" />
          <Button title="Secondary" onPress={() => {}} variant="secondary" />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Outline" onPress={() => {}} variant="outline" />
          <Button title="Ghost" onPress={() => {}} variant="ghost" />
        </View>
      </Card>

      {/* Background Colors */}
      <Card style={styles.section}>
        <Text style={presets.textHeading3}>Backgrounds</Text>
        <View style={[styles.bgSwatch, { backgroundColor: colors.background.primary }]}>
          <Text style={presets.textBody}>Primary (White)</Text>
        </View>
        <View style={[styles.bgSwatch, { backgroundColor: colors.background.secondary }]}>
          <Text style={presets.textBody}>Secondary (Beige)</Text>
        </View>
        <View style={[styles.bgSwatch, { backgroundColor: colors.background.tertiary }]}>
          <Text style={presets.textBody}>Tertiary (Light Gray)</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  colorSwatch: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  bgSwatch: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});

