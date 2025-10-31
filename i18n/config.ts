import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import fr from './fr.json';

const LANGUAGE_STORAGE_KEY = '@mubaku_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      callback(savedLanguage || 'en');
    } catch (error) {
      console.error('Error loading language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
