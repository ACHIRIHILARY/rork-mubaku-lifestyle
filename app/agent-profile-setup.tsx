import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useApplyForProviderMutation, useUpdateUnifiedProfileMutation } from '@/store/services/profileApi';

export default function AgentProfileSetup() {
  const [businessName, setBusinessName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Cameroon');
  const [aboutMe, setAboutMe] = useState('');
  
  const [applyForProvider, { isLoading: isApplying }] = useApplyForProviderMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUnifiedProfileMutation();

  const handleSaveProfile = async () => {
    if (!businessName || !specialty || !experience || !phone || !city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateProfile({
        phone_number: phone,
        city,
        country,
        about_me: aboutMe || `${businessName} - ${specialty} specialist with ${experience} years of experience.`,
      }).unwrap();

      await applyForProvider({
        specialty,
        experience,
        certifications: certifications || 'None provided',
        reason: `I would like to offer ${specialty} services through Mubaku Lifestyle platform.`,
      }).unwrap();

      Alert.alert(
        'Application Submitted!',
        'Your provider application has been submitted successfully. We will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Profile setup error:', error);
      Alert.alert(
        'Error',
        error?.data?.detail || 'Failed to complete profile setup. Please try again.'
      );
    }
  };

  const isLoading = isApplying || isUpdating;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
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
                <Text style={styles.label}>Specialty *</Text>
                <TextInput
                  style={styles.input}
                  value={specialty}
                  onChangeText={setSpecialty}
                  placeholder="e.g., Hair Styling, Makeup, Nails"
                />
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
                  placeholder="e.g., Professional Makeup Artist Certificate"
                  multiline
                  numberOfLines={2}
                />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4A896',
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
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
});
