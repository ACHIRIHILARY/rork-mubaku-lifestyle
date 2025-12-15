import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import { useCreateAppointmentMutation } from '@/store/services/appointmentApi';
import { useGetPaymentMethodsQuery, useInitiatePaymentMutation } from '@/store/services/paymentApi';

export default function PaymentScreen() {
  const { serviceId, date, startTime, endTime, amount, currency } = useLocalSearchParams<{
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: string;
    currency: string;
  }>();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
  const [initiatePayment, { isLoading: isInitiating }] = useInitiatePaymentMutation();
  const { data: paymentMethodsData, isLoading: isLoadingMethods } = useGetPaymentMethodsQuery();

  const isLoading = isCreating || isInitiating;

  const selectedMethodData = paymentMethodsData?.methods.find(
    (m) => m.method_code === paymentMethod
  );

  const validatePhoneNumber = (phone: string): boolean => {
    if (!selectedMethodData) return false;
    const regex = new RegExp(selectedMethodData.configuration.validation_regex);
    return regex.test(phone);
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', `Please enter your ${selectedMethodData?.configuration.service_number_label || 'phone number'}`);
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        selectedMethodData?.configuration.service_number_hint || 'Please enter a valid phone number'
      );
      return;
    }

    try {
      console.log('Creating appointment...');
      const scheduledFor = `${date}T${startTime}`;
      const scheduledUntil = `${date}T${endTime}`;

      const appointment = await createAppointment({
        service_id: serviceId,
        scheduled_for: scheduledFor,
        scheduled_until: scheduledUntil,
        amount: parseFloat(amount),
        currency: currency || 'XAF',
      }).unwrap();

      console.log('Appointment created:', appointment.id);
      console.log('Initiating payment...');

      const paymentResponse = await initiatePayment({
        appointment_id: appointment.id,
        payment_method: paymentMethod,
        customer_phone: phoneNumber,
      }).unwrap();

      console.log('Payment initiated:', paymentResponse.payment.frontend_token);

      router.push(
        `/booking/payment-status?frontendToken=${paymentResponse.payment.frontend_token}&phoneNumber=${phoneNumber}` as any
      );
    } catch (error: any) {
      console.error('Payment error:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unable to process payment. Please try again.';
      
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.error) {
          if (typeof error.data.error === 'string') {
            errorMessage = error.data.error;
          } else if (error.data.error.message) {
            errorMessage = error.data.error.message;
          }
        } else if (error.data.detail) {
          errorMessage = error.data.detail;
        } else {
          errorMessage = JSON.stringify(error.data);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        errorMessage = `Error: ${error.status}`;
      }
      
      Alert.alert(
        'Payment Failed',
        errorMessage
      );
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {isLoadingMethods ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Your Payment Method</Text>
              <Text style={styles.sectionSubtitle}>Choose how you&apos;d like to pay</Text>
              
              <View style={styles.methodsContainer}>
                {paymentMethodsData?.methods.map((method) => (
                  <TouchableOpacity
                    key={method.method_code}
                    style={[
                      styles.methodCard,
                      paymentMethod === method.method_code && styles.selectedMethodCard
                    ]}
                    onPress={() => {
                      setPaymentMethod(method.method_code);
                      setPhoneNumber('');
                    }}
                  >
                    <View style={styles.methodHeader}>
                      <View style={[
                        styles.methodIconContainer,
                        paymentMethod === method.method_code && styles.selectedMethodIcon
                      ]}>
                        <Smartphone 
                          color={paymentMethod === method.method_code ? 'white' : '#2D1A46'} 
                          size={24} 
                        />
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={[
                          styles.methodTitle,
                          paymentMethod === method.method_code && styles.selectedMethodText
                        ]}>
                          {method.display_name}
                        </Text>
                        <Text style={[
                          styles.methodDescription,
                          paymentMethod === method.method_code && styles.selectedMethodDescription
                        ]}>
                          Quick & secure mobile payment
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {paymentMethod && selectedMethodData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enter Your Phone Number</Text>
                <Text style={styles.sectionSubtitle}>You&apos;ll receive a prompt to complete payment</Text>
                
                <View style={styles.card}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      {selectedMethodData.configuration.service_number_label}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder={selectedMethodData.configuration.example}
                      keyboardType="phone-pad"
                    />
                    <Text style={styles.hint}>
                      {selectedMethodData.configuration.service_number_hint}
                    </Text>
                  </View>
                  
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      💡 A payment prompt will be sent to your phone. Complete it to confirm your booking.
                    </Text>
                    <Text style={styles.processingTime}>
                      ⏱️ Usually takes {selectedMethodData.metadata.estimated_processing_time}
                    </Text>
                  </View>

                  <View style={styles.feesContainer}>
                    <Text style={styles.feesLabel}>Processing Fee:</Text>
                    <Text style={styles.feesValue}>
                      {selectedMethodData.fees.rate}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Price</Text>
            <Text style={styles.totalAmount}>{currency} {parseFloat(amount).toFixed(0)}</Text>
          </View>
          {selectedMethodData && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.feeLabel}>Processing Fee ({selectedMethodData.fees.rate}%)</Text>
                <Text style={styles.feeAmount}>
                  {currency} {(parseFloat(amount) * selectedMethodData.fees.rate / 100).toFixed(0)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total to Pay</Text>
                <Text style={styles.totalAmount}>
                  {currency} {(parseFloat(amount) * (1 + selectedMethodData.fees.rate / 100)).toFixed(0)}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!paymentMethod || isLoading) && styles.disabledButton
          ]}
          onPress={handlePayment}
          disabled={!paymentMethod || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : selectedMethodData ? (
            <Text style={styles.payButtonText}>Pay {currency} {(parseFloat(amount) * (1 + selectedMethodData.fees.rate / 100)).toFixed(0)}</Text>
          ) : (
            <Text style={styles.payButtonText}>Continue</Text>
          )}
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
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
  selectedMethodCard: {
    backgroundColor: '#2D1A46',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedMethodIcon: {
    backgroundColor: '#F4A896',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  selectedMethodText: {
    color: 'white',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedMethodDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: 'white',
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#2D1A46',
    lineHeight: 20,
  },
  processingTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  feesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  feesLabel: {
    fontSize: 14,
    color: '#666',
  },
  feesValue: {
    fontSize: 14,
    color: '#2D1A46',
    fontWeight: '600',
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  payButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});