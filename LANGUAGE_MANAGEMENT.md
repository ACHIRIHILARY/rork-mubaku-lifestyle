# Language Management Implementation

## Overview

This document describes the complete language management system implemented in the Mubaku Lifestyle mobile app. The system provides:

✅ **Local language storage** for immediate availability
✅ **Backend synchronization** with user profile for cross-device consistency
✅ **Conditional navigation** based on authentication status
✅ **Profile settings integration** for easy language changes
✅ **Automatic sync** between local storage and user profile

## Architecture

### 1. Data Flow

```
User Selection → AsyncStorage → User Profile API → AuthSlice → LanguageContext
```

**Flow Details:**
1. User selects language on `/language` screen
2. Language saved to AsyncStorage (local persistence)
3. If authenticated: API call updates user profile
4. AuthSlice receives updated user data with language
5. LanguageContext syncs with user profile language
6. Components access language via `useLanguage()` hook

### 2. Files Modified/Created

#### Type Definitions Updated:
- **`store/authSlice.ts`**: Added `language?: string` to User interface
- **`store/services/authApi.ts`**: Added `language?: string` to User interface
- **`store/services/profileApi.ts`**: Added `language?: string` to Profile, UnifiedProfile, and UpdateProfileRequest interfaces

#### Language Screen Enhanced:
- **`app/language.tsx`**:
  - Added authentication checks
  - Integrated with profile update API
  - Conditional navigation (onboarding vs settings)
  - Syncs with user profile when authenticated

#### Context Updated:
- **`contexts/LanguageContext.tsx`**:
  - Added `useAppSelector` to access Redux user state
  - Automatic sync when user profile language changes
  - Maintains consistency between local storage and profile

#### Profile Integration:
- **`app/(tabs)/profile.tsx`**: Already includes language option that navigates to `/language` screen

## How It Works

### For Unauthenticated Users (Onboarding):

```typescript
// Language screen behavior
1. User opens app for first time
2. Sees language selection screen
3. Selects language (e.g., French)
4. Language saved to AsyncStorage: '@mubaku_language' = 'fr'
5. Navigates to /login
```

### For Authenticated Users (Settings):

```typescript
// Profile settings → Language
1. User opens Profile tab
2. Taps "Language Preference" option
3. Navigates to /language screen
4. Selects new language (e.g., Spanish)
5. Language saved to AsyncStorage: '@mubaku_language' = 'es'
6. API call: PATCH /api/v1/users/me/unified/ with { language: 'es' }
7. User profile updated in database
8. AuthSlice receives updated user data
9. LanguageContext syncs with new language
10. Success alert shown, navigates back to profile
```

### On App Launch:

```typescript
// Auto-loading user language
1. App initializes auth from AsyncStorage tokens
2. If tokens exist, fetches current user
3. User data includes language field
4. LanguageContext syncs with user.language
5. AsyncStorage updated to match profile
```

## API Integration

### Backend Requirements:

The backend API should support a `language` field in the user/profile model:

```python
# Example Django model (adjust based on your backend)
class User(models.Model):
    # ... existing fields
    language = models.CharField(
        max_length=5, 
        choices=[
            ('en', 'English'),
            ('fr', 'Français'),
            ('es', 'Español'),
            ('de', 'Deutsch'),
            ('ar', 'العربية'),
        ],
        default='en',
        blank=True
    )
```

### API Endpoints Used:

1. **Get User Profile**: `GET /api/v1/auth/users/me/`
   - Returns user data including `language` field
   
2. **Update User Profile**: `PATCH /api/v1/users/me/unified/`
   - Request body: `{ language: 'fr' }`
   - Updates user's language preference

## Supported Languages

The app currently supports 5 languages:

| Code | Name      | Native Name | Flag |
|------|-----------|-------------|------|
| en   | English   | English     | 🇺🇸   |
| fr   | Français  | Français    | 🇫🇷   |
| es   | Spanish   | Español     | 🇪🇸   |
| de   | German    | Deutsch     | 🇩🇪   |
| ar   | Arabic    | العربية     | 🇸🇦   |

