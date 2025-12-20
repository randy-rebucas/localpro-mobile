import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { Button, Card, Loading } from '@localpro/ui';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

// Conditional import for DateTimePicker (requires native code)
let DateTimePicker: any;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (error) {
  DateTimePicker = null;
}

export default function EditProfileScreen() {
  const { user, updateProfile, uploadAvatar, checkAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const colors = useThemeColors();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    location: {
      latitude: '',
      longitude: '',
    },
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    latitude?: string;
    longitude?: string;
  }>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      // Format dateOfBirth if it exists
      let dateOfBirthStr = '';
      let dobDate: Date | null = null;
      if (user.dateOfBirth) {
        dobDate = typeof user.dateOfBirth === 'string' ? new Date(user.dateOfBirth) : new Date(user.dateOfBirth);
        if (!isNaN(dobDate.getTime())) {
          dateOfBirthStr = dobDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        } else {
          dobDate = null;
        }
      }

      // Extract location coordinates
      let latitude = '';
      let longitude = '';
      if (user.location?.coordinates && Array.isArray(user.location.coordinates)) {
        longitude = user.location.coordinates[0]?.toString() || '';
        latitude = user.location.coordinates[1]?.toString() || '';
      }

      setDateOfBirth(dobDate);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        dateOfBirth: dateOfBirthStr,
        address: {
          street: user.profile?.address?.street || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          zipCode: user.profile?.address?.zipCode || '',
          country: user.profile?.address?.country || '',
        },
        location: {
          latitude,
          longitude,
        },
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate date of birth (should be valid if dateOfBirth state exists)
    if (dateOfBirth && isNaN(dateOfBirth.getTime())) {
      newErrors.dateOfBirth = 'Please select a valid date';
    }

    // Validate location coordinates if provided (coordinates are captured automatically)
    if (formData.location.latitude || formData.location.longitude) {
      const lat = parseFloat(formData.location.latitude);
      const lng = parseFloat(formData.location.longitude);
      
      if (formData.location.latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
        newErrors.latitude = 'Invalid latitude';
      }
      
      if (formData.location.longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
        newErrors.longitude = 'Invalid longitude';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Show alert if coordinates are invalid (since fields are hidden)
      if (errors.latitude || errors.longitude) {
        Alert.alert(
          'Invalid Location',
          'Location coordinates are invalid. Please use "Use Current Location" to update them.'
        );
      }
      return;
    }

    setIsSaving(true);
    try {
      // Build address object if any field is filled
      const address = formData.address.street || formData.address.city || 
                      formData.address.state || formData.address.zipCode || 
                      formData.address.country
        ? {
            street: formData.address.street.trim() || undefined,
            city: formData.address.city.trim() || undefined,
            state: formData.address.state.trim() || undefined,
            zipCode: formData.address.zipCode.trim() || undefined,
            country: formData.address.country.trim() || undefined,
          }
        : undefined;

      // Build location object if coordinates are provided
      const location = formData.location.latitude && formData.location.longitude
        ? {
            type: 'Point' as const,
            coordinates: [
              parseFloat(formData.location.longitude),
              parseFloat(formData.location.latitude),
            ] as [number, number],
          }
        : undefined;

      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        dateOfBirth: formData.dateOfBirth.trim() || undefined,
        address,
        location,
      });
      
      // Refresh user data
      await checkAuth();
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access media library is required'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8, // Compress to 80% quality
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets[0];

      // Validate file size (2MB limit)
      if (image.fileSize && image.fileSize > 2 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Image size exceeds 2MB limit. Please choose a smaller image.'
        );
        return;
      }

      setIsUploadingAvatar(true);
      try {
        await uploadAvatar(image.uri, image.fileSize);
        // Refresh user data
        await checkAuth();
        Alert.alert('Success', 'Avatar updated successfully!');
      } catch (error: any) {
        const errorMessage = error?.message || 
                            (typeof error === 'string' ? error : 'Failed to upload avatar. Please try again.');
        Alert.alert(
          'Upload Failed',
          errorMessage
        );
      } finally {
        setIsUploadingAvatar(false);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to pick image. Please try again.'
      );
      setIsUploadingAvatar(false);
    }
  };

  const getAvatarUrl = (): string | null => {
    if (user?.profile?.avatar?.url) {
      return user.profile.avatar.url;
    }
    return null;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDateOfBirth(selectedDate);
        // Format as YYYY-MM-DD for formData
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setFormData({ ...formData, dateOfBirth: formattedDate });
        if (errors.dateOfBirth) {
          setErrors({ ...errors, dateOfBirth: undefined });
        }
      }
    } else {
      // On iOS, update date as user scrolls
      if (selectedDate) {
        setDateOfBirth(selectedDate);
        // Format as YYYY-MM-DD for formData
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setFormData({ ...formData, dateOfBirth: formattedDate });
        if (errors.dateOfBirth) {
          setErrors({ ...errors, dateOfBirth: undefined });
        }
      }
      // Close picker when dismissed
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };

  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location. Please enable it in your device settings.'
        );
        setIsFetchingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        
        // Build formatted address string
        // Try to use name property first (often contains formatted address)
        // Otherwise, construct from available components
        let formattedAddress = '';
        if (addressData.name) {
          formattedAddress = addressData.name;
        } else {
          // Construct formatted address from components
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
          
          // Country
          if (addressData.country) {
            addressParts.push(addressData.country);
          }
          
          formattedAddress = addressParts.join(', ');
        }
        
        // Update form data with location and address
        setFormData({
          ...formData,
          location: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          },
          address: {
            street: formattedAddress,
            city: addressData.city || addressData.district || '',
            state: addressData.region || addressData.subregion || '',
            zipCode: addressData.postalCode || '',
            country: addressData.country || '',
          },
        });

        Alert.alert('Success', 'Location and address updated from your current location!');
      } else {
        // If reverse geocode fails, still update coordinates
        setFormData({
          ...formData,
          location: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          },
        });
        Alert.alert('Location Updated', 'Coordinates updated, but address details could not be retrieved.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to get your current location. Please try again or enter manually.'
      );
    } finally {
      setIsFetchingLocation(false);
    }
  };

  if (isLoading && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Loading />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Avatar Section */}
          <Card style={styles.avatarCard}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {getAvatarUrl() ? (
                  <Image source={{ uri: getAvatarUrl()! }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {formData.firstName?.charAt(0).toUpperCase() || 
                       formData.lastName?.charAt(0).toUpperCase() || 
                       'U'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editAvatarButton}
                  onPress={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <Ionicons name="camera" size={16} color={colors.text.inverse} />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={handleUploadAvatar}
                disabled={isUploadingAvatar}
                style={styles.changePhotoButton}
              >
                <Text style={styles.changePhotoText}>
                  {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Personal Information */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
                placeholder="Enter first name"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
                placeholder="Enter last name"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="Enter email address"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
              >
                <Text style={[
                  styles.dateInputText,
                  !dateOfBirth && { color: colors.text.tertiary }
                ]}>
                  {dateOfBirth ? formatDateForDisplay(dateOfBirth) : 'Select date of birth'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
              
              {showDatePicker && DateTimePicker && (
                <>
                  {Platform.OS === 'ios' && (
                    <View style={styles.datePickerActions}>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        style={styles.datePickerButton}
                      >
                        <Text style={styles.datePickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                      >
                        <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextPrimary]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                </>
              )}
              {showDatePicker && !DateTimePicker && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    Date picker requires native code. Please rebuild the app:
                    {'\n'}npx expo run:ios or npx expo run:android
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Address Information */}
          <Card style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1 }]}>Address</Text>
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={isFetchingLocation}
                style={styles.useLocationButton}
              >
                {isFetchingLocation ? (
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                ) : (
                  <Ionicons name="location" size={18} color={colors.primary[600]} />
                )}
                <Text style={styles.useLocationText}>
                  {isFetchingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street</Text>
              <TextInput
                style={styles.input}
                value={formData.address.street}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, street: text }
                })}
                placeholder="Enter street address"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.address.city}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: text }
                })}
                placeholder="Enter city"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State/Province</Text>
              <TextInput
                style={styles.input}
                value={formData.address.state}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: text }
                })}
                placeholder="Enter state or province"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                value={formData.address.zipCode}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, zipCode: text }
                })}
                placeholder="Enter zip code"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="default"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.address.country}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, country: text }
                })}
                placeholder="Enter country"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>
          </Card>

          {/* Location coordinates are captured automatically when using "Use Current Location" 
              but hidden from UI to keep the form clean */}
          
          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isSaving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={isSaving}
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  avatarCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  useLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[600],
    marginLeft: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  locationInput: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral.gray200,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  changePhotoButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  formCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.semantic.error + '10',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  datePickerButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginLeft: Spacing.sm,
  },
  datePickerButtonPrimary: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  datePickerButtonTextPrimary: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
});

