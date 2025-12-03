# Redux State Management Documentation

This app uses **Redux Toolkit** with **RTK Query** for state management and API integration with your Django backend hosted on Google Cloud.

## Architecture

### Store Structure
```
store/
├── store.ts              # Redux store configuration
├── api.ts                # Base RTK Query API configuration
├── authSlice.ts          # Authentication state slice
├── hooks.ts              # Typed Redux hooks
└── services/
    ├── authApi.ts        # Authentication API endpoints
    ├── profileApi.ts     # User profile API endpoints
    └── appointmentApi.ts # Appointments & availability API endpoints
```

## Configuration

### Backend URL
Set your backend URL in the environment variable:
```bash
EXPO_PUBLIC_API_URL=https://mubakulifestyle.com
```

If not set, it defaults to `https://mubakulifestyle.com` (configured in `store/api.ts`).

### Token Management
- **Access tokens** are automatically added to API requests via `prepareHeaders` in `api.ts`
- **Refresh tokens** are stored in AsyncStorage
- Tokens persist across app sessions

## API Endpoints

### Authentication (`authApi.ts`)

#### Login
```typescript
const [login, { isLoading, error }] = useLoginMutation();

await login({ email: 'user@example.com', password: 'password' }).unwrap();
// Automatically stores tokens and fetches user data
```

#### Register
```typescript
const [register] = useRegisterMutation();

await register({
  username: 'john_doe',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'securepassword'
}).unwrap();
```

#### Get Current User
```typescript
const { data: user, isLoading, error } = useGetCurrentUserQuery();
// Automatically called after login
// Returns user object with profile data
```

### User Profiles (`profileApi.ts`)

#### Get Profile
```typescript
const { data: profile } = useGetProfileQuery(userId);
```

#### Update Profile
```typescript
const [updateProfile] = useUpdateProfileMutation();

await updateProfile({
  pkid: userId,
  data: {
    phone_number: '+237699000111',
    about_me: 'Software engineer',
    city: 'Yaoundé'
  }
}).unwrap();
```

### Appointments (`appointmentApi.ts`)

#### Get Available Slots
```typescript
const { data: slots } = useGetAvailableSlotsQuery({
  serviceId: 'service-uuid',
  startDate: '2024-01-15',
  endDate: '2024-01-20'
});
```

#### Create Appointment
```typescript
const [createAppointment] = useCreateAppointmentMutation();

const appointment = await createAppointment({
  service_id: 'service-uuid',
  scheduled_for: '2024-01-15T09:00:00',
  scheduled_until: '2024-01-15T09:30:00',
  amount: 15000.00,
  currency: 'XAF'
}).unwrap();
```

#### Confirm Payment
```typescript
const [confirmPayment] = useConfirmPaymentMutation();

await confirmPayment(appointmentId).unwrap();
// Updates appointment status to 'confirmed'
```

#### Get My Appointments
```typescript
const { data: appointments } = useGetMyAppointmentsQuery({ status: 'confirmed' });
```

## Authentication State

Access authentication state using the Redux hooks:

```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';

function MyComponent() {
  const { user, isAuthenticated, accessToken } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    // Clears tokens from state and AsyncStorage
  };

  return (
    <View>
      <Text>{user?.full_name}</Text>
      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
}
```

## Screens Updated with Redux

### ✅ Login Screen (`app/login.tsx`)
- Uses `useLoginMutation` for authentication
- Stores JWT tokens automatically
- Navigates to home on success
- Shows loading state and error handling

### ✅ Register Screen (`app/register.tsx`)
- Uses `useRegisterMutation` for account creation
- Validates all required fields
- Redirects to login after successful registration
- Comprehensive error handling

### ✅ Home Screen (`app/home.tsx`)
- Fetches current user data with `useGetCurrentUserQuery`
- Displays personalized greeting
- Shows loading state while fetching user
- Profile button for settings

### ✅ Profile Settings Screen (`app/profile-settings.tsx`)
- Displays user profile information from Redux state
- Logout functionality with confirmation
- Integrated with Redux auth state

### ✅ Booking Payment Screen (`app/booking/payment.tsx`)
- Creates appointments using `useCreateAppointmentMutation`
- Confirms payment with `useConfirmPaymentMutation`
- Handles payment flow with proper error handling
- Loading states during API calls

## Error Handling

All mutations return errors in a consistent format:

```typescript
try {
  await mutation(data).unwrap();
} catch (error) {
  // error.data contains backend error response
  // error.status contains HTTP status code
  console.error('Error:', error);
  Alert.alert('Error', error?.data?.detail || 'Something went wrong');
}
```

## Next Steps

1. **Backend URL Configured**: Already set to `https://mubakulifestyle.com`
2. **Test Authentication**: Try logging in with real credentials from your backend
3. **Add Services Endpoints**: Your backend needs endpoints for listing services/agents (not in current API docs)
4. **Image Uploads**: Implement profile photo uploads using multipart/form-data
5. **Token Refresh**: Implement automatic token refresh on 401 errors
6. **Offline Support**: Consider adding RTK Query persistence for offline functionality

## Backend Requirements

Your backend should have these endpoints working:
- ✅ POST `/api/v1/auth/jwt/create/` - Login
- ✅ POST `/api/v1/auth/jwt/refresh/` - Refresh token
- ✅ POST `/api/v1/auth/users/` - Register
- ✅ GET `/api/v1/auth/users/me/` - Get current user
- ✅ GET `/api/v1/profiles/{pkid}/` - Get profile
- ✅ PATCH `/api/v1/profiles/{pkid}/` - Update profile
- ✅ POST `/api/appointments/appointments/` - Create appointment
- ✅ POST `/api/appointments/appointments/{id}/confirm-payment/` - Confirm payment
- ⚠️ Missing: List services/agents endpoint for home screen

## Testing the Integration

1. Start your app: `npm start`
2. Try registering a new account
3. Login with the registered credentials
4. Check if user data appears on home screen
5. Try updating profile in settings
6. Test booking flow (will need service data from backend)

## Troubleshooting

### CORS Issues
Ensure your Django backend has CORS properly configured for your Expo development URL.

### Token Expiration
Tokens are stored in AsyncStorage but will expire based on your backend JWT settings. Implement token refresh logic for production.

### Network Errors
Check that your device/emulator can reach the backend URL. Use ngrok or ensure both are on the same network during development.
