import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { UserRole } from '@localpro/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    router.push('/(app)/(tabs)/notifications');
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

  // Package definitions matching PackageSelectionModal styling
  const packages = [
    { id: 'marketplace', name: 'Marketplace', icon: 'storefront-outline', description: 'Browse and book services', color: '#3B82F6' },
    { id: 'jobs', name: 'Job Board', icon: 'briefcase-outline', description: 'Find your next opportunity', color: '#10B981' },
    { id: 'finance', name: 'Finance', icon: 'wallet-outline', description: 'Manage your wallet', color: '#F59E0B' },
    { id: 'academy', name: 'Academy', icon: 'school-outline', description: 'Learn new skills', color: '#8B5CF6' },
    { id: 'supplies', name: 'Supplies', icon: 'cube-outline', description: 'Order supplies', color: '#EC4899' },
    { id: 'rentals', name: 'Rentals', icon: 'home-outline', description: 'Rent equipment', color: '#06B6D4' },
    { id: 'referrals', name: 'Referrals', icon: 'people-outline', description: 'Refer and earn', color: '#14B8A6' },
    { id: 'agencies', name: 'Agencies', icon: 'business-outline', description: 'Manage agencies', color: '#6366F1' },
    { id: 'communication', name: 'Communication', icon: 'chatbubbles-outline', description: 'Messages & notifications', color: '#F97316' },
    { id: 'facility-care', name: 'Facility Care', icon: 'medical-outline', description: 'Healthcare services', color: '#EF4444' },
    { id: 'ads', name: 'Ads', icon: 'megaphone-outline', description: 'Advertise your services', color: '#84CC16' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'star-outline', description: 'LocalPro Plus', color: '#F59E0B' },
    { id: 'trust', name: 'Trust', icon: 'shield-checkmark-outline', description: 'Verification & trust', color: '#10B981' },
    { id: 'partners', name: 'Partners', icon: 'people-circle-outline', description: 'Partner network', color: '#3B82F6' },
    { id: 'search', name: 'Search', icon: 'search-outline', description: 'Advanced search', color: '#8B5CF6' },
    { id: 'analytics', name: 'Analytics', icon: 'stats-chart-outline', description: 'Insights & reports', color: '#6366F1' },
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
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setRoleModalVisible(false)}
        >
          <View style={styles.roleModalContainer}>
            {/* Header */}
            <View style={styles.roleModalHeader}>
              <View>
                <Text style={styles.roleModalTitle}>Switch Role</Text>
                <Text style={styles.roleModalSubtitle}>Choose a role to switch to</Text>
              </View>
              <TouchableOpacity
                style={styles.roleModalCloseButton}
                onPress={() => setRoleModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Roles List */}
            <ScrollView
              style={styles.roleModalScrollView}
              contentContainerStyle={styles.roleModalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {availableRoles.map((role) => {
                const isActive = role === activeRole;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleModalItem,
                      isActive && styles.roleModalItemActive,
                    ]}
                    onPress={async () => {
                      await setActiveRole(role);
                      setRoleModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.roleModalItemContent}>
                      <View style={styles.roleModalItemLeft}>
                        <View style={[
                          styles.roleModalItemIcon,
                          isActive && styles.roleModalItemIconActive
                        ]}>
                          <Ionicons
                            name={getRoleIcon(role)}
                            size={28}
                            color={isActive ? Colors.primary[600] : Colors.text.secondary}
                          />
                        </View>
                        <View style={styles.roleModalItemText}>
                          <Text style={[
                            styles.roleModalItemName,
                            isActive && styles.roleModalItemNameActive
                          ]}>
                            {getRoleDisplayName(role)}
                          </Text>
                          <Text style={styles.roleModalItemDescription}>
                            {getRoleDescription(role)}
                          </Text>
                        </View>
                      </View>
                      {isActive && (
                        <View style={styles.roleModalActiveBadge}>
                          <Ionicons name="checkmark-circle" size={24} color={Colors.primary[600]} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Package Switcher Modal */}
      <Modal
        visible={packageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPackageModalVisible(false)}
      >
        <View style={styles.packageModalContainer}>
          {/* Header */}
          <View style={styles.packageModalHeader}>
            <View>
              <Text style={styles.packageModalTitle}>Switch Package</Text>
              <Text style={styles.packageModalSubtitle}>Choose a package to switch to</Text>
            </View>
            <TouchableOpacity
              style={styles.packageModalCloseButton}
              onPress={() => setPackageModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Packages Grid */}
          <ScrollView
            style={styles.packageModalScrollView}
            contentContainerStyle={styles.packageModalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.packageModalGrid}>
              {packages.map((pkg) => {
                const isActive = isPackageActive(pkg.id);
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    style={styles.packageModalCard}
                    onPress={async () => {
                      const packageType = mapPackageIdToType(pkg.id);
                      if (packageType) {
                        await setActivePackage(packageType);
                        // Navigate to initial tab based on package type
                        if (packageType === 'marketplace') {
                          router.push('/(app)/(tabs)');
                        } else if (packageType === 'job-board') {
                          router.push('/(app)/(tabs)/browse-jobs');
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
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.packageModalIconContainer,
                      { backgroundColor: pkg.color + '15' },
                      isActive && { backgroundColor: pkg.color + '25' }
                    ]}>
                      <Ionicons 
                        name={pkg.icon as any} 
                        size={32} 
                        color={pkg.color} 
                      />
                      {isActive && (
                        <View style={styles.packageModalActiveBadge}>
                          <Ionicons name="checkmark-circle" size={20} color={pkg.color} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.packageModalName} numberOfLines={1}>
                      {pkg.name}
                    </Text>
                    <Text style={styles.packageModalDescription} numberOfLines={2}>
                      {pkg.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
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
  // Package Modal Styles (matching PackageSelectionModal)
  packageModalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  packageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  packageModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  packageModalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  packageModalCloseButton: {
    padding: Spacing.xs,
  },
  packageModalScrollView: {
    flex: 1,
  },
  packageModalScrollContent: {
    padding: Spacing.lg,
  },
  packageModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  packageModalCard: {
    width: '33.33%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  packageModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  packageModalActiveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background.primary,
    borderRadius: 10,
  },
  packageModalName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  packageModalDescription: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
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
  // Role Modal Styles (matching PackageSelectionModal)
  roleModalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  roleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  roleModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  roleModalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  roleModalCloseButton: {
    padding: Spacing.xs,
  },
  roleModalScrollView: {
    flex: 1,
  },
  roleModalScrollContent: {
    padding: Spacing.lg,
  },
  roleModalItem: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleModalItemActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[600],
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleModalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleModalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleModalItemIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  roleModalItemIconActive: {
    backgroundColor: Colors.primary[200],
  },
  roleModalItemText: {
    flex: 1,
  },
  roleModalItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roleModalItemNameActive: {
    color: Colors.primary[600],
  },
  roleModalItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  roleModalActiveBadge: {
    marginLeft: Spacing.sm,
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

