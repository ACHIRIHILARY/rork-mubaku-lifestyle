import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { ArrowLeft, User, Star, Phone, Mail } from 'lucide-react-native';
import { useGetApprovedProvidersQuery } from '@/store/services/profileApi';
import { useGetAllServicesQuery } from '@/store/services/servicesApi';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: providers } = useGetApprovedProvidersQuery(undefined);
  const { data: allServices } = useGetAllServicesQuery({});

  const provider = React.useMemo(() => {
    if (!providers || !id) return null;
    return providers.find(p => p.pkid === parseInt(id));
  }, [providers, id]);

  const providerServices = React.useMemo(() => {
    if (!allServices || !provider) return [];
    return allServices.filter(service => service.provider_details?.pkid === provider.pkid);
  }, [allServices, provider]);

  const handleServicePress = (serviceId: string) => {
    router.push(`/service-detail?id=${serviceId}` as any);
  };

  const handleContactPress = () => {
    if (!provider?.phone_number) {
      Alert.alert('Contact Info', 'Phone number not available');
      return;
    }
    Alert.alert(
      'Contact Provider',
      `Call ${provider.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call', onPress: () => {
            // In a real app, you'd use Linking to make a call
            console.log('Call:', provider.phone_number);
          }
        },
      ]
    );
  };

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Loading provider details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {provider.profile_photo ? (
              <Image source={{ uri: provider.profile_photo }} style={styles.galleryImage} />
            ) : (
              <View style={styles.galleryImagePlaceholder}>
                <User color="white" size={64} />
                <Text style={styles.galleryPlaceholderText}>Provider Image</Text>
              </View>
            )}
            {/* Future: Add more images here when API supports multiple images */}
          </ScrollView>
        </View>

        {/* Provider Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {provider.profile_photo ? (
                <Image source={{ uri: provider.profile_photo }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <User color="white" size={32} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.providerName}>{provider.full_name}</Text>
              <View style={styles.ratingContainer}>
                <Star color="#FFD700" size={16} fill="#FFD700" />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.reviewsText}>(24 reviews)</Text>
              </View>
              <Text style={styles.providerLocation}>📍 {provider.city || 'Location not specified'}</Text>
            </View>
          </View>

          {provider.about_me && (
            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{provider.about_me}</Text>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.averageRating}>
                <Star color="#FFD700" size={20} fill="#FFD700" />
                <Text style={styles.averageRatingText}>4.8</Text>
                <Text style={styles.totalReviewsText}>(24 reviews)</Text>
              </View>
            </View>

            {/* Sample Reviews - In real app, fetch from API */}
            <View style={styles.reviewList}>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>Alice Johnson</Text>
                  <View style={styles.reviewRating}>
                    <Star color="#FFD700" size={14} fill="#FFD700" />
                    <Text style={styles.reviewRatingText}>5</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>Great service! Highly professional and punctual. Will definitely book again.</Text>
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>Bob Wilson</Text>
                  <View style={styles.reviewRating}>
                    <Star color="#FFD700" size={14} fill="#FFD700" />
                    <Text style={styles.reviewRatingText}>4</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>Very satisfied with the service. Clean and efficient work.</Text>
              </View>

              <TouchableOpacity style={styles.viewAllReviewsButton}>
                <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            {provider.phone_number && (
              <TouchableOpacity style={styles.contactItem} onPress={handleContactPress}>
                <Phone color="#2D1A46" size={20} />
                <Text style={styles.contactText}>{provider.phone_number}</Text>
              </TouchableOpacity>
            )}
            {provider.email && (
              <View style={styles.contactItem}>
                <Mail color="#2D1A46" size={20} />
                <Text style={styles.contactText}>{provider.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services by {provider.first_name}</Text>

          {providerServices && providerServices.length > 0 ? (
            <View style={styles.servicesGrid}>
              {providerServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                >
                  <View style={styles.serviceImageContainer}>
                    {service.image_url ? (
                      <Image source={{ uri: service.image_url }} style={styles.serviceImage} />
                    ) : (
                      <View style={styles.serviceImagePlaceholder}>
                        <Text style={styles.serviceImageText}>💼</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                    <Text style={styles.serviceCategory} numberOfLines={1}>{service.category_details?.name || 'Service'}</Text>
                    <View style={styles.serviceMeta}>
                      <Text style={styles.servicePrice}>{Math.floor(Number(service.price))} {service.currency}</Text>
                      <Text style={styles.serviceDuration}>{service.duration_minutes}min</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyServicesText}>No services available from this provider</Text>
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
  content: {
    flex: 1,
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
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  providerLocation: {
    fontSize: 14,
    color: '#666',
  },
  aboutSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2D1A46',
  },
  servicesSection: {
    padding: 16,
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
    width: '31%', // 3 columns
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
    height: 70,
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
    fontSize: 20,
  },
  serviceInfo: {
    padding: 8,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  serviceDuration: {
    fontSize: 9,
    color: '#666',
  },
  emptyServices: {
    padding: 32,
    alignItems: 'center',
  },
  emptyServicesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imageGallery: {
    height: 250,
    backgroundColor: '#F5F5F5',
  },
  imageScroll: {
    flex: 1,
  },
  galleryImage: {
    width: 300,
    height: 200,
    margin: 16,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  galleryImagePlaceholder: {
    width: 300,
    height: 200,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryPlaceholderText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  reviewsSection: {
    marginBottom: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRatingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalReviewsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  viewAllReviewsButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: '#F4A896',
    fontWeight: '600',
  },
});
