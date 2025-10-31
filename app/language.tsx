import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Check, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useUpdateUnifiedProfileMutation } from '@/store/services/profileApi';
import { useLanguage } from '@/contexts/LanguageContext';

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
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [updateProfile] = useUpdateUnifiedProfileMutation();
  const { setLanguage: setContextLanguage } = useLanguage();

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
    await setContextLanguage(languageCode);
    console.log('Language context updated to:', languageCode);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert(t('language.errorTitle'), t('language.errorMessage'));
      return;
    }

    setIsSaving(true);
    const saved = await saveLanguage(selectedLanguage);

    if (saved) {
      await setContextLanguage(selectedLanguage);
      
      if (isAuthenticated && user) {
        try {
          await updateProfile({ language: selectedLanguage }).unwrap();
          console.log('Language updated in user profile:', selectedLanguage);
          setIsSaving(false);
          Alert.alert(t('language.successTitle'), t('language.successMessage'), [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]);
        } catch (error) {
          console.error('Failed to update language in profile:', error);
          setIsSaving(false);
          Alert.alert(t('language.warningTitle'), t('language.warningMessage'));
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
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedLangObj = LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Globe size={48} color="#2D1A46" strokeWidth={1.5} />
            </View>
          </View>
          
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>{t('language.label')}</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownButtonContent}>
                {selectedLangObj ? (
                  <>
                    <Text style={styles.dropdownFlag}>{selectedLangObj.flag}</Text>
                    <View style={styles.dropdownTextContainer}>
                      <Text style={styles.dropdownText}>{selectedLangObj.name}</Text>
                      <Text style={styles.dropdownNativeText}>{selectedLangObj.nativeName}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>{t('language.selectPlaceholder')}</Text>
                )}
              </View>
              <ChevronDown 
                size={24} 
                color="#666" 
                style={[styles.chevron, isDropdownOpen && styles.chevronOpen]}
              />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView 
                  style={styles.dropdownScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                >
                  {LANGUAGES.map((language, index) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.dropdownItem,
                        selectedLanguage === language.code && styles.dropdownItemSelected,
                        index === LANGUAGES.length - 1 && styles.dropdownItemLast,
                      ]}
                      onPress={() => {
                        handleLanguageSelect(language.code);
                        setIsDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownItemFlag}>{language.flag}</Text>
                      <View style={styles.dropdownItemTextContainer}>
                        <Text style={[
                          styles.dropdownItemName,
                          selectedLanguage === language.code && styles.dropdownItemNameSelected
                        ]}>
                          {language.name}
                        </Text>
                        <Text style={[
                          styles.dropdownItemNative,
                          selectedLanguage === language.code && styles.dropdownItemNativeSelected
                        ]}>
                          {language.nativeName}
                        </Text>
                      </View>
                      {selectedLanguage === language.code && (
                        <Check size={20} color="#F4A896" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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
                <Text style={styles.continueText}>{t('language.saving')}</Text>
              </View>
            ) : (
              <Text style={styles.continueText}>{t('common.continue')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#2D1A46',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F4F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#2D1A46',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  dropdownContainer: {
    marginBottom: 40,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  dropdownTextContainer: {
    flex: 1,
  },
  dropdownText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  dropdownNativeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#FEF3F2',
  },
  dropdownItemFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  dropdownItemNameSelected: {
    color: '#F4A896',
  },
  dropdownItemNative: {
    fontSize: 14,
    color: '#6B7280',
  },
  dropdownItemNativeSelected: {
    color: '#F4A896',
  },
  continueButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2D1A46',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export { LANGUAGE_STORAGE_KEY, LANGUAGES };