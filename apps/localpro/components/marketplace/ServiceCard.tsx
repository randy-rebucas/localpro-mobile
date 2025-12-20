import { Ionicons } from '@expo/vector-icons';
import type { Service } from '@localpro/types';
import { Card } from '@localpro/ui';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
  onPress: (serviceId: string) => void;
}

export function ServiceCard({ service, viewMode, onPress }: ServiceCardProps) {
  const colors = useThemeColors();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={styles.serviceCardGrid}
        onPress={() => onPress(service.id)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceImageContainer}>
          {service.images && service.images.length > 0 ? (
            <Image
              source={{ uri: service.images[0] }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.serviceImagePlaceholder, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="image-outline" size={32} color={colors.primary[400]} />
            </View>
          )}
          {service.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={colors.semantic.warning} />
              <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.serviceCardContent}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {service.title}
          </Text>
          <Text style={styles.serviceProvider} numberOfLines={1}>
            {service.providerName}
          </Text>
          <Text style={styles.servicePrice}>{formatCurrency(service.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.serviceCardList}>
      <TouchableOpacity
        onPress={() => onPress(service.id)}
        activeOpacity={0.7}
        style={styles.serviceCardListContent}
      >
        <View style={styles.serviceImageContainer}>
          {service.images && service.images.length > 0 ? (
            <Image
              source={{ uri: service.images[0] }}
              style={styles.serviceImageList}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.serviceImagePlaceholder, styles.serviceImageList, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="image-outline" size={32} color={colors.primary[400]} />
            </View>
          )}
        </View>
        <View style={styles.serviceCardListInfo}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {service.title}
          </Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
          </Text>
          <View style={styles.serviceCardListFooter}>
            <Text style={styles.serviceProvider}>{service.providerName}</Text>
            <View style={styles.serviceCardListRight}>
              {service.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.semantic.warning} />
                  <Text style={styles.ratingTextSmall}>{service.rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.servicePrice}>{formatCurrency(service.price)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  serviceCardGrid: {
    flex: 1,
    margin: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  serviceCardList: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  serviceCardListContent: {
    flexDirection: 'row',
  },
  serviceImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImageList: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray100,
  },
  serviceCardContent: {
    padding: Spacing.sm,
  },
  serviceCardListInfo: {
    flex: 1,
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  serviceProvider: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  serviceCardListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  serviceCardListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 2,
    ...Shadows.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ratingTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

