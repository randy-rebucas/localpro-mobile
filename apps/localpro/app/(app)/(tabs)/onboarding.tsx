import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface OnboardingFormData {
  name: string;
  email: string;
  phone: string;
  website?: string;
  category: string;
  partnershipType: 'sponsor' | 'integration' | 'affiliate' | 'strategic' | '';
  description: string;
}

export default function OnboardingTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    partnershipType: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});

  const categories = ['Technology', 'Marketing', 'Finance', 'Services', 'Other'];
  const partnershipTypes = [
    { key: 'sponsor' as const, label: 'Sponsor', icon: 'star-outline' as const, description: 'Financial support and brand visibility' },
    { key: 'integration' as const, label: 'Integration', icon: 'link-outline' as const, description: 'Technical integration and API access' },
    { key: 'affiliate' as const, label: 'Affiliate', icon: 'people-outline' as const, description: 'Referral and commission-based partnership' },
    { key: 'strategic' as const, label: 'Strategic', icon: 'business-outline' as const, description: 'Long-term strategic collaboration' },
  ];

  const validateStep1 = (): boolean => {
    const newErrors: Partial<OnboardingFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<OnboardingFormData> = {};
    if (!formData.category) newErrors.category = '' as OnboardingFormData['category'];
    if (!formData.partnershipType) newErrors.partnershipType = '' as OnboardingFormData['partnershipType'];
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<OnboardingFormData> = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to submit onboarding request
      // await PartnersService.onboardPartner(formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      Alert.alert(
        'Success',
        'Partner onboarding request submitted successfully. We will review and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit onboarding request');
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipTypeColor = (type: OnboardingFormData['partnershipType']) => {
    switch (type) {
      case 'sponsor':
        return colors.primary[600];
      case 'integration':
        return colors.secondary[600];
      case 'affiliate':
        return colors.semantic.success;
      case 'strategic':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Onboard Partner</Text>
            <Text style={styles.subtitle}>Add a new partnership to your network</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      step >= stepNum && { backgroundColor: colors.primary[600] },
                    ]}
                  >
                    {step > stepNum ? (
                      <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                    ) : (
                      <Text
                        style={[
                          styles.progressNumber,
                          step >= stepNum && styles.progressNumberActive,
                        ]}
                      >
                        {stepNum}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.progressLabel,
                      step >= stepNum && styles.progressLabelActive,
                    ]}
                  >
                    {stepNum === 1 ? 'Contact' : stepNum === 2 ? 'Details' : 'Review'}
                  </Text>
                </View>
                {stepNum < 3 && (
                  <View
                    style={[
                      styles.progressLine,
                      step > stepNum && { backgroundColor: colors.primary[600] },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Step 1: Contact Information */}
          {step === 1 && (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Partner Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Enter partner name"
                  placeholderTextColor={colors.text.tertiary}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="partner@example.com"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(text) => setFormData({ ...formData, website: text })}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </Card>
          )}

          {/* Step 2: Partnership Details */}
          {step === 2 && (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Partnership Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.optionsGrid}>
                  {categories.map((category) => {
                    const isSelected = formData.category === category;
                    return (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.optionChip,
                          isSelected && [styles.optionChipActive, { backgroundColor: colors.primary[600] }],
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category });
                          if (errors.category) setErrors({ ...errors, category: undefined });
                        }}
                      >
                        <Text
                          style={[
                            styles.optionChipText,
                            isSelected && styles.optionChipTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Partnership Type *</Text>
                <View style={styles.partnershipTypesGrid}>
                  {partnershipTypes.map((type) => {
                    const isSelected = formData.partnershipType === type.key;
                    const typeColor = getPartnershipTypeColor(type.key);
                    return (
                      <TouchableOpacity
                        key={type.key}
                        style={[
                          styles.partnershipTypeCard,
                          isSelected && { borderColor: typeColor, borderWidth: 2 },
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, partnershipType: type.key });
                          if (errors.partnershipType) setErrors({ ...errors, partnershipType: undefined });
                        }}
                      >
                        <View style={[styles.partnershipTypeIcon, { backgroundColor: `${typeColor}15` }]}>
                          <Ionicons name={type.icon} size={24} color={typeColor} />
                        </View>
                        <Text style={styles.partnershipTypeLabel}>{type.label}</Text>
                        <Text style={styles.partnershipTypeDescription}>{type.description}</Text>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: typeColor }]}>
                            <Ionicons name="checkmark" size={12} color={colors.text.inverse} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.partnershipType && <Text style={styles.errorText}>{errors.partnershipType}</Text>}
              </View>
            </Card>
          )}

          {/* Step 3: Description */}
          {step === 3 && (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData({ ...formData, description: text });
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  placeholder="Describe the partnership, benefits, and goals..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              {/* Review Summary */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Review Summary</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Name:</Text>
                  <Text style={styles.reviewValue}>{formData.name}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Email:</Text>
                  <Text style={styles.reviewValue}>{formData.email}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Phone:</Text>
                  <Text style={styles.reviewValue}>{formData.phone}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Category:</Text>
                  <Text style={styles.reviewValue}>{formData.category}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Type:</Text>
                  <Text style={styles.reviewValue}>{formData.partnershipType}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonSecondary, { borderColor: colors.primary[600] }]}
                onPress={handleBack}
              >
                <Text style={[styles.navButtonText, { color: colors.primary[600] }]}>Back</Text>
              </TouchableOpacity>
            )}
            <Pressable
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>
                {step === 3 ? 'Submit' : 'Next'}
              </Text>
            </Pressable>
          </View>
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  progressNumberActive: {
    color: Colors.text.inverse,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  progressLabelActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border.light,
    marginHorizontal: Spacing.sm,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  textArea: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  optionChipActive: {
    borderWidth: 0,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  optionChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  partnershipTypesGrid: {
    gap: Spacing.md,
  },
  partnershipTypeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    position: 'relative',
  },
  partnershipTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  partnershipTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  partnershipTypeDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  navButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: Colors.primary[600],
  },
  navButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}

