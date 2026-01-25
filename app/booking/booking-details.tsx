import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react-native';
import { useGetAppointmentDetailQuery } from '@/store/services/appointmentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabBar from '../components/CustomTabBar';

// Assuming your base URL is defined in your constants
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mubakulifestyle.com/api/v1';

export default function CompleteAppointmentScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { data: appointment, isLoading: appointmentLoading } = useGetAppointmentDetailQuery(appointmentId!);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteAppointment = async () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to mark this appointment as completed? This will release the payment to the provider.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setIsCompleting(true);
            try {
              // Constructing the URL as per your requirement
              const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/complete/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept-Language': (await AsyncStorage.getItem('user-language')) || 'en',
                },
                body: JSON.stringify({}),
              });

              if (!response.ok) {
                throw new Error('Failed to complete appointment');
              }

              await response.json();

              Alert.alert('Success', 'Appointment marked as completed!', [
                { text: 'OK', onPress: () => {} }
              ]);
            } catch {
              Alert.alert('Error', 'Could not complete the appointment. Please try again.');
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  if (appointmentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Appointment</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <CheckCircle2 color="#4CAF50" size={64} strokeWidth={1.5} />
            <Text style={styles.confirmText}>Finalize Service</Text>
            <Text style={styles.descriptionText}>
              Please confirm that the service for <Text style={styles.bold}>{appointment?.service?.name || 'this appointment'}</Text> has been performed.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Info color="#2D1A46" size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text style={styles.infoValue}>
                Upon completion, {Number(appointment?.amount || 0).toFixed(2)} {appointment?.currency} will be released to {appointment?.provider?.full_name || 'the provider'}.
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.completeButton, isCompleting && styles.disabledButton]}
              onPress={handleCompleteAppointment}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.completeButtonText}>Mark as Completed</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
  placeholder: { width: 40 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  confirmText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: { fontWeight: 'bold', color: '#2D1A46' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8E4ED',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 14, fontWeight: 'bold', color: '#2D1A46', marginBottom: 2 },
  infoValue: { fontSize: 13, color: '#4D3E63', lineHeight: 18 },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  completeButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#ccc' },
  completeButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});