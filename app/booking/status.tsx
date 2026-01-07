import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { CheckCircle, Clock, Star, Receipt, MapPin, XCircle } from 'lucide-react-native'; // Added Receipt, MapPin, XCircle
import { useGetAppointmentDetailQuery, useCancelAppointmentMutation, useCompleteAppointmentMutation } from '@/store/services/appointmentApi';

export default function BookingStatus() {
  const { appointmentId, paymentSuccess, paymentMessage } = useLocalSearchParams<{
    appointmentId: string;
    paymentSuccess?: string;
    paymentMessage?: string;
  }>();
  const { data: appointment, isLoading, refetch } = useGetAppointmentDetailQuery(appointmentId || '', {
    skip: !appointmentId,
  });
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');

  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();
  const [completeAppointment, { isLoading: isCompleting }] = useCompleteAppointmentMutation();

  const statusSteps = [
    { id: 1, title: 'Booked', completed: true, icon: CheckCircle },
    { id: 2, title: 'In Progress', completed: appointment?.status === 'in_progress' || appointment?.status === 'completed', icon: Clock },
    { id: 3, title: 'Completed', completed: appointment?.status === 'completed', icon: CheckCircle },
  ];

  const handleSubmitReview = () => {
    console.log('Review submitted:', { rating, review, appointmentId });
    // In a real app, you would send this review to your API
    Alert.alert('Thank you!', 'Your review has been submitted.');
    router.push('/(tabs)/home');
  };

  const handleCompleteService = async () => {
    if (!appointmentId) return;

    Alert.alert(
      'Complete Service',
      'Are you sure you want to mark this service as completed? Funds will be released to the provider.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await completeAppointment(appointmentId).unwrap();
              Alert.alert('Success', 'Service marked as completed. Funds released to provider.');
              refetch(); // Refetch to update status
            } catch (error) {
              console.error('Failed to complete service:', error);
              Alert.alert('Error', 'Could not mark service as completed.');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async () => {
    if (!appointmentId) return;

    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? A cancellation fee may apply.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              await cancelAppointment({ appointmentId, reason: 'User cancelled via app' }).unwrap();
              Alert.alert('Success', 'Appointment cancelled successfully.');
              refetch(); // Refetch to update status
            } catch (error) {
              console.error('Failed to cancel appointment:', error);
              Alert.alert('Error', 'Could not cancel appointment.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
      >
        <Star
          size={32}
          color={index < rating ? '#FFD700' : '#E5E5E5'}
          fill={index < rating ? '#FFD700' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appointment not found</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';
  const canComplete = (appointment.status === 'confirmed' || appointment.status === 'in_progress');
  const canCancel = !isCompleted && !isCancelled;
  const showEscrowMessage = appointment.payment_status === 'held_in_escrow' && !isCompleted && !isCancelled;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Payment Success Message */}
        {paymentSuccess === 'true' && paymentMessage && (
          <View style={styles.paymentSuccessContainer}>
            <CheckCircle color="#10B981" size={48} />
            <Text style={styles.paymentSuccessTitle}>Payment Successful!</Text>
            <Text style={styles.paymentSuccessMessage}>{decodeURIComponent(paymentMessage)}</Text>
          </View>
        )}

        {/* Success Message */}
        <View style={styles.successContainer}>
          {isCompleted ? (
            <CheckCircle color="#4CAF50" size={64} />
          ) : isCancelled ? (
            <XCircle color="#EF4444" size={64} />
          ) : (
            <CheckCircle color="#4CAF50" size={64} />
          )}

          <Text style={styles.successTitle}>
            {isCompleted ? 'Service Completed!' : isCancelled ? 'Appointment Cancelled' : 'Booking Confirmed!'}
          </Text>
          <Text style={styles.successMessage}>
            {isCompleted ? 'Hope you enjoyed your service!' : isCancelled ? 'Your appointment has been cancelled as requested.' : 'Your appointment has been successfully booked.'}
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.card}>
          <View style={styles.receiptHeader}>
            <Receipt color="#2D1A46" size={24} />
            <Text style={styles.cardTitle}>Transaction Receipt</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{appointment.service?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Provider:</Text>
            <Text style={styles.detailValue}>{appointment.provider?.business_name || appointment.provider?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(appointment.scheduled_for).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {formatTime(appointment.scheduled_for)} - {formatTime(appointment.scheduled_until)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, styles.statusText]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace(/_/g, ' ')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Paid:</Text>
            <Text style={[styles.detailValue, styles.amountValue]}>
              {appointment.currency} {appointment.amount.toFixed(2)}
            </Text>
          </View>

          {showEscrowMessage && (
            <View style={styles.escrowInfo}>
              <Text style={styles.escrowText}>
                🔒 Funds held securely in escrow until service completion
              </Text>
            </View>
          )}
        </View>

        {/* Progress Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Progress</Text>
          <View style={styles.progressContainer}>
            {statusSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <View key={step.id} style={styles.progressStep}>
                  <View style={styles.stepIndicator}>
                    <View style={[
                      styles.stepCircle,
                      step.completed && styles.completedStep
                    ]}>
                      <IconComponent
                        color={step.completed ? 'white' : '#ccc'}
                        size={20}
                      />
                    </View>
                    {index < statusSteps.length - 1 && (
                      <View style={[
                        styles.stepLine,
                        step.completed && styles.completedLine
                      ]} />
                    )}
                  </View>
                  <Text style={[
                    styles.stepTitle,
                    step.completed && styles.completedStepTitle
                  ]}>
                    {step.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        {(canComplete || canCancel) && (
          <View style={styles.actionButtonsCard}>
            {canComplete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleCompleteService}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <CheckCircle color="white" size={20} />
                    <Text style={styles.actionButtonText}>Mark Service as Completed</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <XCircle color="white" size={20} />
                    <Text style={styles.actionButtonText}>Cancel Appointment</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* View Location Button - Only shown for booked appointments with location */}
        {appointment && !isCancelled && (appointment.latitude && appointment.longitude) && (
          <View style={styles.locationCard}>
            <TouchableOpacity
              style={styles.viewLocationButton}
              onPress={() => {
                const locationName = appointment.location || `${appointment.provider?.city || 'Service'} Location`;
                const serviceName = appointment.service?.name || 'Service';
                router.push(`/view-location?latitude=${appointment.latitude}&longitude=${appointment.longitude}&locationName=${encodeURIComponent(locationName)}&serviceName=${encodeURIComponent(serviceName)}` as any);
              }}
            >
              <MapPin color="white" size={20} />
              <Text style={styles.viewLocationButtonText}>View Live Location & Directions</Text>
            </TouchableOpacity>
            <Text style={styles.locationHint}>
              Get real-time directions to your service location
            </Text>
          </View>
        )}

        {/* Review Section */}
        {isCompleted && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rate Your Experience</Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>How was your service?</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
            </View>

            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>Write a review (optional)</Text>
              <TextInput
                style={styles.reviewInput}
                value={review}
                onChangeText={setReview}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Home Button - Outside scroll view for proper positioning */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    textAlign: 'right',
    flexShrink: 1, // Allow text to shrink
  },
  amountValue: {
    color: '#10B981', // Green for amount
    fontWeight: '700',
  },
  escrowInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  escrowText: {
    fontSize: 13,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    paddingVertical: 10,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E5E5E5',
    marginTop: 5,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
  stepTitle: {
    fontSize: 16,
    color: '#666',
  },
  completedStepTitle: {
    color: '#2D1A46',
    fontWeight: '600',
  },
  actionButtonsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50', // Green for complete
  },
  cancelButton: {
    backgroundColor: '#EF4444', // Red for cancel
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#2D1A46',
    marginBottom: 12,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#F4A896',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20, // Extra padding for Android navigation bar
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  homeButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  statusText: {
    textTransform: 'capitalize',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewLocationButton: {
    backgroundColor: '#2D1A46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewLocationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomSpacing: {
    height: Platform.OS === 'android' ? 80 : 20, // Extra spacing for Android navigation
  },
});
