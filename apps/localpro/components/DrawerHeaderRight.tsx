import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePackageContext, type PackageType } from '../contexts/PackageContext';

export function DrawerHeaderRight() {
  const { user } = useAuthContext();
  const { activePackage, setActivePackage } = usePackageContext();
  const router = useRouter();
  const [packageModalVisible, setPackageModalVisible] = useState(false);

  const handlePackageSwitcher = () => {
    setPackageModalVisible(true);
  };

  const handleNotifications = () => {
    router.push('/(app)/notifications');
  };


  // Map package IDs to PackageType
  const mapPackageIdToType = (id: string): PackageType | null => {
    const mapping: Record<string, PackageType> = {
      'marketplace': 'marketplace',
      'jobs': 'job-board',
      'academy': 'academy',
      'finance': 'finance',
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
  ];

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handlePackageSwitcher}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="apps" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNotifications}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
          {/* Badge indicator can be added here */}
        </TouchableOpacity>
      </View>

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
                  <Ionicons name="close" size={24} color="#000" />
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
                              color={isActive ? "#007AFF" : "#007AFF"}
                            />
                          </View>
                          {isActive && (
                            <View style={styles.activeIndicator}>
                              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  packagesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  packageBlock: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  packageBlockActive: {
    backgroundColor: '#E6F4FE',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  packageBlockHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  packageBlockIcon: {
    padding: 8,
    backgroundColor: '#E6F4FE',
    borderRadius: 20,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  packageBlockName: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DrawerHeaderRight;

