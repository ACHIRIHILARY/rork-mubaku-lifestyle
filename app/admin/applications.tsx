import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useListApplicationsQuery,
  useDeclineProviderMutation,
} from '@/store/services/adminApi';
import { useVerifyProviderMutation } from '@/store/services/profileApi';
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';

export default function ProviderApplications() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');

  const {
    data: applications,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useListApplicationsQuery();

  const [verifyProvider, { isLoading: isVerifying }] = useVerifyProviderMutation();
  const [declineProvider, { isLoading: isDeclining }] = useDeclineProviderMutation();

  if (!user || (user.role !== 'admin' && !user.admin)) {
    router.back();
    return null;
  }

  const handleVerify = async (userId: string, userName: string) => {
    Alert.alert(
      'Verify Provider',
      `Are you sure you want to verify ${userName} as a provider?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          style: 'default',
          onPress: async () => {
            try {
              console.log('Verifying provider:', userId);
              await verifyProvider(userId).unwrap();
              Alert.alert('Success', `${userName} has been verified as a provider`);
              refetch();
            } catch (err: any) {
              console.error('Verify provider error:', err);
              Alert.alert('Error', err?.data?.detail || 'Failed to verify provider');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (userId: string, userName: string) => {
    Alert.alert(
      'Decline Provider',
      `Are you sure you want to decline ${userName}'s provider application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Declining provider:', userId);
              await declineProvider(userId).unwrap();
              Alert.alert('Success', `${userName}'s application has been declined`);
              refetch();
            } catch (err: any) {
              console.error('Decline provider error:', err);
              Alert.alert('Error', err?.data?.detail || 'Failed to decline provider');
            }
          },
        },
      ]
    );
  };

  const filteredApplications = applications?.filter((app) =>
    selectedTab === 'pending' ? app.status === 'pending' : true
  ) || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Provider Applications',
          headerStyle: { backgroundColor: '#2D1A46' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load applications</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          {filteredApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <User size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Applications</Text>
              <Text style={styles.emptyText}>
                {selectedTab === 'pending'
                  ? 'No pending applications to review'
                  : 'No applications found'}
              </Text>
            </View>
          ) : (
            filteredApplications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    {application.user.profile_photo ? (
                      <Image
                        source={{ uri: application.user.profile_photo }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <User size={24} color="#6B7280" />
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{application.user.full_name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          application.status === 'pending' && styles.statusPending,
                          application.status === 'approved' && styles.statusApproved,
                          application.status === 'declined' && styles.statusDeclined,
                        ]}
                      >
                        <Text style={styles.statusText}>{application.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Mail size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{application.user.email}</Text>
                  </View>
                  {application.user.phone_number && (
                    <View style={styles.infoRow}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{application.user.phone_number}</Text>
                    </View>
                  )}
                  {(application.user.city || application.user.country) && (
                    <View style={styles.infoRow}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {[application.user.city, application.user.country]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                  )}
                </View>

                {application.status === 'pending' && (
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.declineButton,
                        (isVerifying || isDeclining) && styles.buttonDisabled,
                      ]}
                      onPress={() =>
                        handleDecline(
                          application.user.id || String(application.user.pkid),
                          application.user.full_name
                        )
                      }
                      disabled={isVerifying || isDeclining}
                    >
                      <XCircle size={20} color="white" />
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.verifyButton,
                        (isVerifying || isDeclining) && styles.buttonDisabled,
                      ]}
                      onPress={() =>
                        handleVerify(
                          application.user.id || String(application.user.pkid),
                          application.user.full_name
                        )
                      }
                      disabled={isVerifying || isDeclining}
                    >
                      <CheckCircle size={20} color="white" />
                      <Text style={styles.actionButtonText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2D1A46',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2D1A46',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1A46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBody: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  verifyButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
