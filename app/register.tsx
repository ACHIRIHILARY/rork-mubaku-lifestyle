import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRegisterMutation } from '@/store/services/authApi';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const isSubmitting = useRef(false);

  const handleRegister = async () => {
    if (isSubmitting.current || isLoading) {
      return;
    }

    setErrorMessage('');

    if (!firstName || !lastName || !username || !email || !password) {
      setErrorMessage(t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t('passwordMinLength'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t('validEmailRequired'));
      return;
    }

    try {
      isSubmitting.current = true;
      
      console.log('Starting registration...');
      console.log('Registration data:', {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password: '***'
      });
      
      await register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      }).unwrap();

      Alert.alert(
        t('registrationSuccessful'),
        t('welcomeToMubaku', { name: firstName }),
        [
          {
            text: t('login'),
            onPress: () => {
              router.replace('/login');
            },
            style: 'default'
          }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('Registration error:', JSON.stringify(error, null, 2));
      console.error('Error status:', error?.status);
      console.error('Error data:', error?.data);
      
      let message = 'Registration failed. Please try again.';
      
      if (error?.data) {
        if (typeof error.data === 'string') {
          message = error.data;
        } else if (error.data.email) {
          message = Array.isArray(error.data.email) ? error.data.email[0] : error.data.email;
        } else if (error.data.username) {
          message = Array.isArray(error.data.username) ? error.data.username[0] : error.data.username;
        } else if (error.data.password) {
          message = Array.isArray(error.data.password) ? error.data.password[0] : error.data.password;
        } else if (error.data.first_name) {
          message = Array.isArray(error.data.first_name) ? error.data.first_name[0] : error.data.first_name;
        } else if (error.data.last_name) {
          message = Array.isArray(error.data.last_name) ? error.data.last_name[0] : error.data.last_name;
        } else if (error.data.detail) {
          message = error.data.detail;
        } else if (error.data.message) {
          message = error.data.message;
        } else {
          const keys = Object.keys(error.data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const value = error.data[firstKey];
            message = `${firstKey}: ${Array.isArray(value) ? value[0] : value}`;
          } else {
            message = 'Registration failed. Please check your information and try again.';
          }
        }
      } else if (error?.message) {
        message = error.message;
      } else if (error?.status) {
        if (error.status === 'FETCH_ERROR') {
          message = 'Network error. Please check your internet connection and try again.';
        } else {
          message = `Error: ${error.status} - ${error.statusText || 'Request failed'}`;
        }
      }
      
      setErrorMessage(message);
      Alert.alert(t('registrationFailed'), message);
    } finally {
      isSubmitting.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('createAccount')}</Text>
              <Text style={styles.subtitle}>{t('joinMubakulifestyle')}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('firstName')}</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('enterFirstName')}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('lastName')}</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('enterLastName')}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('username')}</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t('chooseUsername')}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('enterYourEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('password')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('createPassword')}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={20} color="#666" />
                    ) : (
                      <EyeOff size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('confirmPassword')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('confirmYourPassword')}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} color="#666" />
                    ) : (
                      <EyeOff size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={20} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={[styles.registerText, { marginLeft: 12 }]}>{t('creatingAccount')}</Text>
                  </View>
                ) : (
                  <Text style={styles.registerText}>{t('createAccount')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginText}>{t('alreadyHaveAccount')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4A896',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
  registerButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#2D1A46',
    fontSize: 16,
    fontWeight: '500',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
