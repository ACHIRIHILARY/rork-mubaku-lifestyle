import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { CheckCircle, Clock, Star } from 'lucide-react-native';

export default function BookingStatus() {
  const { agentId, date, time, location, total } = useLocalSearchParams();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');

  const statusSteps = [
    { id: 1, title: 'Booked', completed: true, icon: CheckCircle },
    { id: 2, title: 'In Progress', completed: false, icon: Clock },
    { id: 3, title: 'Completed', completed: false, icon: CheckCircle },
  ];

  const handleSubmitReview = () => {
    // Mock review submission
    router.push('/home');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <CheckCircle color="#4CAF50" size={64} />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your appointment has been successfully booked
          </Text>
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(date as string).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>
              {location === 'home' ? 'At Your Home' : 'At Salon'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Paid:</Text>
            <Text style={styles.detailValue}>${total}</Text>
          </View>
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

        {/* Review Section */}
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
      </ScrollView>

      {/* Home Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/home')}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 16,
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
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
});