To add more languages, update the `LANGUAGES` array in `app/language.tsx`.

## Usage in Components

### Access Current Language:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { currentLanguage, getLanguageName } = useLanguage();
  
  return <Text>Current: {getLanguageName(currentLanguage)}</Text>;
}
```

### Change Language Programmatically:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function LanguageToggle() {
  const { setLanguage } = useLanguage();
  
  const handleChange = async () => {
    try {
      await setLanguage('fr');
      console.log('Language changed to French');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };
  
  return <Button onPress={handleChange} title="Switch to French" />;
}
```

## Preventing Logout Issues

### Problem Previously:
The language screen always navigated to `/login`, interrupting authenticated sessions.

### Solution Implemented:
```typescript
// Conditional navigation based on auth status
const handleContinue = async () => {
  if (isAuthenticated && user) {
    // Update profile and go back
    await updateProfile({ language: selectedLanguage });
    router.back();
  } else {
    // Onboarding flow continues to login
    router.replace('/login');
  }
};
```

## Future Enhancements

### 1. Add i18n Library (Recommended):

Install `react-i18next`:
```bash
npm install react-i18next i18next
```

Create translation files:
```typescript
// locales/en.json
{
  "welcome": "Welcome",
  "login": "Login",
  "register": "Register"
}

// locales/fr.json
{
  "welcome": "Bienvenue",
  "login": "Connexion",
  "register": "S'inscrire"
}
```

Configure i18next:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      fr: { translation: require('./locales/fr.json') },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

Use in components:
```typescript
import { useTranslation } from 'react-i18next';

function LoginScreen() {
  const { t } = useTranslation();
  
  return <Text>{t('welcome')}</Text>;
}
```

### 2. RTL Support for Arabic:

```typescript
import { I18nManager } from 'react-native';

const setRTL = (isRTL: boolean) => {
  I18nManager.forceRTL(isRTL);
  // Requires app restart
};
```

### 3. Device Language Detection:

```typescript
import * as Localization from 'expo-localization';

const deviceLanguage = Localization.locale.split('-')[0]; // 'en', 'fr', etc.
```

## Testing

### Test Scenarios:

1. **First-time user (Onboarding)**:
   - Select language → should navigate to login
   - Language should persist after login

2. **Authenticated user (Settings)**:
   - Change language → should update profile
   - Should show success message
   - Should navigate back to profile
   - Should sync across devices after re-login

3. **Profile sync**:
   - Login on Device A, change language
   - Login on Device B
   - Should see language from profile

4. **Error handling**:
   - Network failure during profile update
   - Should save locally with warning message

## Console Logs for Debugging

The implementation includes extensive logging:

```typescript
console.log('Loaded saved language:', savedLanguage);
console.log('Language saved:', languageCode);
console.log('Language updated in user profile:', selectedLanguage);
console.log('Syncing language from user profile:', user.language);
```

Monitor these logs to debug language sync issues.

## Common Issues & Solutions

### Issue: Language resets on app restart
**Solution**: Check that AsyncStorage is properly persisting. Verify `LANGUAGE_STORAGE_KEY` is consistent.

### Issue: Language doesn't sync to profile
**Solution**: Ensure backend has `language` field in user model and serializer includes it.

### Issue: User gets "logged out" when changing language
**Solution**: This is now fixed. The screen checks authentication status before navigating.

### Issue: LanguageContext doesn't update after profile change
**Solution**: Implemented `useEffect` to watch `user?.language` changes and sync automatically.

## Summary

The language management system is now fully integrated with:
- ✅ Local persistence via AsyncStorage
- ✅ Backend synchronization via profile API
- ✅ Context-based state management
- ✅ Profile settings UI
- ✅ Conditional navigation for onboarding vs settings
- ✅ Automatic sync between storage and profile

**What's NOT implemented yet**:
- ❌ Actual translations (i18n library)
- ❌ RTL layout support for Arabic
- ❌ Device language detection

These can be added as future enhancements when translation files are ready.
