import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, user, isInitialized } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isInitialized) {
      // Auth initialization is complete
      if (isAuthenticated && user) {
        // User is authenticated, navigate to tabs
        router.replace('/(tabs)/home');
      } else {
        // User is not authenticated, navigate to login
        router.replace('/login');
      }
    }
  }, [isInitialized, isAuthenticated, user]);

  // Show loading state while auth is being initialized
  if (!isInitialized) {
    return (
      <LinearGradient
        colors={['#F4A896', '#F7B8A8']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{t('mubaku')}</Text>
            <Text style={styles.logoSubtext}>{t('style')}</Text>
          </View>

          <Text style={styles.tagline}>{t('bookYourLook')}</Text>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // This return should never be reached due to the useEffect navigation,
  // but we keep it as a fallback
  return (
    <LinearGradient
      colors={['#F4A896', '#F7B8A8']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>{t('mubaku')}</Text>
          <Text style={styles.logoSubtext}>{t('style')}</Text>
        </View>

        <Text style={styles.tagline}>{t('bookYourLook')}</Text>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.getStartedText}>{t('getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '300',
    color: 'white',
    letterSpacing: 4,
    marginTop: -5,
  },
  tagline: {
    fontSize: 20,
    color: 'white',
    marginBottom: 60,
    fontWeight: '300',
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedText: {
    color: '#2D1A46',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '300',
  },
});
