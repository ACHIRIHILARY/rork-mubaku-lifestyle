import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n/config';
import { LANGUAGE_STORAGE_KEY, LANGUAGES } from '@/app/language';
import { useAppSelector } from '@/store/hooks';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => Promise<void>;
  getLanguageName: (code: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (user?.language && user.language !== currentLanguage) {
      console.log('Syncing language from user profile:', user.language);
      setCurrentLanguage(user.language);
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, user.language);
    }
  }, [user?.language]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      setCurrentLanguage(languageCode);
      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Error saving language:', error);
      throw error;
    }
  };

  const getLanguageName = (code: string): string => {
    const language = LANGUAGES.find(lang => lang.code === code);
    return language?.name || 'English';
  };

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      getLanguageName,
      isLoading,
    }),
    [currentLanguage, isLoading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
