import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, User, CreditCard, Globe, LogOut, ChevronRight, Briefcase } from 'lucide-react-native';
import { useGetCurrentUserQuery } from '@/store/services/authApi';
import { useGetApplicationStatusQuery } from '@/store/services/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/authSlice';

export default function ProfileSettingsScreen() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const { data: applicationStatus } = useGetApplicationStatusQuery();
  const dispatch = useAppDispatch();

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: User,
      onPress: () => {
        // Navigate to edit profile
      }
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Manage your payment options',
      icon: CreditCard,
      onPress: () => {
        // Navigate to payment methods
      }
    },
    {
      id: 'language',
      title: 'Language Preference',
      description: 'Change app language',
      icon: Globe,
      onPress: () => {
        router.push('/language');
      }
    }
  ];

  const showProviderApplication = user?.role === 'client' && (!applicationStatus || applicationStatus.status === 'rejected' || applicationStatus.status === 'withdrawn');
  const showApplicationStatus = applicationStatus && applicationStatus.status !== 'rejected' && applicationStatus.status !== 'withdrawn';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutAction());
            router.replace('/login');
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
          </View>
        ) : (
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user?.profile_photo ? (
                  <Text style={styles.avatarText}>👤</Text>
                ) : (
                  <Text style={styles.avatarText}>{user?.first_name?.charAt(0) || '👤'}</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                </Text>
                <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                {user?.phone_number && (
                  <Text style={styles.profilePhone}>{user.phone_number}</Text>
                )}
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user?.role === 'provider' ? 'Provider' : 'Client'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Provider Application Section */}
        {showProviderApplication && (
          <TouchableOpacity 
            style={styles.providerCard}
            onPress={() => router.push('/agent-profile-setup')}
          >
            <View style={styles.providerIconContainer}>
              <Briefcase color="white" size={32} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerTitle}>Become a Service Provider</Text>
              <Text style={styles.providerDescription}>Offer your services and earn money</Text>
            </View>
            <ChevronRight color="white" size={24} />
          </TouchableOpacity>
        )}

        {/* Application Status Section */}
        {showApplicationStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Provider Application Status</Text>
            <View style={[
              styles.statusBadge,
              applicationStatus.status === 'pending' && styles.statusPending,
              applicationStatus.status === 'approved' && styles.statusApproved,
            ]}>
              <Text style={styles.statusText}>
                {applicationStatus.status === 'pending' ? 'Pending Review' : 
                 applicationStatus.status === 'approved' ? 'Approved' : 
                 applicationStatus.status}
              </Text>
            </View>
            {applicationStatus.status === 'pending' && (
              <Text style={styles.statusDescription}>
                Your application is being reviewed. We'll notify you once it's approved.
              </Text>
            )}
            {applicationStatus.status === 'approved' && (
              <Text style={styles.statusDescription}>
                Congratulations! You can now create services and accept bookings.
              </Text>
            )}
          </View>
        )}

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity 
                key={option.id}
                style={styles.settingCard}
                onPress={option.onPress}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <IconComponent color="#2D1A46" size={24} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{option.title}</Text>
                    <Text style={styles.settingDescription}>{option.description}</Text>
                  </View>
                </View>
                <ChevronRight color="#ccc" size={20} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut color="#FF4444" size={24} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  profileSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  profilePhone: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  settingsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutContainer: {
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 12,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: '#2D1A46',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  providerCard: {
    backgroundColor: '#2D1A46',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  providerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusApproved: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});