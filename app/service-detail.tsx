import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Star, Clock, DollarSign, MapPin } from 'lucide-react-native';
import { useGetServiceByIdQuery } from '@/store/services/servicesApi';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = Array.isArray(id) ? id[0] : id;

  const { data: service, isLoading, error } = useGetServiceByIdQuery(serviceId || '', {
    skip: !serviceId,
  });

  const durationHours = useMemo(() => {
    if (!service) return '';
    const hours = Math.floor(service.duration_minutes / 60);
    const minutes = service.duration_minutes % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  }, [service]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity 
            style={styles.backToHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToHomeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Service Info */}
        <View style={styles.content}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {service.rating !== undefined && service.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Star color="#FFD700" size={20} fill="#FFD700" />
                <Text style={styles.rating}>{service.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {service.category_details && (
            <Text style={styles.category}>{service.category_details.name}</Text>
          )}
          {service.provider_location && (
            <Text style={styles.providerName}>By {service.provider_location.full_name || 'Provider'}</Text>
          )}
          {service.total_bookings !== undefined && service.total_bookings > 0 && (
            <Text style={styles.bookingsCount}>{service.total_bookings} bookings</Text>
          )}

          {/* Service Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Service Details</Text>
            
            <View style={styles.detailRow}>
              <Clock color="#666" size={20} />
              <Text style={styles.detailText}>Duration: {durationHours}</Text>
            </View>

            <View style={styles.detailRow}>
              <DollarSign color="#666" size={20} />
              <Text style={styles.detailText}>Price: {service.currency} {service.price}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: service.is_active ? '#4CAF50' : '#F44336' }]} />
              <Text style={styles.statusText}>{service.is_active ? 'Available' : 'Currently Unavailable'}</Text>
            </View>
          </View>

          {/* Description */}
          {service.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.description}>{service.description}</Text>
            </View>
          )}

          {/* Location */}
          {((service.provider_location?.latitude && service.provider_location?.longitude) || (service.provider_location?.latitude && service.provider_location?.longitude)) && (
            <View style={styles.locationCard}>
              <Text style={styles.cardTitle}>Location</Text>
              <Text style={styles.locationText}>
                {service.provider_location?.location || service.provider_location?.location || service.provider_location?.city || 'Service Location'}
              </Text>
              <TouchableOpacity 
                style={styles.viewLocationButton}
                onPress={() => router.push(`/view-location?latitude=${service.provider_location?.latitude || service.provider_location?.latitude}&longitude=${service.provider_location?.longitude || service.provider_location?.longitude}&locationName=${encodeURIComponent(service.location || service.provider_location?.location || service.provider_location?.city || 'Service Location')}&serviceName=${encodeURIComponent(service.name)}` as any)}
              >
                <MapPin color="white" size={18} />
                <Text style={styles.viewLocationButtonText}>View on Map</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Provider Info */}
          {service.provider_location && (
            <View style={styles.providerCard}>
              <Text style={styles.cardTitle}>Provider Information</Text>
              <Text style={styles.providerInfo}>
                {service.provider_location.full_name || 'Provider'}
              </Text>
              {service.provider_location.email && (
                <Text style={styles.providerContact}>{service.provider_location.email}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Button */}
      {service.is_active && (
        <View style={styles.bookingContainer}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => router.push(`/booking/select-datetime?serviceId=${service.id}`)}
          >
            <Text style={styles.bookButtonText}>Book Service</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 24,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  category: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    color: '#2D1A46',
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingsCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  viewLocationButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  viewLocationButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerInfo: {
    fontSize: 16,
    color: '#2D1A46',
    fontWeight: '600',
    marginBottom: 4,
  },
  providerContact: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
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
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backToHomeButton: {
    backgroundColor: '#2D1A46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bookButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});