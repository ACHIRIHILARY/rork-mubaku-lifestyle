import { api } from '../api';

interface User {
  pkid: number;
  id?: string;
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
  role: 'client' | 'provider' | 'admin';
  admin: boolean;
  is_active?: boolean;
  is_verified_provider?: boolean;
}

interface ProviderApplication {
  id: string;
  user: User;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

interface UpdateUserRequest {
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: 'client' | 'provider' | 'admin';
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listApplications: builder.query<ProviderApplication[], void>({
      query: () => '/api/v1/users/applications/',
      providesTags: ['User'],
    }),

    verifyProvider: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/verify-provider/`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['User'],
    }),

    updateUserRole: builder.mutation<User, { userId: string; role: 'client' | 'provider' | 'admin' }>({
      query: ({ userId, role }) => ({
        url: `/api/v1/users/${userId}/update-role/`,
        method: 'POST',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    declineProvider: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/decline-provider/`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['User'],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: '/api/v1/services/categories/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Service'],
    }),

    updateCategory: builder.mutation<Category, { categoryId: string; data: UpdateCategoryRequest }>({
      query: ({ categoryId, data }) => ({
        url: `/api/v1/services/categories/${categoryId}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (categoryId) => ({
        url: `/api/v1/services/categories/${categoryId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

    listAllUsers: builder.query<User[], void>({
      query: () => '/api/v1/auth/users/',
      providesTags: ['User'],
    }),

    getSpecificUser: builder.query<User, number>({
      query: (pkid) => `/api/v1/auth/users/${pkid}/`,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { pkid: number; data: UpdateUserRequest }>({
      query: ({ pkid, data }) => ({
        url: `/api/v1/auth/users/${pkid}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useListApplicationsQuery,
  useVerifyProviderMutation,
  useUpdateUserRoleMutation,
  useDeclineProviderMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useListAllUsersQuery,
  useGetSpecificUserQuery,
  useUpdateUserMutation,
} = adminApi;
