import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Animated, ScrollView, Alert, Share } from 'react-native';
import { CheckCircle, XCircle, Clock, AlertCircle, Phone, RefreshCcw, Receipt, Calendar, Navigation } from 'lucide-react-native';
import { useLazyGetPaymentStatusQuery } from '@/store/services/paymentApi';
import CustomTabBar from '../components/CustomTabBar';

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export default function PaymentStatusScreen() {
  const { frontendToken, phoneNumber, serviceName, locationName, latitude, longitude } = useLocalSearchParams<{
    frontendToken: string;
    phoneNumber: string;
    serviceName?: string;
    locationName?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const [getPaymentStatus, { data: payment, isLoading, error }] = useLazyGetPaymentStatusQuery();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);
  const [pollingMessage, setPollingMessage] = useState('Processing payment, please wait…');
  const [pollAttempts, setPollAttempts] = useState(0);
  const [finalResult, setFinalResult] = useState<{
    status: PaymentStatus;
    errorCode: number | string | null;
    errorMessage: string | null;
    locked: boolean;
  } | null>(null);
  const finalResultRef = useRef<{
    status: PaymentStatus;
    errorCode: number | string | null;
    errorMessage: string | null;
    locked: boolean;
  } | null>(null);
  const MAX_POLL_ATTEMPTS = 40;
  const TIMEOUT_SECONDS = 120;
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!frontendToken) {
      console.error('[PaymentStatus] No frontend token provided');
      return;
    }

    const startPolling = async () => {
      console.log('[PaymentStatus] Starting payment status polling');

      try {
        await getPaymentStatus(frontendToken);
      } catch (err) {
        console.error('[PaymentStatus] Initial status fetch failed:', err);
      }

      let pollCount = 0;
      pollingIntervalRef.current = setInterval(async () => {
        // Check if status is already locked - stop immediately
        if (finalResultRef.current?.locked) {
          console.log('[PaymentStatus] Status already locked, stopping poll');
          stopPolling();
          stopTimer();
          return;
        }

        pollCount++;
        setPollAttempts(pollCount);
        console.log(`[PaymentStatus] Poll #${pollCount}`);

        if (pollCount >= MAX_POLL_ATTEMPTS) {
          console.log('[PaymentStatus] Max polling attempts reached (2 minutes)');
          setHasExpired(true);
          const result = {
            status: 'failed' as PaymentStatus,
            errorCode: null,
            errorMessage: 'Payment could not be confirmed. Please try again.',
            locked: true,
          };
          finalResultRef.current = result;
          setFinalResult(result);
          setPollingMessage('Payment could not be confirmed. Please try again.');
          stopPolling();
          stopTimer();
          return;
        }

        try {
          const result = await getPaymentStatus(frontendToken);
          const paymentData = result.data as any;

          const currentStatus = paymentData?.status;
          const errCode = paymentData?.errorCode;
          const errMsg = paymentData?.errorMessage;

          console.log(`[PaymentStatus] Poll response - status: ${currentStatus}, errorCode: ${errCode}, errorMessage: ${errMsg}`);

          // If status is NOT pending, stop polling immediately
          if (currentStatus !== 'pending') {
            console.log(`[PaymentStatus] Status is ${currentStatus}, stopping polling`);
            console.log(`[PaymentStatus] Locking final result - code: ${errCode}, message: ${errMsg}`);
            
            // Lock EVERYTHING in one atomic operation
            const result = {
              status: currentStatus as PaymentStatus,
              errorCode: errCode || null,
              errorMessage: errMsg || null,
              locked: true,
            };
            
            // Set ref FIRST (synchronous), then state
            finalResultRef.current = result;
            setFinalResult(result);
            
            if (currentStatus === 'completed' && !errCode) {
              setPollingMessage('Payment successful. Booking confirmed!');
            } else {
              setPollingMessage(errMsg || 'Payment could not be completed.');
            }
            
            stopPolling();
            stopTimer();
            return;
          }

          // Status is pending - continue polling
          console.log('[PaymentStatus] Status is pending, continuing to poll...');
        } catch (err) {
          console.error('[PaymentStatus] Polling error:', err);
        }
      }, 3000);
    };

    startPolling();

    timerIntervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;

        if (newTime >= TIMEOUT_SECONDS && !finalResultRef.current?.locked) {
          console.log('[PaymentStatus] Payment timeout reached (2 minutes)');
          setHasExpired(true);
          const result = {
            status: 'failed' as PaymentStatus,
            errorCode: null,
            errorMessage: 'Payment could not be confirmed. Please try again.',
            locked: true,
          };
          finalResultRef.current = result;
          setFinalResult(result);
          setPollingMessage('Payment could not be confirmed. Please try again.');
          stopPolling();
          stopTimer();
        }

        return newTime;
      });
    }, 1000);

    return () => {
      stopPolling();
      stopTimer();
    };
  }, [frontendToken, getPaymentStatus]);

  useEffect(() => {
    if (payment?.status === 'pending' || payment?.status === 'processing') {
      const pulseAnimation = Animated.loop(
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

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [payment?.status, pulseAnim, rotateAnim]);

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

  const formatTimeRemaining = (seconds: number) => {
    const remaining = Math.max(0, TIMEOUT_SECONDS - seconds);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    switch (status) {
      case 'completed':
        return <CheckCircle color="#10B981" size={80} />;
      case 'failed':
        return <XCircle color="#EF4444" size={80} />;
      case 'pending':
        return (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Phone color="#F59E0B" size={80} />
          </Animated.View>
        );
      case 'processing':
        return (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCcw color="#3B82F6" size={80} />
          </Animated.View>
        );
      default:
        return <AlertCircle color="#6B7280" size={80} />;
    }
  };

  const getErrorTitle = (): string => {
    return 'Payment Failed';
  };

  const getStatusTitle = (status: PaymentStatus) => {
    const paymentData: any = payment;
    if (paymentData?.errorCode || paymentData?.gateway?.error_code) {
      return 'Payment Failed';
    }

    if (hasExpired && status !== 'completed') return 'Payment Timeout';

    switch (status) {
      case 'completed':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Approve Payment on Your Phone';
      case 'processing':
        return 'Processing Payment...';
      default:
        return 'Checking Payment Status';
    }
  };

  const formatAmount = () => {
    if (!payment?.amount) return '';
    const currency = payment.amount.currency || 'XAF';
    const total = payment.amount.total;
    if (total === undefined || total === null || isNaN(total)) return '';
    return `${currency} ${Math.round(total).toLocaleString()}`;
  };

  const getStatusMessage = () => {
    const paymentData: any = payment;
    const hasError = paymentData?.errorCode || paymentData?.gateway?.error_code;
    const errMsg = paymentData?.errorMessage || paymentData?.gateway?.error_message || paymentData?.failure_details?.message;

    if (hasError) {
      return errMsg || 'Payment rejected. Please try again.';
    }

    if (hasExpired && payment?.status !== 'completed') {
      return 'Payment could not be confirmed. Please retry.';
    }

    if (!payment) return pollingMessage;

    if (payment.status === 'pending') {
      return `Check your phone (${phoneNumber}) for a USSD prompt. Dial the code shown on your screen to authorize the payment.`;
    }

    if (payment.status === 'processing') {
      return 'Your payment is being processed. This usually takes 30-60 seconds. Please wait...';
    }

    if (payment.status === 'completed' && !hasError) {
      const amount = formatAmount();
      if (amount) {
        return `Payment of ${amount} completed successfully! Your booking is confirmed and the provider has been notified.`;
      }
      return 'Payment successful. Booking confirmed!';
    }

    if (payment.status === 'failed') {
      return errMsg || 'Payment could not be completed';
    }

    return payment.instructions?.message || pollingMessage;
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const handleViewMyBookings = () => {
    router.replace('/(tabs)/my-bookings' as any);
  };

  const handleViewRoute = () => {
    const lat = latitude;
    const lng = longitude;
    const locName = locationName || 'Service Location';
    const svcName = serviceName || payment?.appointment?.service || 'Service';

    if (lat && lng) {
      router.push({
        pathname: '/view-location',
        params: {
          latitude: String(lat),
          longitude: String(lng),
          locationName: locName,
          serviceName: svcName,
          showRoute: 'true',
        },
      } as any);
    } else {
      Alert.alert('Location Unavailable', 'Service location is not available for this booking.');
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  const handleContactSupport = () => {
    console.log('[PaymentStatus] Contact support requested');
    console.log('[PaymentStatus] Payment ID:', payment?.id);
    console.log('[PaymentStatus] Frontend Token:', frontendToken?.substring(0, 8) + '...');
  };

  const handleRetryPayment = () => {
    router.back();
  };

  const handleViewReceipt = () => {
    if (!payment) return;

    const receiptData = {
      paymentId: payment.id || 'N/A',
      transactionId: payment.gateway?.transaction_id || 'N/A',
      receiptNumber: payment.gateway?.receipt_number || 'N/A',
      amount: `${payment.amount.currency} ${Math.round(payment.amount.total)}`,
      date: new Date(payment.timestamps?.created_at || '').toLocaleString(),
      service: payment.appointment?.service || 'N/A',
      provider: payment.appointment?.provider_name || 'N/A',
      scheduledDate: new Date(payment.appointment?.scheduled_at || '').toLocaleString(),
      paymentMethod: payment.payment_method?.display_name || 'N/A',
      status: payment.status,
    };

    const receiptText = `
MU BAKU LIFESTYLE - PAYMENT RECEIPT

Payment ID: ${receiptData.paymentId}
Transaction ID: ${receiptData.transactionId}
Receipt Number: ${receiptData.receiptNumber}

Amount Paid: ${receiptData.amount}
Payment Date: ${receiptData.date}
Payment Method: ${receiptData.paymentMethod}

Service: ${receiptData.service}
Provider: ${receiptData.provider}
Scheduled Date: ${receiptData.scheduledDate}

Status: ${receiptData.status.toUpperCase()}

Thank you for using Mu Baku Lifestyle!
    `.trim();

    Alert.alert(
      'Payment Receipt',
      receiptText,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: receiptText,
                title: 'Payment Receipt - Mu Baku Lifestyle',
              });
            } catch (error) {
              console.error('Error sharing receipt:', error);
              Alert.alert('Error', 'Unable to share receipt');
            }
          },
        },
      ]
    );
  };



  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle color="#EF4444" size={80} />
          </View>
          <Text style={styles.title}>Unable to Check Payment</Text>
          <Text style={styles.message}>
            We couldn&apos;t retrieve the payment status. This could be a temporary network issue.
          </Text>
          <View style={styles.errorDetails}>
            <Text style={styles.errorText}>Please check your bookings or contact support if needed.</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContactSupport}>
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Connecting to payment gateway...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // CRITICAL: Once locked, use ONLY the frozen finalResult - completely ignore payment object
  const isLocked = finalResultRef.current?.locked || finalResult?.locked;
  const frozenResult = finalResultRef.current || finalResult;
  
  const status: PaymentStatus = isLocked && frozenResult ? frozenResult.status : (payment?.status || 'pending');
  const errorCode = isLocked && frozenResult ? frozenResult.errorCode : null;
  const errorMessage = isLocked && frozenResult ? frozenResult.errorMessage : null;
  const hasErrorCode = !!errorCode;
  
  const isCompleted = status === 'completed' && !hasErrorCode;
  const isProcessing = !isLocked && (status === 'pending' || status === 'processing') && !hasExpired;
  const isFailed = isLocked ? (status === 'failed' || hasErrorCode || hasExpired) : (status === 'failed' || (hasExpired && !isCompleted));
  const statusColor = getStatusColor(isFailed ? 'failed' : status);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {isFailed ? (
              <>
                <View style={styles.iconContainer}>
                  <XCircle color="#B91C1C" size={80} />
                </View>
                <Text style={[styles.title, { color: '#B91C1C' }]}>
                  {hasExpired && !payment?.gateway?.error_code && !payment?.failure_details ? 'Payment Timeout' : 'Payment Failed'}
                </Text>

                <View style={styles.fancyErrorCard}>
                  <Text style={styles.fancyErrorMessageLarge}>
                    {errorMessage || (hasExpired ? 'The request timed out while waiting for payment confirmation. Please check your balance and try again.' : 'Payment could not be completed.')}
                  </Text>
                  {errorCode && (
                    <View style={styles.errorCodeContainer}>
                      <Text style={styles.errorCodeText}>
                        ERROR CODE: {errorCode}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.failedActions}>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetryPayment}>
                    <RefreshCcw color="white" size={20} />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.goHomeButton} onPress={handleGoHome}>
                    <Text style={styles.goHomeButtonText}>Go to Home</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.iconContainer}>
                  {getStatusIcon(status)}
                </View>

                <Text style={[styles.title, { color: '#2D1A46' }]}>
                  {getStatusTitle(status)}
                </Text>

                <Text style={styles.message}>{getStatusMessage()}</Text>

                {isProcessing && !hasExpired && (
                  <>
                    <View style={styles.timerContainer}>
                      <Clock color="#666" size={20} />
                      <Text style={styles.timerText}>Elapsed: {formatTime(timeElapsed)}</Text>
                      <Text style={styles.timerDivider}>•</Text>
                      <Text style={styles.timerText}>Timeout: {formatTimeRemaining(timeElapsed)}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min((pollAttempts / MAX_POLL_ATTEMPTS) * 100, 100)}%`, backgroundColor: statusColor }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {payment?.state_machine?.current?.replace(/_/g, ' ').toUpperCase() || `VERIFYING (${pollAttempts}/${MAX_POLL_ATTEMPTS})`}
                      </Text>
                    </View>

                    <View style={styles.instructionCard}>
                      <View style={styles.instructionHeader}>
                        <Phone color="#2D1A46" size={24} />
                        <Text style={styles.instructionTitle}>
                          {status === 'pending' ? 'Action Required' : 'Processing'}
                        </Text>
                      </View>
                      <Text style={styles.instructionText}>
                        {status === 'pending'
                          ? `Look for a USSD popup on ${phoneNumber}. Enter your mobile money PIN to approve the payment.`
                          : 'Please wait while we confirm your payment with the mobile money provider.'}
                      </Text>
                      {status === 'pending' && (
                        <Text style={styles.instructionNote}>
                          💡 Tip: If you don&apos;t see a prompt, dial *126# (MTN) or #150# (Orange) and check for pending transactions.
                        </Text>
                      )}
                    </View>
                  </>
                )}

                {isCompleted && payment?.gateway && (
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Payment Details</Text>
                    {payment.gateway.transaction_id && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {payment.gateway.transaction_id}
                        </Text>
                      </View>
                    )}
                    {payment.gateway.receipt_number && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Receipt Number</Text>
                        <Text style={styles.detailValue}>{payment.gateway.receipt_number}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount Paid</Text>
                      <Text style={[styles.detailValue, styles.amountValue]}>
                        {payment.amount.currency} {Math.round(payment.amount.total)}
                      </Text>
                    </View>
                    {payment.escrow && (
                      <View style={styles.escrowInfo}>
                        <Text style={styles.escrowText}>
                          🔒 Funds held securely in escrow until service completion
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {isCompleted && (
                  <View style={styles.successActions}>
                    <TouchableOpacity
                      style={styles.viewBookingsButton}
                      onPress={handleViewMyBookings}
                    >
                      <Calendar color="white" size={20} />
                      <Text style={styles.viewBookingsButtonText}>View My Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewRouteButton}
                      onPress={handleViewRoute}
                    >
                      <Navigation color="white" size={20} />
                      <Text style={styles.viewRouteButtonText}>Navigate to Location</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewReceiptButton}
                      onPress={handleViewReceipt}
                    >
                      <Receipt color="#2D1A46" size={20} />
                      <Text style={styles.viewReceiptButtonText}>View Receipt</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  timerDivider: {
    fontSize: 14,
    color: '#CCC',
    marginHorizontal: 8,
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
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  instructionCard: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginLeft: 12,
  },
  instructionText: {
    fontSize: 15,
    color: '#2D1A46',
    lineHeight: 22,
    marginBottom: 12,
  },
  instructionNote: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailsCard: {
    width: '100%',
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
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 18,
    color: '#10B981',
  },
  escrowInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  escrowText: {
    fontSize: 13,
    color: '#10B981',
    textAlign: 'center',
  },
  fancyErrorCard: {
    width: '100%',
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFB8BF',
  },
  fancyErrorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fancyErrorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginLeft: 12,
    textTransform: 'capitalize',
  },
  fancyErrorMessage: {
    fontSize: 15,
    color: '#991B1B',
    lineHeight: 22,
    marginBottom: 16,
  },
  fancyErrorMessageLarge: {
    fontSize: 18,
    color: '#991B1B',
    lineHeight: 28,
    marginBottom: 16,
    fontWeight: '500',
  },
  errorCodeContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  errorCodeText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '600',
  },
  errorDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
  successActions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  viewBookingsButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  viewBookingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewRouteButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  viewRouteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewReceiptButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D1A46',
  },
  viewReceiptButtonText: {
    color: '#2D1A46',
    fontSize: 16,
    fontWeight: '600',
  },
  failedActions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goHomeButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D1A46',
  },
  goHomeButtonText: {
    color: '#2D1A46',
    fontSize: 16,
    fontWeight: '600',
  },
});
