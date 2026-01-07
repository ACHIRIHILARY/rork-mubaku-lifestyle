import { api } from '../api';

interface ServiceCategory {
  id: string;
  pkid: number;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  service_count?: number;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  pkid: number;
  name: string;
  description?: string;
  category: number;
  category_name: string;
  provider: number;
  provider_name: string;
  provider_business: string;
  is_verified_provider: boolean;
  duration: string;
  duration_minutes: number;
  price: string;
  image: string;
  currency: string;
  price_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider_location: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    business_name: string;
    map_embed: string;
    static_map?: string;
    google_maps_link: string;
    is_verified_provider: boolean;
  };
  provider_map: string;
  provider_static_map?: string;
}

interface CreateServiceRequest {
  category: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface UpdateServiceRequest {
  category?: number;
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface ServiceStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
}

export const servicesApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllServices: builder.query<Service[], { category?: string; provider?: string; search?: string; verified_only?: boolean }>({
      query: (params) => ({
        url: '/services/',
        params: { ...params, verified_only: params?.verified_only !== false },
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
      query: (serviceId) => `/services/${serviceId}/`,
      providesTags: (result, error, serviceId) => [{ type: 'Service', id: serviceId }],
    }),

    getMyServices: builder.query<Service[], void>({
      query: () => '/services/my-services/',
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Service' as const, id })),
            'Service',
          ]
          : ['Service'],
    }),

    getProviderServices: builder.query<Service[], string>({
      query: (providerId) => `/services/provider/${providerId}/`,
      providesTags: (result, error, providerId) => [
        { type: 'Service', id: `provider-${providerId}` },
      ],
    }),

    createService: builder.mutation<Service, CreateServiceRequest>({
      query: (data) => ({
        url: '/services/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation<Service, { serviceId: string; data: UpdateServiceRequest }>({
      query: ({ serviceId, data }) => ({
        url: `/services/${serviceId}/update/`,
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
        url: `/services/${serviceId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, serviceId) => [
        { type: 'Service', id: serviceId },
        'Service',
      ],
    }),

    getMyServiceStats: builder.query<ServiceStats, void>({
      query: () => '/services/my-stats/',
      providesTags: ['Service'],
    }),

    getAllCategories: builder.query<ServiceCategory[], void>({
      query: () => '/services/categories/',
      providesTags: ['Service'],
    }),

    getCategoryById: builder.query<ServiceCategory, string>({
      query: (categoryId) => `/services/categories/${categoryId}/`,
      providesTags: (result, error, categoryId) => [
        { type: 'Service', id: `category-${categoryId}` },
      ],
    }),

    getCategoryServices: builder.query<Service[], string>({
      query: (categoryId) => `/services/categories/${categoryId}/services/`,
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
