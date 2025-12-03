# Mubaku Lifestyle API Integration Guide

## ✅ Fixed Issues

### URL Duplication Issue - RESOLVED
**Problem:** API calls were duplicating `/api/v1` in the URL path
- Before: `https://mubakulifestyle.com/api/v1/api/v1/auth/jwt/create/`
- After: `https://mubakulifestyle.com/api/v1/auth/jwt/create/`

**Solution:** Updated base URL in `store/api.ts` to `https://mubakulifestyle.com` (without `/api/v1`)

### Role Naming Issue - RESOLVED
**Problem:** Backend uses `provider` role, frontend was using `agent`
**Solution:** Updated all role types from `'client' | 'agent' | 'admin'` to `'client' | 'provider' | 'admin'`

---

## API Base URL
```
Production: https://mubakulifestyle.com
API Version: /api/v1
```

---

## 1. Authentication API (`store/services/authApi.ts`)

### Endpoints

#### Login
```typescript
const [login, { isLoading, error }] = useLoginMutation();
await login({ email: "user@example.com", password: "password" }).unwrap();
```
- **Endpoint:** `POST /api/v1/auth/jwt/create/`
- **Response:** `{ access: string, refresh: string }`
- **Auto-stores tokens** in Redux and AsyncStorage
- **Auto-fetches user** data after successful login

#### Register
```typescript
const [register, { isLoading }] = useRegisterMutation();
await register({
  username: "john_doe",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  password: "secure_password"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/auth/users/`
- **Response:** User object

#### Get Current User
```typescript
const { data: user, isLoading, error } = useGetCurrentUserQuery();
```
- **Endpoint:** `GET /api/v1/auth/users/me/`
- **Auto-syncs** with Redux auth state
- **Cached** by RTK Query

#### Refresh Token
```typescript
const [refreshToken] = useRefreshTokenMutation();
await refreshToken({ refresh: "refresh_token" }).unwrap();
```
- **Endpoint:** `POST /api/v1/auth/jwt/refresh/`
- **Auto-updates** access token in Redux

#### Change Password
```typescript
const [changePassword] = useChangePasswordMutation();
await changePassword({
  current_password: "old_pass",
  new_password: "new_pass"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/auth/users/set_password/`

#### Request Password Reset
```typescript
const [requestReset] = useRequestPasswordResetMutation();
await requestReset({ email: "user@example.com" }).unwrap();
```
- **Endpoint:** `POST /api/v1/auth/users/reset_password/`

---

## 2. Profile/User API (`store/services/profileApi.ts`)

### Endpoints

#### Get User Profile (By ID)
```typescript
const { data: profile } = useGetProfileQuery(userId);
```
- **Endpoint:** `GET /api/v1/users/{id}/`
- **Public:** View any user's profile

#### Get My Profile
```typescript
const { data: myProfile } = useGetMyProfileQuery();
```
- **Endpoint:** `GET /api/v1/users/me/`
- **Returns:** Current user's basic data

#### Get Unified Profile
```typescript
const { data: unifiedProfile } = useGetUnifiedProfileQuery();
```
- **Endpoint:** `GET /api/v1/users/me/unified/`
- **Returns:** Complete user + profile data

#### Update Profile
```typescript
const [updateProfile] = useUpdateProfileMutation();
await updateProfile({
  id: userId,
  data: {
    phone_number: "+237699000111",
    about_me: "Software engineer",
    gender: "Male",
    country: "Cameroon",
    city: "Yaoundé"
  }
}).unwrap();
```
- **Endpoint:** `PATCH /api/v1/users/{id}/update/`

#### Update Unified Profile
```typescript
const [updateUnified] = useUpdateUnifiedProfileMutation();
await updateUnified({
  phone_number: "+237699000111",
  city: "Yaoundé"
}).unwrap();
```
- **Endpoint:** `PATCH /api/v1/users/me/unified/`

#### Apply to Become Provider
```typescript
const [applyProvider] = useApplyForProviderMutation();
await applyProvider({
  specialty: "Hair Styling",
  experience: "5 years",
  certifications: "Licensed Cosmetologist",
  reason: "Passionate about beauty services"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/users/apply-provider/`

#### Get Application Status
```typescript
const { data: status } = useGetApplicationStatusQuery();
```
- **Endpoint:** `GET /api/v1/users/application-status/`

#### Withdraw Application
```typescript
const [withdraw] = useWithdrawApplicationMutation();
await withdraw().unwrap();
```
- **Endpoint:** `POST /api/v1/users/withdraw-application/`

#### Verify Provider (Admin Only)
```typescript
const [verifyProvider] = useVerifyProviderMutation();
await verifyProvider(userId).unwrap();
```
- **Endpoint:** `POST /api/v1/users/{id}/verify-provider/`

---

