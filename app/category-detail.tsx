import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Star, ArrowLeft } from 'lucide-react-native';
import {
  useGetCategoryByIdQuery,
  useGetCategoryServicesQuery,
} from '@/store/services/servicesApi';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryByIdQuery(id || '');

  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useGetCategoryServicesQuery(id || '');

  console.log('Category detail loaded:', {
    categoryId: id,
    category,
    servicesCount: services?.length,
  });

  const handleServicePress = (serviceId: string) => {
    router.push(`/service-detail?id=${serviceId}`);
  };

  const isLoading = categoryLoading || servicesLoading;
  const hasError = categoryError || servicesError;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Category',
            headerStyle: { backgroundColor: '#F4A896' },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError || !category) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Category',
            headerStyle: { backgroundColor: '#F4A896' },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Category Not Found</Text>
          <Text style={styles.errorMessage}>
            The category you are looking for does not exist.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={20} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: category.name,
          headerStyle: { backgroundColor: '#F4A896' },
          headerTintColor: 'white',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.categoryIconLarge}>
            <Text style={styles.categoryIconText}>💇</Text>
          </View>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          {category.description && (
            <Text style={styles.categoryDescription}>
              {category.description}
            </Text>
          )}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{services?.length || 0}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
          </View>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>

          {!services || services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No services available in this category yet
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.back()}
              >
                <Text style={styles.browseButtonText}>Browse Other Categories</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.servicesContainer}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                >
                  <View style={styles.serviceImagePlaceholder}>
                    <Text style={styles.serviceImageText}>💼</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                      </Text>
                    )}
                    <View style={styles.serviceMeta}>
                      <View style={styles.ratingContainer}>
                        <Star color="#FFD700" size={16} fill="#FFD700" />
                        <Text style={styles.rating}>
                          {service.rating || '5.0'}
                        </Text>
                      </View>
                      <Text style={styles.duration}>
                        {service.duration_minutes} min
                      </Text>
                    </View>
                    <View style={styles.serviceFooter}>
                      <Text style={styles.price}>
                        {service.price} {service.currency}
                      </Text>
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => handleServicePress(service.id)}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1A46',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconText: {
    fontSize: 48,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  servicesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceImageText: {
    fontSize: 32,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  bookButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
