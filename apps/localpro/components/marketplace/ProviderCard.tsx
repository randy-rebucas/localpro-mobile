import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ProviderCardProps {
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  location?: string;
}

export function ProviderCard({
  providerId,
  providerName,
  providerAvatar,
  rating,
  reviewCount,
  verified = false,
  location,
}: ProviderCardProps) {
  const colors = useThemeColors();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(stack)/provider/${providerId}` as any);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.content}>
        <View style={styles.avatarContainer}>
          {providerAvatar ? (
            <Image source={{ uri: providerAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="person" size={32} color={colors.primary[600]} />
            </View>
          )}
          {verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.secondary[600]} />
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{providerName}</Text>
            {verified && (
              <Ionicons name="shield-checkmark" size={16} color={colors.secondary[600]} />
            )}
          </View>
          
          {rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.semantic.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              {reviewCount !== undefined && reviewCount > 0 && (
                <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
              )}
            </View>
          )}
          
          {location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

