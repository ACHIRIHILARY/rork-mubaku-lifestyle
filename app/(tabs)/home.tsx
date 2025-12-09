import { router } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Search, Star, X, User } from 'lucide-react-native';
import { useGetCurrentUserQuery } from '@/store/services/authApi';
import { useGetAllServicesQuery, useGetAllCategoriesQuery } from '@/store/services/servicesApi';
import { useGetApprovedProvidersQuery } from '@/store/services/profileApi';



export default function HomeScreen() {

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  
  const queryParams: { category?: string; search?: string } = {};
  if (selectedCategory) queryParams.category = selectedCategory.toString();
  if (debouncedSearch) queryParams.search = debouncedSearch;
  
  const { data: services, isLoading: servicesLoading } = useGetAllServicesQuery(queryParams);
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: providers, isLoading: providersLoading } = useGetApprovedProvidersQuery();
  
  const handleServicePress = (serviceId: string) => {
    router.push(`/service-detail?id=${serviceId}`);
  };

  const handleProviderPress = (providerId: number) => {
    console.log('Provider selected:', providerId);
    router.push(`/profile-settings?userId=${providerId}`);
  };
  
  const handleCategoryPress = (categoryId: number) => {
    console.log('Category selected:', categoryId);
    router.push(`/category-detail?id=${categoryId}`);
  };
  
  const handleCategoryFilter = (categoryPkid: number) => {
    console.log('Filtering by category pkid:', categoryPkid);
    setSelectedCategory(categoryPkid);
  };
  
  const handleClearSearch = useCallback(() => {
    console.log('Clearing search');
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);
  
  const handleClearAll = useCallback(() => {
    console.log('Clearing all filters');
    setSelectedCategory(null);
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  console.log('Home screen loaded', { 
    user, 
    servicesCount: services?.length, 
    categoriesCount: categories?.length,
    providersCount: providers?.length 
  });

  const isLoading = userLoading || servicesLoading || categoriesLoading || providersLoading;

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
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#666" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <X color="#666" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              {(selectedCategory || debouncedSearch) && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={handleClearAll}
                >
                  <X color="#666" size={16} />
                  <Text style={styles.clearFilterText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.pkid;
                  return (
                    <TouchableOpacity 
                      key={category.id} 
                      style={[
                        styles.categoryCard,
                        isSelected && styles.categoryCardSelected
                      ]}
                      onPress={() => handleCategoryFilter(category.pkid)}
                      onLongPress={() => handleCategoryPress(category.pkid)}
                    >
                      <Text style={styles.categoryIcon}>💇</Text>
                      <Text style={[
                        styles.categoryName,
                        isSelected && styles.categoryNameSelected
                      ]}>{category.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Approved Providers */}
        {providers && providers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Approved Providers</Text>
            </View>
            <View style={styles.providersContainer}>
              {providers.map((provider) => (
                <TouchableOpacity 
                  key={provider.pkid} 
                  style={styles.providerCard}
                  onPress={() => handleProviderPress(provider.pkid)}
                >
                  <View style={styles.providerImagePlaceholder}>
                    <User color="white" size={32} />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.full_name}</Text>
                    {provider.about_me && (
                      <Text style={styles.providerAbout} numberOfLines={2}>
                        {provider.about_me}
                      </Text>
                    )}
                    {provider.city && (
                      <Text style={styles.providerLocation}>📍 {provider.city}</Text>
                    )}
                    {provider.phone_number && (
                      <Text style={styles.providerContact}>📞 {provider.phone_number}</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.viewProfileButton}
                    onPress={() => handleProviderPress(provider.pkid)}
                  >
                    <Text style={styles.viewProfileButtonText}>View Profile</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Top Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory || debouncedSearch ? 'Search Results' : 'Available Services'}
            </Text>
            {servicesLoading && debouncedSearch && (
              <ActivityIndicator size="small" color="#2D1A46" />
            )}
          </View>
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
              <Text style={styles.emptyText}>
                {debouncedSearch || selectedCategory 
                  ? 'No services found matching your criteria' 
                  : 'No services available at this time'
                }
              </Text>
              {(debouncedSearch || selectedCategory) && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                >
                  <Text style={styles.clearAllButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
    minWidth: 100,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    backgroundColor: '#2D1A46',
    borderColor: '#F4A896',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: 'white',
  },
  providersContainer: {
    gap: 16,
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  providerAbout: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  providerLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  providerContact: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  viewProfileButton: {
    backgroundColor: '#F4A896',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  clearAllButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  clearAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
