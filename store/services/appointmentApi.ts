import { api } from '../api';

interface TimeSlot {
  start_time: string;
  end_time: string;
  date: string;
  duration_minutes: number;
}

interface Appointment {
  id: string;
  service_id: string;
  scheduled_for: string;
  scheduled_until: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status?: 'held_in_escrow' | 'released' | 'refunded';
  client?: any;
  provider?: any;
  service?: any;
}

interface CreateAppointmentRequest {
  service_id: string;
  scheduled_for: string;
  scheduled_until: string;
  amount: number;
  currency: string;
}

interface RescheduleRequest {
  scheduled_for: string;
  scheduled_until: string;
}

interface Availability {
  id: string;
  provider: string;
  day_of_week: number;
  day_of_week_display: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityException {
  id?: string;
  exception_date: string;
  exception_type: 'unavailable' | 'modified_hours';
  start_time?: string;
  end_time?: string;
  reason?: string;
}

interface DayAvailability {
  date: string;
  status: 'full' | 'limited' | 'unavailable';
  availability_level: 'full' | 'limited' | 'unavailable';
}

export const appointmentApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAvailableSlots: builder.query<TimeSlot[], { serviceId: string; startDate: string; endDate: string }>({
      query: ({ serviceId, startDate, endDate }) => ({
        url: `/appointments/services/${serviceId}/slots/`,
        params: { start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { serviceId }) => [
        { type: 'Availability', id: serviceId },
      ],
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
      query: (data) => ({
        url: '/appointments/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),

    confirmPayment: builder.mutation<Appointment, string>({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}/confirm-payment/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, appointmentId) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
      ],
    }),

    getMyAppointments: builder.query<Appointment[], { status?: string }>({
      query: ({ status }) => ({
        url: '/appointments/my/',
        params: status ? { status } : {},
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Appointment' as const, id })),
            'Appointment',
          ]
          : ['Appointment'],
    }),

    getAppointmentDetail: builder.query<Appointment, string>({
      query: (appointmentId) => `/appointments/${appointmentId}/`,
      providesTags: (result, error, appointmentId) => [{ type: 'Appointment', id: appointmentId }],
    }),

    cancelAppointment: builder.mutation<Appointment, { appointmentId: string; reason: string }>({
      query: ({ appointmentId, reason }) => ({
        url: `/appointments/${appointmentId}/cancel/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
      ],
    }),

    rescheduleAppointment: builder.mutation<Appointment, { appointmentId: string } & RescheduleRequest>({
      query: ({ appointmentId, ...data }) => ({
        url: `/appointments/${appointmentId}/reschedule/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
        'Availability',
      ],
    }),

    completeAppointment: builder.mutation<Appointment, string>({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}/`,
        method: 'POST',
        body: { action: 'complete' },
      }),
      invalidatesTags: (result, error, appointmentId) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
      ],
    }),

    getProviderAvailability: builder.query<Availability[], void>({
      query: () => '/appointments/availability/',
      providesTags: ['Availability'],
    }),

    setProviderAvailability: builder.mutation<Availability, Omit<Availability, 'id' | 'provider' | 'day_of_week_display'>>({
      query: (data) => ({
        url: '/appointments/availability/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    updateProviderAvailability: builder.mutation<Availability, { id: string } & Partial<Omit<Availability, 'id' | 'provider' | 'day_of_week_display'>>>({
      query: ({ id, ...data }) => ({
        url: `/appointments/availability/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    deleteProviderAvailability: builder.mutation<void, string>({
      query: (id) => ({
        url: `/appointments/availability/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Availability'],
    }),

    getAvailabilityExceptions: builder.query<AvailabilityException[], void>({
      query: () => '/appointments/availability/exceptions/',
      providesTags: ['Availability'],
    }),

    createAvailabilityException: builder.mutation<AvailabilityException, Omit<AvailabilityException, 'id'>>({
      query: (data) => ({
        url: '/appointments/availability/exceptions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    deleteAvailabilityException: builder.mutation<void, string>({
      query: (id) => ({
        url: `/appointments/availability/exceptions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Availability'],
    }),

    getMonthlyCalendar: builder.query<DayAvailability[], { providerId: string; year: number; month: number }>({
      query: ({ providerId, year, month }) => `/appointments/providers/${providerId}/calendar/${year}/${month}/`,
      providesTags: (result, error, { providerId }) => [
        { type: 'Availability', id: providerId },
      ],
    }),

    getDailyDetails: builder.query<any, { providerId: string; year: number; month: number; day: number }>({
      query: ({ providerId, year, month, day }) =>
        `/appointments/providers/${providerId}/calendar/${year}/${month}/${day}/`,
      providesTags: (result, error, { providerId }) => [
        { type: 'Availability', id: `${providerId}-daily` },
      ],
    }),
  }),
});

export const {
  useGetAvailableSlotsQuery,
  useCreateAppointmentMutation,
  useConfirmPaymentMutation,
  useGetMyAppointmentsQuery,
  useGetAppointmentDetailQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetProviderAvailabilityQuery,
  useSetProviderAvailabilityMutation,
  useUpdateProviderAvailabilityMutation,
  useDeleteProviderAvailabilityMutation,
  useGetAvailabilityExceptionsQuery,
  useCreateAvailabilityExceptionMutation,
  useDeleteAvailabilityExceptionMutation,
  useGetMonthlyCalendarQuery,
  useGetDailyDetailsQuery,
  useCompleteAppointmentMutation,
} = appointmentApi;
