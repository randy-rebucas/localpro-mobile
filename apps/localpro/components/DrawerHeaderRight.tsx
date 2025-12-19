import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { UserRole } from '@localpro/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { usePackageContext, type PackageType } from '../contexts/PackageContext';
import { useRoleContext } from '../contexts/RoleContext';

export function DrawerHeaderRight() {
  const { user } = useAuthContext();
  const { activePackage, setActivePackage } = usePackageContext();
  const { activeRole, setActiveRole, availableRoles } = useRoleContext();
  const router = useRouter();
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRoleSwitcher = () => {
    setRoleModalVisible(true);
  };

  const handlePackageSwitcher = () => {
    setPackageModalVisible(true);
  };

  const handleNotifications = () => {
    router.push('/(app)/notifications');
  };

  // Load unread notification count
  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await CommunicationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      // Set to 0 on error to hide badge
      setUnreadCount(0);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Refresh count when screen comes into focus (e.g., returning from notifications)
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  // Role helper functions
  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'client':
        return 'Client';
      case 'provider':
        return 'Provider';
      case 'admin':
        return 'Admin';
      case 'supplier':
        return 'Supplier';
      case 'instructor':
        return 'Instructor';
      case 'agency_owner':
        return 'Agency Owner';
      case 'agency_admin':
        return 'Agency Admin';
      case 'partner':
        return 'Partner';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: UserRole): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case 'client':
        return 'person-outline';
      case 'provider':
        return 'briefcase-outline';
      case 'admin':
        return 'shield-outline';
      case 'supplier':
        return 'cube-outline';
      case 'instructor':
        return 'school-outline';
      case 'agency_owner':
        return 'business-outline';
      case 'agency_admin':
        return 'people-outline';
      case 'partner':
        return 'link-outline';
      default:
        return 'person-outline';
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case 'client':
        return 'Browse and book services';
      case 'provider':
        return 'Offer and manage services';
      case 'admin':
        return 'Manage platform settings';
      case 'supplier':
        return 'Manage and sell supplies';
      case 'instructor':
        return 'Create and teach courses';
      case 'agency_owner':
        return 'Own and manage your agency';
      case 'agency_admin':
        return 'Manage agency operations';
      case 'partner':
        return 'Collaborate with partners';
      default:
        return '';
    }
  };


  // Map package IDs to PackageType
  const mapPackageIdToType = (id: string): PackageType | null => {
    const mapping: Record<string, PackageType> = {
      'marketplace': 'marketplace',
      'jobs': 'job-board',
      'academy': 'academy',
      'finance': 'finance',
      'referrals': 'referrals',
      'agencies': 'agencies',
      'supplies': 'supplies',
      'rentals': 'rentals',
      'ads': 'ads',
      'facility-care': 'facility-care',
      'subscriptions': 'subscriptions',
      'trust': 'trust',
      'communication': 'communication',
      'partners': 'partners',
      'search': 'search',
      'analytics': 'analytics',
    };
    return mapping[id] || null;
  };

  // Check if a package is active
  const isPackageActive = (id: string): boolean => {
    const packageType = mapPackageIdToType(id);
    return packageType !== null && packageType === activePackage;
  };

  const packages = [
    { id: 'marketplace', name: 'Marketplace', icon: 'storefront' },
    { id: 'jobs', name: 'Job Board', icon: 'briefcase' },
    { id: 'referrals', name: 'Referrals', icon: 'people' },
    { id: 'agencies', name: 'Agencies', icon: 'business' },
    { id: 'supplies', name: 'Supplies', icon: 'cube' },
    { id: 'academy', name: 'Academy', icon: 'school' },
    { id: 'finance', name: 'Finance', icon: 'wallet' },
    { id: 'rentals', name: 'Rentals', icon: 'home' },
    { id: 'ads', name: 'Ads', icon: 'megaphone' },
    { id: 'facility-care', name: 'FacilityCare', icon: 'medical' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'card' },
    { id: 'trust', name: 'Trust Verification', icon: 'shield-checkmark' },
    { id: 'communication', name: 'Communication', icon: 'chatbubbles' },
    { id: 'partners', name: 'Partners', icon: 'people' },
    { id: 'search', name: 'Search', icon: 'search' },
    { id: 'analytics', name: 'Analytics', icon: 'stats-chart' },
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Role Switcher - only show if user has multiple roles */}
        {availableRoles.length > 1 && (
          <TouchableOpacity
            onPress={handleRoleSwitcher}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={getRoleIcon(activeRole)} 
              size={24} 
              color={Colors.text.primary} 
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handlePackageSwitcher}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="apps" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNotifications}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Role Switcher Modal */}
      {availableRoles.length > 1 && (
        <Modal
          visible={roleModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setRoleModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setRoleModalVisible(false)}
          >
            <SafeAreaView edges={['top']} style={styles.modalContent}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Switch Role</Text>
                  <TouchableOpacity
                    onPress={() => setRoleModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
                  {availableRoles.map((role) => {
                    const isActive = role === activeRole;
                    return (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleItem,
                          isActive && styles.roleItemActive,
                        ]}
                        onPress={async () => {
                          await setActiveRole(role);
                          setRoleModalVisible(false);
                        }}
                      >
                        <View style={styles.roleItemContent}>
                          <View style={styles.roleItemLeft}>
                            <View style={[
                              styles.roleItemIcon,
                              isActive && styles.roleItemIconActive
                            ]}>
                              <Ionicons
                                name={getRoleIcon(role)}
                                size={24}
                                color={isActive ? Colors.primary[600] : Colors.text.secondary}
                              />
                            </View>
                            <View style={styles.roleItemText}>
                              <Text style={[
                                styles.roleItemName,
                                isActive && styles.roleItemNameActive
                              ]}>
                                {getRoleDisplayName(role)}
                              </Text>
                              <Text style={styles.roleItemDescription}>
                                {getRoleDescription(role)}
                              </Text>
                            </View>
                          </View>
                          {isActive && (
                            <Ionicons name="checkmark-circle" size={24} color={Colors.secondary[600]} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Pressable>
            </SafeAreaView>
          </Pressable>
        </Modal>
      )}

      {/* Package Switcher Modal */}

      {/* Package Switcher Modal */}
      <Modal
        visible={packageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPackageModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPackageModalVisible(false)}
        >
          <SafeAreaView edges={['top']} style={styles.modalContent}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Switch Package</Text>
                  <TouchableOpacity
                    onPress={() => setPackageModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
              </View>

              <ScrollView style={styles.packagesList} showsVerticalScrollIndicator={false}>
                <View style={styles.packagesGrid}>
                  {packages.map((pkg) => {
                    const isActive = isPackageActive(pkg.id);
                    return (
                      <TouchableOpacity
                        key={pkg.id}
                        style={[
                          styles.packageBlock,
                          isActive && styles.packageBlockActive,
                        ]}
                        onPress={async () => {
                          const packageType = mapPackageIdToType(pkg.id);
                          if (packageType) {
                            await setActivePackage(packageType);
                            // Navigate to initial tab based on package type
                            if (packageType === 'marketplace') {
                              router.push('/(app)/(tabs)');
                            } else if (packageType === 'job-board') {
                              router.push('/(app)/(tabs)');
                            } else if (packageType === 'finance') {
                              router.push('/(app)/(tabs)/wallet');
                            } else if (packageType === 'academy') {
                              router.push('/(app)/(tabs)/courses');
                            } else if (packageType === 'referrals') {
                              router.push('/(app)/(tabs)/refer');
                            } else if (packageType === 'agencies') {
                              router.push('/(app)/(tabs)/browse-agencies');
                            } else if (packageType === 'supplies') {
                              router.push('/(app)/(tabs)/shop');
                            } else if (packageType === 'rentals') {
                              router.push('/(app)/(tabs)/browse-rentals');
                            } else if (packageType === 'ads') {
                              router.push('/(app)/(tabs)/browse-ads');
                            } else if (packageType === 'facility-care') {
                              router.push('/(app)/(tabs)/services-fc');
                            } else if (packageType === 'subscriptions') {
                              router.push('/(app)/(tabs)/browse-subscriptions');
                            } else if (packageType === 'trust') {
                              router.push('/(app)/(tabs)/verify');
                            } else if (packageType === 'communication') {
                              router.push('/(app)/(tabs)/messages-comm');
                            } else if (packageType === 'partners') {
                              router.push('/(app)/(tabs)/browse-partners');
                            } else if (packageType === 'search') {
                              router.push('/(app)/(tabs)/global-search');
                            } else if (packageType === 'analytics') {
                              router.push('/(app)/(tabs)/dashboard');
                            }
                          }
                          setPackageModalVisible(false);
                        }}
                      >
                        <View style={styles.packageBlockHeader}>
                          <View style={styles.packageBlockIcon}>
                            <Ionicons
                              name={pkg.icon as any}
                              size={28}
                              color={Colors.primary[600]}
                            />
                          </View>
                          {isActive && (
                            <View style={styles.activeIndicator}>
                              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary[600]} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.packageBlockName} numberOfLines={2}>
                          {pkg.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  iconButton: {
    padding: 4,
  },
  profileButton: {
    padding: 2,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '80%',
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  packagesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: Spacing.lg,
  },
  packageBlock: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    position: 'relative',
  },
  packageBlockActive: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[600],
    borderWidth: 2,
  },
  packageBlockHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  packageBlockIcon: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary[100],
    borderRadius: 20,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background.primary,
    borderRadius: 10,
  },
  packageBlockName: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  rolesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  roleItem: {
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  roleItemActive: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[600],
    borderWidth: 2,
  },
  roleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleItemIconActive: {
    backgroundColor: Colors.primary[200],
  },
  roleItemText: {
    flex: 1,
  },
  roleItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roleItemNameActive: {
    color: Colors.primary[600],
  },
  roleItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DrawerHeaderRight;

