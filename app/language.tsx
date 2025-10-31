import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe } from 'lucide-react-native';
import { useAppSelector } from '@/store/hooks';
import { useUpdateUnifiedProfileMutation } from '@/store/services/profileApi';

const LANGUAGE_STORAGE_KEY = '@mubaku_language';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [updateProfile] = useUpdateUnifiedProfileMutation();

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && !isAuthenticated) {
        console.log('Loaded saved language:', savedLanguage);
        setSelectedLanguage(savedLanguage);
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      } else {
        setSelectedLanguage(savedLanguage || user?.language || 'en');
      }
    } catch (error) {
      console.error('Error loading language:', error);
      setSelectedLanguage('en');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLanguage = async (languageCode: string): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      console.log('Language saved:', languageCode);
      return true;
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert('Error', 'Failed to save language preference. Please try again.');
      return false;
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert('Language Required', 'Please select a language to continue.');
      return;
    }

    setIsSaving(true);
    const saved = await saveLanguage(selectedLanguage);

    if (saved) {
      if (isAuthenticated && user) {
        try {
          await updateProfile({ language: selectedLanguage }).unwrap();
          console.log('Language updated in user profile:', selectedLanguage);
          Alert.alert('Success', 'Language preference updated successfully', [
            {
              text: 'OK',
              onPress: () => {
                setIsSaving(false);
                router.back();
              }
            }
          ]);
        } catch (error) {
          console.error('Failed to update language in profile:', error);
          setIsSaving(false);
          Alert.alert('Warning', 'Language saved locally but failed to sync with server.');
        }
      } else {
        setIsSaving(false);
        router.replace('/login');
      }
    } else {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Globe size={64} color="white" />
        </View>
        
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>Select your preferred language to get started</Text>

        <View style={styles.languageContainer}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedLanguage === language.code && styles.selectedCard
              ]}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.selectedText
                  ]}>
                    {language.name}
                  </Text>
                  <Text style={[
                    styles.nativeName,
                    selectedLanguage === language.code && styles.selectedNativeText
                  ]}>
                    {language.nativeName}
                  </Text>
                </View>
              </View>
              {selectedLanguage === language.code && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedLanguage || isSaving) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.continueText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4A896',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
    opacity: 0.9,
  },
  languageContainer: {
    gap: 16,
    marginBottom: 60,
  },
  languageCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#2D1A46',
    borderColor: '#F4A896',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageTextContainer: {
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  selectedText: {
    color: 'white',
  },
  selectedNativeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4A896',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export { LANGUAGE_STORAGE_KEY, LANGUAGES };