import { router } from 'expo-router';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Search, Bell, Star, Settings } from 'lucide-react-native';
import { useGetCurrentUserQuery } from '@/store/services/authApi';
import { useGetAllServicesQuery, useGetAllCategoriesQuery } from '@/store/services/servicesApi';


export default function HomeScreen() {
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: services, isLoading: servicesLoading } = useGetAllServicesQuery({});
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const handleServicePress = (serviceId: string) => {
    router.push(`/service-detail?id=${serviceId}`);
  };

  console.log('Home screen loaded', { user, servicesCount: services?.length, categoriesCount: categories?.length });

  const isLoading = userLoading || servicesLoading || categoriesLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.first_name || 'Guest'}!</Text>
              <Text style={styles.subGreeting}>Find your perfect look</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell color="white" size={24} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => router.push('/profile-settings')}
              >
                <Settings color="white" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#666" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services or agents..."
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {categories.slice(0, 4).map((category) => (
                  <TouchableOpacity key={category.id} style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>💇</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Top Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services && services.length > 0 ? (
            <View style={styles.agentsContainer}>
              {services.map((service) => (
                <TouchableOpacity 
                  key={service.id} 
                  style={styles.agentCard}
                  onPress={() => handleServicePress(service.id)}
                >
                  <View style={styles.agentImagePlaceholder}>
                    <Text style={styles.agentImageText}>💼</Text>
                  </View>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{service.name}</Text>
                    <Text style={styles.agentService}>{service.category_details?.name || 'Service'}</Text>
                    <View style={styles.agentMeta}>
                      <View style={styles.ratingContainer}>
                        <Star color="#FFD700" size={16} fill="#FFD700" />
                        <Text style={styles.rating}>{service.rating || '5.0'}</Text>
                      </View>
                      <Text style={styles.price}>{service.price} {service.currency}</Text>
                    </View>
                    <View style={styles.durationContainer}>
                      <Text style={styles.duration}>{service.duration_minutes} min</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.bookButton}
                      onPress={() => handleServicePress(service.id)}
                    >
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services available at the moment</Text>
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
  header: {
    backgroundColor: '#F4A896',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  notificationButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
  agentsContainer: {
    gap: 16,
  },
  agentCard: {
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
  agentImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  agentImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentImageText: {
    fontSize: 32,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  agentService: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  agentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  durationContainer: {
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});