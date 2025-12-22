import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CompanyHeaderProps {
  name: string;
  logo?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
}

const toTitleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatLocation = (location?: CompanyHeaderProps['location']): string => {
  if (!location) return 'Location not specified';
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : location.address || 'Location not specified';
};

export function CompanyHeader({
  name,
  logo,
  description,
  industry,
  size,
  website,
  location,
  contactEmail,
  contactPhone,
}: CompanyHeaderProps) {
  const colors = useThemeColors();

  const handleWebsitePress = async () => {
    if (!website) return;
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('Error opening website:', err);
    }
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email' && contactEmail) {
      Linking.openURL(`mailto:${contactEmail}`);
    } else if (type === 'phone' && contactPhone) {
      Linking.openURL(`tel:${contactPhone}`);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary[100] }]}>
            <Ionicons name="business" size={40} color={colors.primary[600]} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {industry && (
            <Text style={[styles.industry, { color: colors.text.secondary }]}>{industry}</Text>
          )}
          {size && (
            <Text style={[styles.size, { color: colors.text.tertiary }]}>
              {toTitleCase(size)} company
            </Text>
          )}
        </View>
      </View>

      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>
        </View>
      )}

      {location && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
          <Text style={[styles.locationText, { color: colors.text.secondary }]}>
            {formatLocation(location)}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {website && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.primary[200] }]}
            onPress={handleWebsitePress}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="globe-outline" size={16} color={colors.primary[600]} />
            <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>Website</Text>
          </TouchableOpacity>
        )}
        {contactEmail && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border.light }]}
            onPress={() => handleContact('email')}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>Email</Text>
          </TouchableOpacity>
        )}
        {contactPhone && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border.light }]}
            onPress={() => handleContact('phone')}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 32,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  industry: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  size: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  descriptionContainer: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    backgroundColor: Colors.background.secondary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

