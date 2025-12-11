import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';

export default function SelectDateTime() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const availableDates = useMemo(() => {
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30:00`);
      }
    }
    return slots;
  }, []);

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
    if (selectedDate && selectedTime) {
      const [hours] = selectedTime.split(':');
      const endHour = parseInt(hours) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;
      router.push(`/booking/summary?serviceId=${serviceId}&date=${selectedDate}&startTime=${selectedTime}&endTime=${endTime}`);
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color="#2D1A46" size={24} />
            <Text style={styles.sectionTitle}>Choose Date</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {availableDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dateCard,
                    selectedDate === dateStr && styles.selectedDateCard,
                  ]}
                  onPress={() => {
                    setSelectedDate(dateStr);
                    setSelectedTime('');
                  }}
                >
                  <Text style={[
                    styles.dateDay,
                    selectedDate === dateStr && styles.selectedDateText,
                  ]}>
                    {formatDate(dateStr)}
                  </Text>
                  <Text style={[
                    styles.dateNumber,
                    selectedDate === dateStr && styles.selectedDateText,
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color="#2D1A46" size={24} />
              <Text style={styles.sectionTitle}>Choose Time</Text>
            </View>
            
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeCard,
                      isSelected && styles.selectedTimeCard,
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[
                      styles.timeText,
                      isSelected && styles.selectedTimeText,
                    ]}>
                      {formatTime(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedDate || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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