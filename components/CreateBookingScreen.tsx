import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const CreateBookingScreen: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const services = [
    { name: 'House Cleaning', icon: 'home-outline' as const, color: '#FF6B6B' },
    { name: 'Plumbing', icon: 'water-outline' as const, color: '#4ECDC4' },
    { name: 'Electrical', icon: 'flash-outline' as const, color: '#45B7D1' },
    { name: 'Landscaping', icon: 'leaf-outline' as const, color: '#96CEB4' },
    { name: 'Moving', icon: 'car-outline' as const, color: '#FFEAA7' },
    { name: 'Painting', icon: 'color-palette-outline' as const, color: '#DDA0DD' },
    { name: 'Carpentry', icon: 'hammer-outline' as const, color: '#FDCB6E' },
    { name: 'HVAC', icon: 'thermometer-outline' as const, color: '#74B9FF' }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const handlePostJob = () => {
    if (!selectedService || !date || !time || !description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    Alert.alert(
      'Job Posted Successfully!',
      'Your service request has been posted. Providers will be notified and can start bidding on your job.',
      [{ text: 'OK', style: 'default' }]
    );
    
    // Reset form
    setSelectedService('');
    setDate('');
    setTime('');
    setDescription('');
    setBudget('');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Create Booking</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Tell us what you need and we&apos;ll connect you with the best service providers
        </Text>
      </View>
    </LinearGradient>
  );

  const renderServiceSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name="grid-outline" size={20} color="#667eea" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Select Service</Text>
          <Text style={styles.sectionSubtitle}>Choose the type of service you need</Text>
        </View>
      </View>
      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.name}
            style={[
              styles.serviceOption,
              selectedService === service.name && styles.selectedService
            ]}
            onPress={() => setSelectedService(service.name)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedService === service.name 
                ? [service.color, service.color + 'CC'] 
                : ['#f8f9fa', '#f8f9fa']
              }
              style={styles.serviceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={service.icon} 
                size={28}
                color={selectedService === service.name ? '#fff' : service.color}
              />
              <Text style={[
                styles.serviceText,
                selectedService === service.name && styles.selectedServiceText
              ]}>
                {service.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionSubtitle}>When do you need the service?</Text>
        </View>
      </View>
      
      <View style={styles.dateTimeContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="calendar" size={20} color="#667eea" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter date (e.g., 2024-01-15)"
            placeholderTextColor="#999"
            value={date}
            onChangeText={setDate}
          />
        </View>
      </View>
    </View>
  );

  const renderTimeSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name="time-outline" size={20} color="#667eea" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Preferred Time</Text>
          <Text style={styles.sectionSubtitle}>Select your preferred time slot</Text>
        </View>
      </View>
      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.timeOption,
              time === slot && styles.selectedTime
            ]}
            onPress={() => setTime(slot)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={time === slot 
                ? ['#667eea', '#764ba2'] 
                : ['#f8f9fa', '#f8f9fa']
              }
              style={styles.timeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name="time" 
                size={16}
                color={time === slot ? '#fff' : '#667eea'}
              />
              <Text style={[
                styles.timeText,
                time === slot && styles.selectedTimeText
              ]}>
                {slot}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBudgetSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name="wallet-outline" size={20} color="#667eea" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Budget (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Help providers understand your budget</Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="cash-outline" size={20} color="#667eea" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter your budget (e.g., $100-200)"
          placeholderTextColor="#999"
          value={budget}
          onChangeText={setBudget}
        />
      </View>
    </View>
  );

  const renderDescriptionSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name="document-text-outline" size={20} color="#667eea" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>Tell us more about what you need</Text>
        </View>
      </View>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your service requirements in detail..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderSubmitButton = () => (
    <View style={styles.submitSection}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedService || !date || !time || !description) && styles.disabledButton
        ]}
        onPress={handlePostJob}
        disabled={!selectedService || !date || !time || !description}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={(!selectedService || !date || !time || !description) 
            ? ['#ccc', '#ccc'] 
            : ['#667eea', '#764ba2']
          }
          style={styles.submitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>Post Job Request</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {renderHeader()}
        <View style={styles.formContainer}>
          {renderServiceSection()}
          {renderDateTimeSection()}
          {renderTimeSection()}
          {renderBudgetSection()}
          {renderDescriptionSection()}
          {renderSubmitButton()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceOption: {
    width: (width - 80) / 2 - 10,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedService: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  serviceGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedServiceText: {
    color: '#fff',
    fontWeight: '700',
  },
  dateTimeContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    width: (width - 80) / 3 - 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTime: {
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timeGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 60,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '700',
  },
  textAreaContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitSection: {
    marginTop: 10,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    shadowOpacity: 0.1,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
