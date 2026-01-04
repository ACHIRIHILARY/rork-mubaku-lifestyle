import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Smartphone, Info, AlertCircle } from 'lucide-react-native';
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
  const [phoneError, setPhoneError] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const payButtonRef = useRef<any>(null);
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
  const [initiatePayment, { isLoading: isInitiating }] = useInitiatePaymentMutation();
  const { data: paymentMethodsArray, isLoading: isLoadingMethods, error: methodsError, refetch } = useGetPaymentMethodsQuery();

  // Transform the API response to match the expected structure
  const paymentMethodsData = React.useMemo(() => {
    if (!paymentMethodsArray || !Array.isArray(paymentMethodsArray)) {
      return null;
    }

    const transformedMethods = paymentMethodsArray.map((method) => ({
      id: method.id,
      method_code: method.method_code,
      display_name: method.name, // API has 'name', we need 'display_name'
      gateway: {
        name: method.gateway.name,
        type: method.gateway.type,
        logo_url: method.icon_url, // Move icon_url to gateway.logo_url
      },
      configuration: {
        requires_service_number: method.requires_service_number,
        service_number_label: method.service_number_label,
        service_number_hint: 'Enter your 9-digit phone number (without country code)',
        validation_regex: '^[0-9]{9}$', // Updated to validate 9 digits only
        example: method.method_code === 'mtn_momo' ? '6XXXXXXXX' : '9XXXXXXXX', // Examples without country code
      },
      limits: {
        min_amount: parseFloat(method.min_amount),
        max_amount: parseFloat(method.max_amount),
        currency: 'XAF', // Default to XAF as per documentation
      },
      fees: {
        type: 'percentage',
        rate: 1.5, // Default gateway fee as per documentation
        description: 'Gateway processing fee',
      },
      metadata: {
        icon_url: method.icon_url,
        instructions: method.instructions,
        estimated_processing_time: '30-60 seconds', // Default as per documentation
      },
    }));

    return {
      success: true,
      default_currency: 'XAF',
      methods: transformedMethods,
    };
  }, [paymentMethodsArray]);

  const isLoading = isCreating || isInitiating;

  React.useEffect(() => {
    console.log('[Payment] Payment methods data:', JSON.stringify(paymentMethodsData, null, 2));
    console.log('[Payment] Payment methods error:', JSON.stringify(methodsError, null, 2));
    console.log('[Payment] Is loading methods:', isLoadingMethods);
  }, [paymentMethodsData, methodsError, isLoadingMethods]);

  const selectedMethodData = React.useMemo(() => {
    if (!paymentMethodsData?.methods || !Array.isArray(paymentMethodsData.methods)) {
      return null;
    }
    return paymentMethodsData.methods.find((m) => m.method_code === paymentMethod) || null;
  }, [paymentMethodsData, paymentMethod]);

  const validatePhoneNumber = (phone: string): boolean => {
    if (!selectedMethodData) return false;
    const regex = new RegExp(selectedMethodData.configuration.validation_regex);
    return regex.test(phone);
  };

  const handlePhoneChange = (text: string) => {
    // Remove any non-digits and strip '237' prefix if present
    let formatted = text.replace(/\D/g, '');
    if (formatted.startsWith('237')) {
      formatted = formatted.substring(3);
    }
    // Limit to 9 digits
    formatted = formatted.substring(0, 9);
    setPhoneNumber(formatted);
    setPhoneError('');

    if (formatted.length > 0 && selectedMethodData) {
      if (!validatePhoneNumber(formatted)) {
        setPhoneError('Please enter exactly 9 digits');
      }
    }
  };

  const calculateTotalAmount = (): number => {
    if (!selectedMethodData) return parseFloat(amount);
    const serviceAmount = parseFloat(amount);
    const gatewayFee = serviceAmount * (selectedMethodData.fees.rate / 100);
    return serviceAmount + gatewayFee;
  };

  const calculateGatewayFee = (): number => {
    if (!selectedMethodData) return 0;
    return parseFloat(amount) * (selectedMethodData.fees.rate / 100);
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Select Payment Method', 'Please choose how you want to pay');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert(
        'Phone Number Required',
        `Please enter your ${selectedMethodData?.configuration.service_number_label || 'phone number'}`
      );
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        `${selectedMethodData?.configuration.service_number_hint || 'Please enter a valid phone number'}\n\nExample: ${selectedMethodData?.configuration.example}`
      );
      return;
    }

    if (!agreementAccepted) {
      Alert.alert(
        'Accept Terms',
        'Please accept the payment terms to continue'
      );
      return;
    }

    const totalAmount = calculateTotalAmount();
    const minAmount = selectedMethodData?.limits?.min_amount || 100;
    const maxAmount = selectedMethodData?.limits?.max_amount || 1000000;

    if (totalAmount < minAmount) {
      Alert.alert(
        'Amount Too Low',
        `Minimum payment amount is ${currency} ${minAmount}`
      );
      return;
    }

    if (totalAmount > maxAmount) {
      Alert.alert(
        'Amount Too High',
        `Maximum payment amount is ${currency} ${maxAmount}. Please contact support for large transactions.`
      );
      return;
    }

    try {
      console.log('[Payment] Creating appointment...');
      const scheduledFor = `${date}T${startTime}`;
      const scheduledUntil = `${date}T${endTime}`;

      const appointment = await createAppointment({
        service_id: serviceId,
        scheduled_for: scheduledFor,
        scheduled_until: scheduledUntil,
        amount: parseFloat(amount),
        currency: currency || 'XAF',
      }).unwrap();

      console.log('[Payment] Appointment created:', appointment.id);
      console.log('[Payment] Initiating payment...');

      const deviceInfo = `${Platform.OS}/${Platform.Version}`;
      
      const paymentResponse = await initiatePayment({
        appointment_id: appointment.id,
        payment_method: paymentMethod,
        customer_phone: '237' + phoneNumber,
        metadata: {
          device_info: deviceInfo,
          ip_address: "127.0.0.1"
        },
      }).unwrap();

      console.log('[Payment] Payment initiated successfully');
      console.log('[Payment] Payment response:', JSON.stringify(paymentResponse, null, 2));

      // Handle response structure
      const paymentData = paymentResponse;

      if (!paymentData || !paymentData.frontend_token) {
        throw new Error('Frontend token not found in payment response');
      }

      console.log('[Payment] Frontend token:', paymentData.frontend_token.substring(0, 8) + '...');

      router.push(
        `/booking/payment-status?frontendToken=${paymentData.frontend_token}&phoneNumber=${phoneNumber}&amount=${Math.round(totalAmount)}&currency=${currency}` as any
      );
    } catch (error: any) {
      console.error('[Payment] Error:', error?.status || 'Unknown');
      
      let errorTitle = 'Payment Failed';
      let errorMessage = 'Unable to process payment. Please try again.';
      let suggestions: string[] = [];
      
      if (error?.data?.error) {
        const errorData = error.data.error;
        
        if (errorData.code) {
          switch (errorData.code) {
            case 'INVALID_PHONE_FORMAT':
              errorTitle = 'Invalid Phone Number';
              errorMessage = errorData.message || 'Phone number format is incorrect';
              suggestions = errorData.suggestions || [
                `Use format: ${selectedMethodData?.configuration.example}`,
                'Include country code 237',
              ];
              break;
            
            case 'INSUFFICIENT_FUNDS':
              errorTitle = 'Insufficient Funds';
              errorMessage = 'Your account balance is too low';
              suggestions = [
                'Add funds to your mobile money account',
                'Try a different payment method',
              ];
              break;
            
            case 'GATEWAY_TIMEOUT':
              errorTitle = 'Connection Issue';
              errorMessage = 'Unable to reach payment gateway';
              suggestions = [
                'Check your internet connection',
                'Try again in 30 seconds',
              ];
              break;
            
            case 'DUPLICATE_TRANSACTION':
              errorTitle = 'Duplicate Payment';
              errorMessage = 'This payment may already be processing';
              suggestions = [
                'Check your bookings',
                'Wait a few moments before retrying',
              ];
              break;
            
            case 'DAILY_LIMIT_EXCEEDED':
              errorTitle = 'Daily Limit Reached';
              errorMessage = 'You have reached your daily transaction limit';
              suggestions = [
                'Try again tomorrow',
                'Contact your mobile money provider',
              ];
              break;
            
            case 'PAYMENT_INITIATION_FAILED':
              errorTitle = 'Payment Setup Failed';
              errorMessage = errorData.message || 'Could not start payment process';
              suggestions = [
                'Try a different payment method',
                'Check if your phone number is active',
              ];
              break;
            
            default:
              errorMessage = errorData.message || errorMessage;
              suggestions = errorData.suggestions || [];
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorTitle = 'Session Expired';
        errorMessage = 'Please log in again';
      } else if (error?.status === 403) {
        errorTitle = 'Not Authorized';
        errorMessage = 'You do not have permission to make this payment';
      } else if (error?.status === 409) {
        errorTitle = 'Payment Already Exists';
        errorMessage = 'A payment for this booking already exists';
        suggestions = ['Check your bookings', 'Contact support if you need help'];
      } else if (error?.status === 422) {
        errorTitle = 'Payment Method Unavailable';
        errorMessage = 'This payment method is currently unavailable';
        suggestions = ['Try a different payment method'];
      } else if (error?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Our servers are experiencing issues';
        suggestions = ['Please try again in a few minutes'];
      }
      
      const fullMessage = suggestions.length > 0 
        ? `${errorMessage}\n\n${suggestions.join('\n')}` 
        : errorMessage;
      
      Alert.alert(errorTitle, fullMessage);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoadingMethods ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : !paymentMethodsData?.methods || paymentMethodsData.methods.length === 0 ? (
          <View style={styles.errorContainer}>
            <AlertCircle color="#EF4444" size={48} />
            <Text style={styles.errorTitle}>Payment Methods Unavailable</Text>
            <Text style={styles.errorMessage}>
              Unable to load payment methods. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.retryButton, { marginTop: 12, backgroundColor: '#666' }]} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepBadge, styles.stepBadgeActive]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepBadge, paymentMethod ? styles.stepBadgeActive : styles.stepBadgeInactive]}>
                <Text style={[styles.stepNumber, !paymentMethod && styles.stepNumberInactive]}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepBadge, styles.stepBadgeInactive]}>
                <Text style={[styles.stepNumber, styles.stepNumberInactive]}>3</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Choose Payment Method</Text>
                  <Text style={styles.sectionSubtitle}>Select MTN or Orange Money</Text>
                </View>
              </View>
              
              <View style={styles.methodsContainer}>
                {paymentMethodsData?.methods?.map((method) => (
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
                          Mobile money payment
                        </Text>
                        <Text style={[
                          styles.methodLimits,
                          paymentMethod === method.method_code && styles.selectedMethodDescription
                        ]}>
                          Limit: {method.limits.currency} {Math.round(method.limits.min_amount)} - {Math.round(method.limits.max_amount)}
                        </Text>
                      </View>
                      {paymentMethod === method.method_code && (
                        <View style={styles.selectedCheckmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {paymentMethod && selectedMethodData && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Enter Your Mobile Number</Text>
                    <Text style={styles.sectionSubtitle}>Enter the {selectedMethodData.display_name} number for payment</Text>
                  </View>
                </View>
                
                <View style={styles.card}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      {selectedMethodData.configuration.service_number_label}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        phoneError ? styles.inputError : null
                      ]}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholder={selectedMethodData.configuration.example}
                      keyboardType="phone-pad"
                      maxLength={9}
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                    />
                    {phoneError ? (
                      <View style={styles.inputErrorContainer}>
                        <AlertCircle size={16} color="#EF4444" />
                        <Text style={styles.errorText}>{phoneError}</Text>
                      </View>
                    ) : (
                      <Text style={styles.hint}>
                        {selectedMethodData.configuration.service_number_hint}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <Info size={20} color="#2D1A46" />
                      <Text style={styles.infoText}>
                        You will receive a prompt on your phone <Text style={styles.phoneHighlight}>{phoneNumber ? `237${phoneNumber}` : '(your number)'}</Text>. Enter your PIN to authorize the payment.
                      </Text>
                    </View>
                    <Text style={styles.processingTime}>
                      ⏱️ Usually takes {selectedMethodData.metadata.estimated_processing_time}
                    </Text>
                  </View>

                  <View style={styles.agreementContainer}>
                    <TouchableOpacity 
                      style={styles.checkbox}
                      onPress={() => setAgreementAccepted(!agreementAccepted)}
                    >
                      <View style={[
                        styles.checkboxBox,
                        agreementAccepted && styles.checkboxBoxChecked
                      ]}>
                        {agreementAccepted && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        I understand that payment will be held securely until service completion
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {!isLoadingMethods && paymentMethodsData?.methods && (
          <View style={styles.totalCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.totalCardTitle}>Payment Summary</Text>
              </View>
            </View>
            <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Price</Text>
            <Text style={styles.totalAmount}>{currency} {Math.round(parseFloat(amount))}</Text>
          </View>
          {selectedMethodData && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.feeLabel}>Gateway Fee ({selectedMethodData.fees.rate}%)</Text>
                <Text style={styles.feeAmount}>
                  {currency} {Math.round(calculateGatewayFee())}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalAmount}>
                  {currency} {Math.round(calculateTotalAmount())}
                </Text>
              </View>
              <Text style={styles.escrowNote}>
                💰 Funds held securely in escrow until service completed
              </Text>
            </>
          )}
          </View>
        )}
      </ScrollView>

      {/* Quick Summary & Pay Button - Positioned higher for better Android UX */}
      {paymentMethod && selectedMethodData && (
        <View style={styles.quickSummaryContainer}>
          <View style={styles.quickSummaryCard}>
            <View style={styles.quickSummaryRow}>
              <Text style={styles.quickSummaryLabel}>Service:</Text>
              <Text style={styles.quickSummaryValue}>{amount} {currency}</Text>
            </View>
            <View style={styles.quickSummaryRow}>
              <Text style={styles.quickSummaryLabel}>Gateway Fee:</Text>
              <Text style={styles.quickSummaryValue}>{currency} {Math.round(calculateGatewayFee())}</Text>
            </View>
            <View style={styles.quickSummaryDivider} />
            <View style={styles.quickSummaryRow}>
              <Text style={styles.quickSummaryTotalLabel}>Total:</Text>
              <Text style={styles.quickSummaryTotalValue}>{currency} {Math.round(calculateTotalAmount())}</Text>
            </View>
            <Text style={styles.quickSummaryNote}>
              💰 Funds held securely in escrow until service completion
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          ref={payButtonRef}
          style={[
            styles.payButton,
            (!paymentMethod || isLoading) && styles.disabledButton
          ]}
          onPress={handlePayment}
          disabled={!paymentMethod || isLoading}
          accessible={!isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator color="white" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : selectedMethodData ? (
            <Text style={styles.payButtonText}>Pay {currency} {Math.round(calculateTotalAmount())}</Text>
          ) : (
            <Text style={styles.payButtonText}>Select Payment Method</Text>
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#2D1A46',
  },
  stepBadgeInactive: {
    backgroundColor: '#E5E5E5',
  },
  stepNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  stepNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D1A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberInactive: {
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  methodsContainer: {
    gap: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  methodLimits: {
    fontSize: 12,
    color: '#999',
  },
  selectedCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  inputErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
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
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2D1A46',
    lineHeight: 20,
  },
  phoneHighlight: {
    fontWeight: 'bold',
    color: '#F4A896',
  },
  processingTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  agreementContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2D1A46',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2D1A46',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2D1A46',
    lineHeight: 20,
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
  totalCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  grandTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  escrowNote: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    paddingBottom: Platform.OS === 'android' ? 40 : 20, // Extra padding for Android navigation bar
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
  quickSummaryContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quickSummaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quickSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
  quickSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  quickSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  quickSummaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F4A896',
  },
  quickSummaryNote: {
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 8,
  },
});
