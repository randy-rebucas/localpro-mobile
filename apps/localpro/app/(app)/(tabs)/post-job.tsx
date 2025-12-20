import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';

export default function PostJobTabScreen() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time' as JobType,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    requirements: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jobTypes: { value: JobType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'full-time', label: 'Full-time', icon: 'briefcase-outline' },
    { value: 'part-time', label: 'Part-time', icon: 'time-outline' },
    { value: 'contract', label: 'Contract', icon: 'document-text-outline' },
    { value: 'freelance', label: 'Freelance', icon: 'laptop-outline' },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (formData.salaryMin && formData.salaryMax) {
      const min = parseFloat(formData.salaryMin);
      const max = parseFloat(formData.salaryMax);
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        newErrors.salary = 'Salary must be valid numbers';
      } else if (min > max) {
        newErrors.salary = 'Minimum salary cannot be greater than maximum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to post job
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        type: formData.type,
        salary: formData.salaryMin && formData.salaryMax ? {
          min: parseFloat(formData.salaryMin),
          max: parseFloat(formData.salaryMax),
          currency: formData.currency,
        } : undefined,
        requirements: formData.requirements
          .split('\n')
          .map(r => r.trim())
          .filter(r => r.length > 0),
      };

      console.log('Posting job:', jobData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        'Job posted successfully!',
        [{ text: 'OK', onPress: () => {
          // Reset form
          setFormData({
            title: '',
            description: '',
            company: '',
            location: '',
            type: 'full-time',
            salaryMin: '',
            salaryMax: '',
            currency: 'USD',
            requirements: '',
            expiresAt: '',
          });
        }}]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Post a Job</Text>
            <Text style={styles.subtitle}>Create a new job posting to find the perfect candidate</Text>

            {/* Job Details */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Job Details</Text>

              <Input
                label="Job Title *"
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g., Software Engineer"
                error={errors.title}
              />

              <Input
                label="Job Description *"
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Describe the role, responsibilities, and requirements..."
                multiline
                error={errors.description}
              />

              <Input
                label="Company Name *"
                value={formData.company}
                onChangeText={(text) => {
                  setFormData({ ...formData, company: text });
                  if (errors.company) setErrors({ ...errors, company: '' });
                }}
                placeholder="Your company name"
                error={errors.company}
              />

              <Input
                label="Location *"
                value={formData.location}
                onChangeText={(text) => {
                  setFormData({ ...formData, location: text });
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                placeholder="e.g., New York, NY or Remote"
                error={errors.location}
              />
            </Card>

            {/* Job Type */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Job Type *</Text>
              <View style={styles.jobTypesGrid}>
                {jobTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.jobTypeItem,
                      formData.type === type.value && [
                        styles.jobTypeItemActive,
                        { borderColor: colors.primary[600] },
                      ],
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.value })}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={formData.type === type.value ? colors.primary[600] : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.jobTypeText,
                        formData.type === type.value && { color: colors.primary[600] },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Salary */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Salary (Optional)</Text>
              <View style={styles.salaryRow}>
                <View style={styles.salaryInput}>
                  <Input
                    label="Min"
                    value={formData.salaryMin}
                    onChangeText={(text) => {
                      setFormData({ ...formData, salaryMin: text });
                      if (errors.salary) setErrors({ ...errors, salary: '' });
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.salaryInput}>
                  <Input
                    label="Max"
                    value={formData.salaryMax}
                    onChangeText={(text) => {
                      setFormData({ ...formData, salaryMax: text });
                      if (errors.salary) setErrors({ ...errors, salary: '' });
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.currencyContainer}>
                  <Text style={styles.currencyLabel}>Currency</Text>
                  <View style={styles.currencyButtons}>
                    {currencies.map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[
                          styles.currencyButton,
                          formData.currency === curr && [
                            styles.currencyButtonActive,
                            { backgroundColor: colors.primary[600] },
                          ],
                        ]}
                        onPress={() => setFormData({ ...formData, currency: curr })}
                      >
                        <Text
                          style={[
                            styles.currencyButtonText,
                            formData.currency === curr && { color: colors.text.inverse },
                          ]}
                        >
                          {curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              {errors.salary && (
                <Text style={styles.errorText}>{errors.salary}</Text>
              )}
            </Card>

            {/* Requirements */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Requirements (Optional)</Text>
              <Text style={styles.helperText}>Enter each requirement on a new line</Text>
              <Input
                value={formData.requirements}
                onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                placeholder="e.g., 3+ years of experience&#10;Bachelor's degree&#10;Proficiency in React"
                multiline
              />
            </Card>

            {/* Submit Button */}
            <View style={styles.submitButton}>
              <Button
                title="Post Job"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  jobTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  jobTypeItem: {
    width: '50%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    margin: Spacing.xs,
  },
  jobTypeItemActive: {
    backgroundColor: Colors.primary[50],
  },
  jobTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  salaryInput: {
    flex: 1,
  },
  currencyContainer: {
    width: 120,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  currencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  currencyButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.gray100,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  currencyButtonActive: {
    borderColor: Colors.primary[600],
  },
  currencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
    marginTop: -Spacing.md,
    marginBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});