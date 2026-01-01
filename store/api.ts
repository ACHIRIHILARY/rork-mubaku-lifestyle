import { createApi, fetchBaseQuery, FetchArgs, BaseQueryApi } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { updateAccessToken, logout } from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mubakulifestyle.com/api/v1';

console.log('API Base URL:', API_BASE_URL);

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const language = await AsyncStorage.getItem('user-language');
    headers.set('Accept-Language', language || 'en');
    
    return headers;
  },
}); 

const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      console.log('Access token expired, attempting refresh...');
      
      const refreshResult = await baseQuery(
        {
          url: '/auth/jwt/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { access: string };
        api.dispatch(updateAccessToken(data.access));
        
        console.log('Token refreshed successfully, retrying original request...');
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error('Token refresh failed, logging out user');
        api.dispatch(logout());
      }
    } else {
      console.error('No refresh token available, logging out user');
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Profile', 'Appointment', 'Availability', 'Service', 'Notification', 'Payment'],
  endpoints: () => ({}),
});
