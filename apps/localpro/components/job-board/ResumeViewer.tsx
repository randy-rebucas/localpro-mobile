import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ResumeViewerProps {
  resumeUrl?: string;
  resumeName?: string;
}

export function ResumeViewer({ resumeUrl, resumeName }: ResumeViewerProps) {
  const colors = useThemeColors();

  const handleViewResume = async () => {
    if (!resumeUrl) {
      Alert.alert('No Resume', 'No resume has been uploaded for this application');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(resumeUrl);
      if (canOpen) {
        await Linking.openURL(resumeUrl);
      } else {
        Alert.alert('Error', 'Cannot open resume. Please check the file URL.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open resume');
      console.error('Error opening resume:', err);
    }
  };

  const handleDownloadResume = async () => {
    if (!resumeUrl) {
      Alert.alert('No Resume', 'No resume has been uploaded for this application');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(resumeUrl);
      if (canOpen) {
        await Linking.openURL(resumeUrl);
      } else {
        Alert.alert('Error', 'Cannot download resume. Please check the file URL.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to download resume');
      console.error('Error downloading resume:', err);
    }
  };

  if (!resumeUrl) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No resume uploaded</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Resume</Text>
      <View style={[styles.resumeCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.light }]}>
        <View style={styles.resumeInfo}>
          <Ionicons name="document-text" size={32} color={colors.primary[600]} />
          <View style={styles.resumeDetails}>
            <Text style={[styles.resumeName, { color: colors.text.primary }]}>
              {resumeName || 'Resume.pdf'}
            </Text>
            <Text style={[styles.resumeSize, { color: colors.text.tertiary }]}>PDF Document</Text>
          </View>
        </View>
        <View style={styles.resumeActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}
            onPress={handleViewResume}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary[600]} />
            <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}
            onPress={handleDownloadResume}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="download-outline" size={18} color={colors.text.secondary} />
            <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  resumeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  resumeSize: {
    fontSize: 13,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  resumeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
});

