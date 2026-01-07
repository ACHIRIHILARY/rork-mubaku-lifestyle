import { router } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Search, X, User } from 'lucide-react-native';
import { useGetCurrentUserQuery } from '@/store/services/authApi';
import { useTranslation } from 'react-i18next';
import { useGetAllServicesQuery, useGetAllCategoriesQuery } from '@/store/services/servicesApi';
import { useGetApprovedProvidersQuery } from '@/store/services/profileApi';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '@/store/languageSlice';
import type { RootState, AppDispatch } from '@/store/store';


export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const { data: user } = useGetCurrentUserQuery();

  const queryParams: { category?: string; search?: string } = {};
  if (selectedCategory) queryParams.category = selectedCategory.toString();
  if (debouncedSearch) queryParams.search = debouncedSearch;

  const { data: services, isLoading: servicesLoading } = useGetAllServicesQuery(queryParams);
  const { data: categories } = useGetAllCategoriesQuery();
  const { data: providers } = useGetApprovedProvidersQuery();

  const handleServicePress = (serviceId: string) => {
    router.push(`/service-detail?id=${serviceId}` as any);
  };

  const handleProviderPress = (providerId: number) => {
    console.log('Provider selected:', providerId);
    router.push(`/provider-detail?id=${providerId}` as any);
  };

  const handleCategoryPress = (categoryId: number) => {
    console.log('Category selected:', categoryId);
    router.push(`/category-detail?id=${categoryId}` as any);
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

  // Redirect providers to dashboard
  React.useEffect(() => {
    if (user?.role === 'provider') {
      router.replace('/(tabs)/dashboard' as any);
    }
  }, [user]);

  // Mock personalized data - in real app, fetch from API
  const upcomingAppointments = [
    {
      id: '1',
      service: { name: 'Haircut & Styling', provider_details: { full_name: 'Beauty Studio Pro' } },
      scheduled_for: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      status: 'confirmed'
    }
  ];

  const previousBookings = [
    {
      provider: { pkid: 1, full_name: 'Beauty Studio Pro', city: 'Yaounde' },
      lastService: 'Haircut & Styling',
      lastBooked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    },
    {
      provider: { pkid: 2, full_name: 'Relax Spa Center', city: 'Douala' },
      lastService: 'Full Body Massage',
      lastBooked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    }
  ];

  const recommendedServices = services?.slice(0, 4) || []; // Mock recommendations

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTop}>
            <View>
              <Text style={styles.greeting}>{t('greeting', { name: user?.first_name || 'Guest' })}</Text>
              <Text style={styles.subGreeting}>{t('subGreeting')}</Text>
            </View>
            <View style={styles.languageSwitcher}>
              <TouchableOpacity
                style={[styles.langButton, currentLanguage === 'en' && styles.langButtonActive]}
                onPress={() => {
                  dispatch(setLanguage('en'));
                  i18n.changeLanguage('en');
                }}
              >
                <Text style={styles.langButtonText}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langButton, currentLanguage === 'fr' && styles.langButtonActive]}
                onPress={() => {
                  dispatch(setLanguage('fr'));
                  i18n.changeLanguage('fr');
                }}
              >
                <Text style={styles.langButtonText}>FR</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#666" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
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

        {/* Personalized Sections for Clients */}
        {user?.role !== 'provider' && (
          <>
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>📅 Upcoming Appointments</Text>
                </View>
                {upcomingAppointments.map((appointment) => (
                  <TouchableOpacity
                    key={appointment.id}
                    style={styles.appointmentCard}
                    onPress={() => router.push('/(tabs)/my-bookings' as any)}
                  >
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentService}>{appointment.service.name}</Text>
                      <Text style={styles.appointmentProvider}>with {appointment.service.provider_details?.full_name}</Text>
                      <Text style={styles.appointmentDate}>
                        {appointment.scheduled_for.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View style={styles.appointmentStatus}>
                      <Text style={styles.appointmentStatusText}>Confirmed</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Book Again */}
            {previousBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🔄 Book Again</Text>
                  <Text style={styles.sectionSubtitle}>Quick access to your favorite providers</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.bookAgainContainer}>
                    {previousBookings.map((booking) => (
                      <TouchableOpacity
                        key={booking.provider.pkid}
                        style={styles.bookAgainCard}
                        onPress={() => handleProviderPress(booking.provider.pkid)}
                      >
                        <View style={styles.bookAgainAvatar}>
                          <User color="white" size={24} />
                        </View>
                        <View style={styles.bookAgainInfo}>
                          <Text style={styles.bookAgainName} numberOfLines={1}>
                            {booking.provider.full_name}
                          </Text>
                          <Text style={styles.bookAgainService} numberOfLines={1}>
                            {booking.lastService}
                          </Text>
                          <Text style={styles.bookAgainLocation}>
                            📍 {booking.provider.city}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Recommendations */}
            {recommendedServices.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>✨ Recommended for You</Text>
                  <Text style={styles.sectionSubtitle}>Popular services near you</Text>
                </View>
                <View style={styles.recommendationsGrid}>
                  {recommendedServices.slice(0, 4).map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.recommendationCard}
                      onPress={() => handleServicePress(service.id)}
                    >
                      <View style={styles.recommendationImage}>
                        {service.image ? (
                          <Image source={{ uri: service.image }} style={styles.recommendationImageContent} />
                        ) : (
                          <View style={styles.recommendationImagePlaceholder}>
                            <Text style={styles.recommendationImageText}>💼</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.recommendationInfo}>
                        <Text style={styles.recommendationName} numberOfLines={1}>
                          {service.name}
                        </Text>
                        <Text style={styles.recommendationProvider} numberOfLines={1}>
                          by {service.provider_name}
                        </Text>
                        <Text style={styles.recommendationPrice}>
                          {service.price_display}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('categories')}</Text>
              {(selectedCategory || debouncedSearch) && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={handleClearAll}
                >
                  <X color="#666" size={16} />
                  <Text style={styles.clearFilterText}>{t('clearAll')}</Text>
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
              <Text style={styles.sectionTitle}>{t('approvedProviders')}</Text>
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
                    <Text style={styles.viewProfileButtonText}>{t('viewProfile')}</Text>
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
              {selectedCategory || debouncedSearch ? t('searchResults') : t('availableServices')}
            </Text>
            {servicesLoading && debouncedSearch && (
              <ActivityIndicator size="small" color="#2D1A46" />
            )}
          </View>
          {services && services.length > 0 ? (
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                >
                  <View style={styles.serviceImageContainer}>
                    {service.image ? (
                      <Image source={{ uri: service.image }} style={styles.serviceImage} />
                    ) : (
                      <View style={styles.serviceImagePlaceholder}>
                        <Text style={styles.serviceImageText}>💼</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceName} numberOfLines={2}>{service.name}</Text>
                      {service.is_verified_provider && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerBusiness} numberOfLines={1}>{service.provider_business}</Text>
                      <Text style={styles.providerName} numberOfLines={1}>by {service.provider_name}</Text>
                    </View>
                    <Text style={styles.serviceCategory} numberOfLines={1}>{service.category_name}</Text>
                    <View style={styles.locationRow}>
                      <Text style={styles.serviceLocation}>📍 {service.provider_location.city}</Text>
                    </View>
                    <View style={styles.serviceMeta}>
                      <Text style={styles.servicePrice}>{service.price_display}</Text>
                      <Text style={styles.serviceDuration}>{service.duration_minutes}min</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {debouncedSearch || selectedCategory
                  ? t('noServicesFound')
                  : t('noServicesAvailable')
                }
              </Text>
              {(debouncedSearch || selectedCategory) && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                >
                  <Text style={styles.clearAllButtonText}>{t('clearFilters')}</Text>
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
  welcomeSection: {
    backgroundColor: '#F4A896',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeTop: {
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
  languageSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  langButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  langButtonActive: {
    backgroundColor: '#8B5CF6',
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    backgroundColor: '#FFF5F3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  serviceLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D1A46',
  },
  locationRowDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  serviceLocationDisabled: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%', // 2 columns
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceImageContainer: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImageText: {
    fontSize: 32,
  },
  serviceInfo: {
    padding: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  providerInfo: {
    marginBottom: 6,
  },
  providerBusiness: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D1A46',
  },
  providerName: {
    fontSize: 11,
    color: '#666',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 4,
  },
  appointmentProvider: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#F4A896',
    fontWeight: '500',
  },
  appointmentStatus: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  bookAgainContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  bookAgainCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookAgainAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bookAgainInfo: {
    alignItems: 'center',
  },
  bookAgainName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAgainService: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAgainLocation: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  recommendationImageContent: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendationImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationImageText: {
    fontSize: 20,
  },
  recommendationInfo: {
    padding: 12,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 4,
  },
  recommendationProvider: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recommendationPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F4A896',
  },
});
