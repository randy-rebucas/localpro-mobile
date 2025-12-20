import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  certificateNumber: string;
  issuedAt: Date;
  imageUrl?: string;
  pdfUrl?: string;
  verificationUrl?: string;
}

export default function CertificatesTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock certificates data - replace with actual API call
  const certificates: Certificate[] = [];

  const filteredCertificates = certificates.filter(certificate => {
    return certificate.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           certificate.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCertificatePress = (certificateId: string) => {
    // TODO: Navigate to certificate detail/view screen
    // router.push(`/(app)/certificate/${certificateId}`);
    console.log('View certificate:', certificateId);
  };

  const handleDownload = async (certificate: Certificate) => {
    // TODO: Implement download functionality
    if (certificate.pdfUrl) {
      try {
        if (Platform.OS === 'web') {
          window.open(certificate.pdfUrl, '_blank');
        } else {
          await Linking.openURL(certificate.pdfUrl);
        }
      } catch {
        Alert.alert('Error', 'Failed to download certificate');
      }
    } else {
      Alert.alert('Info', 'Certificate download will be available soon');
    }
  };

  const handleShare = async (certificate: Certificate) => {
    try {
      const message = `I completed the course "${certificate.courseTitle}" and earned a certificate! ${certificate.verificationUrl || ''}`;
      await Share.share({
        message,
        title: 'Course Certificate',
      });
    } catch {
      Alert.alert('Error', 'Failed to share certificate');
    }
  };

  const handleVerify = (certificate: Certificate) => {
    if (certificate.verificationUrl) {
      Linking.openURL(certificate.verificationUrl).catch(() => {
        Alert.alert('Error', 'Failed to open verification link');
      });
    } else {
      Alert.alert('Info', 'Verification link not available');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Certificates</Text>
            <Text style={styles.subtitle}>Your earned certificates and achievements</Text>
          </View>

          {/* Stats Card */}
          {certificates.length > 0 && (
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="ribbon" size={24} color={colors.primary[600]} />
                  <Text style={styles.statValue}>{certificates.length}</Text>
                  <Text style={styles.statLabel}>Certificates</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={24} color={colors.semantic.warning} />
                  <Text style={styles.statValue}>
                    {new Set(certificates.map(c => c.courseCategory)).size}
                  </Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.text.secondary} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search certificates..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Certificates List */}
          {filteredCertificates.length > 0 ? (
            <View style={styles.certificatesList}>
              {filteredCertificates.map((certificate) => (
                <Card key={certificate.id} style={styles.certificateCard}>
                  <TouchableOpacity
                    onPress={() => handleCertificatePress(certificate.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.certificateHeader}>
                      <View style={[styles.certificateIconContainer, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons name="ribbon" size={32} color={colors.primary[600]} />
                      </View>
                      <View style={styles.certificateInfo}>
                        <Text style={styles.certificateTitle} numberOfLines={2}>
                          {certificate.courseTitle}
                        </Text>
                        <Text style={styles.certificateCategory}>
                          {certificate.courseCategory}
                        </Text>
                        <Text style={styles.certificateNumber}>
                          Certificate #{certificate.certificateNumber}
                        </Text>
                        <Text style={styles.certificateDate}>
                          Issued on {formatDate(certificate.issuedAt)}
                        </Text>
                      </View>
                    </View>

                    {/* Certificate Preview */}
                    {certificate.imageUrl && (
                      <View style={styles.certificatePreview}>
                        <Image 
                          source={{ uri: certificate.imageUrl }} 
                          style={styles.certificateImage}
                        />
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.certificateActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.downloadButton, { borderColor: colors.primary[600] }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDownload(certificate);
                        }}
                      >
                        <Ionicons name="download-outline" size={18} color={colors.primary[600]} />
                        <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                          Download
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.shareButton, { borderColor: colors.secondary[600] }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleShare(certificate);
                        }}
                      >
                        <Ionicons name="share-social-outline" size={18} color={colors.secondary[600]} />
                        <Text style={[styles.actionButtonText, { color: colors.secondary[600] }]}>
                          Share
                        </Text>
                      </TouchableOpacity>
                      {certificate.verificationUrl && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.verifyButton, { borderColor: colors.semantic.success }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleVerify(certificate);
                          }}
                        >
                          <Ionicons name="shield-checkmark-outline" size={18} color={colors.semantic.success} />
                          <Text style={[styles.actionButtonText, { color: colors.semantic.success }]}>
                            Verify
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'ribbon-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Certificates Found' : 'No Certificates Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Complete courses to earn certificates'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={() => router.push('/(app)/(tabs)/courses')}
                  >
                    <Ionicons name="library-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Browse Courses</Text>
                  </TouchableOpacity>
                )}
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
  statsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  certificatesList: {
    gap: Spacing.md,
  },
  certificateCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  certificateHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  certificateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  certificateCategory: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  certificateNumber: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: 'monospace',
    marginBottom: Spacing.xs,
  },
  certificateDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  certificatePreview: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  certificateImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutral.gray200,
  },
  certificateActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  downloadButton: {
    backgroundColor: Colors.background.primary,
  },
  shareButton: {
    backgroundColor: Colors.background.primary,
  },
  verifyButton: {
    backgroundColor: Colors.background.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

