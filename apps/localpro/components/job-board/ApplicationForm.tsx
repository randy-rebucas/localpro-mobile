import { Button, Card } from '@localpro/ui';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';
import { ResumeUpload } from './ResumeUpload';

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onSubmit: (data: { coverLetter: string; resume: string; additionalInfo?: { portfolio?: string; linkedIn?: string } }) => Promise<void>;
  onCancel: () => void;
  existingApplication?: {
    coverLetter?: string;
    resume?: string;
    additionalInfo?: {
      portfolio?: string;
      linkedIn?: string;
    };
  };
}

export function ApplicationForm({ jobId, jobTitle, onSubmit, onCancel, existingApplication }: ApplicationFormProps) {
  const colors = useThemeColors();
  const [coverLetter, setCoverLetter] = useState(existingApplication?.coverLetter || '');
  const [resume, setResume] = useState<{ uri: string; name: string; type: string } | null>(
    existingApplication?.resume ? { uri: existingApplication.resume, name: 'Resume.pdf', type: 'application/pdf' } : null
  );
  const [portfolio, setPortfolio] = useState(existingApplication?.additionalInfo?.portfolio || '');
  const [linkedIn, setLinkedIn] = useState(existingApplication?.additionalInfo?.linkedIn || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resume || !resume.uri) {
      Alert.alert('Resume Required', 'Please upload your resume to apply for this job.');
      return;
    }

    if (coverLetter.trim().length < 10) {
      Alert.alert('Cover Letter Required', 'Please provide a cover letter (minimum 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert resume file to base64
      const resumeBase64 = await convertFileToBase64(resume.uri);
      
      // Build additionalInfo object
      const additionalInfo: { portfolio?: string; linkedIn?: string } = {};
      if (portfolio.trim()) {
        additionalInfo.portfolio = portfolio.trim();
      }
      if (linkedIn.trim()) {
        additionalInfo.linkedIn = linkedIn.trim();
      }

      await onSubmit({
        coverLetter: coverLetter.trim(),
        resume: resumeBase64,
        additionalInfo: Object.keys(additionalInfo).length > 0 ? additionalInfo : undefined,
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const convertFileToBase64 = async (uri: string): Promise<string> => {
    try {
      // Use expo-file-system legacy API to read file as base64
      // The legacy API accepts 'base64' as a string for encoding
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      } as any);
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      // Fallback: if conversion fails, return the URI as-is (assuming it's already a URL)
      return uri;
    }
  };


  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Text style={styles.jobTitle} numberOfLines={2}>{jobTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Submit your application</Text>
        </View>
      </Card>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ResumeUpload
          onResumeSelected={(file) => setResume(file)}
          existingResume={existingApplication?.resume}
          maxSizeMB={5}
        />

        <Card style={styles.sectionCard}>
          <Text style={styles.label}>Cover Letter *</Text>
          <Text style={[styles.hint, { color: colors.text.tertiary }]}>
            Tell us why you're a great fit for this position (minimum 10 characters)
          </Text>
          <TextInput
            multiline
            numberOfLines={8}
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Write your cover letter here..."
            placeholderTextColor={colors.text.tertiary}
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border.light }]}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
            {coverLetter.length} characters
          </Text>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.label}>Additional Information (Optional)</Text>
          <Text style={[styles.hint, { color: colors.text.tertiary, marginBottom: Spacing.md }]}>
            Share links to your portfolio, LinkedIn, or other professional profiles
          </Text>
          
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Portfolio URL</Text>
            <TextInput
              value={portfolio}
              onChangeText={setPortfolio}
              placeholder="https://portfolio.example.com"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text.tertiary}
              style={[styles.urlInput, { color: colors.text.primary, borderColor: colors.border.light }]}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>LinkedIn URL</Text>
            <TextInput
              value={linkedIn}
              onChangeText={setLinkedIn}
              placeholder="https://linkedin.com/in/yourprofile"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text.tertiary}
              style={[styles.urlInput, { color: colors.text.primary, borderColor: colors.border.light }]}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.actionBar, { backgroundColor: colors.background.primary, borderTopColor: colors.border.light }]}>
        <View style={styles.cancelButton}>
          <Button
            variant="outline"
            onPress={onCancel}
            title="Cancel"
            disabled={submitting}
          />
        </View>
        <View style={styles.submitButton}>
          <Button
            onPress={handleSubmit}
            title={submitting ? 'Submitting...' : 'Submit Application'}
            disabled={submitting || !resume || coverLetter.trim().length < 10}
            loading={submitting}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerCard: {
    padding: Spacing.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  sectionCard: {
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
  textArea: {
    minHeight: 150,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
    backgroundColor: Colors.background.primary,
  },
  charCount: {
    fontSize: 12,
    marginTop: Spacing.xs,
    textAlign: 'right',
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Platform.select({ ios: Spacing.lg, android: Spacing.xl }),
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  inputRow: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  urlInput: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
    backgroundColor: Colors.background.primary,
  },
});

