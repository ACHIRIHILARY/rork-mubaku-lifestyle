import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';

export default function SelectDateTime() {
  const { agentId } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const dates = [
    { id: '1', date: '2024-01-20', day: 'Today', available: true },
    { id: '2', date: '2024-01-21', day: 'Tomorrow', available: true },
    { id: '3', date: '2024-01-22', day: 'Mon', available: true },
    { id: '4', date: '2024-01-23', day: 'Tue', available: false },
    { id: '5', date: '2024-01-24', day: 'Wed', available: true },
  ];

  const times = [
    { id: '1', time: '9:00 AM', available: true },
    { id: '2', time: '10:30 AM', available: true },
    { id: '3', time: '12:00 PM', available: false },
    { id: '4', time: '2:00 PM', available: true },
    { id: '5', time: '3:30 PM', available: true },
    { id: '6', time: '5:00 PM', available: true },
  ];

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      router.push(`/booking/choose-location?agentId=${agentId}&date=${selectedDate}&time=${selectedTime}`);
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
        {/* Date Selection */}
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
                  !date.available && styles.unavailableDateCard
                ]}
                onPress={() => date.available && setSelectedDate(date.date)}
                disabled={!date.available}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDate === date.date && styles.selectedDateText,
                  !date.available && styles.unavailableText
                ]}>
                  {date.day}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate === date.date && styles.selectedDateText,
                  !date.available && styles.unavailableText
                ]}>
                  {new Date(date.date).getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock color="#2D1A46" size={24} />
            <Text style={styles.sectionTitle}>Choose Time</Text>
          </View>
          
          <View style={styles.timeGrid}>
            {times.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.timeCard,
                  selectedTime === time.time && styles.selectedTimeCard,
                  !time.available && styles.unavailableTimeCard
                ]}
                onPress={() => time.available && setSelectedTime(time.time)}
                disabled={!time.available}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time.time && styles.selectedTimeText,
                  !time.available && styles.unavailableText
                ]}>
                  {time.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
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