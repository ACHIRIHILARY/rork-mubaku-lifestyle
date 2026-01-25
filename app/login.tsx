import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLoginMutation } from '@/store/services/authApi';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';


export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (waitingForUser && user && isAuthenticated) {
      console.log('User data loaded after login:', JSON.stringify(user, null, 2));

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      const destination = '/(tabs)/home';

      console.log('Redirecting user to:', destination);

      setWaitingForUser(false);
      router.replace(destination as any);
    }
  }, [waitingForUser, user, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('enterBothEmailPassword'));
      return;
    }

    try {
      await login({ email, password }).unwrap();
      console.log('Login successful, waiting for user data...');

      setWaitingForUser(true);

      redirectTimeoutRef.current = setTimeout(() => {
        console.warn('User data fetch timeout, redirecting to home as fallback');
        setWaitingForUser(false);
        router.replace('/(tabs)/home' as any);
      }, 5000);
    } catch (error: unknown) {
      setWaitingForUser(false);

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      console.error('Login error:', JSON.stringify(error, null, 2));

      let errorMessage = 'Login failed. Please check your credentials and try again.';

      if (error && typeof error === 'object') {
        const err = error as { data?: unknown; message?: string; status?: number; statusText?: string };

        if (err.data) {
          if (typeof err.data === 'string') {
            errorMessage = err.data;
          } else if (typeof err.data === 'object' && err.data !== null) {
            const data = err.data as { detail?: string; message?: string; error?: string };
            if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.error) {
              errorMessage = data.error;
            } else {
              errorMessage = JSON.stringify(err.data);
            }
          }
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.status) {
          errorMessage = `Error: ${err.status} - ${err.statusText || 'Request failed'}`;
        }
      }

      Alert.alert(t('loginError'), errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('welcomeBack')}</Text>
              <Text style={styles.subtitle}>{t('signInToAccount')}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('enterEmail')}
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
                    placeholder={t('enterPassword')}
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
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => router.push('/forgot-password' as any)}
                >
                  <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, (isLoading || waitingForUser) && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading || waitingForUser}
              >
                {(isLoading || waitingForUser) ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="white" />
                    <Text style={styles.loginText}>
                      {isLoading ? t('loggingIn') : t('loading')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.loginText}>{t('login')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push('/register' as any)}
              >
                <Text style={styles.registerText}>{t('noAccount')}</Text>
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
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  loginButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerText: {
    color: '#2D1A46',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButtonDisabled: {
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#F4A896',
    fontSize: 14,
    fontWeight: '500',
  },
});