## 3. Services API (`store/services/servicesApi.ts`)

### Endpoints

#### Get All Services
```typescript
const { data: services } = useGetAllServicesQuery({
  category: "hair-styling",
  provider: "provider-uuid",
  search: "haircut"
});
```
- **Endpoint:** `GET /api/v1/services/`
- **Public:** View all active services
- **Filters:** category, provider, search

#### Get Service by ID
```typescript
const { data: service } = useGetServiceByIdQuery(serviceId);
```
- **Endpoint:** `GET /api/v1/services/{service_id}/`
- **Public:** View specific service details

#### Get My Services (Provider)
```typescript
const { data: myServices } = useGetMyServicesQuery();
```
- **Endpoint:** `GET /api/v1/services/my-services/`
- **Auth:** Provider only

#### Get Provider Services
```typescript
const { data: providerServices } = useGetProviderServicesQuery(providerId);
```
- **Endpoint:** `GET /api/v1/services/provider/{provider_id}/`
- **Public:** View all services by a specific provider

#### Create Service (Provider)
```typescript
const [createService] = useCreateServiceMutation();
await createService({
  category: "category-uuid",
  name: "Women's Haircut",
  description: "Professional haircut and styling",
  duration_minutes: 60,
  price: 15000,
  currency: "XAF"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/services/create/`
- **Auth:** Provider only

#### Update Service (Provider)
```typescript
const [updateService] = useUpdateServiceMutation();
await updateService({
  serviceId: "service-uuid",
  data: {
    price: 18000,
    is_active: true
  }
}).unwrap();
```
- **Endpoint:** `PUT /api/v1/services/{service_id}/update/`
- **Auth:** Provider (must own service)

#### Delete Service (Provider)
```typescript
const [deleteService] = useDeleteServiceMutation();
await deleteService(serviceId).unwrap();
```
- **Endpoint:** `DELETE /api/v1/services/{service_id}/delete/`
- **Auth:** Provider (must own service)

#### Get My Service Stats (Provider)
```typescript
const { data: stats } = useGetMyServiceStatsQuery();
// Returns: { total_services, active_services, total_bookings, total_revenue, average_rating }
```
- **Endpoint:** `GET /api/v1/services/my-stats/`
- **Auth:** Provider only

#### Get All Categories
```typescript
const { data: categories } = useGetAllCategoriesQuery();
```
- **Endpoint:** `GET /api/v1/services/categories/`
- **Public:** View all service categories

#### Get Category by ID
```typescript
const { data: category } = useGetCategoryByIdQuery(categoryId);
```
- **Endpoint:** `GET /api/v1/services/categories/{category_id}/`
- **Public**

#### Get Category Services
```typescript
const { data: categoryServices } = useGetCategoryServicesQuery(categoryId);
```
- **Endpoint:** `GET /api/v1/services/categories/{category_id}/services/`
- **Public:** All services in a category

---

## 4. Appointments API (`store/services/appointmentApi.ts`)

### Endpoints

#### Get Available Time Slots
```typescript
const { data: slots } = useGetAvailableSlotsQuery({
  serviceId: "service-uuid",
  startDate: "2024-01-15",
  endDate: "2024-01-20"
});
// Returns: [{ start_time, end_time, date, duration_minutes }]
```
- **Endpoint:** `GET /api/v1/appointments/services/{service_id}/slots/`
- **Public**

#### Create Appointment
```typescript
const [createAppointment] = useCreateAppointmentMutation();
await createAppointment({
  service_id: "service-uuid",
  scheduled_for: "2024-01-15T09:00:00",
  scheduled_until: "2024-01-15T09:30:00",
  amount: 15000.00,
  currency: "XAF"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/`
- **Auth:** Client only
- **Status:** "pending" (waiting for payment)

#### Confirm Payment
```typescript
const [confirmPayment] = useConfirmPaymentMutation();
await confirmPayment(appointmentId).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/{appointment_id}/confirm-payment/`
- **Auth:** Client (owner)
- **Changes status** to "confirmed" and payment_status to "held_in_escrow"

#### Get My Appointments
```typescript
const { data: appointments } = useGetMyAppointmentsQuery({ status: "confirmed" });
```
- **Endpoint:** `GET /api/v1/appointments/my/`
- **Auth:** Required
- **Filter:** status (optional)

#### Get Appointment Detail
```typescript
const { data: appointment } = useGetAppointmentDetailQuery(appointmentId);
```
- **Endpoint:** `GET /api/v1/appointments/{appointment_id}/`
- **Auth:** Client, Provider, or Admin (related to appointment)

#### Cancel Appointment
```typescript
const [cancelAppointment] = useCancelAppointmentMutation();
await cancelAppointment({
  appointmentId: "appointment-uuid",
  reason: "Client emergency"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/{appointment_id}/cancel/`
