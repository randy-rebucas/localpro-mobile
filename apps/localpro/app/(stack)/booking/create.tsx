import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
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
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

export default function CreateBookingScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [service, setService] = useState<any>(null);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    if (!serviceId) return;
    setLoadingService(true);
    try {
      const serviceData = await MarketplaceService.getService(serviceId);
      setService(serviceData);
    } catch (error: any) {
      console.error('Error loading service:', error);
      Alert.alert('Error', 'Failed to load service details');
      router.back();
    } finally {
      setLoadingService(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduledDate.trim()) {
      newErrors.scheduledDate = 'Date is required';
    }
    if (!formData.scheduledTime.trim()) {
      newErrors.scheduledTime = 'Time is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validateForm() || !service || !serviceId) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const bookingData = {
        serviceId,
        providerId: service.providerId,
        scheduledDate: scheduledDateTime,
        address: {
          street: formData.address,
          city: formData.city,
          coordinates: {
            lat: 0, // TODO: Get from location service
            lng: 0,
          },
        },
        notes: formData.notes.trim() || undefined,
      };

      const booking = await MarketplaceService.createBooking(bookingData);
      
      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => router.replace(`/(stack)/booking/${booking.id}`) },
      ]);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (loadingService) {
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
          <Text style={styles.errorText}>Service not found</Text>
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
          <Text style={styles.headerTitle}>Create Booking</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Service Info */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
              {service.description && (
                <Text style={styles.serviceDescription}>{service.description}</Text>
              )}
            </Card>

            {/* Booking Information */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Booking Information</Text>

              <Input
                label="Date *"
                value={formData.scheduledDate}
                onChangeText={(text) => {
                  setFormData({ ...formData, scheduledDate: text });
                  if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' });
                }}
                placeholder="YYYY-MM-DD"
                error={errors.scheduledDate}
              />

              <Input
                label="Time *"
                value={formData.scheduledTime}
                onChangeText={(text) => {
                  setFormData({ ...formData, scheduledTime: text });
                  if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' });
                }}
                placeholder="HH:MM"
                error={errors.scheduledTime}
              />

              <Input
                label="Address *"
                value={formData.address}
                onChangeText={(text) => {
                  setFormData({ ...formData, address: text });
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                placeholder="Street address"
                error={errors.address}
              />

              <Input
                label="City *"
                value={formData.city}
                onChangeText={(text) => {
                  setFormData({ ...formData, city: text });
                  if (errors.city) setErrors({ ...errors, city: '' });
                }}
                placeholder="City"
                error={errors.city}
              />

              <View style={styles.notesContainer}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { borderColor: colors.border.medium },
                  ]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Any special instructions or requirements..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </Card>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={[styles.footer, { backgroundColor: colors.background.primary }]}>
          <Button
            title="Create Booking"
            onPress={handleCreateBooking}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: Colors.semantic.error,
    marginBottom: Spacing.md,
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
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary[600],
    marginBottom: Spacing.sm,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  notesContainer: {
    marginTop: Spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
});

