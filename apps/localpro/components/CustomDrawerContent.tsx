import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/phone');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Drawer Header - User Details */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            
            <View style={styles.phoneContainer}>
              <Ionicons name="call-outline" size={14} color="#666" style={styles.phoneIcon} />
              <Text style={styles.userPhone} numberOfLines={1}>
                {user?.phone || 'No phone number'}
              </Text>
            </View>
            
            {/* Roles - can be extended when roles are added to user model */}
            <View style={styles.rolesContainer}>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#007AFF" />
                <Text style={styles.roleText}>Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Drawer Items */}
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerContent}
          showsVerticalScrollIndicator={false}
        >
          <DrawerItemList {...props} />
        </DrawerContentScrollView>

        {/* Drawer Footer - Logout */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E6F4FE',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E6F4FE',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
  },
  phoneIcon: {
    marginRight: 6,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  drawerContent: {
    paddingTop: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default CustomDrawerContent;

