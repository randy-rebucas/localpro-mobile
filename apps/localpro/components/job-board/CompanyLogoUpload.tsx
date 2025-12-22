import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CompanyLogoUploadProps {
  onLogoSelected: (file: { uri: string; type: string; name: string }) => void;
  existingLogo?: string;
  maxSizeMB?: number;
}

export function CompanyLogoUpload({ onLogoSelected, existingLogo, maxSizeMB = 2 }: CompanyLogoUploadProps) {
  const colors = useThemeColors();
  const [selectedLogo, setSelectedLogo] = useState<string | null>(existingLogo || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photos to upload a logo.');
        return;
      }

      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const image = result.assets[0];

      // Validate file size
      if (image.fileSize && image.fileSize > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `Please select an image smaller than ${maxSizeMB}MB`);
        setUploading(false);
        return;
      }

      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      setSelectedLogo(image.uri);
      onLogoSelected({
        uri: image.uri,
        type: mimeType,
        name: `logo.${fileType}`,
      });
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', error?.message || 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setSelectedLogo(null);
    onLogoSelected({ uri: '', type: '', name: '' });
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.label}>Company Logo</Text>
      <Text style={[styles.hint, { color: colors.text.tertiary }]}>
        Upload your company logo (JPG or PNG). Max size: {maxSizeMB}MB. Recommended: Square image, 512x512px
      </Text>

      {selectedLogo ? (
        <View style={styles.logoContainer}>
          <Image source={{ uri: selectedLogo }} style={styles.logoPreview} />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.semantic.error[50] }]}
            onPress={removeLogo}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="close" size={18} color={colors.semantic.error[600]} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor: colors.border.light, backgroundColor: colors.background.secondary }]}
          onPress={pickImage}
          disabled={uploading}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          {uploading ? (
            <Text style={[styles.uploadButtonText, { color: colors.text.secondary }]}>Selecting...</Text>
          ) : (
            <>
              <Ionicons name="image-outline" size={32} color={colors.primary[600]} />
              <Text style={[styles.uploadButtonText, { color: colors.primary[600] }]}>Select Logo</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  hint: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  logoContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

