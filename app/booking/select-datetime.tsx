import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { useGetAvailableSlotsQuery } from '@/store/services/appointmentApi';

export default function SelectDateTime() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 14);

  const { data: slots, isLoading } = useGetAvailableSlotsQuery({
    serviceId: serviceId || '',
    startDate: today.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }, {
    skip: !serviceId,
  });

  const dateSlots = useMemo(() => {
    if (!slots) return {};
    
    const grouped: { [date: string]: typeof slots } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [slots]);

  const availableDates = useMemo(() => {
    return Object.keys(dateSlots).sort();
  }, [dateSlots]);

  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !dateSlots[selectedDate]) return [];
    return dateSlots[selectedDate];
  }, [selectedDate, dateSlots]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateOnly = dateStr;
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayStr) return 'Today';
    if (dateOnly === tomorrowStr) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleNext = () => {
    if (selectedDate && selectedSlot) {
      router.push(`/booking/choose-location?serviceId=${serviceId}&date=${selectedDate}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
            <Text style={styles.loadingText}>Loading available slots...</Text>
          </View>
        ) : availableDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>No Available Slots</Text>
            <Text style={styles.emptyText}>This service has no available time slots at the moment.</Text>
          </View>
        ) : (
          <>
            {/* Date Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar color="#2D1A46" size={24} />
                <Text style={styles.sectionTitle}>Choose Date</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {availableDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateCard,
                      selectedDate === date && styles.selectedDateCard,
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                  >
                    <Text style={[
                      styles.dateDay,
                      selectedDate === date && styles.selectedDateText,
                    ]}>
                      {formatDate(date)}
                    </Text>
                    <Text style={[
                      styles.dateNumber,
                      selectedDate === date && styles.selectedDateText,
                    ]}>
                      {new Date(date).getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time Selection */}
            {selectedDate && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock color="#2D1A46" size={24} />
                  <Text style={styles.sectionTitle}>Choose Time</Text>
                </View>
                
                {timeSlotsForSelectedDate.length === 0 ? (
                  <View style={styles.emptyTimeContainer}>
                    <Text style={styles.emptyTimeText}>No time slots available for this date</Text>
                  </View>
                ) : (
                  <View style={styles.timeGrid}>
                    {timeSlotsForSelectedDate.map((slot, index) => {
                      const isSelected = selectedSlot?.start === slot.start_time && selectedSlot?.end === slot.end_time;
                      return (
                        <TouchableOpacity
                          key={`${slot.date}-${slot.start_time}-${index}`}
                          style={[
                            styles.timeCard,
                            isSelected && styles.selectedTimeCard,
                          ]}
                          onPress={() => setSelectedSlot({ start: slot.start_time, end: slot.end_time })}
                        >
                          <Text style={[
                            styles.timeText,
                            isSelected && styles.selectedTimeText,
                          ]}>
                            {formatTime(slot.start_time)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Next Button */}
      {!isLoading && availableDates.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!selectedDate || !selectedSlot) && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!selectedDate || !selectedSlot}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  unavailableDateCard: {
    backgroundColor: '#F0F0F0',
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
  unavailableText: {
    color: '#999',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    paddingHorizontal: 32,
  },
  emptyTimeContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTimeText: {
    fontSize: 14,
    color: '#999',
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
  unavailableTimeCard: {
    backgroundColor: '#F0F0F0',
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
  nextButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});