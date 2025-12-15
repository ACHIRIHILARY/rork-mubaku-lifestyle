import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin, DollarSign, X, Edit } from 'lucide-react-native';
import { useGetMyAppointmentsQuery, useCancelAppointmentMutation } from '@/store/services/appointmentApi';

type StatusFilter = '' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export default function MyBookingsScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const { data: appointments, isLoading, refetch, isFetching } = useGetMyAppointmentsQuery({ 
    status: statusFilter || undefined 
  });
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  const handleCancelAppointment = (appointmentId: string, serviceName: string) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment for "${serviceName}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            Alert.prompt(
              'Cancellation Reason',
              'Please provide a reason for cancellation:',
              async (reason) => {
                if (!reason || reason.trim() === '') {
                  Alert.alert('Error', 'Please provide a cancellation reason');
                  return;
                }
                try {
                  await cancelAppointment({
                    appointmentId,
                    reason: reason.trim()
                  }).unwrap();
                  Alert.alert('Success', 'Appointment cancelled successfully');
                  refetch();
                } catch (error: any) {
                  console.error('Cancel appointment error:', error);
                  const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to cancel appointment';
                  Alert.alert('Error', errorMessage);
                }
              },
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const handleReschedule = (appointmentId: string) => {
    router.push(`/booking/reschedule?appointmentId=${appointmentId}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'completed':
        return '#9C27B0';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                statusFilter === filter.value && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text style={[
                styles.filterText,
                statusFilter === filter.value && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
          </View>
        ) : !appointments || appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
              {statusFilter 
                ? `You don't have any ${statusFilter} bookings` 
                : "You haven't made any bookings yet"}
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseButtonText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appointmentsContainer}>
            {appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.serviceName}>
                    <Text style={styles.serviceTitle}>
                      {appointment.service?.name || 'Service'}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(appointment.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(appointment.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Calendar color="#666" size={18} />
                    <Text style={styles.detailText}>
                      {new Date(appointment.scheduled_for).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock color="#666" size={18} />
                    <Text style={styles.detailText}>
                      {new Date(appointment.scheduled_for).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(appointment.scheduled_until).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {appointment.provider?.full_name && (
                    <View style={styles.detailRow}>
                      <MapPin color="#666" size={18} />
                      <Text style={styles.detailText}>
                        Provider: {appointment.provider.full_name}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <DollarSign color="#666" size={18} />
                    <Text style={styles.detailText}>
                      {appointment.amount} {appointment.currency}
                    </Text>
                  </View>

                  {appointment.payment_status && (
                    <View style={styles.paymentStatus}>
                      <Text style={styles.paymentStatusText}>
                        Payment: {appointment.payment_status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  )}
                </View>

                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity
                      style={styles.rescheduleButton}
                      onPress={() => handleReschedule(appointment.id)}
                    >
                      <Edit color="#2D1A46" size={18} />
                      <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.cancelButton, isCancelling && styles.disabledButton]}
                      onPress={() => handleCancelAppointment(appointment.id, appointment.service?.name || 'this service')}
                      disabled={isCancelling}
                    >
                      <X color="white" size={18} />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2D1A46',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2D1A46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appointmentHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  appointmentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paymentStatus: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF4444',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
});