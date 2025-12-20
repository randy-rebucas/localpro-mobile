import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService, useService } from '@localpro/marketplace';
import { Button, Card, Input } from '@localpro/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoUpload } from '../../../../components/marketplace';
import { BorderRadius, Colors, Spacing } from '../../../../constants/theme';
import { useThemeColors } from '../../../../hooks/use-theme';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const categories: Category[] = [
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
  { id: 'landscaping', name: 'Landscaping', icon: 'leaf-outline' },
  { id: 'painting', name: 'Painting', icon: 'brush-outline' },
  { id: 'handyman', name: 'Handyman', icon: 'construct-outline' },
];

const durationOptions = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
];

const radiusOptions = [5, 10, 15, 20, 25, 30, 50];

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { service, loading: serviceLoading } = useService(id as string);
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: 60,
    serviceArea: {
      cities: [] as string[],
      radius: 25,
    },
    images: [] as string[],
    status: 'draft' as 'draft' | 'published',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cityInput, setCityInput] = useState('');

  // Load service data when available
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        duration: 60, // Default, as duration is not in Service type
        serviceArea: {
          cities: [], // Default, as serviceArea is not in Service type
          radius: 25,
        },
        images: service.images || [],
        status: 'published', // Default
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Title Required', 'Please enter a service title first to generate a description.');
      return;
    }

    setGeneratingDescription(true);
    try {
      const prompt = `Generate a professional service description for: ${formData.title}`;
      const generatedDescription = await MarketplaceService.generateDescription(prompt);
      
      if (generatedDescription) {
        setFormData({ ...formData, description: generatedDescription });
        Alert.alert('Success', 'Description generated successfully!');
      } else {
        Alert.alert('Error', 'Could not generate description. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating description:', error);
      Alert.alert('Error', error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleAddCity = () => {
    const city = cityInput.trim();
    if (city && !formData.serviceArea.cities.includes(city)) {
      setFormData({
        ...formData,
        serviceArea: {
          ...formData.serviceArea,
          cities: [...formData.serviceArea.cities, city],
        },
      });
      setCityInput('');
    }
  };

  const handleRemoveCity = (city: string) => {
    setFormData({
      ...formData,
      serviceArea: {
        ...formData.serviceArea,
        cities: formData.serviceArea.cities.filter((c) => c !== city),
      },
    });
  };

  const handleSaveDraft = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        duration: formData.duration,
        serviceArea: formData.serviceArea,
        images: formData.images,
        status: 'draft' as const,
      };

      await MarketplaceService.updateService(id as string, serviceData);
      
      // Upload images if any
      if (formData.images.length > 0) {
        await MarketplaceService.uploadServiceImages(id as string, formData.images);
      }

      Alert.alert('Success', 'Service saved as draft!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        duration: formData.duration,
        serviceArea: formData.serviceArea,
        images: formData.images,
        status: 'published' as const,
      };

      await MarketplaceService.updateService(id as string, serviceData);
      
      // Upload images if any
      if (formData.images.length > 0) {
        await MarketplaceService.uploadServiceImages(id as string, formData.images);
      }

      Alert.alert('Success', 'Service updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating service:', error);
      Alert.alert('Error', error.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  if (serviceLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.semantic.error} />
          <Text style={styles.loadingText}>Service not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="primary" />
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Basic Information */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <Input
                label="Service Title *"
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g., Professional House Cleaning"
                error={errors.title}
              />

              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionHeader}>
                  <Text style={styles.label}>Description *</Text>
                  <TouchableOpacity
                    onPress={handleGenerateDescription}
                    disabled={generatingDescription}
                    style={styles.aiButton}
                  >
                    {generatingDescription ? (
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    ) : (
                      <Ionicons name="sparkles" size={16} color={colors.primary[600]} />
                    )}
                    <Text style={[styles.aiButtonText, { color: colors.primary[600] }]}>
                      {generatingDescription ? 'Generating...' : 'AI Generate'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError,
                    { borderColor: colors.border.medium },
                  ]}
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData({ ...formData, description: text });
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Describe your service in detail..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={styles.categoryContainer}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryRow}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          formData.category === category.id && {
                            backgroundColor: colors.primary[600],
                          },
                          { borderColor: colors.border.medium },
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category: category.id });
                          if (errors.category) setErrors({ ...errors, category: '' });
                        }}
                      >
                        <Ionicons
                          name={category.icon}
                          size={16}
                          color={
                            formData.category === category.id
                              ? Colors.text.inverse
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            formData.category === category.id && { color: Colors.text.inverse },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>
            </Card>

            {/* Pricing & Duration */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Pricing & Duration</Text>

              <Input
                label="Price (USD) *"
                value={formData.price}
                onChangeText={(text) => {
                  setFormData({ ...formData, price: text });
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                placeholder="0.00"
                keyboardType="numeric"
                error={errors.price}
              />

              <View style={styles.durationContainer}>
                <Text style={styles.label}>Duration *</Text>
                <View style={styles.durationRow}>
                  {durationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.durationChip,
                        formData.duration === option.value && {
                          backgroundColor: colors.primary[600],
                        },
                        { borderColor: colors.border.medium },
                      ]}
                      onPress={() => setFormData({ ...formData, duration: option.value })}
                    >
                      <Text
                        style={[
                          styles.durationChipText,
                          formData.duration === option.value && { color: Colors.text.inverse },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            {/* Service Area */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Service Area</Text>

              <View style={styles.radiusContainer}>
                <Text style={styles.label}>Service Radius (miles)</Text>
                <View style={styles.radiusRow}>
                  {radiusOptions.map((radius) => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusChip,
                        formData.serviceArea.radius === radius && {
                          backgroundColor: colors.primary[600],
                        },
                        { borderColor: colors.border.medium },
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          serviceArea: { ...formData.serviceArea, radius },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.radiusChipText,
                          formData.serviceArea.radius === radius && { color: Colors.text.inverse },
                        ]}
                      >
                        {radius} mi
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.citiesContainer}>
                <Text style={styles.label}>Cities</Text>
                <View style={styles.cityInputRow}>
                  <TextInput
                    style={[styles.cityInput, { borderColor: colors.border.medium }]}
                    value={cityInput}
                    onChangeText={setCityInput}
                    placeholder="Enter city name"
                    placeholderTextColor={colors.text.tertiary}
                    onSubmitEditing={handleAddCity}
                  />
                  <TouchableOpacity
                    style={[styles.addCityButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleAddCity}
                  >
                    <Ionicons name="add" size={20} color={Colors.text.inverse} />
                  </TouchableOpacity>
                </View>
                {formData.serviceArea.cities.length > 0 && (
                  <View style={styles.citiesList}>
                    {formData.serviceArea.cities.map((city) => (
                      <View key={city} style={styles.cityTag}>
                        <Text style={styles.cityTagText}>{city}</Text>
                        <TouchableOpacity onPress={() => handleRemoveCity(city)}>
                          <Ionicons name="close" size={16} color={colors.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Card>

            {/* Images */}
            <Card style={styles.card}>
              <PhotoUpload
                onPhotosSelected={(photos) => {
                  setFormData({ ...formData, images: photos });
                  if (errors.images) setErrors({ ...errors, images: '' });
                }}
                maxPhotos={10}
                existingPhotos={formData.images}
              />
              {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
            </Card>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { backgroundColor: colors.background.primary }]}>
          <Button
            title="Save Draft"
            onPress={handleSaveDraft}
            variant="outline"
            loading={loading}
            disabled={loading}
          />
          <Button
            title="Update"
            onPress={handlePublish}
            variant="primary"
            loading={loading}
            disabled={loading}
          />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  errorText: {
    color: Colors.semantic.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  categoryContainer: {
    marginTop: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  durationContainer: {
    marginTop: Spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  durationChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  radiusContainer: {
    marginBottom: Spacing.lg,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  citiesContainer: {
    marginTop: Spacing.md,
  },
  cityInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
  },
  addCityButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    gap: Spacing.xs,
  },
  cityTagText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
});

