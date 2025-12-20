import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { usePackageContext } from '../contexts/PackageContext';

export function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthContext();
  const { activePackage } = usePackageContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/phone');
  };


  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Text style={styles.profileAvatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <Text style={styles.profileName}>{user?.name || 'John Doe'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'john@example.com'}</Text>
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => {
                  router.push('/(app)/(tabs)/profile');
                  props.navigation.closeDrawer();
                }}
              >
                <Text style={styles.viewProfileText}>View Profile →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Current Package Section */}
          <View style={styles.section}>
            <View style={styles.menuItem}>
              <Ionicons name="cube-outline" size={24} color={Colors.secondary[600]} />
              <Text style={styles.menuItemText}>Current Package</Text>
            </View>
            <View style={styles.currentPackageContainer}>
              <Text style={styles.currentPackageText}>
                {activePackage === 'marketplace' && 'Marketplace'}
                {activePackage === 'job-board' && 'Job Board'}
                {activePackage === 'finance' && 'Finance'}
                {activePackage === 'academy' && 'Academy'}
                {activePackage === 'referrals' && 'Referrals'}
                {activePackage === 'agencies' && 'Agencies'}
                {activePackage === 'supplies' && 'Supplies'}
                {activePackage === 'rentals' && 'Rentals'}
                {activePackage === 'ads' && 'Ads'}
                {activePackage === 'facility-care' && 'FacilityCare'}
                {activePackage === 'subscriptions' && 'Subscriptions'}
                {activePackage === 'trust' && 'Trust Verification'}
                {activePackage === 'communication' && 'Communication'}
                {activePackage === 'partners' && 'Partners'}
                {activePackage === 'search' && 'Search'}
                {activePackage === 'analytics' && 'Analytics'}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary[600]} />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Main Navigation */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/(tabs)');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="home-outline" size={24} color={Colors.primary[500]} />
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/search');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="search-outline" size={24} color={Colors.primary[400]} />
              <Text style={styles.menuItemText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/(tabs)/bookings');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="calendar-outline" size={24} color={Colors.secondary[600]} />
              <Text style={styles.menuItemText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/favorites');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="star-outline" size={24} color={Colors.semantic.warning} />
              <Text style={styles.menuItemText}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/(tabs)/messages');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="chatbubble-outline" size={24} color={Colors.primary[600]} />
              <Text style={styles.menuItemText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/notifications');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.semantic.warning} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Settings Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/settings');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.text.tertiary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/help-support');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color={Colors.semantic.error} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push('/(app)/about');
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="document-text-outline" size={24} color={Colors.text.tertiary} />
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleLogout();
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="log-out-outline" size={24} color={Colors.secondary[600]} />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </DrawerContentScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  drawerContent: {
    paddingTop: 0,
    paddingBottom: Spacing.lg,
  },
  profileSection: {
    padding: Spacing.md,
    margin: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  profileAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  profileAvatarText: {
    color: Colors.text.secondary,
    fontSize: 24,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  viewProfileButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  viewProfileText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  section: {
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  currentPackageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  currentPackageText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});

export default CustomDrawerContent;

