import { api } from '../api';



interface PaymentMethodApiResponse {
  id: string;
  name: string;
  method_code: string;
  icon_url: string;
  min_amount: string;
  max_amount: string;
  instructions: string;
  requires_service_number: boolean;
  service_number_label: string;
  service_number_hint: string;
  validation_regex: string;
  gateway: {
    name: string;
    type: string;
  };
}

type PaymentMethodsResponse = PaymentMethodApiResponse[];

interface AmountBreakdown {
  service_amount: number;
  platform_fee: number;
  gateway_fee: number;
  provider_payout: number;
}

interface PaymentAmount {
  total: number;
  currency: string;
  breakdown: AmountBreakdown;
  percentages: {
    platform_fee: number;
    gateway_fee: number;
    provider_payout: number;
  };
}

interface PaymentAppointment {
  id: string;
  service: string;
  scheduled_at: string;
  provider_name: string;
}

interface PaymentMethodInfo {
  code: string;
  display_name: string;
  instructions: string;
  authorization_required: boolean;
}

interface NextAction {
  type: string;
  description: string;
  expected_timeout: number;
  polling_interval: number;
}

interface PollingInfo {
  endpoint: string;
  recommended_interval: number;
  max_attempts: number;
  stop?: boolean;
  reason?: string;
  next_poll_after?: number;
  poll_count?: number;
  max_polls_remaining?: number;
}

interface GatewayInfo {
  reference: string;
  transaction_id: string | null;
  status: string;
  last_check?: string;
  receipt_number?: string;
  verification_code?: string;
  confirmation_time?: string;
  error_code?: string;
  error_message?: string;
  failure_time?: string;
}

interface EscrowInfo {
  status: string;
  release_trigger: string;
  auto_release_date: string;
  available_balance: number;
}

interface PaymentAction {
  type: string;
  endpoint: string;
  method: string;
  payload?: any;
  payload_template?: any;
}

interface NextSteps {
  user_action: string;
  message: string;
  actions: PaymentAction[];
}

interface StateMachine {
  current: string;
  next?: string;
  progress: number;
  final?: boolean;
  estimated_remaining?: number;
  error_state?: string;
}

interface FailureDetails {
  code: string;
  message: string;
  recoverable: boolean;
  retry_allowed: boolean;
  suggested_action: string;
}

interface InstructionsInfo {
  user_action_required: boolean;
  message: string;
  action_type: string;
  timeout_warning: string;
}

interface Payment {
  id: string;
  frontend_token: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: PaymentAmount;
  appointment: PaymentAppointment;
  payment_method: PaymentMethodInfo;
  gateway_reference: string;
  requires_action: boolean;
  next_action?: NextAction;
  timestamps: {
    created_at: string;
    expires_at?: string;
    estimated_completion?: string;
    last_updated?: string;
    elapsed_seconds?: number;
    completed_at?: string;
    processing_duration?: number;
    failed_at?: string;
    failure_duration?: number;
  };
  polling: PollingInfo;
  state_machine?: StateMachine;
  gateway?: GatewayInfo;
  escrow?: EscrowInfo;
  next_steps?: NextSteps;
  failure_details?: FailureDetails;
  instructions?: InstructionsInfo;
}

interface InitiatePaymentRequest {
  appointment_id: string;
  payment_method: string;
  customer_phone: string;
  customer_email?: string;
  metadata?: {
    device_info?: string;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}

interface InitiatePaymentResponse {
  success: boolean;
  payment: Payment;
}

type PaymentStatusResponse = Payment;

interface PaymentHistoryItem {
  id: string;
  frontend_token: string;
  status: string;
  amount: {
    total: number;
    currency: string;
    breakdown: {
      service_amount: number;
      platform_fee: number;
      gateway_fee: number;
    };
  };
  appointment: {
    id: string;
    service_name: string;
    provider_name: string;
    scheduled_at: string;
    status: string;
  };
  payment_method: {
    code: string;
    display_name: string;
    icon_url: string;
  };
  gateway: {
    transaction_id: string;
    receipt_number: string;
    completed_at: string;
  };
  escrow: {
    status: string;
    auto_release_date: string;
  };
  timestamps: {
    created_at: string;
    completed_at: string;
  };
  actions: {
    view_receipt: string;
    view_appointment: string;
  };
}

interface PaymentHistoryResponse {
  success: boolean;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: string | null;
    previous_page: string | null;
  };
  summary: {
    total_amount: number;
    total_fees: number;
    completed_count: number;
    failed_count: number;
    refunded_count: number;
  };
  payments: PaymentHistoryItem[];
}

export const paymentApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethodsResponse, void>({
      query: () => '/payments/methods',
      providesTags: ['Payment'],
    }),

    initiatePayment: builder.mutation<InitiatePaymentResponse, InitiatePaymentRequest>({
      query: (data) => ({
        url: '/payments/initiate/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Appointment'],
    }),

    getPaymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (frontendToken) => `/payments/status/${frontendToken}/`,
      providesTags: (result, error, frontendToken) => [
        { type: 'Payment', id: frontendToken },
      ],
    }),

    getPaymentById: builder.query<PaymentStatusResponse, string>({
      query: (paymentId) => `/payments/${paymentId}/`,
      providesTags: (result, error, paymentId) => [
        { type: 'Payment', id: paymentId },
      ],
    }),

    getPaymentHistory: builder.query<PaymentHistoryResponse, {
      status?: string;
      page?: number;
      page_size?: number;
      date_from?: string;
      date_to?: string;
      currency?: string;
      payment_method?: string;
    }>({
      query: (params) => ({
        url: '/payments/history/',
        params,
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useInitiatePaymentMutation,
  useGetPaymentStatusQuery,
  useLazyGetPaymentStatusQuery,
  useGetPaymentByIdQuery,
  useGetPaymentHistoryQuery,
} = paymentApi;
