import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { useUpdateServiceMutation, useGetServiceByIdQuery, useGetAllCategoriesQuery } from '@/store/services/servicesApi';
import * as ImagePicker from 'expo-image-picker';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: service, isLoading: serviceLoading } = useGetServiceByIdQuery(id || '');
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [updateService, { isLoading }] = useUpdateServiceMutation();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: number | null;
    duration_minutes: string;
    price: string;
    currency: string;
    is_active: boolean;
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
    is_active: true,
    latitude: '',
    longitude: '',
    location: '',
    image: undefined,
  });

  useEffect(() => {
    if (service) {
      console.log('Service loaded for editing:', JSON.stringify(service, null, 2));
      console.log('Service location fields:', {
        latitude: service.latitude,
        longitude: service.longitude,
        location: service.location,
        hasLocation: !!(service.latitude && service.longitude)
      });

      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        duration_minutes: service.duration_minutes.toString(),
        price: service.price.toString(),
        currency: service.currency,
        is_active: service.is_active,
        latitude: service.latitude?.toString() || '',
        longitude: service.longitude?.toString() || '',
        location: service.location || '',
        image: service.image_url || undefined,
      });
    }
  }, [service]);

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

    if (!id) {
      Alert.alert('Error', 'Service ID is missing');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category!,
        duration_minutes: parseInt(formData.duration_minutes),
        price: parseFloat(formData.price),
        currency: formData.currency,
        is_active: formData.is_active,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        location: formData.location.trim() || undefined,
      };

      console.log('Updating service with payload:', JSON.stringify(payload, null, 2));
      console.log('Location data being sent:', {
        latitude: payload.latitude,
        longitude: payload.longitude,
        location: payload.location,
        hasLocation: !!(payload.latitude && payload.longitude)
      });

      const result = await updateService({
        serviceId: id,
        data: payload,
      }).unwrap();

      console.log('Service updated, response:', JSON.stringify(result, null, 2));
      console.log('Response location data:', {
        latitude: result.latitude,
        longitude: result.longitude,
        location: result.location
      });

      Alert.alert('Success', 'Service updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Update service error:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to update service';
      Alert.alert('Error', errorMessage);
    }
  };

  if (serviceLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Edit Service',
            headerStyle: {
              backgroundColor: '#F4A896',
            },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Edit Service',
            headerStyle: {
              backgroundColor: '#F4A896',
            },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Service',
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
            <View style={styles.labelRow}>
              <Text style={styles.label}>Service Active</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                trackColor={{ false: '#E5E5E5', true: '#F4A896' }}
                thumbColor={formData.is_active ? '#2D1A46' : '#999'}
              />
            </View>
            <Text style={styles.helperText}>
              {formData.is_active ? 'Service is visible and bookable' : 'Service is hidden from clients'}
            </Text>
          </View>

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
                {categories?.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      formData.category === category.pkid && styles.categoryChipActive
                    ]}
                    onPress={() => setFormData({ ...formData, category: category.pkid })}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.category === category.pkid && styles.categoryChipTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
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
            <Text style={styles.submitButtonText}>Update Service</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  backButtonError: {
    backgroundColor: '#2D1A46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
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
