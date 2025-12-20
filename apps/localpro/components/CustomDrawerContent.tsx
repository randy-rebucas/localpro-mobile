import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { toTitleCase } from '@localpro/utils';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { usePackageContext } from '../contexts/PackageContext';
import { useAppHealth } from '../hooks/use-app-health';

export function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthContext();
  const { activePackage } = usePackageContext();
  const router = useRouter();
  const { status: healthStatus, lastChecked } = useAppHealth(30000); // Check every 30 seconds

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
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => {
              props.navigation.closeDrawer();
              setTimeout(() => {
                router.push('/(app)/(tabs)/profile');
              }, 100);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.profileContainer}>
              {/* Avatar on the left */}
              {user?.profile?.avatar?.thumbnail ? (
                <Image source={{ uri: user?.profile?.avatar?.thumbnail }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Text style={styles.profileAvatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}

              {/* Details on the right */}
              <View style={styles.profileDetails}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user?.firstName + ' ' + user?.lastName || 'John Doe'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user?.phoneNumber}
                </Text>
              </View>

              {/* Chevron indicator */}
              <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* App Status Section */}
          <View style={styles.section}>
            <View style={styles.menuItem}>
              <Ionicons name="pulse-outline" size={24} color={Colors.primary[600]} />
              <Text style={styles.menuItemText}>App Status</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        healthStatus === 'healthy'
                          ? Colors.semantic.success
                          : healthStatus === 'unhealthy'
                            ? Colors.semantic.error
                            : healthStatus === 'checking'
                              ? Colors.semantic.warning
                              : Colors.text.tertiary,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {healthStatus === 'healthy'
                    ? 'All Systems Operational'
                    : healthStatus === 'unhealthy'
                      ? 'Service Unavailable'
                      : healthStatus === 'checking'
                        ? 'Checking Status...'
                        : 'Unknown Status'}
                </Text>
              </View>
              {lastChecked && (
                <Text style={styles.lastCheckedText}>
                  Last checked: {lastChecked.toLocaleTimeString()}
                </Text>
              )}
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
                {toTitleCase(activePackage)}
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
                props.navigation.closeDrawer();
                setTimeout(() => {
                  router.push('/(app)/(tabs)');
                }, 100);
              }}
            >
              <Ionicons name="home-outline" size={24} color={Colors.primary[500]} />
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.closeDrawer();
                setTimeout(() => {
                  router.push('/(app)/(tabs)/search');
                }, 100);
              }}
            >
              <Ionicons name="search-outline" size={24} color={Colors.primary[400]} />
              <Text style={styles.menuItemText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.closeDrawer();
                setTimeout(() => {
                  router.push('/(app)/(tabs)/bookings');
                }, 100);
              }}
            >
              <Ionicons name="calendar-outline" size={24} color={Colors.secondary[600]} />
              <Text style={styles.menuItemText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(app)/(tabs)/favorites')}
            >
              <Ionicons name="star-outline" size={24} color={Colors.semantic.warning} />
              <Text style={styles.menuItemText}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.closeDrawer();
                setTimeout(() => {
                  router.push('/(app)/(tabs)/messages-comm');
                }, 100);
              }}
            >
              <Ionicons name="chatbubble-outline" size={24} color={Colors.primary[600]} />
              <Text style={styles.menuItemText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(app)/(tabs)/notifications-comm')}
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
              onPress={() => router.push('/(app)/(tabs)/settings-comm')}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.text.tertiary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(app)/(tabs)/help-support')}
            >
              <Ionicons name="help-circle-outline" size={24} color={Colors.semantic.error} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(app)/(tabs)/about')}
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
    margin: 12,
    marginBottom: Spacing.md,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  profileAvatarText: {
    color: Colors.text.secondary,
    fontSize: 24,
    fontWeight: '600',
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
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
  statusContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  lastCheckedText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
});

export default CustomDrawerContent;

