# Language Management System - Implementation Guide

## Overview

The Mubaku Lifestyle app now includes a complete language management system that allows users to select and persist their preferred language across app sessions. This implementation provides a solid foundation for future internationalization (i18n) support.

## Features Implemented

### 1. **Language Selection Screen** (`app/language.tsx`)
- Beautiful UI with flag emojis for each language
- Support for 5 languages:
  - English (EN) 🇺🇸
  - Français (FR) 🇫🇷
  - Español (ES) 🇪🇸
  - Deutsch (DE) 🇩🇪
  - العربية (AR) 🇸🇦
- Auto-skip feature: If language is already selected, automatically redirects to login
- Loading states with proper feedback
- Persistent storage using AsyncStorage
- Native language names displayed alongside English names
- Visual selection feedback with checkmarks
- Disabled state while saving

### 2. **Language Context Provider** (`contexts/LanguageContext.tsx`)
- Global state management for current language
- Automatic loading of saved language preference on app start
- Methods for changing language app-wide
- Helper function to get language name from code
- Optimized with `useMemo` to prevent unnecessary re-renders

### 3. **Profile Integration** (`app/(tabs)/profile.tsx`)
- Language preference displayed with current language name
- Flag emoji badge showing selected language
- Quick access to change language from profile settings
- Real-time updates when language changes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     App Root (_layout.tsx)                   │
│                                                               │
│  ┌─────────────────��──────────────────────────────────────┐ │
│  │           LanguageProvider (Context)                    │ │
│  │                                                          │ │
│  │  • Loads language from AsyncStorage on mount            │ │
│  │  • Provides currentLanguage state                       │ │
│  │  • Provides setLanguage function                        │ │
│  │  • Provides getLanguageName helper                      │ │
│  │                                                          │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │          All App Screens                         │   │ │
│  │  │                                                  │   │ │
│  │  │  • Access via useLanguage() hook                │   │ │
│  │  │  • Can change language anywhere                 │   │ │
│  │  │  • Changes persist automatically                │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Storage

- **Storage Key**: `@mubaku_language`
- **Storage Method**: AsyncStorage (React Native's recommended persistent storage)
- **Data Format**: Simple language code string (e.g., "en", "fr", "es")

## How to Use in Your Code

### 1. Access Current Language

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { currentLanguage, getLanguageName } = useLanguage();
  
  console.log(currentLanguage); // "en"
  console.log(getLanguageName(currentLanguage)); // "English"
  
  return <Text>Current Language: {getLanguageName(currentLanguage)}</Text>;
}
```

### 2. Change Language Programmatically

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert } from 'react-native';

function LanguageSwitcher() {
  const { setLanguage } = useLanguage();
  
  const handleChangeLanguage = async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
      Alert.alert('Success', 'Language changed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to change language');
    }
  };
  
  return (
    <Button 
      title="Switch to French" 
      onPress={() => handleChangeLanguage('fr')} 
    />
  );
}
```

### 3. Add New Languages

To add more languages, edit `app/language.tsx`:

```typescript
const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  // Add your new language here:
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
];
```

## Integration with i18n Libraries (Future Enhancement)

This system is designed to work seamlessly with internationalization libraries. When you're ready to add translations:

### Recommended: `react-i18next`

1. Install dependencies:
```bash
bun install i18next react-i18next
```

2. Create translation files:
```typescript
// locales/en.json
{
  "welcome": "Welcome to Mubaku Lifestyle",
  "login": "Login",
  "register": "Register"
}

// locales/fr.json
{
  "welcome": "Bienvenue à Mubaku Lifestyle",
  "login": "Connexion",
  "register": "S'inscrire"
}
```

3. Initialize i18next with your language context:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

// In your Language Provider or _layout.tsx
const { currentLanguage } = useLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      fr: { translation: require('./locales/fr.json') },
      // ... other languages
    },
    lng: currentLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
```

4. Use in components:
```typescript
import { useTranslation } from 'react-i18next';

function Welcome() {
  const { t } = useTranslation();
  return <Text>{t('welcome')}</Text>;
}
```

5. Sync with language changes:
```typescript
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import i18n from 'i18next';

function LanguageSync() {
  const { currentLanguage } = useLanguage();
  
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage]);
  
  return null;
}
```

## User Flow

1. **First App Launch**:
   - User sees language selection screen
   - Selects preferred language (defaults to English)
   - Language is saved to AsyncStorage
   - Navigates to login screen

2. **Subsequent Launches**:
   - App loads saved language from AsyncStorage
   - Automatically applies the saved language
   - Auto-redirects to login (skips language selection)

3. **Changing Language Later**:
   - Navigate to Profile → Language Preference
   - Select new language
   - Change is saved immediately
   - App UI updates in real-time

## Testing Checklist

- [x] Language persists across app restarts
- [x] Changing language updates profile display
- [x] Auto-skip works when language is already set
- [x] Loading states display properly
- [x] Error handling for AsyncStorage failures
- [x] All 5 languages are selectable
- [x] Flag emojis display correctly
- [x] Checkmark shows on selected language
- [x] Continue button is disabled until selection is made
- [x] Language context is available throughout the app

## API Considerations

Currently, the language selection is client-side only. If your backend API supports localized content:

1. **Send language in API headers**:
```typescript
// In your API client configuration
headers: {
  'Accept-Language': currentLanguage,
}
```

2. **Include language in user profile**:
```typescript
// Update user profile with preferred language
const updateLanguagePreference = async (languageCode: string) => {
  await apiClient.patch('/api/v1/users/me/', {
    preferred_language: languageCode
  });
};
```

3. **Sync with backend on change**:
```typescript
const { setLanguage } = useLanguage();
const [updateProfile] = useUpdateProfileMutation();

const handleLanguageChange = async (code: string) => {
  await setLanguage(code);
  await updateProfile({ preferred_language: code });
};
```

## Troubleshooting

### Language not persisting
- Check AsyncStorage permissions
- Verify storage key is consistent
- Check console logs for storage errors

### Language context undefined
- Ensure LanguageProvider wraps your app in _layout.tsx
- Verify you're using useLanguage() hook inside a component

### Flags not displaying
- This is likely a font/emoji support issue on the device
- Consider using image assets instead of emoji flags for production

## Future Enhancements

1. **RTL Support**: Add right-to-left layout support for Arabic
2. **Dynamic Content**: Fetch localized content from API
3. **Translation Management**: Use a translation management system (e.g., Lokalise, Phrase)
4. **Pluralization**: Handle plural forms correctly for each language
5. **Date/Time Formatting**: Locale-aware date and time formatting
6. **Number Formatting**: Currency and number formatting per locale
7. **Language-specific Fonts**: Load custom fonts for better language support

## Files Modified/Created

### Created
- `app/language.tsx` - Language selection screen
- `contexts/LanguageContext.tsx` - Global language state management
- `LANGUAGE_MANAGEMENT.md` - This documentation

### Modified
- `app/_layout.tsx` - Added LanguageProvider wrapper
- `app/(tabs)/profile.tsx` - Added language preference display with flag badge

## Summary

The language management system is now fully functional and provides:
- ✅ Persistent language selection
- ✅ Global state management
- ✅ Beautiful, intuitive UI
- ✅ Easy integration for future i18n support
- ✅ Profile integration with visual indicators
- ✅ Foundation for multi-language app

This implementation follows React Native and Expo best practices and is production-ready!
