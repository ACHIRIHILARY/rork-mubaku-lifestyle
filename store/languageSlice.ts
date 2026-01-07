import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

export type Language = 'en' | 'fr';

interface LanguageState {
    currentLanguage: Language;
    isInitialized: boolean;
}

const initialState: LanguageState = {
    currentLanguage: 'en',
    isInitialized: false,
};

export const initializeLanguage = createAsyncThunk(
    'language/initialize',
    async () => {
        try {
            const storedLanguage = await AsyncStorage.getItem('user-language');
            const deviceLanguage = getLocales()[0]?.languageCode as Language;
            const language = (storedLanguage as Language) || deviceLanguage || 'en';
            return language;
        } catch (error) {
            console.error('Failed to load language from storage:', error);
            return 'en';
        }
    }
);

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.currentLanguage = action.payload;
            AsyncStorage.setItem('user-language', action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeLanguage.fulfilled, (state, action) => {
                state.currentLanguage = action.payload;
                state.isInitialized = true;
            })
            .addCase(initializeLanguage.rejected, (state) => {
                state.isInitialized = true;
            });
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;