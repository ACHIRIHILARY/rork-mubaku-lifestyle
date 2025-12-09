import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useCreateServiceMutation, useGetAllCategoriesQuery } from '@/store/services/servicesApi';

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
  }>({
    name: '',
    description: '',
    category: null,
    duration_minutes: '',
    price: '',
    currency: 'XAF',
  });
  
  React.useEffect(() => {
    if (categories) {
      console.log('Categories loaded:', JSON.stringify(categories, null, 2));
      categories.forEach(cat => {
        console.log(`Category ${cat.name}: id=${cat.id}, type=${typeof cat.id}`);
      });
    }
  }, [categories]);
  
  React.useEffect(() => {
    console.log('Selected category:', formData.category, 'Type:', typeof formData.category);
  }, [formData.category]);

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
      const categoryId = typeof formData.category === 'string' ? parseInt(formData.category, 10) : formData.category!;
      
      const normalizedCategories = categories?.map(c => ({
        ...c,
        id: typeof c.id === 'string' ? parseInt(c.id, 10) : c.id
      }));
      
      if (!normalizedCategories?.find(c => c.id === categoryId)) {
        console.error('Invalid category ID:', categoryId);
        console.error('Available categories:', JSON.stringify(normalizedCategories, null, 2));
        Alert.alert('Error', `Invalid category selected. Please choose a valid category. Available categories: ${normalizedCategories?.map(c => `${c.name} (ID: ${c.id})`).join(', ')}`);
        return;
      }
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: categoryId,
        duration_minutes: parseInt(formData.duration_minutes, 10),
        price: parseFloat(formData.price),
        currency: formData.currency,
        is_active: true,
      };
      console.log('Creating service with payload:', JSON.stringify(payload, null, 2));
      console.log('Category type:', typeof payload.category, 'Value:', payload.category);
      console.log('Available categories:', normalizedCategories?.map(c => ({ id: c.id, name: c.name })));
      await createService(payload).unwrap();

      Alert.alert('Success', 'Service created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
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
    <View style={styles.container}>
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
            <Text style={styles.label}>Category *</Text>
            {categoriesLoading ? (
              <ActivityIndicator color="#2D1A46" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories?.map((category) => {
                  const categoryId = typeof category.id === 'string' ? parseInt(category.id, 10) : category.id;
                  const isSelected = formData.category === categoryId;
                  
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive
                      ]}
                      onPress={() => {
                        console.log('Selected category:', category.name, 'ID:', categoryId, 'Type:', typeof categoryId);
                        setFormData((prev) => ({ ...prev, category: categoryId }));
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
    </View>
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
});
