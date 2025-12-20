import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Document {
  id: string;
  name: string;
  type: 'id' | 'business' | 'license' | 'certificate' | 'other';
  uri: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export default function DocumentsTabScreen() {
  const colors = useThemeColors();
  const [documents, setDocuments] = useState<Document[]>([]);

  const documentTypes = [
    { key: 'id' as const, label: 'ID Document', icon: 'card-outline' as const },
    { key: 'business' as const, label: 'Business License', icon: 'business-outline' as const },
    { key: 'license' as const, label: 'Professional License', icon: 'school-outline' as const },
    { key: 'certificate' as const, label: 'Certificate', icon: 'ribbon-outline' as const },
    { key: 'other' as const, label: 'Other', icon: 'document-outline' as const },
  ];

  const handlePickImage = async (type: Document['type']) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newDocument: Document = {
          id: Date.now().toString(),
          name: `${documentTypes.find(t => t.key === type)?.label || 'Document'} - ${new Date().toLocaleDateString()}`,
          type,
          uri: result.assets[0].uri,
          uploadedAt: new Date(),
          status: 'pending',
        };
        setDocuments([...documents, newDocument]);
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
      console.error('Image picker error:', error);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(documents.filter(doc => doc.id !== documentId));
            Alert.alert('Success', 'Document deleted');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'rejected':
        return colors.semantic.error;
    }
  };

  const getStatusIcon = (status: Document['status']): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'rejected':
        return 'close-circle';
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>Manage your verification documents</Text>
          </View>

          {/* Upload Options */}
          <Card style={styles.uploadCard}>
            <Text style={styles.sectionTitle}>Upload Document</Text>
            <View style={styles.uploadGrid}>
              {documentTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.uploadButton, { borderColor: colors.primary[600] }]}
                  onPress={() => handlePickImage(type.key)}
                >
                  <Ionicons name={type.icon} size={32} color={colors.primary[600]} />
                  <Text style={[styles.uploadButtonText, { color: colors.primary[600] }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Documents List */}
          {documents.length > 0 ? (
            <View style={styles.documentsSection}>
              <Text style={styles.sectionTitle}>My Documents ({documents.length})</Text>
              <View style={styles.documentsList}>
                {documents.map((document) => {
                  const statusColor = getStatusColor(document.status);
                  return (
                    <Card key={document.id} style={styles.documentCard}>
                      <View style={styles.documentHeader}>
                        <Image source={{ uri: document.uri }} style={styles.documentThumbnail} />
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentName} numberOfLines={1}>
                            {document.name}
                          </Text>
                          <Text style={styles.documentDate}>
                            Uploaded: {formatDate(document.uploadedAt)}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Ionicons name={getStatusIcon(document.status)} size={12} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteDocument(document.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Documents</Text>
                <Text style={styles.emptyStateText}>
                  Upload documents to complete your verification
                </Text>
              </View>
            </Card>
          )}
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
  header: {
    marginBottom: Spacing.lg,
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
  uploadCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  uploadButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  documentsSection: {
    marginBottom: Spacing.lg,
  },
  documentsList: {
    gap: Spacing.md,
  },
  documentCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  documentThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  documentDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

