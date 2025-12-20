import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import Constants from 'expo-constants';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

export default function AboutScreen() {
  const colors = useThemeColors();

  const appInfo = {
    name: 'LocalPro',
    version: Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0',
    description: 'Connect with local professionals and services in your community. Find services, book appointments, and manage everything in one place.',
    buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || '1',
  };

  const links = [
    {
      icon: 'globe-outline' as const,
      title: 'Website',
      url: 'https://www.localpro.asia',
      color: colors.primary[600],
    },
    {
      icon: 'logo-facebook' as const,
      title: 'Facebook',
      url: 'https://www.facebook.com/localpro.asia',
      color: colors.primary[600],
    },
    {
      icon: 'logo-twitter' as const,
      title: 'Twitter',
      url: 'https://www.twitter.com/localpro.asia',
      color: colors.primary[600],
    },
    {
      icon: 'logo-instagram' as const,
      title: 'Instagram',
      url: 'https://www.instagram.com/localpro.asia',
      color: colors.primary[600],
    },
  ];

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>About</Text>

          {/* App Info Card */}
          <Card style={styles.card}>
            <View style={styles.appHeader}>
              <View style={[styles.appIcon, { backgroundColor: colors.primary[600] }]}>
                <Ionicons name="location" size={48} color={colors.text.inverse} />
              </View>
              <Text style={styles.appName}>{appInfo.name}</Text>
              <Text style={styles.appVersion}>Version {appInfo.version}</Text>
            </View>
            <Text style={styles.appDescription}>{appInfo.description}</Text>
          </Card>

          {/* App Details */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{appInfo.version}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>React Native</Text>
            </View>
          </Card>

          {/* Connect With Us */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
            {links.map((link, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={() => handleLinkPress(link.url)}
                >
                  <View style={styles.linkItemLeft}>
                    <Ionicons name={link.icon} size={24} color={link.color} />
                    <Text style={styles.linkText}>{link.title}</Text>
                  </View>
                  <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>

          {/* Legal */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Legal</Text>
            
            <TouchableOpacity style={styles.legalItem}>
              <View style={styles.legalItemLeft}>
                <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.legalText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.legalItem}>
              <View style={styles.legalItemLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.legalText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.legalItem}>
              <View style={styles.legalItemLeft}>
                <Ionicons name="document-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.legalText}>Licenses</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>

          {/* Credits */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Credits</Text>
            <Text style={styles.creditsText}>
              Built with ❤️ by the LocalPro team{'\n\n'}
              © {new Date().getFullYear()} LocalPro. All rights reserved.
            </Text>
          </Card>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    color: Colors.text.primary,
  },
  card: {
    marginBottom: Spacing.md,
  },
  appHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  appDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.xs,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  linkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  legalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legalText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  creditsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});