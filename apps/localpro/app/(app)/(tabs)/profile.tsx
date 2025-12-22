import { Ionicons } from '@expo/vector-icons';
import { AuthService, useAuthContext } from '@localpro/auth';
import type { User, UserRole } from '@localpro/types';
import { Button, Card, Loading } from '@localpro/ui';
import { formatDate, toTitleCase } from '@localpro/utils';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

export default function ProfileScreen() {
  const { user: contextUser, logout, uploadAvatar } = useAuthContext();
  const { activeRole, setActiveRole, availableRoles } = useRoleContext();
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(contextUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const colors = useThemeColors();
  const router = useRouter();

  // Initialize with context user
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    }
  }, [contextUser]);

  // Fetch fresh user data on mount
  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const fetchCurrentUser = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Don't call checkAuth() here as it causes redirects
        // The auth context already manages authentication state
      } else {
        // If no user is returned, use context user as fallback
        setUser(contextUser);
      }
    } catch (error: any) {
      console.error('Failed to fetch user data:', error);
      // On error, use context user as fallback
      setUser(contextUser);
      // Only show alert on manual refresh, not on initial load
      if (showRefreshIndicator) {
        Alert.alert(
          'Error',
          'Failed to refresh profile data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCurrentUser(true);
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


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/phone');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    console.log('Navigating to edit profile...');
    // Use the full path with the stack group
    router.push('/(stack)/profile/edit');
  };

  const handleUploadAvatar = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access media library is required'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8, // Compress to 80% quality
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets[0];

      // Validate file size (2MB limit)
      if (image.fileSize && image.fileSize > 2 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Image size exceeds 2MB limit. Please choose a smaller image.'
        );
        return;
      }

      setIsUploadingAvatar(true);
      try {
        await uploadAvatar(image.uri, image.fileSize);
        // Refresh user data to get updated avatar URL
        await fetchCurrentUser();
        Alert.alert('Success', 'Avatar updated successfully!');
      } catch (error: any) {
        console.error('Avatar upload error in profile:', error);
        const errorMessage = error?.message || 
                            (typeof error === 'string' ? error : 'Failed to upload avatar. Please try again.');
        Alert.alert(
          'Upload Failed',
          errorMessage
        );
      } finally {
        setIsUploadingAvatar(false);
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to pick image. Please try again.'
      );
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Loading />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>

          {/* Profile Header with Avatar */}
          <Card style={styles.profileHeaderCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {user?.profile?.avatar?.thumbnail ? (
                  <Image source={{ uri: user?.profile?.avatar?.thumbnail }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editAvatarButton}
                  onPress={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <Ionicons name="camera" size={16} color={colors.text.inverse} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileName}>
                  {user?.name || (user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`.trim()
                    : user?.firstName || user?.lastName || 'User')}
                </Text>
                {user?.email && (
                  <Text style={styles.profileEmail}>{user.email}</Text>
                )}
                <Text style={styles.profilePhone}>{user?.phone || user?.phoneNumber || 'N/A'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary[600]} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </Card>

          {/* Role Switcher Card */}
          {availableRoles.length > 1 && (
            <Card style={styles.card}>
              <Text style={styles.label}>Current Role</Text>
              <TouchableOpacity
                style={styles.roleSwitcher}
                onPress={() => setRoleModalVisible(true)}
              >
                <View style={styles.roleSwitcherContent}>
                  <View style={styles.roleSwitcherLeft}>
                    <Ionicons
                      name={getRoleIcon(activeRole)}
                      size={24}
                      color={colors.primary[600]}
                      style={styles.roleIcon}
                    />
                    <View>
                      <Text style={styles.roleName}>{toTitleCase(activeRole)}</Text>
                      <Text style={styles.roleDescription}>{getRoleDescription(activeRole)}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </Card>
          )}

          {/* Account Information */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Name</Text>
              </View>
              <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
            </View>

            {user?.email && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Email</Text>
                  </View>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </>
            )}

            {user?.createdAt && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Member Since</Text>
                  </View>
                  <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
                </View>
              </>
            )}

            {user?.updatedAt && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Last Updated</Text>
                  </View>
                  <Text style={styles.infoValue}>{formatDate(user.updatedAt)}</Text>
                </View>
              </>
            )}

            {user?.id && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="finger-print-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>User ID</Text>
                  </View>
                  <Text style={[styles.infoValue, styles.userIdText]} numberOfLines={1} ellipsizeMode="middle">
                    {user.id}
                  </Text>
                </View>
              </>
            )}

            {user?.isOnboarded !== undefined && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons 
                      name={user.isOnboarded ? "checkmark-circle-outline" : "alert-circle-outline"} 
                      size={20} 
                      color={user.isOnboarded ? colors.secondary[600] : colors.semantic.warning} 
                    />
                    <Text style={styles.infoLabel}>Onboarding Status</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[
                      styles.statusText,
                      { color: user.isOnboarded ? colors.secondary[600] : colors.semantic.warning }
                    ]}>
                      {user.isOnboarded ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {user?.roles && user.roles.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="people-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.infoLabel}>Roles</Text>
                  </View>
                  <View style={styles.rolesContainer}>
                    {user.roles.map((role, index) => (
                      <View key={role} style={[
                        styles.roleBadge,
                        role === activeRole && styles.roleBadgeActive
                      ]}>
                        <Text style={[
                          styles.roleBadgeText,
                          role === activeRole && styles.roleBadgeTextActive
                        ]}>
                          {toTitleCase(role)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </Card>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(stack)/settings')}
            >
              <View style={styles.actionItemLeft}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary[600]} />
                </View>
                <Text style={styles.actionText}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(stack)/help-support')}
            >
              <View style={styles.actionItemLeft}>
                <View style={[styles.actionIcon, { backgroundColor: colors.secondary[100] }]}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.secondary[600]} />
                </View>
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(stack)/about')}
            >
              <View style={styles.actionItemLeft}>
                <View style={[styles.actionIcon, { backgroundColor: colors.neutral.gray100 }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.actionText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
            />
          </View>
        </View>
      </ScrollView>

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
                    <Ionicons name="close" size={24} color={colors.text.primary} />
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
                                color={isActive ? colors.primary[600] : colors.text.secondary}
                              />
                            </View>
                            <View style={styles.roleItemText}>
                              <Text style={[
                                styles.roleItemName,
                                isActive && styles.roleItemNameActive
                              ]}>
                                {toTitleCase(role)}
                              </Text>
                              <Text style={styles.roleItemDescription}>
                                {getRoleDescription(role)}
                              </Text>
                            </View>
                          </View>
                          {isActive && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.secondary[600]} />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  profileHeaderCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral.gray200,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
    marginLeft: 6,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  logoutContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleSwitcher: {
    marginTop: Spacing.sm,
  },
  roleSwitcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  roleSwitcherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    marginRight: 12,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  userIdText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.gray100,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.gray100,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  roleBadgeActive: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[600],
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  roleBadgeTextActive: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
});

