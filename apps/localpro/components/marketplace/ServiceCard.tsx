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
  onProviderPress?: (providerId: string) => void;
}

export function ServiceCard({ service, viewMode, onPress, onProviderPress }: ServiceCardProps) {
  const colors = useThemeColors();

  const handleProviderPress = () => {
    if (onProviderPress && service.providerId) {
      onProviderPress(service.providerId);
    }
  };

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
          {service.rating != null && service.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={colors.semantic.warning} />
              <Text style={styles.ratingText}>
                {typeof service.rating === 'number' ? service.rating.toFixed(1) : String(service.rating)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.serviceCardContent}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {service.title || 'Untitled Service'}
          </Text>
          {onProviderPress && service.providerId ? (
            <TouchableOpacity onPress={handleProviderPress} activeOpacity={0.7}>
              <Text style={[styles.serviceProvider, styles.serviceProviderLink]} numberOfLines={1}>
                {service.providerName || 'Unknown Provider'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.serviceProvider} numberOfLines={1}>
              {service.providerName || 'Unknown Provider'}
            </Text>
          )}
          <Text style={styles.servicePrice}>
            {service.price != null ? formatCurrency(service.price) : 'N/A'}
          </Text>
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
        <View style={styles.serviceImageContainerList}>
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
          {service.rating != null && service.rating > 0 && (
            <View style={styles.ratingBadgeList}>
              <Ionicons name="star" size={10} color={colors.semantic.warning} />
              <Text style={styles.ratingTextSmall}>
                {typeof service.rating === 'number' ? service.rating.toFixed(1) : String(service.rating)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.serviceCardListInfo}>
          <View style={styles.serviceCardListHeader}>
            <View style={styles.serviceCardListTitleRow}>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                {service.title || 'Untitled Service'}
              </Text>
            </View>
            {service.category && (
              <View style={styles.categoryBadgeList}>
                <Ionicons name="pricetag-outline" size={10} color={colors.text.secondary} />
                <Text style={styles.categoryTextList}>{service.category}</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description || 'No description available'}
          </Text>
          <View style={styles.serviceCardListFooter}>
            <View style={styles.serviceCardListFooterLeft}>
              {onProviderPress && service.providerId ? (
                <TouchableOpacity onPress={handleProviderPress} activeOpacity={0.7}>
                  <View style={styles.providerRow}>
                    <Ionicons name="person-outline" size={12} color={colors.primary[600]} />
                    <Text style={[styles.serviceProvider, styles.serviceProviderLink]} numberOfLines={1}>
                      {service.providerName || 'Unknown Provider'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.providerRow}>
                  <Ionicons name="person-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.serviceProvider} numberOfLines={1}>
                    {service.providerName || 'Unknown Provider'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.serviceCardListRight}>
              <Text style={styles.servicePrice}>
                {service.price != null ? formatCurrency(service.price) : 'N/A'}
              </Text>
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
  serviceImageContainerList: {
    width: 120,
    height: 120,
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
    padding: Spacing.md,
    paddingLeft: Spacing.md,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  serviceCardListHeader: {
    marginBottom: Spacing.xs,
  },
  serviceCardListTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  categoryBadgeList: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral.gray100,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
    marginTop: Spacing.xs,
  },
  categoryTextList: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
    flex: 1,
  },
  serviceProvider: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  serviceProviderLink: {
    color: Colors.primary[600],
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginTop: 'auto',
  },
  serviceCardListFooterLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  serviceCardListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingBadgeList: {
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

