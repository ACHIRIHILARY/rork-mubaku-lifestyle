import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { User, Lock, Trash2, LogOut, ChevronRight, Briefcase, Eye, EyeOff, Package, Edit, Languages } from 'lucide-react-native';
import { useGetCurrentUserQuery, useChangePasswordMutation, useDeleteAccountMutation } from '@/store/services/authApi';
import { useGetApplicationStatusQuery } from '@/store/services/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/authSlice';
import { useTranslation } from 'react-i18next';


export default function ProfileSettingsScreen() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const { data: applicationStatus } = useGetApplicationStatusQuery();
  const [changePassword] = useChangePasswordMutation();
  const [deleteAccount] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('passwordMinLength'));
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();

      Alert.alert(t('success'), t('passwordChangedSuccessfully'));
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error?.data?.detail || error?.data?.current_password?.[0] || error?.data?.new_password?.[0] || t('failedToChangePassword');
      Alert.alert(t('error'), errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            Alert.prompt(
              t('confirmPassword'),
              t('enterPasswordConfirm'),
              async (password) => {
                if (!password) {
                  Alert.alert(t('error'), t('passwordRequired'));
                  return;
                }
                try {
                  await deleteAccount({ current_password: password }).unwrap();
                  Alert.alert(
                    t('success'),
                    t('accountDeletedSuccessfully'),
                    [
                      {
                        text: t('ok'),
                        onPress: () => {
                          dispatch(logoutAction());
                          router.replace('/login');
                        }
                      }
                    ]
                  );
                } catch (error: any) {
                  console.error('Delete account error:', error);
                  const errorMessage = error?.data?.current_password?.[0] || error?.data?.detail || t('failedToDeleteAccount');
                  Alert.alert(t('error'), errorMessage);
                }
              },
              'secure-text'
            );
          }
        }
      ]
    );
  };

  const handleViewProfileDetails = () => {
    if (!user) return;

    const details = `Name: ${user.full_name || 'N/A'}\n` +
      `Email: ${user.email || 'N/A'}\n` +
      `Phone: ${user.phone_number || 'N/A'}\n` +
      `City: ${user.city || 'N/A'}\n` +
      `Country: ${user.country || 'N/A'}\n` +
      `Role: ${user.role === 'provider' ? t('provider') : t('client')}`;

    Alert.alert('Profile Details', details);
  };

  const handleChangeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguageModalVisible(false);
    Alert.alert(t('success'), t('languageChanged', { lang: lang === 'en' ? t('english') : t('french') }));
  };

  const clientSettingsOptions = [
    {
      id: 'edit-profile',
      title: t('editProfile'),
      description: t('updateProfileInfo'),
      icon: Edit,
      onPress: () => router.push('/profile-edit' as any)
    },
    {
      id: 'favorites',
      title: t('favoriteProviders'),
      description: t('manageFavoriteProviders'),
      icon: User,
      onPress: () => Alert.alert('Coming Soon', 'Favorite providers feature will be available soon!')
    },
    {
      id: 'payment-methods',
      title: t('paymentMethods'),
      description: t('managePaymentMethods'),
      icon: Lock,
      onPress: () => Alert.alert('Payment Methods', 'Available payment methods:\n• MTN Mobile Money\n• Orange Mobile Money\n\nThis feature will be fully integrated soon!')
    },
    {
      id: 'view-profile',
      title: t('viewProfileDetails'),
      description: t('seeCompleteProfile'),
      icon: User,
      onPress: handleViewProfileDetails
    },
    {
      id: 'language',
      title: t('language'),
      description: t('currentLanguage', { lang: i18n.language === 'en' ? t('english') : t('french') }),
      icon: Languages,
      onPress: () => setLanguageModalVisible(true)
    },
    {
      id: 'change-password',
      title: t('changePassword'),
      description: t('updateAccountPassword'),
      icon: Lock,
      onPress: () => setPasswordModalVisible(true)
    },
    {
      id: 'help-support',
      title: t('helpSupport'),
      description: t('getHelpSupport'),
      icon: User,
      onPress: () => Alert.alert('Help & Support', 'For assistance, please contact our support team at support@mubakulifestyle.com')
    },
    {
      id: 'delete-account',
      title: t('deleteAccount'),
      description: t('permanentlyDeleteAccount'),
      icon: Trash2,
      onPress: handleDeleteAccount,
      isDanger: true
    }
  ];

  const providerSettingsOptions = [
    {
      id: 'edit-profile',
      title: t('editProfile'),
      description: t('updateProfileInfo'),
      icon: Edit,
      onPress: () => router.push('/profile-edit' as any)
    },
    {
      id: 'public-profile',
      title: t('myPublicProfile'),
      description: t('howClientsSeeYou'),
      icon: User,
      onPress: () => router.push(('/provider-detail?id=' + user?.pkid) as any)
    },
    {
      id: 'payout-settings',
      title: t('payoutBankDetails'),
      description: t('managePayoutSettings'),
      icon: Lock,
      onPress: () => Alert.alert('Coming Soon', 'Payout and bank details management will be available soon!')
    },
    {
      id: 'view-profile',
      title: t('viewProfileDetails'),
      description: t('seeCompleteProfile'),
      icon: User,
      onPress: handleViewProfileDetails
    },
    {
      id: 'language',
      title: t('language'),
      description: t('currentLanguage', { lang: i18n.language === 'en' ? t('english') : t('french') }),
      icon: Languages,
      onPress: () => setLanguageModalVisible(true)
    },
    {
      id: 'change-password',
      title: t('changePassword'),
      description: t('updateAccountPassword'),
      icon: Lock,
      onPress: () => setPasswordModalVisible(true)
    },
    {
      id: 'help-support',
      title: t('helpSupport'),
      description: t('getHelpSupport'),
      icon: User,
      onPress: () => Alert.alert('Help & Support', 'For assistance, please contact our support team at support@mubakulifestyle.com')
    },
    {
      id: 'delete-account',
      title: t('deleteAccount'),
      description: t('permanentlyDeleteAccount'),
      icon: Trash2,
      onPress: handleDeleteAccount,
      isDanger: true
    }
  ];

  const settingsOptions = user?.role === 'provider' ? providerSettingsOptions : clientSettingsOptions;

  const showProviderApplication = user?.role === 'client' && (!applicationStatus || applicationStatus.status === 'rejected' || applicationStatus.status === 'withdrawn');
  const showApplicationStatus = applicationStatus && applicationStatus.status !== 'rejected' && applicationStatus.status !== 'withdrawn';
  const isApprovedProvider = user?.role === 'provider' || (applicationStatus && applicationStatus.status === 'approved');

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
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
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <ScrollView style={styles.content}>
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
                  <Text style={styles.roleText}>{user?.role === 'provider' ? t('provider') : t('client')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {showProviderApplication && (
          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => router.push('/agent-profile-setup')}
          >
            <View style={styles.providerIconContainer}>
              <Briefcase color="white" size={32} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerTitle}>{t('becomeProvider')}</Text>
              <Text style={styles.providerDescription}>{t('offerServicesEarnMoney')}</Text>
            </View>
            <ChevronRight color="white" size={24} />
          </TouchableOpacity>
        )}

        {showApplicationStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>{t('providerApplicationStatus')}</Text>
            <View style={[
              styles.statusBadge,
              applicationStatus.status === 'pending' && styles.statusPending,
              applicationStatus.status === 'approved' && styles.statusApproved,
            ]}>
              <Text style={styles.statusText}>
                {applicationStatus.status === 'pending' ? t('pendingReview') :
                  applicationStatus.status === 'approved' ? t('approved') :
                    applicationStatus.status}
              </Text>
            </View>
            {applicationStatus.status === 'pending' && (
              <Text style={styles.statusDescription}>
                {t('applicationBeingReviewed')}
              </Text>
            )}
            {applicationStatus.status === 'approved' && (
              <Text style={styles.statusDescription}>
                {t('congratulationsApproved')}
              </Text>
            )}
          </View>
        )}

        {isApprovedProvider && (
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() => router.push('/provider-services' as any)}
          >
            <View style={styles.dashboardIconContainer}>
              <Package color="white" size={32} />
            </View>
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardTitle}>{t('manageMyServices')}</Text>
              <Text style={styles.dashboardDescription}>{t('createEditManageServices')}</Text>
            </View>
            <ChevronRight color="white" size={24} />
          </TouchableOpacity>
        )}

        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.settingCard, option.isDanger && styles.dangerCard]}
                onPress={option.onPress}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, option.isDanger && styles.dangerIconContainer]}>
                    <IconComponent color={option.isDanger ? '#FF4444' : '#2D1A46'} size={24} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, option.isDanger && styles.dangerTitle]}>{option.title}</Text>
                    <Text style={styles.settingDescription}>{option.description}</Text>
                  </View>
                </View>
                <ChevronRight color="#ccc" size={20} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut color="#FF4444" size={24} />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('currentPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder={t('enterCurrentPassword')}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('newPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder={t('enterNewPassword')}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('confirmNewPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.changePasswordButton, isChangingPassword && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.changePasswordText}>{t('changePassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.languageModalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && styles.selectedLanguageOption
              ]}
              onPress={() => handleChangeLanguage('en')}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  i18n.language === 'en' && styles.selectedLanguageText
                ]}>{t('english')}</Text>
                <Text style={[
                  styles.languageNative,
                  i18n.language === 'en' && styles.selectedLanguageText
                ]}>{t('english')}</Text>
              </View>
              {i18n.language === 'en' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'fr' && styles.selectedLanguageOption
              ]}
              onPress={() => handleChangeLanguage('fr')}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  i18n.language === 'fr' && styles.selectedLanguageText
                ]}>{t('french')}</Text>
                <Text style={[
                  styles.languageNative,
                  i18n.language === 'fr' && styles.selectedLanguageText
                ]}>{t('french')}</Text>
              </View>
              {i18n.language === 'fr' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
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
  dangerCard: {
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  dangerIconContainer: {
    backgroundColor: '#FFE0E0',
  },
  dangerTitle: {
    color: '#FF4444',
  },
  dashboardCard: {
    backgroundColor: '#4CAF50',
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
  dashboardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  dashboardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  changePasswordButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  settingBadge: {
    fontSize: 20,
  },
  languageModalContent: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedLanguageText: {
    color: 'white',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
});