- **Auth:** Client, Provider, or Admin

#### Reschedule Appointment
```typescript
const [reschedule] = useRescheduleAppointmentMutation();
await reschedule({
  appointmentId: "appointment-uuid",
  scheduled_for: "2024-01-16T10:00:00",
  scheduled_until: "2024-01-16T10:30:00"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/{appointment_id}/reschedule/`
- **Auth:** Client (owner)

---

## 5. Provider Availability API

### Endpoints

#### Get Provider Availability
```typescript
const { data: availability } = useGetProviderAvailabilityQuery();
// Returns: [{ id, provider, day_of_week, start_time, end_time, is_available }]
```
- **Endpoint:** `GET /api/v1/appointments/availability/`
- **Auth:** Provider only

#### Set Provider Availability
```typescript
const [setAvailability] = useSetProviderAvailabilityMutation();
await setAvailability({
  day_of_week: 1, // Monday
  start_time: "09:00:00",
  end_time: "17:00:00"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/availability/`
- **Auth:** Provider only

#### Get Availability Exceptions
```typescript
const { data: exceptions } = useGetAvailabilityExceptionsQuery();
```
- **Endpoint:** `GET /api/v1/appointments/availability/exceptions/`
- **Auth:** Provider only

#### Create Availability Exception
```typescript
const [createException] = useCreateAvailabilityExceptionMutation();

// Unavailable (holiday)
await createException({
  exception_date: "2024-12-25",
  exception_type: "unavailable",
  reason: "Christmas Holiday"
}).unwrap();

// Modified hours
await createException({
  exception_date: "2024-12-24",
  exception_type: "modified_hours",
  start_time: "10:00:00",
  end_time: "14:00:00",
  reason: "Short Day"
}).unwrap();
```
- **Endpoint:** `POST /api/v1/appointments/availability/exceptions/`
- **Auth:** Provider only

#### Get Monthly Calendar
```typescript
const { data: calendar } = useGetMonthlyCalendarQuery({
  providerId: "provider-uuid",
  year: 2024,
  month: 1
});
// Returns: [{ date, status, availability_level }]
```
- **Endpoint:** `GET /api/v1/appointments/providers/{provider_id}/calendar/{year}/{month}/`
- **Public**

#### Get Daily Details
```typescript
const { data: dailySchedule } = useGetDailyDetailsQuery({
  providerId: "provider-uuid",
  year: 2024,
  month: 1,
  day: 15
});
```
- **Endpoint:** `GET /api/v1/appointments/providers/{provider_id}/calendar/{year}/{month}/{day}/`
- **Public**

---

## Redux Store Structure

```typescript
{
  auth: {
    accessToken: string | null,
    refreshToken: string | null,
    user: User | null,
    isAuthenticated: boolean
  },
  api: {
    queries: { ... },
    mutations: { ... }
  }
}
```

### User Type
```typescript
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
  role: 'client' | 'provider' | 'admin';
  admin: boolean;
}
```

---

## Authentication Flow

1. **Login** → Stores tokens → Auto-fetches user data
2. **All protected requests** → Auto-adds `Authorization: Bearer {token}` header
3. **Token refresh** → Update access token without re-login
4. **Logout** → Clears tokens from Redux + AsyncStorage

---

## Error Handling

All API hooks return:
```typescript
{
  data: T | undefined,
  error: FetchBaseQueryError | SerializationError | undefined,
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean
}
```

Example:
```typescript
const { data, error, isLoading } = useGetCurrentUserQuery();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (data) return <UserProfile user={data} />;
```

---

## Cache Management

RTK Query automatically:
- **Caches** responses
- **Invalidates** cache on mutations
- **Refetches** when cache is invalidated
- **Deduplicates** identical requests

### Tag System
```typescript
tagTypes: ['User', 'Profile', 'Appointment', 'Availability', 'Service']
```

When a mutation **invalidates** a tag, all queries with that tag are **refetched**.

---

## Next Steps

### Update Screens to Use Real API:

1. **Home Screen** (`app/home.tsx`)
   - Replace `mockAgents` with `useGetAllServicesQuery()`
   - Replace `categories` with `useGetAllCategoriesQuery()`

2. **Service Detail** (`app/service-detail.tsx`)
   - Use `useGetServiceByIdQuery(serviceId)`
   - Use `useGetAvailableSlotsQuery()` for booking

3. **Provider Screens**
   - Use `useGetMyServicesQuery()` for provider dashboard
   - Use `useGetMyServiceStatsQuery()` for stats

4. **Booking Flow**
   - Use `useCreateAppointmentMutation()` → `useConfirmPaymentMutation()`

---

## Testing

Test credentials from your backend:
```
Email: superuser@gmail.com
Password: 123456789
```

The API is now correctly configured and ready to use! 🎉
