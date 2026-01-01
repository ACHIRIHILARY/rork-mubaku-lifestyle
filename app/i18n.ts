import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    const storedLanguage = await AsyncStorage.getItem('user-language');
    const language = storedLanguage || getLocales()[0]?.languageCode || 'en';
    callback(language);
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    await AsyncStorage.setItem('user-language', language);
  },
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  languageDetector.cacheUserLanguage(lng);
});

export default i18n;
