import { api } from '../api';
import { setCredentials, setUser, updateAccessToken } from '../authSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

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

interface RefreshTokenRequest {
  refresh: string;
}

interface RefreshTokenResponse {
  access: string;
}

export const authApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/jwt/create/',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.access,
              refreshToken: data.refresh,
            })
          );
          dispatch(authApi.endpoints.getCurrentUser.initiate());
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    register: builder.mutation<User, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/users/',
        method: 'POST',
        body: userData,
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/users/me/',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (error) {
          console.error('Get current user failed:', error);
        }
      },
      providesTags: ['User'],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: '/auth/jwt/refresh/',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateAccessToken(data.access));
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      },
    }),

    changePassword: builder.mutation<void, { current_password: string; new_password: string; re_new_password?: string }>({
      query: (body) => ({
        url: '/auth/users/set_password/',
        method: 'POST',
        body: {
          ...body,
          re_new_password: body.new_password,
        },
      }),
    }),

    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/auth/users/reset_password/',
        method: 'POST',
        body,
      }),
    }),

    deleteAccount: builder.mutation<void, { current_password: string }>({
      query: (body) => ({
        url: '/auth/users/me/',
        method: 'DELETE',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useDeleteAccountMutation,
} = authApi;
