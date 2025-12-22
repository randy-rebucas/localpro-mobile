import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import { Card, Input } from '@localpro/ui';
import { safeReverseGeocode } from '@localpro/utils/location';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BenefitsSelector,
  CategoryPickerSheet,
  ExperienceLevelSelector,
  JobTypeMultiSelect,
  LocationPicker,
  MultiStepForm,
  RequirementsBuilder,
  SalaryInput,
} from '../../../components/job-board';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useRoleContext } from '../../../contexts/RoleContext';
import { useThemeColors } from '../../../hooks/use-theme';

type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'temporary';
type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

interface JobFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  categoryId?: string;
  subcategory?: string;

  // Step 2: Company Info
  company: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  location: string;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  remote?: boolean;
  remoteType?: 'on_site' | 'remote' | 'hybrid';
  companyLogo?: { uri: string; type: string; name: string };

  // Step 3: Job Details
  type: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: string;
  salaryIsNegotiable?: boolean;
  salaryIsConfidential?: boolean;
  benefits: string[];

  // Step 4: Requirements
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  educationLevel?: string;
  educationField?: string;
  educationRequired?: boolean;
  experienceYears?: number;
  experienceDescription?: string;
  certifications: string[];
  languages: { language: string; proficiency: string }[];
  otherRequirements: string[];

  // Step 5: Application Process
  expiresAt?: string;
  startDate?: string;
  applicationMethod?: 'platform' | 'email' | 'url' | 'phone';
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;
  applicationInstructions?: string;
  
  // Additional
  tags: string[];
  visibility?: 'public' | 'private';
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'company', title: 'Company', icon: 'business-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'details', title: 'Job Details', icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'requirements', title: 'Requirements', icon: 'list-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'application', title: 'Application', icon: 'mail-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'review', title: 'Review', icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap },
];

const COMPANY_SIZES = [
  { value: 'small', label: '1-10' },
  { value: 'small', label: '11-50' },
  { value: 'medium', label: '51-200' },
  { value: 'medium', label: '201-500' },
  { value: 'large', label: '501-1000' },
  { value: 'enterprise', label: '1000+' },
];
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Construction',
  'Hospitality',
  'Other',
];

