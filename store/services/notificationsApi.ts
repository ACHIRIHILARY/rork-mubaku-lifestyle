import { api } from '../api';

interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface GetNotificationsParams {
  is_read?: boolean;
  notification_type?: string;
  page?: number;
  page_size?: number;
}

export const notificationsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], GetNotificationsParams | void>({
      query: (params = {}) => ({
        url: '/notifications/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              'Notification',
            ]
          : ['Notification'],
    }),

    markAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read/`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: 'Notification', id: notificationId },
        'Notification',
      ],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: 'Notification', id: notificationId },
        'Notification',
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
