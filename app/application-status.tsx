import { router, Stack } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react-native';
import { useGetApplicationStatusQuery, useWithdrawApplicationMutation } from '@/store/services/profileApi';

export default function ApplicationStatusScreen() {
  const { data: status, isLoading, error } = useGetApplicationStatusQuery();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw your provider application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawApplication().unwrap();
              Alert.alert('Success', 'Your application has been withdrawn', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              console.error('Withdraw application error:', error);
              Alert.alert('Error', error?.data?.detail || 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return <Clock color="#FF9800" size={48} />;
      case 'approved':
        return <CheckCircle color="#4CAF50" size={48} />;
      case 'rejected':
        return <XCircle color="#F44336" size={48} />;
      default:
        return <AlertCircle color="#999" size={48} />;
    }
  };

  const getStatusColor = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusMessage = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return 'Your application is currently under review by our team. We will notify you once a decision has been made.';
      case 'approved':
        return 'Congratulations! Your provider application has been approved. You can now start offering services on the platform.';
      case 'rejected':
        return 'Unfortunately, your application was not approved at this time. You can reapply after addressing the feedback provided.';
      default:
        return 'No application found. Please submit an application to become a provider.';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Application Status',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#2D1A46" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#F4A896',
          },
          headerTintColor: 'white',
        }} 
      />

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
            <Text style={styles.loadingText}>Loading application status...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle color="#ccc" size={64} />
            <Text style={styles.errorTitle}>No Application Found</Text>
            <Text style={styles.errorText}>
              You have not submitted a provider application yet.
            </Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => router.push('/agent-profile-setup')}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ) : status && (
          <>
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.iconContainer}>
                {getStatusIcon(status.status)}
              </View>
              <Text style={[styles.statusTitle, { color: getStatusColor(status.status) }]}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Text>
              <Text style={styles.statusMessage}>
                {getStatusMessage(status.status)}
              </Text>
            </View>

            {/* Application Details */}
            {status.application && (
              <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>Application Details</Text>
                
                {status.application.specialty && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Specialty:</Text>
                    <Text style={styles.detailValue}>{status.application.specialty}</Text>
                  </View>
                )}

                {status.application.experience && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Experience:</Text>
                    <Text style={styles.detailValue}>{status.application.experience} years</Text>
                  </View>
                )}

                {status.application.certifications && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Certifications:</Text>
                    <Text style={styles.detailValue}>{status.application.certifications}</Text>
                  </View>
                )}

                {status.application.submitted_at && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(status.application.submitted_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {status.application.reviewed_at && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reviewed:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(status.application.reviewed_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Feedback (if rejected) */}
            {status.status === 'rejected' && status.feedback && (
              <View style={styles.feedbackCard}>
                <Text style={styles.cardTitle}>Feedback</Text>
                <Text style={styles.feedbackText}>{status.feedback}</Text>
              </View>
            )}

            {/* Actions */}
            {status.status === 'pending' && (
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={[styles.withdrawButton, isWithdrawing && styles.withdrawButtonDisabled]}
                  onPress={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <ActivityIndicator color="#F44336" />
                  ) : (
                    <Text style={styles.withdrawButtonText}>Withdraw Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {status.status === 'rejected' && (
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={styles.reapplyButton}
                  onPress={() => router.push('/agent-profile-setup')}
                >
                  <Text style={styles.reapplyButtonText}>Reapply</Text>
                </TouchableOpacity>
              </View>
            )}

            {status.status === 'approved' && (
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={styles.servicesButton}
                  onPress={() => router.push('/provider-services')}
                >
                  <Text style={styles.servicesButtonText}>Manage Services</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  applyButton: {
    backgroundColor: '#2D1A46',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsCard: {
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
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#2D1A46',
  },
  feedbackCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  actionsCard: {
    marginBottom: 24,
  },
  withdrawButton: {
    borderWidth: 2,
    borderColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  reapplyButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reapplyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  servicesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