export default function PostJobTabScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const jobId = params.jobId && typeof params.jobId === 'string' ? params.jobId : undefined;
  const router = useRouter();
  const colors = useThemeColors();
  const { activeRole } = useRoleContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    categoryId: undefined,
    subcategory: 'No subcategory',
    company: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    location: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationCountry: '',
    remote: false,
    remoteType: 'on_site',
    type: 'full-time',
    experienceLevel: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    salaryCurrency: 'USD',
    salaryPeriod: 'year',
    salaryIsNegotiable: false,
    salaryIsConfidential: false,
    benefits: [],
    requirements: [],
    responsibilities: [],
    qualifications: [],
    skills: [],
    educationLevel: '',
    educationField: '',
    educationRequired: false,
    experienceYears: undefined,
    experienceDescription: '',
    certifications: [],
    languages: [],
    otherRequirements: [],
    expiresAt: '',
    startDate: '',
    applicationMethod: 'platform',
    contactEmail: '',
    contactPhone: '',
    applicationUrl: '',
    applicationInstructions: '',
    tags: [],
    visibility: 'public',
  });

  useEffect(() => {
    if (jobId) {
      loadJobForEdit();
    } else {
      // Auto-fill application deadline with current date for new jobs
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        expiresAt: prev.expiresAt || dateStr,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Fetch categories for display
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await JobBoardService.getCategories();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch {
        // Silently handle error
      }
    };
    fetchCategories();
  }, []);

  const loadJobForEdit = async () => {
    try {
      setLoading(true);
      const job = await JobBoardService.getJob(jobId!);
      if (job) {
        const jobData = job as any;
        // Handle both old structure (location at top level) and new structure (location nested in company)
        const companyObj = typeof jobData.company === 'object' ? jobData.company : {};
        const locationObj = companyObj.location || jobData.location || {};
        
        // Convert jobType from "full_time" to "full-time" format for form
        const jobType = jobData.jobType || job.type || 'full-time';
        const normalizedJobType = jobType.replace(/_/g, '-') as JobType;
        
        setFormData({
          title: job.title,
          description: job.description,
          categoryId: job.categoryId || jobData.category,
          subcategory: jobData.subcategory || '',
          company: companyObj.name || (typeof jobData.company === 'string' ? jobData.company : ''),
          companyWebsite: companyObj.website || '',
          companySize: companyObj.size || '',
          industry: companyObj.industry || '',
          location: locationObj.address || job.location || '',
          locationAddress: locationObj.address || job.location || '',
          locationCity: locationObj.city || '',
          locationState: locationObj.state || '',
          locationCountry: locationObj.country || '',
          locationLat: locationObj.coordinates?.lat || undefined,
          locationLng: locationObj.coordinates?.lng || undefined,
          remote: locationObj.isRemote || job.remote || false,
          remoteType: locationObj.remoteType || (locationObj.isRemote ? 'remote' : 'on_site'),
          type: normalizedJobType,
          experienceLevel: job.experienceLevel || jobData.experienceLevel,
          salaryMin: job.salary?.min || jobData.salary?.min,
          salaryMax: job.salary?.max || jobData.salary?.max,
          salaryCurrency: job.salary?.currency || jobData.salary?.currency || 'USD',
          salaryPeriod: job.salary?.period || jobData.salary?.period || 'year',
          salaryIsNegotiable: (job.salary as any)?.isNegotiable || jobData.salary?.isNegotiable || false,
          salaryIsConfidential: (job.salary as any)?.isConfidential || jobData.salary?.isConfidential || false,
          benefits: jobData.benefits || [],
          requirements: job.requirements || [],
          responsibilities: jobData.responsibilities || [],
          qualifications: jobData.qualifications || [],
          skills: jobData.requirements?.skills || [],
          educationLevel: jobData.requirements?.education?.level || '',
          educationField: jobData.requirements?.education?.field || '',
          educationRequired: jobData.requirements?.education?.isRequired || false,
          experienceYears: jobData.requirements?.experience?.years,
          experienceDescription: jobData.requirements?.experience?.description || '',
          certifications: jobData.requirements?.certifications || [],
          languages: jobData.requirements?.languages || [],
          otherRequirements: jobData.requirements?.other || [],
          expiresAt: jobData.applicationProcess?.deadline ? new Date(jobData.applicationProcess.deadline).toISOString().split('T')[0] : '',
          startDate: jobData.applicationProcess?.startDate ? new Date(jobData.applicationProcess.startDate).toISOString().split('T')[0] : '',
          applicationMethod: jobData.applicationProcess?.applicationMethod || 'platform',
          contactEmail: jobData.applicationProcess?.contactEmail || '',
          contactPhone: jobData.applicationProcess?.contactPhone || '',
          applicationUrl: jobData.applicationProcess?.applicationUrl || '',
          applicationInstructions: jobData.applicationProcess?.instructions || '',
          tags: jobData.tags || [],
          visibility: jobData.visibility || 'public',
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.description.trim()) newErrors.description = 'Job description is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        break;
      case 1: // Company Info
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 2: // Job Details
        if (formData.salaryMin && formData.salaryMax) {
          if (formData.salaryMin > formData.salaryMax) {
            newErrors.salary = 'Minimum salary cannot be greater than maximum';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepChange = (step: number) => {
    if (step > currentStep && !validateStep(currentStep)) {
      return;
    }
    setCurrentStep(step);
    setErrors({});
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const jobData = buildJobData('draft');
      if (jobId) {
        await JobBoardService.updateJob(jobId, jobData);
        Alert.alert('Success', 'Draft saved successfully');
      } else {
        await JobBoardService.createJob(jobData);
        Alert.alert('Success', 'Draft saved successfully');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(currentStep)) {
      Alert.alert('Validation Error', 'Please complete all required fields');
      return;
    }

    // Validate all steps
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        Alert.alert('Validation Error', 'Please complete all required fields');
        return;
      }
    }

    try {
      setLoading(true);
      const jobData = buildJobData('open');
      let createdJobId: string;

      if (jobId) {
        const updated = await JobBoardService.updateJob(jobId, jobData);
        createdJobId = updated.id;
      } else {
        const created = await JobBoardService.createJob(jobData);
        createdJobId = created.id;
      }

      Alert.alert('Success', 'Job posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace(`/(stack)/job/${createdJobId}` as any);
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  // Map human-readable benefit names to enum values
  const mapBenefitToEnum = (benefit: string): string => {
    const benefitMap: Record<string, string> = {
      'Health Insurance': 'health_insurance',
      'Dental Insurance': 'dental_insurance',
      'Vision Insurance': 'vision_insurance',
      'Life Insurance': 'life_insurance',
      '401(k) Matching': 'retirement_401k',
      'Paid Time Off': 'paid_time_off',
      'Sick Leave': 'sick_leave',
      'Maternity Leave': 'maternity_leave',
      'Paternity Leave': 'paternity_leave',
      'Remote Work': 'remote_work',
      'Flexible Hours': 'flexible_schedule',
      'Flexible Schedule': 'flexible_schedule',
      'Professional Development': 'professional_development',
      'Tuition Reimbursement': 'tuition_reimbursement',
      'Stock Options': 'stock_options',
      'Gym Membership': 'gym_membership',
      'Free Meals': 'meal_allowance',
      'Meal Allowance': 'meal_allowance',
      'Transportation Allowance': 'transportation_allowance',
    };

    // If already in enum format, return as is
    if (benefit.includes('_')) {
      return benefit;
    }

    // Map human-readable to enum, or convert to snake_case if not in map
    return benefitMap[benefit] || benefit.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
  };

  const buildJobData = (status: 'draft' | 'open'): any => {
    // Build location object (nested inside company)
    const location: any = {
      address: formData.locationAddress || formData.location.trim(),
      city: formData.locationCity || undefined,
      state: formData.locationState || undefined,
      country: formData.locationCountry || undefined,
      isRemote: formData.remote || false,
    };

    if (formData.locationLat && formData.locationLng) {
      location.coordinates = {
        lat: formData.locationLat,
        lng: formData.locationLng,
      };
    }

    // Build company object with nested location
    const company: any = {
      name: formData.company.trim(),
      website: formData.companyWebsite || undefined,
      size: formData.companySize || undefined,
      industry: formData.industry || undefined,
      location: Object.keys(location).length > 1 || location.address ? location : undefined,
    };

    // Convert jobType from "full-time" to "full_time" format for API
    const jobType = formData.type.replace(/-/g, '_');

    // Convert salary period to API enum values
    // Form uses: hour, day, week, month, year
    // API expects: hourly, daily, weekly, monthly, yearly
    const periodMap: Record<string, string> = {
      'hour': 'hourly',
      'day': 'daily',
      'week': 'weekly',
      'month': 'monthly',
      'year': 'yearly',
    };
    const salaryPeriod = periodMap[formData.salaryPeriod] || formData.salaryPeriod;

    // Build salary object
    const salary = formData.salaryMin && formData.salaryMax
      ? {
          min: formData.salaryMin,
          max: formData.salaryMax,
          currency: formData.salaryCurrency,
          period: salaryPeriod,
          isNegotiable: formData.salaryIsNegotiable || false,
          isConfidential: formData.salaryIsConfidential || false,
        }
      : undefined;

    // Build requirements object
    const requirements: any = {
      skills: formData.skills.length > 0 ? formData.skills : undefined,
      other: formData.otherRequirements.length > 0 ? formData.otherRequirements : undefined,
      certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
      languages: formData.languages.length > 0 ? formData.languages : undefined,
    };

    if (formData.educationLevel) {
      requirements.education = {
        level: formData.educationLevel,
        field: formData.educationField || undefined,
        isRequired: formData.educationRequired || false,
      };
    }

    if (formData.experienceYears !== undefined) {
      requirements.experience = {
        years: formData.experienceYears,
        description: formData.experienceDescription || undefined,
      };
    }

    // Build application process object
    const applicationProcess: any = {
      applicationMethod: formData.applicationMethod || 'platform',
    };

    if (formData.expiresAt) {
      applicationProcess.deadline = new Date(formData.expiresAt).toISOString();
    }
    if (formData.startDate) {
      applicationProcess.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.contactEmail) {
      applicationProcess.contactEmail = formData.contactEmail;
    }
    if (formData.contactPhone) {
      applicationProcess.contactPhone = formData.contactPhone;
    }
    if (formData.applicationUrl) {
      applicationProcess.applicationUrl = formData.applicationUrl;
    }
    if (formData.applicationInstructions) {
      applicationProcess.instructions = formData.applicationInstructions;
    }

    // Build the payload matching the exact API structure
    const payload: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.categoryId, // Category ID
      subcategory: formData.subcategory || 'No subcategory',
      jobType, // Already converted to underscore format (e.g., "full_time")
      experienceLevel: formData.experienceLevel,
      company,
      salary,
      benefits: formData.benefits.length > 0 
        ? formData.benefits.map(mapBenefitToEnum) 
        : undefined,
      requirements: Object.keys(requirements).length > 0 ? requirements : undefined,
      applicationProcess,
      status: status === 'open' ? 'active' : 'draft',
    };

    // Only include optional fields if they have values (to match payload structure)
    if (formData.responsibilities.length > 0) {
      payload.responsibilities = formData.responsibilities;
    }
    if (formData.qualifications.length > 0) {
      payload.qualifications = formData.qualifications;
    }
    if (formData.tags.length > 0) {
      payload.tags = formData.tags;
    }
    if (formData.visibility && formData.visibility !== 'public') {
      payload.visibility = formData.visibility;
    }

    return payload;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Input
                label="Job Title *"
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g., Senior Software Engineer"
                error={errors.title}
              />

              <Input
                label="Job Description *"
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                multiline
                error={errors.description}
              />

              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>
                  Category <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: errors.categoryId ? Colors.semantic.error[600] : colors.border.light,
                    },
                  ]}
                  onPress={() => {
                    setCategorySheetVisible(true);
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: formData.categoryId
                          ? colors.text.primary
                          : colors.text.tertiary,
                      },
                    ]}
                  >
                    {formData.categoryId
                      ? categories.find((c) => c.id === formData.categoryId)?.name || 'Select category'
                      : 'Select category'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
                {errors.categoryId && (
                  <Text style={styles.errorText}>{errors.categoryId}</Text>
                )}
              </View>
            </Card>
          </ScrollView>
        );

      case 1: // Company Info
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
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
                label="Company Website"
                value={formData.companyWebsite || ''}
                onChangeText={(text) => setFormData({ ...formData, companyWebsite: text })}
                placeholder="https://www.example.com"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Company Size</Text>
                  <View style={styles.chipContainer}>
                    {COMPANY_SIZES.map((size) => (
                      <TouchableOpacity
                        key={size.value + size.label}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              formData.companySize === size.value ? colors.primary[600] : colors.background.secondary,
                            borderColor:
                              formData.companySize === size.value ? colors.primary[600] : colors.border.light,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, companySize: size.value })}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                formData.companySize === size.value ? Colors.text.inverse : colors.text.secondary,
                            },
                          ]}
                        >
                          {size.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Industry</Text>
                  <View style={styles.chipContainer}>
                    {INDUSTRIES.slice(0, 4).map((industry) => (
                      <TouchableOpacity
                        key={industry}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              formData.industry === industry ? colors.primary[600] : colors.background.secondary,
                            borderColor:
                              formData.industry === industry ? colors.primary[600] : colors.border.light,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, industry })}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color:
                                formData.industry === industry ? Colors.text.inverse : colors.text.secondary,
                            },
                          ]}
                        >
                          {industry}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>Location *</Text>
                
                <TouchableOpacity
                  style={[styles.useCurrentLocationButton, { borderColor: colors.border.light, backgroundColor: colors.background.secondary }]}
                  onPress={async () => {
                    try {
                      const { status } = await Location.requestForegroundPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert(
                          'Permission Required',
                          'Location permission is required to use your current location. Please enable it in your device settings.'
                        );
                        return;
                      }

                      const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                      });

                      const { latitude, longitude } = location.coords;

                      // Reverse geocode to get address details
                      const reverseGeocode = await safeReverseGeocode(latitude, longitude);
                      
                      if (reverseGeocode && reverseGeocode.length > 0) {
                        const address = reverseGeocode[0];
                        const street = address.street || '';
                        const city = address.city || address.district || address.subregion || '';
                        const state = address.region || '';
                        const country = address.country || '';
                        const fullAddress = [street, city, state, country].filter(Boolean).join(', ');

                        setFormData({
                          ...formData,
                          location: fullAddress || 'Current Location',
                          locationAddress: street || fullAddress,
                          locationCity: city,
                          locationState: state,
                          locationCountry: country,
                          locationLat: latitude,
                          locationLng: longitude,
                        });
                        if (errors.location) setErrors({ ...errors, location: '' });
                      } else {
                        setFormData({
                          ...formData,
                          location: 'Current Location',
                          locationLat: latitude,
                          locationLng: longitude,
                        });
                      }
                    } catch {
                      Alert.alert('Error', 'Failed to get your location. Please try again.');
                    }
                  }}
                  activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                >
                  <Ionicons name="locate-outline" size={20} color={colors.primary[600]} />
                  <Text style={[styles.useCurrentLocationText, { color: colors.primary[600] }]}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>

                <Input
                  label="Address"
                  value={formData.locationAddress || ''}
                  onChangeText={(text) => {
                    setFormData({ ...formData, locationAddress: text });
                    if (!formData.location) {
                      setFormData({ ...formData, location: text, locationAddress: text });
                    }
                  }}
                  placeholder="Street address"
                />

                <View style={styles.locationRow}>
                  <View style={styles.halfWidth}>
                    <Input
                      label="City"
                      value={formData.locationCity || ''}
                      onChangeText={(text) => setFormData({ ...formData, locationCity: text })}
                      placeholder="City"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label="State"
                      value={formData.locationState || ''}
                      onChangeText={(text) => setFormData({ ...formData, locationState: text })}
                      placeholder="State/Province"
                    />
                  </View>
                </View>

                <Input
                  label="Country"
                  value={formData.locationCountry || ''}
                  onChangeText={(text) => setFormData({ ...formData, locationCountry: text })}
                  placeholder="Country"
                />

                <LocationPicker
                  location={formData.location}
                  onLocationChange={(location?: string) => {
                    setFormData({ ...formData, location: location || '' });
                    if (errors.location) setErrors({ ...errors, location: '' });
                  }}
                  onRadiusChange={() => {}}
                  onLocationDetailsChange={(details) => {
                    setFormData({
                      ...formData,
                      locationAddress: details.address || formData.locationAddress,
                      locationCity: details.city || formData.locationCity,
                      locationState: details.state || formData.locationState,
                      locationCountry: details.country || formData.locationCountry,
                      locationLat: details.lat,
                      locationLng: details.lng,
                    });
                  }}
                />
              </View>
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </Card>
          </ScrollView>
        );

      case 2: // Job Details
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Job Type *</Text>
              <JobTypeMultiSelect
                selectedTypes={formData.type ? [formData.type] : []}
                onSelectionChange={(types: string[]) => {
                  if (types.length > 0) {
                    setFormData({ ...formData, type: types[0] as JobType });
                  } else {
                    // If deselected, set to default
                    setFormData({ ...formData, type: 'full-time' });
                  }
                }}
              />

              <ExperienceLevelSelector
                selectedLevel={formData.experienceLevel}
                onLevelChange={(level?: string) =>
                  setFormData({ ...formData, experienceLevel: level as ExperienceLevel })
                }
              />

              <SalaryInput
                min={formData.salaryMin}
                max={formData.salaryMax}
                currency={formData.salaryCurrency}
                period={formData.salaryPeriod}
                onMinChange={(min?: number) => {
                  setFormData({ ...formData, salaryMin: min });
                  if (errors.salary) setErrors({ ...errors, salary: '' });
                }}
                onMaxChange={(max?: number) => {
                  setFormData({ ...formData, salaryMax: max });
                  if (errors.salary) setErrors({ ...errors, salary: '' });
                }}
                onCurrencyChange={(currency: string) => setFormData({ ...formData, salaryCurrency: currency })}
                onPeriodChange={(period: string) => setFormData({ ...formData, salaryPeriod: period })}
                error={errors.salary}
              />

              <BenefitsSelector
                benefits={formData.benefits}
                onBenefitsChange={(benefits: string[]) => setFormData({ ...formData, benefits })}
              />
            </Card>
          </ScrollView>
        );

      case 3: // Requirements
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <RequirementsBuilder
                requirements={formData.requirements}
                onRequirementsChange={(requirements: string[]) => setFormData({ ...formData, requirements })}
              />
            </Card>
          </ScrollView>
        );

      case 4: // Application Process
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Input
                label="Application Deadline"
                value={formData.expiresAt || ''}
                onChangeText={(text) => setFormData({ ...formData, expiresAt: text })}
                placeholder="YYYY-MM-DD"
              />
              <TouchableOpacity
                style={[styles.quickDateButton, { borderColor: colors.border.light }]}
                onPress={() => {
                  const today = new Date();
                  const dateStr = today.toISOString().split('T')[0];
                  setFormData({ ...formData, expiresAt: dateStr });
                }}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.quickDateButtonText, { color: colors.primary[600] }]}>
                  Use Today&apos;s Date
                </Text>
              </TouchableOpacity>

              <View style={styles.startDateContainer}>
                <Input
                  label="Expected Start Date"
                  value={formData.startDate || ''}
                  onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  placeholder="YYYY-MM-DD"
                />
                <Text style={[styles.quickDateLabel, { color: colors.text.tertiary }]}>
                  Quick Options
                </Text>
                <View style={styles.quickDateOptions}>
                  {[
                    { label: '1 Week', days: 7 },
                    { label: '2 Weeks', days: 14 },
                    { label: '3 Weeks', days: 21 },
                    { label: '1 Month', days: 30 },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.quickDateOption,
                        {
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.light,
                        },
                      ]}
                      onPress={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + option.days);
                        const dateStr = date.toISOString().split('T')[0];
                        setFormData({ ...formData, startDate: dateStr });
                      }}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Text style={[styles.quickDateOptionText, { color: colors.text.primary }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Contact Email"
                value={formData.contactEmail || ''}
                onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                placeholder="hr@company.com"
                keyboardType="email-address"
              />

              <Input
                label="Contact Phone"
                value={formData.contactPhone || ''}
                onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
              />

              <Input
                label="Application Instructions"
                value={formData.applicationInstructions || ''}
                onChangeText={(text) => setFormData({ ...formData, applicationInstructions: text })}
                placeholder="Any special instructions for applicants..."
                multiline
              />
            </Card>
          </ScrollView>
        );

      case 5: // Review
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.card}>
              <Text style={styles.reviewTitle}>Review Your Job Posting</Text>
              <Text style={styles.reviewSubtitle}>Please review all information before publishing</Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Job Title</Text>
                <Text style={[styles.reviewValue, { color: colors.text.primary }]}>{formData.title}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Company</Text>
                <Text style={[styles.reviewValue, { color: colors.text.primary }]}>{formData.company}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Location</Text>
                <Text style={[styles.reviewValue, { color: colors.text.primary }]}>
                  {formData.location} {formData.remote && '(Remote)'}
                </Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Job Type</Text>
                <Text style={[styles.reviewValue, { color: colors.text.primary }]}>
                  {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                </Text>
              </View>

              {formData.salaryMin && formData.salaryMax && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Salary</Text>
                  <Text style={[styles.reviewValue, { color: colors.text.primary }]}>
                    {formData.salaryCurrency}
                    {formData.salaryMin.toLocaleString()} - {formData.salaryCurrency}
                    {formData.salaryMax.toLocaleString()} / {formData.salaryPeriod}
                  </Text>
                </View>
              )}

              {formData.benefits.length > 0 && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Benefits</Text>
                  <Text style={[styles.reviewValue, { color: colors.text.primary }]}>
                    {formData.benefits.join(', ')}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.previewButton, { borderColor: colors.border.light }]}
                onPress={() => setPreviewVisible(true)}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="eye-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.previewButtonText, { color: colors.primary[600] }]}>Preview Job</Text>
              </TouchableOpacity>
            </Card>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  // Check if user has permission to post jobs
  if (activeRole !== 'provider' && activeRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background.secondary }]} edges={['bottom']}>
        <View style={styles.restrictedContainer}>
          <View style={styles.restrictedContent}>
            <View style={[styles.restrictedIconContainer, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="lock-closed-outline" size={48} color={colors.primary[600]} />
            </View>
            <Text style={[styles.restrictedTitle, { color: colors.text.primary }]}>
              Access Restricted
            </Text>
            <Text style={[styles.restrictedSubtitle, { color: colors.text.secondary }]}>
              Only providers and administrators can post jobs on this platform.
            </Text>
            <View style={styles.contactSection}>
              <Text style={[styles.contactLabel, { color: colors.text.tertiary }]}>
                Need access? Contact us:
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // You can add email functionality here if needed
                }}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text style={[styles.contactEmail, { color: colors.primary[600] }]}>
                  admin@localpro.asia
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <MultiStepForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          showProgress={true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{jobId ? 'Edit Job' : 'Post a Job'}</Text>
            <Text style={styles.subtitle}>
              {jobId ? 'Update your job posting' : 'Create a new job posting to find the perfect candidate'}
            </Text>
          </View>

          {renderStepContent()}

          {currentStep === STEPS.length - 1 && (
            <View style={[styles.actionBar, { borderTopColor: colors.border.light }]}>
              <TouchableOpacity
                style={[styles.draftButton, { borderColor: colors.border.light }]}
                onPress={handleSaveDraft}
                disabled={savingDraft}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                {savingDraft ? (
                  <Text style={[styles.draftButtonText, { color: colors.text.secondary }]}>Saving...</Text>
                ) : (
                  <Text style={[styles.draftButtonText, { color: colors.text.secondary }]}>Save Draft</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.publishButton, { backgroundColor: colors.primary[600] }]}
                onPress={handlePublish}
                disabled={loading}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                {loading ? (
                  <Text style={styles.publishButtonText}>Publishing...</Text>
                ) : (
                  <Text style={styles.publishButtonText}>Publish Job</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </MultiStepForm>
      </KeyboardAvoidingView>

      {/* Category Picker Sheet */}
      <CategoryPickerSheet
        visible={categorySheetVisible}
        selectedCategoryId={formData.categoryId}
        onSelectCategory={(id?: string) => {
          setFormData({ ...formData, categoryId: id });
          if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
        }}
        onClose={() => setCategorySheetVisible(false)}
        required
      />

      {/* Preview Modal */}
      <Modal visible={previewVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Preview</Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.previewContent}>
            <Card style={styles.previewCard}>
              <Text style={styles.previewJobTitle}>{formData.title}</Text>
              <Text style={[styles.previewCompany, { color: colors.text.secondary }]}>{formData.company}</Text>
              <Text style={[styles.previewLocation, { color: colors.text.tertiary }]}>
                {formData.location} {formData.remote && '• Remote'}
              </Text>
              <Text style={[styles.previewDescription, { color: colors.text.secondary }]}>
                {formData.description}
              </Text>
              {formData.requirements.length > 0 && (
                <View style={styles.previewRequirements}>
                  <Text style={styles.previewSectionTitle}>Requirements</Text>
                  {formData.requirements.map((req, index) => (
                    <Text key={index} style={[styles.previewRequirement, { color: colors.text.secondary }]}>
                      • {req}
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  stepContent: {
    flex: 1,
  },
  card: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
    borderRadius: BorderRadius.full,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  chipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error[600],
    marginTop: -Spacing.md,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  categoryContainer: {
    marginVertical: Spacing.sm,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  required: {
    color: Colors.semantic.error[600],
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  categoryButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  draftButton: {
    flex: 1,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  publishButton: {
    flex: 2,
    paddingVertical: Platform.select({ ios: 12, android: 14 }),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  reviewSection: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reviewSectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  reviewValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginTop: Spacing.md,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  previewContent: {
    flex: 1,
  },
  previewCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
  },
  previewJobTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  previewCompany: {
    fontSize: 18,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  previewLocation: {
    fontSize: 14,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  previewRequirements: {
    marginTop: Spacing.md,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  previewRequirement: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  quickDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  quickDateButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  startDateContainer: {
    marginTop: Spacing.md,
  },
  quickDateLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  quickDateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quickDateOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: 8, android: 10 }),
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
  },
  quickDateOptionText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  locationSection: {
    marginVertical: Spacing.sm,
  },
  useCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginBottom: Spacing.md,
  },
  useCurrentLocationText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  locationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  restrictedContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  restrictedIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  restrictedSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  contactSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  contactLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});
