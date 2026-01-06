import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { useGetServiceByIdQuery } from '@/store/services/servicesApi';

export default function BookingSummary() {
  const { serviceId, date, startTime, endTime } = useLocalSearchParams<{
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
  }>();

  const { data: service, isLoading } = useGetServiceByIdQuery(serviceId || '', {
    skip: !serviceId,
  });

  const durationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / 60000;
  }, [startTime, endTime]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleConfirmBooking = () => {
    if (service) {
      router.push(
        `/booking/payment?serviceId=${serviceId}&date=${date}&startTime=${startTime}&endTime=${endTime}&amount=${service.price}&currency=${service.currency}`
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service not found</Text>
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
        <Text style={styles.headerTitle}>Review Your Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Service Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service</Text>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.categoryName}>{service.category_details?.name}</Text>
          {service.provider_details && (
            <Text style={styles.providerName}>By {service.provider_details.full_name}</Text>
          )}
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>

          <View style={styles.detailRow}>
            <Calendar color="#666" size={20} />
            <Text style={styles.detailText}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock color="#666" size={20} />
            <Text style={styles.detailText}>
              {formatTime(startTime)} - {formatTime(endTime)}
            </Text>
          </View>

          {durationMinutes > 0 && (
            <View style={styles.detailRow}>
              <Clock color="#666" size={20} />
              <Text style={styles.detailText}>{durationMinutes} minutes</Text>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Cost</Text>
              <Text style={styles.priceValue}>
                {service.currency} {Number(service.price).toFixed(0)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>App Fee</Text>
              <Text style={styles.priceValue}>
                {service.currency} {Math.floor(Number(service.price) * 0.05)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes</Text>
              <Text style={styles.priceValue}>
                {service.currency} {Math.floor(Number(service.price) * 0.18)}
              </Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {service.currency} {Math.floor(Number(service.price) * 1.23)}
              </Text>
            </View>
          </View>

          <Text style={styles.priceNote}>
            * Final amount may vary based on payment processing fees
          </Text>
        </View>
        {/* Confirm Button - Now inside scroll view for better Android navigation */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Extra spacing for Android navigation */}
        <View style={styles.bottomSpacing} />
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
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
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
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
  priceCard: {
    backgroundColor: '#2D1A46',
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceHeaderLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceHeaderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  priceBreakdown: {
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  priceNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20, // Extra padding for Android navigation bar
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  confirmButton: {
    backgroundColor: '#F4A896',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Platform.OS === 'android' ? 80 : 20, // Extra spacing for Android navigation
  },
});
