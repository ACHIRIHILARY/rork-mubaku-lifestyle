import { api } from '../api';

interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  country?: string;
  address?: string;
  about_me?: string;
  city?: string;
  gender?: string;
  phone_number?: string;
  profile_photo?: string;
  joined_date: string;
  last_login: string;
  membership_duration: string;
  role: 'client' | 'provider' | 'admin';
  is_verified_provider?: boolean;
  provider_application_status?: string;
  language?: string;
}

interface UnifiedProfile {
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
  address?: string;
  about_me?: string;
  role: 'client' | 'provider' | 'admin';
  is_verified_provider: boolean;
  provider_application_status?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface UpdateProfileRequest {
  phone_number?: string;
  profile_photo?: string;
  about_me?: string;
  gender?: string;
  country?: string;
  city?: string;
  address?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface ProviderApplicationRequest {
  business_name?: string;
  business_address?: string;
  description?: string;
  service_categories?: number[];
  years_of_experience?: number;
  certifications?: string[];
  portfolio_urls?: string[];
  availability_schedule?: string;
  base_price?: number;
  emergency_contact?: string;
  latitude?: number;
  longitude?: number;
}

export const profileApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, string>({
      query: (id) => `/users/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Profile', id }],
    }),

    getMyProfile: builder.query<UnifiedProfile, void>({
      query: () => '/users/me/',
      providesTags: ['User', 'Profile'],
    }),

    getUnifiedProfile: builder.query<UnifiedProfile, void>({
      query: () => '/users/me/unified/',
      providesTags: ['User', 'Profile'],
    }),

    updateProfile: builder.mutation<Profile, { id: string; data: UpdateProfileRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Profile', id },
        'User',
      ],
    }),

    updateUnifiedProfile: builder.mutation<UnifiedProfile, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/me/unified/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    applyForProvider: builder.mutation<any, ProviderApplicationRequest>({
      query: (data) => ({
        url: '/users/apply-provider/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    getApplicationStatus: builder.query<any, void>({
      query: () => '/users/application-status/',
      providesTags: ['User'],
    }),

    withdrawApplication: builder.mutation<void, void>({
      query: () => ({
        url: '/users/withdraw-application/',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    verifyProvider: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}/verify-provider/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Profile', id },
        'User',
      ],
    }),

    getApprovedProviders: builder.query<UnifiedProfile[], void>({
      query: () => ({
        url: '/users/',
        params: { role: 'provider', is_verified_provider: 'true' }
      }),
      providesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetMyProfileQuery,
  useGetUnifiedProfileQuery,
  useUpdateProfileMutation,
  useUpdateUnifiedProfileMutation,
  useApplyForProviderMutation,
  useGetApplicationStatusQuery,
  useWithdrawApplicationMutation,
  useVerifyProviderMutation,
  useGetApprovedProvidersQuery,
} = profileApi;
