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

const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales();
    return locales?.[0]?.languageCode || 'en';
  } catch (error) {
    console.log('Failed to get device language:', error);
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

// Load stored language preference asynchronously after init
AsyncStorage.getItem('user-language')
  .then((storedLanguage) => {
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr')) {
      i18n.changeLanguage(storedLanguage);
    }
  })
  .catch((error) => {
    console.log('Failed to load stored language:', error);
  });

i18n.on('languageChanged', (lng) => {
  AsyncStorage.setItem('user-language', lng).catch((error) => {
    console.log('Failed to save language preference:', error);
  });
});

export default i18n;
