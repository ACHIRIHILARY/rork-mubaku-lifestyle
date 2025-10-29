import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react-native';
import { useCreateAppointmentMutation, useConfirmPaymentMutation } from '@/store/services/appointmentApi';

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
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();

  const isLoading = isCreating || isConfirming;

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay with your card'
    },
    {
      id: 'mobile',
      title: 'Mobile Money',
      icon: Smartphone,
      description: 'Pay with mobile money'
    }
  ];

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    try {
      const scheduledFor = `${date}T${startTime}`;
      const scheduledUntil = `${date}T${endTime}`;

      const appointment = await createAppointment({
        service_id: serviceId,
        scheduled_for: scheduledFor,
        scheduled_until: scheduledUntil,
        amount: parseFloat(amount),
        currency: currency || 'USD',
      }).unwrap();

      await confirmPayment(appointment.id).unwrap();

      Alert.alert(
        'Success',
        'Your booking has been confirmed!',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/booking/status?appointmentId=${appointment.id}`)
          }
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error?.data?.detail || 'Unable to create booking. Please try again.'
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
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    paymentMethod === method.id && styles.selectedMethodCard
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <View style={styles.methodHeader}>
                    <View style={[
                      styles.methodIconContainer,
                      paymentMethod === method.id && styles.selectedMethodIcon
                    ]}>
                      <IconComponent 
                        color={paymentMethod === method.id ? 'white' : '#2D1A46'} 
                        size={24} 
                      />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={[
                        styles.methodTitle,
                        paymentMethod === method.id && styles.selectedMethodText
                      ]}>
                        {method.title}
                      </Text>
                      <Text style={[
                        styles.methodDescription,
                        paymentMethod === method.id && styles.selectedMethodDescription
                      ]}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="John Doe"
                />
              </View>
            </View>
          </View>
        )}

        {/* Mobile Money */}
        {paymentMethod === 'mobile' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobile Money</Text>
            
            <View style={styles.card}>
              <Text style={styles.mobileMoneyText}>
                You will receive a prompt on your phone to complete the payment of {currency} {amount}
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{currency} {amount}</Text>
          </View>
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
          ) : (
            <Text style={styles.payButtonText}>Pay {currency} {amount}</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  mobileMoneyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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