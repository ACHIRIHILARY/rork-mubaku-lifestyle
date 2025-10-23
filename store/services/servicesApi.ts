import { api } from '../api';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  provider: string;
  category: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider_details?: any;
  category_details?: ServiceCategory;
  rating?: number;
  total_bookings?: number;
}

interface CreateServiceRequest {
  category: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency: string;
}

interface UpdateServiceRequest {
  category?: string;
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  is_active?: boolean;
}

interface ServiceStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
}

export const servicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllServices: builder.query<Service[], { category?: string; provider?: string; search?: string }>({
      query: (params) => ({
        url: '/api/v1/services/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Service' as const, id })),
              'Service',
            ]
          : ['Service'],
    }),

    getServiceById: builder.query<Service, string>({
      query: (serviceId) => `/api/v1/services/${serviceId}/`,
      providesTags: (result, error, serviceId) => [{ type: 'Service', id: serviceId }],
    }),

    getMyServices: builder.query<Service[], void>({
      query: () => '/api/v1/services/my-services/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Service' as const, id })),
              'Service',
            ]
          : ['Service'],
    }),

    getProviderServices: builder.query<Service[], string>({
      query: (providerId) => `/api/v1/services/provider/${providerId}/`,
      providesTags: (result, error, providerId) => [
        { type: 'Service', id: `provider-${providerId}` },
      ],
    }),

    createService: builder.mutation<Service, CreateServiceRequest>({
      query: (data) => ({
        url: '/api/v1/services/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation<Service, { serviceId: string; data: UpdateServiceRequest }>({
      query: ({ serviceId, data }) => ({
        url: `/api/v1/services/${serviceId}/update/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        'Service',
      ],
    }),

    deleteService: builder.mutation<void, string>({
      query: (serviceId) => ({
        url: `/api/v1/services/${serviceId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, serviceId) => [
        { type: 'Service', id: serviceId },
        'Service',
      ],
    }),

    getMyServiceStats: builder.query<ServiceStats, void>({
      query: () => '/api/v1/services/my-stats/',
      providesTags: ['Service'],
    }),

    getAllCategories: builder.query<ServiceCategory[], void>({
      query: () => '/api/v1/services/categories/',
      providesTags: ['Service'],
    }),

    getCategoryById: builder.query<ServiceCategory, string>({
      query: (categoryId) => `/api/v1/services/categories/${categoryId}/`,
      providesTags: (result, error, categoryId) => [
        { type: 'Service', id: `category-${categoryId}` },
      ],
    }),

    getCategoryServices: builder.query<Service[], string>({
      query: (categoryId) => `/api/v1/services/categories/${categoryId}/services/`,
      providesTags: (result, error, categoryId) => [
        { type: 'Service', id: `category-${categoryId}-services` },
      ],
    }),
  }),
});

export const {
  useGetAllServicesQuery,
  useGetServiceByIdQuery,
  useGetMyServicesQuery,
  useGetProviderServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetMyServiceStatsQuery,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryServicesQuery,
} = servicesApi;
