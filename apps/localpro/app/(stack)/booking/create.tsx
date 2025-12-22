import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import { Button, Card, Input } from '@localpro/ui';
import { safeReverseGeocode } from '@localpro/utils/location';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

function CreateBookingScreenContent() {
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
    state: '',
    zipCode: '',
    country: '',
    duration: '',
    specialInstructions: '',
    paymentMethod: 'paymongo', // Default to PayMongo
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  // const [errorDetails, setErrorDetails] = useState<any>(null); // Reserved for future use

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const loadService = async () => {
    if (!serviceId) return;
    setLoadingService(true);
    setApiError(null);
    try {
      const serviceData = await MarketplaceService.getService(serviceId);
      if (!serviceData) {
        throw new Error('Service not found');
      }
      setService(serviceData);
    } catch (error: any) {
      handleError(error, 'loading service');
    } finally {
      setLoadingService(false);
    }
  };

  // Generate time slots based on service availability
  const timeSlots = useMemo(() => {
    if (!service?.availability?.schedule || !selectedDate) {
      return [];
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDayName = dayNames[selectedDate.getDay()];
    
    // Find availability for the selected day
    const daySchedule = service.availability.schedule.find(
      (s: { day: string; isAvailable: boolean }) => s.day.toLowerCase() === selectedDayName && s.isAvailable
    );

    if (!daySchedule) {
      return [];
    }

    // Parse start and end times
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    
    const slots: string[] = [];
    const slotInterval = 30; // 30-minute intervals
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMin += slotInterval;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  }, [service, selectedDate]);

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
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip/Postal code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    setFormData({ ...formData, scheduledDate: dateString, scheduledTime: '' });
    if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' });
    setShowDatePicker(false);
  };

  const handleTimeSlotSelect = (time: string) => {
    setFormData({ ...formData, scheduledTime: time });
    if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' });
  };

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location. Please enable it in your device settings.'
        );
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setAddressCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocode to get address with rate limit handling
      const reverseGeocode = await safeReverseGeocode(latitude, longitude);

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        
        // Build formatted address string
        let formattedAddress = '';
        const addressParts: string[] = [];
        
        // Street number and name
        if (addressData.streetNumber && addressData.street) {
          addressParts.push(`${addressData.streetNumber} ${addressData.street}`);
        } else if (addressData.streetNumber) {
          addressParts.push(addressData.streetNumber);
        } else if (addressData.street) {
          addressParts.push(addressData.street);
        }
        
        // City
        if (addressData.city) {
          addressParts.push(addressData.city);
        } else if (addressData.district) {
          addressParts.push(addressData.district);
        }
        
        // State/Region
        if (addressData.region) {
          addressParts.push(addressData.region);
        } else if (addressData.subregion) {
          addressParts.push(addressData.subregion);
        }
        
        // Postal code
        if (addressData.postalCode) {
          addressParts.push(addressData.postalCode);
        }
        
        formattedAddress = addressParts.join(', ');
        
        // Update form data with complete address information
        setFormData({
          ...formData,
          address: formattedAddress,
          city: addressData.city || addressData.district || '',
          state: addressData.region || addressData.subregion || '',
          zipCode: addressData.postalCode || '',
          country: addressData.country || '',
        });
        
        // Clear errors for all address fields
        const updatedErrors = { ...errors };
        if (updatedErrors.address) updatedErrors.address = '';
        if (updatedErrors.city) updatedErrors.city = '';
        if (updatedErrors.state) updatedErrors.state = '';
        if (updatedErrors.zipCode) updatedErrors.zipCode = '';
        if (updatedErrors.country) updatedErrors.country = '';
        setErrors(updatedErrors);
      } else {
        // If reverse geocode fails, still update coordinates
        setFormData({
          ...formData,
          address: 'Current Location',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error || '');
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        Alert.alert(
          'Rate Limit Exceeded',
          'Location coordinates updated, but address lookup is temporarily unavailable. Please try again later.'
        );
      } else {
        Alert.alert('Error', 'Failed to get your location. Please try again.');
        console.error('Location error:', error);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleAddressChange = (text: string) => {
    setFormData({ ...formData, address: text });
    if (errors.address) setErrors({ ...errors, address: '' });
    
    // Simple autocomplete suggestions based on common patterns
    // In a production app, you'd use Google Places API or similar
    if (text.length > 2) {
      // Generate simple suggestions (this is a basic implementation)
      // For production, integrate with a places/geocoding API
      // const suggestions: string[] = []; // Reserved for future use
      
      // You could add common addresses or use a geocoding service here
      // For now, we'll just show/hide suggestions based on input
      setShowSuggestions(text.length > 2);
    } else {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setFormData({ ...formData, address: suggestion });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleError = (error: any, context: string = 'booking creation') => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorTitle = 'Error';
    let errorDetails: any = null;

    // Handle different error types
    if (error?.response) {
      // API error response
      const status = error.response.status || error.status;
      const data = error.response.data || error.data;
      
      errorDetails = {
        status,
        data,
        message: data?.message || data?.error || error.message,
      };

      switch (status) {
        case 400:
          errorTitle = 'Validation Error';
          errorMessage = data?.message || 'Please check your input and try again.';
          // If there are field-specific errors, update form errors
          if (data?.errors && typeof data.errors === 'object') {
            setErrors(data.errors);
          }
          break;
        case 401:
          errorTitle = 'Authentication Required';
          errorMessage = 'Please log in to create a booking.';
          break;
        case 403:
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to create this booking.';
          break;
        case 404:
          errorTitle = 'Service Not Found';
          errorMessage = 'The service you are trying to book is no longer available.';
          break;
        case 409:
          errorTitle = 'Conflict';
          errorMessage = data?.message || 'This booking conflicts with an existing booking. Please choose a different time.';
          break;
        case 422:
          errorTitle = 'Validation Error';
          errorMessage = data?.message || 'Please check all required fields are filled correctly.';
          if (data?.errors && typeof data.errors === 'object') {
            setErrors(data.errors);
          }
          break;
        case 429:
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
          errorTitle = 'Server Error';
          errorMessage = 'Our servers are experiencing issues. Please try again later.';
          break;
        default:
          errorMessage = data?.message || error.message || errorMessage;
      }
    } else if (error?.message) {
      // Network or other errors
      if (error.message.includes('Network') || error.message.includes('network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'The request took too long. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }

    setApiError(errorMessage);
    setErrorDetails(errorDetails);

    // Show alert with option to go back
    Alert.alert(
      errorTitle,
      errorMessage,
      [
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => router.back(),
        },
        {
          text: 'Try Again',
          onPress: () => {
            setApiError(null);
            setErrorDetails(null);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCreateBooking = async () => {
    // Clear previous errors
    setApiError(null);
    setErrorDetails(null);

    if (!validateForm() || !service || !serviceId) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields correctly.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // Combine date and time into ISO string
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Validate date is not in the past
      if (scheduledDateTime < new Date()) {
        throw new Error('Booking date and time cannot be in the past.');
      }
      
      const bookingDate = scheduledDateTime.toISOString();
      
      // Parse duration as number
      const duration = parseInt(formData.duration, 10);
      if (isNaN(duration) || duration <= 0) {
        throw new Error('Duration must be a positive number.');
      }
      
      // Build booking payload matching API structure
      const bookingData = {
        serviceId,
        bookingDate,
        duration: duration,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          coordinates: addressCoordinates || {
            lat: 0,
            lng: 0,
          },
        },
        specialInstructions: formData.specialInstructions.trim() || undefined,
        paymentMethod: formData.paymentMethod,
      };

      // Use the API client from the marketplace service
      const { apiClient } = await import('@localpro/api');
      const { API_ENDPOINTS } = await import('@localpro/api/config');
      
      const response = await apiClient.post<any>(API_ENDPOINTS.marketplace.bookings.create, bookingData);
      
      Alert.alert(
        'Success',
        'Booking created successfully!',
        [
          {
            text: 'View Booking',
            onPress: () => router.replace(`/(stack)/booking/${response.id || response._id || ''}`),
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      handleError(error, 'booking creation');
    } finally {
      setLoading(false);
    }
  };

  if (loadingService) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service && !loadingService) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Service Not Found</Text>
          <Text style={styles.errorMessage}>
            {apiError || 'The service you are trying to book is no longer available or does not exist.'}
          </Text>
          <View style={styles.errorActions}>
            <View style={styles.errorButton}>
              <Button
                title="Go Back"
                onPress={() => router.back()}
                variant="primary"
              />
            </View>
            <View style={styles.errorButton}>
              <Button
                title="Try Again"
                onPress={loadService}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Error Banner */}
          {apiError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.semantic.error + '15', borderColor: colors.semantic.error }]}>
              <View style={styles.errorBannerContent}>
                <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
                <Text style={[styles.errorBannerText, { color: colors.semantic.error }]}>
                  {apiError}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setApiError(null);
                  setErrorDetails(null);
                }}
                style={styles.errorBannerClose}
              >
                <Ionicons name="close" size={20} color={colors.semantic.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.content, { paddingTop: Platform.select({ ios: 60, android: 70 }) }]}>
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

              {/* Date Picker */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, errors.scheduledDate && styles.labelError]}>
                  Date *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    { borderColor: errors.scheduledDate ? colors.semantic.error : colors.border.medium },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[
                    styles.datePickerText,
                    !formData.scheduledDate && { color: colors.text.tertiary },
                  ]}>
                    {formData.scheduledDate ? formatDateDisplay(formData.scheduledDate) : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                {errors.scheduledDate && (
                  <Text style={styles.errorText}>{errors.scheduledDate}</Text>
                )}
              </View>

              {/* Time Slots */}
              {formData.scheduledDate && (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, errors.scheduledTime && styles.labelError]}>
                    Time *
                  </Text>
                  {timeSlots.length === 0 ? (
                    <View style={styles.noSlotsContainer}>
                      <Text style={styles.noSlotsText}>
                        No available time slots for this date
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.timeSlotsContainer}>
                      {timeSlots.map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeSlotButton,
                            formData.scheduledTime === time && {
                              backgroundColor: colors.primary[600],
                              borderColor: colors.primary[600],
                            },
                            !formData.scheduledTime && {
                              borderColor: colors.border.medium,
                            },
                          ]}
                          onPress={() => handleTimeSlotSelect(time)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              formData.scheduledTime === time && { color: Colors.text.inverse },
                            ]}
                          >
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {errors.scheduledTime && (
                    <Text style={styles.errorText}>{errors.scheduledTime}</Text>
                  )}
                </View>
              )}

              {/* Address Input with Current Location and Autocomplete */}
              <View style={styles.inputContainer}>
                <View style={styles.addressHeader}>
                  <Text style={[styles.label, errors.address && styles.labelError]}>
                    Address *
                  </Text>
                  <TouchableOpacity
                    onPress={handleUseCurrentLocation}
                    disabled={isGettingLocation}
                    style={styles.useLocationButton}
                  >
                    {isGettingLocation ? (
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    ) : (
                      <Ionicons name="location" size={18} color={colors.primary[600]} />
                    )}
                    <Text style={styles.useLocationText}>
                      {isGettingLocation ? 'Getting...' : 'Use Current'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addressInputContainer}>
                  <TextInput
                    style={[
                      styles.addressInput,
                      { borderColor: errors.address ? colors.semantic.error : colors.border.medium },
                    ]}
                    value={formData.address}
                    onChangeText={handleAddressChange}
                    placeholder="Enter street address"
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="words"
                    onFocus={() => {
                      if (formData.address.length > 2) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow selection
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <View style={[styles.suggestionsContainer, { backgroundColor: colors.background.primary }]}>
                      {addressSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionSelect(suggestion)}
                        >
                          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

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

              <Input
                label="State/Province *"
                value={formData.state}
                onChangeText={(text) => {
                  setFormData({ ...formData, state: text });
                  if (errors.state) setErrors({ ...errors, state: '' });
                }}
                placeholder="State or Province"
                error={errors.state}
              />

              <Input
                label="Zip/Postal Code *"
                value={formData.zipCode}
                onChangeText={(text) => {
                  setFormData({ ...formData, zipCode: text });
                  if (errors.zipCode) setErrors({ ...errors, zipCode: '' });
                }}
                placeholder="Zip or Postal Code"
                error={errors.zipCode}
                keyboardType="numeric"
              />

              <Input
                label="Country *"
                value={formData.country}
                onChangeText={(text) => {
                  setFormData({ ...formData, country: text });
                  if (errors.country) setErrors({ ...errors, country: '' });
                }}
                placeholder="Country"
                error={errors.country}
              />

              <Input
                label="Duration (hours) *"
                value={formData.duration}
                onChangeText={(text) => {
                  setFormData({ ...formData, duration: text });
                  if (errors.duration) setErrors({ ...errors, duration: '' });
                }}
                placeholder="e.g., 2"
                error={errors.duration}
                keyboardType="numeric"
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Payment Method *</Text>
                <View style={styles.paymentMethodContainer}>
                  {['paymongo', 'paypal', 'cash'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        formData.paymentMethod === method && {
                          backgroundColor: colors.primary[600],
                          borderColor: colors.primary[600],
                        },
                        !formData.paymentMethod && {
                          borderColor: colors.border.medium,
                        },
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, paymentMethod: method });
                        if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: '' });
                      }}
                    >
                      <Text
                        style={[
                          styles.paymentMethodText,
                          formData.paymentMethod === method && { color: Colors.text.inverse },
                        ]}
                      >
                        {method === 'paymongo' ? 'PayMongo (Cards, GCash, Maya)' : method.charAt(0).toUpperCase() + method.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.paymentMethod && (
                  <Text style={styles.errorText}>{errors.paymentMethod}</Text>
                )}
              </View>

              <View style={styles.notesContainer}>
                <Text style={styles.label}>Special Instructions (Optional)</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { borderColor: colors.border.medium },
                  ]}
                  value={formData.specialInstructions}
                  onChangeText={(text) => setFormData({ ...formData, specialInstructions: text })}
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.datePickerContainer}>
              {(() => {
                const dates: Date[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Generate dates for the next 60 days
                for (let i = 0; i < 60; i++) {
                  const date = new Date(today);
                  date.setDate(today.getDate() + i);
                  dates.push(date);
                }

                return dates.map((date) => {
                  const dateString = date.toISOString().split('T')[0];
                  const isSelected = formData.scheduledDate === dateString;
                  const isToday = date.toDateString() === today.toDateString();
                  
                  return (
                    <TouchableOpacity
                      key={dateString}
                      style={[
                        styles.dateOption,
                        isSelected && { backgroundColor: colors.primary[600] },
                      ]}
                      onPress={() => handleDateSelect(date)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          isSelected && { color: Colors.text.inverse, fontWeight: '600' },
                          isToday && !isSelected && { color: colors.primary[600] },
                        ]}
                      >
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {isToday && !isSelected && ' (Today)'}
                      </Text>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
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
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily?.semibold || 'System',
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
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  labelError: {
    color: Colors.semantic.error,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlotButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: Colors.background.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  noSlotsContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    padding: Spacing.lg,
  },
  dateOption: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.secondary,
  },
  dateOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
  },
  useLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  addressInputContainer: {
    position: 'relative',
  },
  addressInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    ...Shadows.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentMethodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: Colors.background.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  errorActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 400,
  },
  errorButton: {
    flex: 1,
  },
  errorBanner: {
    margin: Spacing.lg,
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  errorBannerText: {
    fontSize: 14,
    flex: 1,
  },
  errorBannerClose: {
    padding: Spacing.xs,
  },
});

export default function CreateBookingScreen() {
  return (
    <ErrorBoundary>
      <CreateBookingScreenContent />
    </ErrorBoundary>
  );
}

