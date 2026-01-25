import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { useGetAppointmentDetailQuery, useRescheduleAppointmentMutation, useGetAvailableSlotsQuery } from '@/store/services/appointmentApi';
import CustomTabBar from '../components/CustomTabBar';

export default function RescheduleAppointmentScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { data: appointment, isLoading: appointmentLoading } = useGetAppointmentDetailQuery(appointmentId!);
  const [reschedule, { isLoading: isRescheduling }] = useRescheduleAppointmentMutation();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<{ start: string; end: string } | null>(null);

  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const { data: slots, isLoading: slotsLoading } = useGetAvailableSlotsQuery(
    {
      serviceId: appointment?.service_id || '',
      startDate,
      endDate,
    },
    { skip: !appointment?.service_id }
  );

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      id: i.toString(),
      date: date.toISOString().split('T')[0],
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      available: true,
    };
  });

  const availableTimesForDate = slots?.filter(slot => slot.date === selectedDate) || [];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointmentId) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    try {
      await reschedule({
        appointmentId,
        scheduled_for: selectedTime.start,
        scheduled_until: selectedTime.end,
      }).unwrap();

      Alert.alert(
        'Success',
        'Your appointment has been rescheduled successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Reschedule error:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to reschedule appointment';
      Alert.alert('Error', errorMessage);
    }
  };

  if (appointmentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appointment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reschedule Appointment</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.serviceName}>{appointment.service?.name}</Text>
            <Text style={styles.currentSchedule}>
              Current: {new Date(appointment.scheduled_for).toLocaleDateString()} at{' '}
              {new Date(appointment.scheduled_for).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar color="#2D1A46" size={24} />
              <Text style={styles.sectionTitle}>Choose Date</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date) => (
                <TouchableOpacity
                  key={date.id}
                  style={[
                    styles.dateCard,
                    selectedDate === date.date && styles.selectedDateCard,
                  ]}
                  onPress={() => {
                    setSelectedDate(date.date);
                    setSelectedTime(null);
                  }}
                >
                  <Text style={[
                    styles.dateDay,
                    selectedDate === date.date && styles.selectedDateText,
                  ]}>
                    {date.day}
                  </Text>
                  <Text style={[
                    styles.dateNumber,
                    selectedDate === date.date && styles.selectedDateText,
                  ]}>
                    {new Date(date.date).getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedDate && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock color="#2D1A46" size={24} />
                <Text style={styles.sectionTitle}>Available Times</Text>
              </View>
              
              {slotsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2D1A46" />
                </View>
              ) : availableTimesForDate.length === 0 ? (
                <View style={styles.noSlotsContainer}>
                  <Text style={styles.noSlotsText}>No available times for this date</Text>
                </View>
              ) : (
                <View style={styles.timeGrid}>
                  {availableTimesForDate.map((slot, index) => {
                    const isSelected = selectedTime?.start === slot.start_time && selectedTime?.end === slot.end_time;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeCard,
                          isSelected && styles.selectedTimeCard,
                        ]}
                        onPress={() => setSelectedTime({ start: slot.start_time, end: slot.end_time })}
                      >
                        <Text style={[
                          styles.timeText,
                          isSelected && styles.selectedTimeText,
                        ]}>
                          {new Date(slot.start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.rescheduleButton,
                (!selectedDate || !selectedTime || isRescheduling) && styles.disabledButton
              ]}
              onPress={handleReschedule}
              disabled={!selectedDate || !selectedTime || isRescheduling}
            >
              {isRescheduling ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.rescheduleButtonText}>Confirm Reschedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar />
    </View>
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
  appointmentInfo: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  currentSchedule: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginLeft: 12,
  },
  dateScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDateCard: {
    backgroundColor: '#2D1A46',
  },
  dateDay: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  selectedDateText: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedTimeCard: {
    backgroundColor: '#2D1A46',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
  },
  selectedTimeText: {
    color: 'white',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  rescheduleButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  rescheduleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
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
  noSlotsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#666',
  },
});
