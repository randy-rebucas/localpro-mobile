import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ResumeUploadProps {
  onResumeSelected: (file: { uri: string; name: string; type: string; size?: number }) => void;
  existingResume?: string;
  maxSizeMB?: number;
}

export function ResumeUpload({ onResumeSelected, existingResume, maxSizeMB = 5 }: ResumeUploadProps) {
  const colors = useThemeColors();
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string; size?: number } | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];

      // Validate file size
      if (file.size && file.size > maxSizeMB * 1024 * 1024) {
        Alert.alert('File Too Large', `Please select a file smaller than ${maxSizeMB}MB`);
        setUploading(false);
        return;
      }

      const fileData = {
        uri: file.uri,
        name: file.name || 'resume.pdf',
        type: file.mimeType || 'application/pdf',
        size: file.size,
      };

      setSelectedFile(fileData);
      onResumeSelected(fileData);
    } catch (error: any) {
      console.error('Document picker error:', error);
      Alert.alert('Error', error?.message || 'Failed to pick document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onResumeSelected({ uri: '', name: '', type: '' });
  };

  const getFileIcon = (type?: string) => {
    if (!type) return 'document-outline';
    if (type.includes('pdf')) return 'document-text-outline';
    if (type.includes('word') || type.includes('document')) return 'document-outline';
    return 'document-outline';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.label}>Resume / CV</Text>
      <Text style={[styles.hint, { color: colors.text.tertiary }]}>
        Upload your resume (PDF, DOC, or DOCX). Max size: {maxSizeMB}MB
      </Text>

      {selectedFile || existingResume ? (
        <View style={[styles.fileContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.light }]}>
          <View style={styles.fileInfo}>
            <Ionicons
              name={getFileIcon(selectedFile?.type || 'application/pdf') as any}
              size={24}
              color={colors.primary[600]}
            />
            <View style={styles.fileDetails}>
              <Text style={[styles.fileName, { color: colors.text.primary }]} numberOfLines={1}>
                {selectedFile?.name || 'Resume.pdf'}
              </Text>
              {selectedFile?.size && (
                <Text style={[styles.fileSize, { color: colors.text.tertiary }]}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={removeFile}
            style={[styles.removeButton, { backgroundColor: colors.semantic.error[50] }]}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="close" size={18} color={colors.semantic.error[600]} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor: colors.border.light, backgroundColor: colors.background.secondary }]}
          onPress={pickDocument}
          disabled={uploading}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          {uploading ? (
            <Text style={[styles.uploadButtonText, { color: colors.text.secondary }]}>Selecting...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primary[600]} />
              <Text style={[styles.uploadButtonText, { color: colors.primary[600] }]}>Select Resume</Text>
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
    paddingVertical: Spacing.md,
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
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    gap: Spacing.sm,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

