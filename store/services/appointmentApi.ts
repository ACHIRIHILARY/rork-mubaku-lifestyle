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
  endpoints: (builder) => ({
    getAvailableSlots: builder.query<TimeSlot[], { serviceId: string; startDate: string; endDate: string }>({
      query: ({ serviceId, startDate, endDate }) => ({
        url: `/api/v1/appointments/services/${serviceId}/slots/`,
        params: { start_date: startDate, end_date: endDate },
      }),
      providesTags: (result, error, { serviceId }) => [
        { type: 'Availability', id: serviceId },
      ],
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
      query: (data) => ({
        url: '/api/v1/appointments/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Appointment'],
    }),

    confirmPayment: builder.mutation<Appointment, string>({
      query: (appointmentId) => ({
        url: `/api/v1/appointments/${appointmentId}/confirm-payment/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, appointmentId) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
      ],
    }),

    getMyAppointments: builder.query<Appointment[], { status?: string }>({
      query: ({ status }) => ({
        url: '/api/v1/appointments/my/',
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
      query: (appointmentId) => `/api/v1/appointments/${appointmentId}/`,
      providesTags: (result, error, appointmentId) => [{ type: 'Appointment', id: appointmentId }],
    }),

    cancelAppointment: builder.mutation<Appointment, { appointmentId: string; reason: string }>({
      query: ({ appointmentId, reason }) => ({
        url: `/api/v1/appointments/${appointmentId}/cancel/`,
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
        url: `/api/v1/appointments/${appointmentId}/reschedule/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
        'Appointment',
        'Availability',
      ],
    }),

    getProviderAvailability: builder.query<Availability[], void>({
      query: () => '/api/v1/appointments/availability/',
      providesTags: ['Availability'],
    }),

    setProviderAvailability: builder.mutation<Availability, Omit<Availability, 'id' | 'provider' | 'day_of_week_display'>>({
      query: (data) => ({
        url: '/api/v1/appointments/availability/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    getAvailabilityExceptions: builder.query<AvailabilityException[], void>({
      query: () => '/api/v1/appointments/availability/exceptions/',
      providesTags: ['Availability'],
    }),

    createAvailabilityException: builder.mutation<AvailabilityException, Omit<AvailabilityException, 'id'>>({
      query: (data) => ({
        url: '/api/v1/appointments/availability/exceptions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    getMonthlyCalendar: builder.query<DayAvailability[], { providerId: string; year: number; month: number }>({
      query: ({ providerId, year, month }) => `/api/v1/appointments/providers/${providerId}/calendar/${year}/${month}/`,
      providesTags: (result, error, { providerId }) => [
        { type: 'Availability', id: providerId },
      ],
    }),

    getDailyDetails: builder.query<any, { providerId: string; year: number; month: number; day: number }>({
      query: ({ providerId, year, month, day }) => 
        `/api/v1/appointments/providers/${providerId}/calendar/${year}/${month}/${day}/`,
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
  useGetAvailabilityExceptionsQuery,
  useCreateAvailabilityExceptionMutation,
  useGetMonthlyCalendarQuery,
  useGetDailyDetailsQuery,
} = appointmentApi;
