import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for token expiration (10 days in milliseconds)
const TOKEN_EXPIRATION_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

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
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const tokenCreatedAtStr = await AsyncStorage.getItem('tokenCreatedAt');

      if (accessToken && refreshToken && tokenCreatedAtStr) {
        const tokenCreatedAt = parseInt(tokenCreatedAtStr, 10);

        // Check if tokens are expired
        if (areTokensExpired(tokenCreatedAt)) {
          console.log('Tokens are expired (10+ days old), clearing stored tokens');
          // Clear expired tokens
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

      AsyncStorage.setItem('accessToken', action.payload.accessToken);
      AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
      AsyncStorage.setItem('tokenCreatedAt', now.toString());
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      AsyncStorage.setItem('accessToken', action.payload);
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

export const { setCredentials, setUser, updateAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
export type { User };
