import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { PackageType } from '../contexts/PackageContext';
import { useThemeColors } from '../hooks/use-theme';

// Package definitions with icons and display names
const PACKAGES: Array<{
  id: PackageType;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}> = [
  { id: 'marketplace', name: 'Marketplace', icon: 'storefront-outline', description: 'Browse and book services', color: '#3B82F6' },
  { id: 'job-board', name: 'Job Board', icon: 'briefcase-outline', description: 'Find your next opportunity', color: '#10B981' },
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

interface PackageSelectionModalProps {
  visible: boolean;
  onSelectPackage: (pkg: PackageType) => void;
  onClose?: () => void;
}

export default function PackageSelectionModal({
  visible,
  onSelectPackage,
  onClose,
}: PackageSelectionModalProps) {
  const colors = useThemeColors();

  const handlePackageSelect = (pkg: PackageType) => {
    onSelectPackage(pkg);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Select a Package</Text>
            <Text style={styles.subtitle}>Choose a package to get started</Text>
          </View>
          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Packages Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.packagesGrid}>
            {PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handlePackageSelect(pkg.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.packageIconContainer, { backgroundColor: pkg.color + '15' }]}>
                  <Ionicons 
                    name={pkg.icon} 
                    size={32} 
                    color={pkg.color} 
                  />
                </View>
                <Text style={styles.packageName} numberOfLines={1}>
                  {pkg.name}
                </Text>
                <Text style={styles.packageDescription} numberOfLines={2}>
                  {pkg.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
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
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  packageCard: {
    width: '33.33%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  packageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  packageName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  packageDescription: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});

