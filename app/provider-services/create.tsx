import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { useCreateServiceMutation, useGetAllCategoriesQuery } from '@/store/services/servicesApi';
import * as ImagePicker from 'expo-image-picker';

export default function CreateServiceScreen() {
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [createService, { isLoading }] = useCreateServiceMutation();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: number | null;
    duration_minutes: string;
    price: string;
    currency: string;
    latitude: string;
    longitude: string;
    location: string;
    image?: string;
  }>({
    name: '',
    description: '',
    category: null,
    duration_minutes: '',
    price: '',
    currency: 'XAF',
    latitude: '',
    longitude: '',
    location: '',
    image: undefined,
  });

  React.useEffect(() => {
    if (categories) {
      console.log('Categories loaded:', JSON.stringify(categories, null, 2));
      categories.forEach(cat => {
        console.log(`Category ${cat.name}: id=${cat.id}, pkid=${cat.pkid}, type=${typeof cat.pkid}`);
      });
    }
  }, [categories]);

  React.useEffect(() => {
    console.log('Selected category:', formData.category, 'Type:', typeof formData.category);
  }, [formData.category]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: undefined });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a service name');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      if (!formData.category) {
        Alert.alert('Error', 'Please select a category');
        return;
      }

      const categoryExists = categories?.find(c => c.pkid === formData.category);

      if (!categoryExists) {
        console.error('Invalid category pkid:', formData.category);
        console.error('Available categories:', JSON.stringify(categories?.map(c => ({ pkid: c.pkid, name: c.name })), null, 2));
        Alert.alert('Error', `Invalid category selected. Available categories: ${categories?.map(c => `${c.name} (ID: ${c.pkid})`).join(', ')}`);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        duration_minutes: parseInt(formData.duration_minutes, 10),
        price: parseFloat(formData.price),
        currency: formData.currency,
        is_active: true,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        location: formData.location.trim() || undefined,
      };
      console.log('Creating service with payload:', JSON.stringify(payload, null, 2));
      console.log('Location data:', {
        latitude: payload.latitude,
        longitude: payload.longitude,
        location: payload.location,
        hasLocation: !!(payload.latitude && payload.longitude)
      });

      const result = await createService(payload).unwrap();
      console.log('Service created, response:', JSON.stringify(result, null, 2));
      console.log('Response location data:', {
        latitude: result.latitude,
        longitude: result.longitude,
        location: result.location
      });

      if (result.latitude && result.longitude) {
        Alert.alert('Success', 'Service created successfully with location!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Success', 'Service created, but location was not saved. Please edit the service to add location.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Create service error:', JSON.stringify(error, null, 2));
      console.error('Error data:', error?.data);
      console.error('Error status:', error?.status);

      let errorMessage = 'Failed to create service';

      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.detail) {
          errorMessage = error.data.detail;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (typeof error.data === 'object') {
          const errorFields = Object.entries(error.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          if (errorFields) {
            errorMessage = errorFields;
          }
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Service',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#2D1A46" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#F4A896',
          },
          headerTintColor: 'white',
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Women's Haircut"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your service..."
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Image</Text>
            {formData.image ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <X color="white" size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                <Camera color="#2D1A46" size={24} />
                <Text style={styles.imageUploadText}>Add Service Image</Text>
                <Text style={styles.imageUploadSubtext}>Upload a photo to showcase your service</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {categoriesLoading ? (
              <ActivityIndicator color="#2D1A46" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories?.map((category) => {
                  const isSelected = formData.category === category.pkid;

                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive
                      ]}
                      onPress={() => {
                        console.log('Selected category:', category.name, 'pkid:', category.pkid, 'Type:', typeof category.pkid);
                        setFormData((prev) => ({ ...prev, category: category.pkid }));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 60"
              placeholderTextColor="#999"
              value={formData.duration_minutes}
              onChangeText={(text) => setFormData({ ...formData, duration_minutes: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 15000"
                placeholderTextColor="#999"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9.]/g, '') })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Currency *</Text>
              <View style={styles.currencyContainer}>
                <Text style={styles.currencyText}>{formData.currency}</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>📍 Service Location (Optional)</Text>
            <Text style={styles.helperText}>Add location so clients can find you easily</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Downtown Salon, Douala"
                placeholderTextColor="#999"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 4.0511"
                  placeholderTextColor="#999"
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text.replace(/[^0-9.-]/g, '') })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 9.7679"
                  placeholderTextColor="#999"
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text.replace(/[^0-9.-]/g, '') })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Service</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2D1A46',
    borderColor: '#2D1A46',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2D1A46',
    marginHorizontal: 24,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  locationSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1A46',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  imagePreview: {
    position: 'relative',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
