import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin, DollarSign, X, Edit, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { useGetMyAppointmentsQuery, useCancelAppointmentMutation } from '@/store/services/appointmentApi';
import { useTranslation } from 'react-i18next';

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function MyBookingsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { data: allAppointments, isLoading, refetch, isFetching } = useGetMyAppointmentsQuery({});
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  // Filter appointments based on active tab
  const appointments = React.useMemo(() => {
    if (!allAppointments) return [];

    switch (activeTab) {
      case 'upcoming':
        return allAppointments.filter(apt =>
          ['pending', 'confirmed', 'in_progress'].includes(apt.status)
        );
      case 'completed':
        return allAppointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return allAppointments.filter(apt => apt.status === 'cancelled');
      default:
        return allAppointments;
    }
  }, [allAppointments, activeTab]);

  const handleCancelAppointment = (appointmentId: string, serviceName: string) => {
    Alert.alert(
      t('cancelAppointment'),
      t('cancelAppointmentConfirm', { serviceName }),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yesCancel'),
          style: 'destructive',
          onPress: async () => {
            Alert.prompt(
              t('cancellationReason'),
              t('provideCancellationReason'),
              async (reason) => {
                if (!reason || reason.trim() === '') {
                  Alert.alert(t('error'), t('provideReason'));
                  return;
                }
                try {
                  await cancelAppointment({
                    appointmentId,
                    reason: reason.trim()
                  }).unwrap();
                  Alert.alert(t('success'), t('appointmentCancelledSuccessfully'));
                  refetch();
                } catch (error: any) {
                  console.error('Cancel appointment error:', error);
                  const errorMessage = error?.data?.detail || error?.data?.message || t('failedToCancelAppointment');
                  Alert.alert(t('error'), errorMessage);
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

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    {
      id: 'upcoming',
      label: t('upcoming') || 'Upcoming',
      icon: Calendar,
      count: allAppointments?.filter(apt => ['pending', 'confirmed', 'in_progress'].includes(apt.status)).length || 0
    },
    {
      id: 'completed',
      label: t('completed') || 'Completed',
      icon: CheckCircle,
      count: allAppointments?.filter(apt => apt.status === 'completed').length || 0
    },
    {
      id: 'cancelled',
      label: t('cancelled') || 'Cancelled',
      icon: AlertTriangle,
      count: allAppointments?.filter(apt => apt.status === 'cancelled').length || 0
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myBookings')}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <IconComponent
                color={isActive ? 'white' : '#666'}
                size={20}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' && (t('noUpcomingBookings') || 'No upcoming bookings')}
              {activeTab === 'completed' && (t('noCompletedBookings') || 'No completed bookings')}
              {activeTab === 'cancelled' && (t('noCancelledBookings') || 'No cancelled bookings')}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' && (t('bookYourFirstService') || 'Book your first service to get started!')}
              {activeTab === 'completed' && (t('noCompletedBookingsYet') || 'No completed bookings yet.')}
              {activeTab === 'cancelled' && (t('noCancelledBookingsYet') || 'No cancelled bookings.')}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.browseButtonText}>{t('browseServices')}</Text>
              </TouchableOpacity>
            )}
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
                      <Text style={styles.rescheduleButtonText}>{t('reschedule')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.cancelButton, isCancelling && styles.disabledButton]}
                      onPress={() => handleCancelAppointment(appointment.id, appointment.service?.name || 'this service')}
                      disabled={isCancelling}
                    >
                      <X color="white" size={18} />
                      <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {appointment.status === 'completed' && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity
                      style={styles.reviewButton}
                      onPress={() => router.push(`/booking/write-review?appointmentId=${appointment.id}` as any)}
                    >
                      <Text style={styles.reviewButtonText}>{t('leaveReview')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookAgainButton}
                      onPress={() => router.push(`/service-detail?id=${appointment.service?.id}`)}
                    >
                      <Text style={styles.bookAgainButtonText}>{t('bookAgain')}</Text>
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
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: '#2D1A46',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: 'white',
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F4A896',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: '#F4A896',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBadgeTextActive: {
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
  reviewButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F4A896',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  bookAgainButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2D1A46',
  },
  bookAgainButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
