import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Save, X } from 'lucide-react-native';
import {
  useGetUnifiedProfileQuery,
  useUpdateUnifiedProfileMutation,
} from '@/store/services/profileApi';

export default function ProfileEditScreen() {
  const { data: profile, isLoading } = useGetUnifiedProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUnifiedProfileMutation();

  const [formData, setFormData] = useState({
    phone_number: '',
    about_me: '',
    gender: '',
    country: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone_number: profile.phone_number || '',
        about_me: profile.about_me || '',
        gender: profile.gender || '',
        country: profile.country || '',
        city: profile.city || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      console.log('Updating profile:', formData);
      await updateProfile(formData).unwrap();
      Alert.alert('Success', 'Your profile has been updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage =
        error?.data?.detail ||
        'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Edit Profile',
            headerStyle: { backgroundColor: '#F4A896' },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: '#F4A896' },
          headerTintColor: 'white',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isUpdating}
              style={styles.headerButton}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Save color="white" size={24} />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {profile?.first_name?.charAt(0) || '👤'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) =>
                setFormData({ ...formData, phone_number: text })
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    formData.gender === option && styles.genderButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: option })}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === option &&
                        styles.genderButtonTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Me</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.about_me}
              onChangeText={(text) =>
                setFormData({ ...formData, about_me: text })
              }
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) =>
                setFormData({ ...formData, country: text })
              }
              placeholder="Enter your country"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Enter your city"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.disabledButton]}
          onPress={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save color="white" size={20} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <X color="#666" size={20} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
    paddingTop: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#2D1A46',
    borderColor: '#2D1A46',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#2D1A46',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
