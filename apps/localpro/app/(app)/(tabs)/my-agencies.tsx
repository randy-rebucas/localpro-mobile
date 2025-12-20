import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Agency {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  verified: boolean;
  rating?: number;
  memberCount: number;
}

interface UserAgency {
  agency: Agency;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export default function MyAgenciesTabScreen() {
  const colors = useThemeColors();

  // Mock user agencies data - replace with actual API call
  const userAgencies: UserAgency[] = [];

  const getRoleBadgeColor = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return colors.primary[600];
      case 'admin':
        return colors.secondary[600];
      case 'member':
        return colors.neutral.gray500;
      default:
        return colors.neutral.gray500;
    }
  };

  const getRoleLabel = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  };

  const handleAgencyPress = (agencyId: string) => {
    // TODO: Navigate to agency detail/management screen
    // router.push(`/(app)/agency/${agencyId}`);
    console.log('View agency:', agencyId);
  };

  const handleCreateAgency = () => {
    // TODO: Navigate to create agency screen
    // router.push('/(app)/create-agency');
    console.log('Create agency');
  };

  const handleJoinAgency = () => {
    router.push('/(app)/(tabs)/browse-agencies');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Agencies</Text>
            <Text style={styles.subtitle}>Manage your agency memberships</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleCreateAgency}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Create Agency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.primary[600] }]}
              onPress={handleJoinAgency}
            >
              <Ionicons name="search-outline" size={20} color={colors.primary[600]} />
              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>Join Agency</Text>
            </TouchableOpacity>
          </View>

          {/* Agencies List */}
          {userAgencies.length > 0 ? (
            <View style={styles.agenciesList}>
              {userAgencies.map((userAgency) => {
                const { agency, role } = userAgency;
                const roleColor = getRoleBadgeColor(role);
                return (
                  <Card key={agency.id} style={styles.agencyCard}>
                    <TouchableOpacity
                      onPress={() => handleAgencyPress(agency.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.agencyHeader}>
                        <View style={styles.agencyLogoContainer}>
                          {agency.logo ? (
                            <Image source={{ uri: agency.logo }} style={styles.agencyLogo} />
                          ) : (
                            <View style={styles.agencyLogoPlaceholder}>
                              <Ionicons name="business" size={32} color={colors.primary[600]} />
                            </View>
                          )}
                          {agency.verified && (
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="checkmark" size={12} color={colors.text.inverse} />
                            </View>
                          )}
                        </View>
                        <View style={styles.agencyInfo}>
                          <View style={styles.agencyNameRow}>
                            <Text style={styles.agencyName} numberOfLines={1}>
                              {agency.name}
                            </Text>
                            <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
                              <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                                {getRoleLabel(role)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.agencyMeta}>
                            <View style={styles.agencyMetaItem}>
                              <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.agencyMetaText}>{agency.location}</Text>
                            </View>
                            <View style={styles.agencyMetaItem}>
                              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.agencyMetaText}>{agency.memberCount} members</Text>
                            </View>
                            {agency.rating && (
                              <View style={styles.agencyMetaItem}>
                                <Ionicons name="star" size={14} color={colors.semantic.warning} />
                                <Text style={styles.agencyMetaText}>{agency.rating.toFixed(1)}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </View>
                      {agency.description && (
                        <Text style={styles.agencyDescription} numberOfLines={2}>
                          {agency.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name="business-outline" 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>No Agencies Yet</Text>
                <Text style={styles.emptyStateText}>
                  Create your own agency or join an existing one to get started
                </Text>
                <View style={styles.emptyStateActions}>
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleCreateAgency}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Create Agency</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.emptyStateButton, styles.emptyStateButtonSecondary, { borderColor: colors.primary[600] }]}
                    onPress={handleJoinAgency}
                  >
                    <Ionicons name="search-outline" size={20} color={colors.primary[600]} />
                    <Text style={[styles.emptyStateButtonText, { color: colors.primary[600] }]}>Browse Agencies</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  agenciesList: {
    gap: Spacing.md,
  },
  agencyCard: {
    marginBottom: Spacing.md,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  agencyLogoContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  agencyLogo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral.gray200,
  },
  agencyLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  agencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  agencyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  agencyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  agencyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  emptyStateActions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  emptyStateButtonSecondary: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

