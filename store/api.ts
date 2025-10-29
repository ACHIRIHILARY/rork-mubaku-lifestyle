import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mubaku-backend.onrender.com';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Appointment', 'Availability', 'Service', 'Notification'],
  endpoints: () => ({}),
});
