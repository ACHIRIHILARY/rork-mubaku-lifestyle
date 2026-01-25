import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for token expiration (10 days in milliseconds)
const TOKEN_EXPIRATION_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

// Simple encryption/decryption for tokens (basic security layer)
const TOKEN_ENCRYPTION_KEY = 'rork-mubaku-secure-key-2024';

// Simple XOR encryption for basic security (not for production use without proper crypto)
const simpleEncrypt = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ TOKEN_ENCRYPTION_KEY.charCodeAt(i % TOKEN_ENCRYPTION_KEY.length));
  }
  return btoa(result); // Base64 encode
};

const simpleDecrypt = (encryptedText: string): string => {
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ TOKEN_ENCRYPTION_KEY.charCodeAt(i % TOKEN_ENCRYPTION_KEY.length));
    }
    return result;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return '';
  }
};

// Utility function to check if tokens are expired
const areTokensExpired = (tokenCreatedAt: number): boolean => {
  const now = Date.now();
  const timeDiff = now - tokenCreatedAt;
  return timeDiff >= TOKEN_EXPIRATION_MS;
};

interface User {
  pkid: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender?: string;
  phone_number?: string;
  profile_photo?: string;
  country?: string;
  city?: string;
  role: 'client' | 'provider';
  language?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenCreatedAt: number | null; // UTC timestamp when tokens were created
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenCreatedAt: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    try {
      const encryptedAccessToken = await AsyncStorage.getItem('accessToken');
      const encryptedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const tokenCreatedAtStr = await AsyncStorage.getItem('tokenCreatedAt');

      if (encryptedAccessToken && encryptedRefreshToken && tokenCreatedAtStr) {
        const tokenCreatedAt = parseInt(tokenCreatedAtStr, 10);

        // Check if tokens are expired
        if (areTokensExpired(tokenCreatedAt)) {
          console.log('Tokens are expired (10+ days old), clearing stored tokens');
          // Clear expired tokens
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'tokenCreatedAt']);
          return null;
        }

        // Decrypt tokens
        const accessToken = simpleDecrypt(encryptedAccessToken);
        const refreshToken = simpleDecrypt(encryptedRefreshToken);

        if (!accessToken || !refreshToken) {
          console.error('Failed to decrypt tokens, clearing stored data');
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'tokenCreatedAt']);
          return null;
        }

        return { accessToken, refreshToken, tokenCreatedAt };
      }
      return null;
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user?: User }>) => {
      const now = Date.now(); // UTC timestamp in milliseconds
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.tokenCreatedAt = now;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.isAuthenticated = true;

      // Store encrypted tokens
      AsyncStorage.setItem('accessToken', simpleEncrypt(action.payload.accessToken));
      AsyncStorage.setItem('refreshToken', simpleEncrypt(action.payload.refreshToken));
      AsyncStorage.setItem('tokenCreatedAt', now.toString());
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      AsyncStorage.setItem('accessToken', simpleEncrypt(action.payload));
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenCreatedAt = null;
      state.user = null;
      state.isAuthenticated = false;

      AsyncStorage.removeItem('accessToken');
      AsyncStorage.removeItem('refreshToken');
      AsyncStorage.removeItem('tokenCreatedAt');
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.tokenCreatedAt = action.payload.tokenCreatedAt || null;
          state.isAuthenticated = true;
        }
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

// Action to check token expiration and logout if expired
export const checkTokenExpiration = createAsyncThunk(
  'auth/checkExpiration',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };

    if (state.auth.tokenCreatedAt && areTokensExpired(state.auth.tokenCreatedAt)) {
      console.log('Token expiration check: tokens are expired, logging out');
      dispatch(logout());
      return true; // Tokens were expired and user was logged out
    }

    return false; // Tokens are still valid
  }
);

export const { setCredentials, setUser, updateAccessToken, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
export type { User };
