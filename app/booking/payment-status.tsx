import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Animated } from 'react-native';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useLazyGetPaymentStatusQuery } from '@/store/services/paymentApi';

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export default function PaymentStatusScreen() {
  const { frontendToken, phoneNumber } = useLocalSearchParams<{
    frontendToken: string;
    phoneNumber: string;
  }>();
  const [getPaymentStatus, { data: payment, isLoading }] = useLazyGetPaymentStatusQuery();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!frontendToken) return;

    const startPolling = async () => {
      console.log('Starting payment status polling...');
      await getPaymentStatus(frontendToken);

      pollingIntervalRef.current = setInterval(async () => {
        console.log('Polling payment status...');
        const result = await getPaymentStatus(frontendToken);
        
        if (result.data?.polling?.stop) {
          console.log('Stopping polling:', result.data.polling.reason);
          stopPolling();
        }
      }, 3000);
    };

    startPolling();

    timerIntervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      stopPolling();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [frontendToken, getPaymentStatus]);

  useEffect(() => {
    if (payment?.status === 'pending' || payment?.status === 'processing') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [payment?.status, pulseAnim]);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="#10B981" size={80} />;
      case 'failed':
        return <XCircle color="#EF4444" size={80} />;
      case 'pending':
      case 'processing':
        return (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Clock color="#F59E0B" size={80} />
          </Animated.View>
        );
      default:
        return <AlertCircle color="#6B7280" size={80} />;
    }
  };

  const getStatusTitle = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Awaiting Authorization';
      case 'processing':
        return 'Processing Payment';
      default:
        return 'Payment Status';
    }
  };

  const getStatusMessage = () => {
    if (!payment) return 'Loading payment information...';

    if (payment.status === 'pending') {
      return `Please check your phone ${phoneNumber} and authorize the payment. This may take up to 2 minutes.`;
    }

    if (payment.status === 'processing') {
      return 'Your payment is being processed. Please wait...';
    }

    if (payment.status === 'completed') {
      return `Your payment of ${payment.amount.currency} ${payment.amount.total} has been successfully processed. The funds are held in escrow until service completion.`;
    }

    if (payment.status === 'failed') {
      const failureMessage = payment.failure_details?.message || 'Payment authorization failed';
      return failureMessage;
    }

    return payment.instructions?.message || 'Processing your payment...';
  };

  const handleRetry = async () => {
    if (payment?.failure_details?.retry_allowed) {
      router.back();
    }
  };

  const handleViewAppointment = () => {
    if (payment?.appointment?.id) {
      router.replace(`/booking/status?appointmentId=${payment.appointment.id}`);
    } else {
      router.replace('/(tabs)/my-bookings');
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)/home');
  };

  if (isLoading && !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Loading payment status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = payment?.status || 'pending';
  const isProcessing = status === 'pending' || status === 'processing';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getStatusIcon(status)}
        </View>

        <Text style={styles.title}>{getStatusTitle(status)}</Text>

        <Text style={styles.message}>{getStatusMessage()}</Text>

        {isProcessing && (
          <>
            <View style={styles.timerContainer}>
              <Clock color="#666" size={20} />
              <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
            </View>

            {payment?.state_machine && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${payment.state_machine.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {payment.state_machine.progress}% Complete
                </Text>
              </View>
            )}

            <ActivityIndicator size="large" color="#2D1A46" style={styles.spinner} />
          </>
        )}

        {isCompleted && payment?.gateway && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{payment.gateway.transaction_id}</Text>
            </View>
            {payment.gateway.receipt_number && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receipt Number</Text>
                <Text style={styles.detailValue}>{payment.gateway.receipt_number}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>
                {payment.amount.currency} {payment.amount.total}
              </Text>
            </View>
          </View>
        )}

        {isFailed && payment?.failure_details && (
          <View style={styles.errorCard}>
            <Text style={styles.errorCode}>Error Code: {payment.failure_details.code}</Text>
            {payment.failure_details.retry_allowed && (
              <Text style={styles.retryHint}>You can try again with a different method</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {isCompleted && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewAppointment}
            >
              <Text style={styles.primaryButtonText}>View Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDone}
            >
              <Text style={styles.secondaryButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        )}

        {isFailed && payment?.failure_details?.retry_allowed && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRetry}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDone}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {isProcessing && (
          <Text style={styles.waitingText}>Please do not close this screen</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F4A896',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  spinner: {
    marginTop: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  errorCode: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  retryHint: {
    fontSize: 14,
    color: '#EF4444',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  primaryButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D1A46',
  },
  secondaryButtonText: {
    color: '#2D1A46',
    fontSize: 18,
    fontWeight: '600',
  },
  waitingText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
});
