import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useApplyForProviderMutation, useUpdateUnifiedProfileMutation } from '@/store/services/profileApi';
import { useGetAllCategoriesQuery } from '@/store/services/servicesApi';

export default function AgentProfileSetup() {
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Cameroon');
  const [aboutMe, setAboutMe] = useState('');
  const [availability, setAvailability] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [applyForProvider, { isLoading: isApplying }] = useApplyForProviderMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUnifiedProfileMutation();

  const handleSaveProfile = async () => {
    if (!businessName || selectedCategories.length === 0 || !experience || !phone || !city || !availability) {
      Alert.alert('Error', 'Please fill in all required fields including category and availability');
      return;
    }

    const categoryNames = categories?.filter(c => selectedCategories.includes(c.pkid)).map(c => c.name).join(', ') || '';

    try {
      await updateProfile({
        phone_number: phone,
        city,
        country,
        about_me: aboutMe || `${businessName} - ${categoryNames} specialist with ${experience} years of experience.`,
      }).unwrap();

      await applyForProvider({
        business_name: businessName,
        business_address: `${city}, ${country}`,
        description: aboutMe || `${businessName} - ${categoryNames} specialist with ${experience} years of experience.`,
        service_categories: selectedCategories,
        years_of_experience: parseInt(experience) || 0,
        certifications: certifications ? certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
        portfolio_urls: [],
        availability_schedule: availability,
        emergency_contact: phone,
        latitude: 0,
        longitude: 0,
      }).unwrap();

      Alert.alert(
        '✅ Application Submitted Successfully!',
        `Thank you for your interest in becoming a service provider!\n\nYour application has been submitted and is under review by our team.\n\nYou will receive a notification once your application is approved. In the meantime, you can continue using Mubaku Lifestyle.`,
        [
          {
            text: 'Return to Home',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error: any) {
      console.log('=== Profile Setup Error Details ===');
      console.log('Error type:', typeof error);
      console.log('Error keys:', Object.keys(error || {}));
      console.log('Full error:', error);
      
      if (error?.data) {
        console.log('Error data:', JSON.stringify(error.data, null, 2));
      }
      if (error?.status) {
        console.log('Error status:', error.status);
      }
      if (error?.message) {
        console.log('Error message:', error.message);
      }
      console.log('=================================');
      
      let errorMessage = 'Failed to complete profile setup. Please try again.';
      
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.detail) {
          errorMessage = Array.isArray(error.data.detail) 
            ? error.data.detail.join(', ')
            : error.data.detail;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          errorMessage = typeof error.data.error === 'string'
            ? error.data.error
            : JSON.stringify(error.data.error);
        } else if (error.data.non_field_errors) {
          errorMessage = Array.isArray(error.data.non_field_errors)
            ? error.data.non_field_errors.join(', ')
            : error.data.non_field_errors;
        } else {
          const firstKey = Object.keys(error.data)[0];
          if (firstKey && error.data[firstKey]) {
            const firstError = error.data[firstKey];
            errorMessage = Array.isArray(firstError)
              ? `${firstKey}: ${firstError.join(', ')}`
              : `${firstKey}: ${firstError}`;
          } else {
            errorMessage = JSON.stringify(error.data);
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        errorMessage = `Error ${error.status}: ${error.statusText || 'Request failed'}`;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const isLoading = isApplying || isUpdating;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Application</Text>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Provider Profile Setup</Text>
              <Text style={styles.subtitle}>Tell clients about your services</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput
                  style={styles.input}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Enter your business name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Service Categories *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Text style={[styles.pickerText, selectedCategories.length === 0 && styles.pickerPlaceholder]}>
                    {selectedCategories.length > 0
                      ? categories?.filter(c => selectedCategories.includes(c.pkid)).map(c => c.name).join(', ')
                      : 'Select service categories'}
                  </Text>
                  <ChevronDown color="#666" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Years of Experience *</Text>
                <TextInput
                  style={styles.input}
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="e.g., 5"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Certifications (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={certifications}
                  onChangeText={setCertifications}
                  placeholder="Separate multiple certifications with commas"
                  multiline
                  numberOfLines={2}
                />
                <Text style={styles.helperText}>Example: Certificate A, License B, Award C</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g., +237670181440"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g., Yaoundé, Douala, Bamenda"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter your country"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Availability Schedule *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={availability}
                  onChangeText={setAvailability}
                  placeholder="e.g., Monday-Friday: 9:00 AM - 6:00 PM"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>About Me (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={aboutMe}
                  onChangeText={setAboutMe}
                  placeholder="Tell clients about yourself and your services..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveText}>Submit Application</Text>
                )}
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Your application will be reviewed by our team. You will be notified once approved.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoriesList}>
              {categoriesLoading ? (
                <ActivityIndicator size="large" color="#2D1A46" />
              ) : (
                categories?.map((category) => {
                  const isSelected = selectedCategories.includes(category.pkid);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryOption}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedCategories(prev => prev.filter(id => id !== category.pkid));
                        } else {
                          setSelectedCategories(prev => [...prev, category.pkid]);
                        }
                      }}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.categoryOptionText}>{category.name}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F4A896',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F4A896',
  },
  categoriesList: {
    padding: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2D1A46',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2D1A46',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
});
