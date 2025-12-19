import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import type { UserRole } from '@localpro/types';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useStylePresets, useThemeColors } from '../../../hooks/use-theme';

export default function ProfileScreen() {
  const { user } = useAuthContext();
  const { activeRole, setActiveRole, availableRoles } = useRoleContext();
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const colors = useThemeColors();
  const presets = useStylePresets();

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>

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
                      <Text style={styles.roleName}>{getRoleDisplayName(activeRole)}</Text>
                      <Text style={styles.roleDescription}>{getRoleDescription(activeRole)}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </Card>
          )}

          <Card style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name || 'N/A'}</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user?.phone || 'N/A'}</Text>
          </Card>

          {user?.email && (
            <Card style={styles.card}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </Card>
          )}
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
                                {getRoleDisplayName(role)}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    color: Colors.text.primary,
  },
  card: {
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
});

