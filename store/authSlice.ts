import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
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
      
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
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
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.isAuthenticated = true;

      AsyncStorage.setItem('accessToken', action.payload.accessToken);
      AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
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
      state.user = null;
      state.isAuthenticated = false;

      AsyncStorage.removeItem('accessToken');
      AsyncStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

export const { setCredentials, setUser, updateAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
export type { User };
