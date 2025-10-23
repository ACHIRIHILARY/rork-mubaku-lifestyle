# API Quick Reference - Common Usage Patterns

## 🚀 Quick Copy-Paste Examples

### Authentication

#### Login
```typescript
import { useLoginMutation } from '@/store/services/authApi';

const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async () => {
  try {
    await login({ email, password }).unwrap();
    router.replace('/home');
  } catch (err) {
    Alert.alert('Error', 'Login failed');
  }
};
```

#### Register
```typescript
import { useRegisterMutation } from '@/store/services/authApi';

const [register, { isLoading }] = useRegisterMutation();

const handleRegister = async () => {
  try {
    await register({
      username: "john_doe",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      password: "password123"
    }).unwrap();
    Alert.alert('Success', 'Account created!');
    router.push('/login');
  } catch (err) {
    Alert.alert('Error', 'Registration failed');
  }
};
```

#### Get Current User
```typescript
import { useGetCurrentUserQuery } from '@/store/services/authApi';

const { data: user, isLoading, error } = useGetCurrentUserQuery();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;

return <Text>Welcome, {user?.first_name}!</Text>;
```

#### Logout
```typescript
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';

const dispatch = useAppDispatch();

const handleLogout = () => {
  dispatch(logout());
  router.replace('/login');
};
```

---

### Services

#### Get All Services
```typescript
import { useGetAllServicesQuery } from '@/store/services/servicesApi';

const { data: services, isLoading } = useGetAllServicesQuery({});

// With filters
const { data: filteredServices } = useGetAllServicesQuery({
  category: "hair-styling",
  search: "haircut"
});
```

#### Get Service by ID
```typescript
import { useGetServiceByIdQuery } from '@/store/services/servicesApi';
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
const { data: service, isLoading } = useGetServiceByIdQuery(id);
```

#### Create Service (Provider)
```typescript
import { useCreateServiceMutation } from '@/store/services/servicesApi';

const [createService, { isLoading }] = useCreateServiceMutation();

const handleCreate = async () => {
  try {
    await createService({
      category: "category-uuid",
      name: "Women's Haircut",
      description: "Professional haircut",
      duration_minutes: 60,
      price: 15000,
      currency: "XAF"
    }).unwrap();
    Alert.alert('Success', 'Service created!');
  } catch (err) {
    Alert.alert('Error', 'Failed to create service');
  }
};
```

#### Get My Services (Provider)
```typescript
import { useGetMyServicesQuery } from '@/store/services/servicesApi';

const { data: myServices, isLoading } = useGetMyServicesQuery();

return (
  <FlatList
    data={myServices}
    renderItem={({ item }) => <ServiceCard service={item} />}
  />
);
```

---

### Categories

#### Get All Categories
```typescript
import { useGetAllCategoriesQuery } from '@/store/services/servicesApi';

const { data: categories } = useGetAllCategoriesQuery();

return (
  <ScrollView horizontal>
    {categories?.map((category) => (
      <CategoryCard key={category.id} category={category} />
    ))}
  </ScrollView>
);
```

#### Get Services in Category
```typescript
import { useGetCategoryServicesQuery } from '@/store/services/servicesApi';

const { data: services } = useGetCategoryServicesQuery(categoryId);
```

---

### Appointments

#### Get Available Slots
```typescript
import { useGetAvailableSlotsQuery } from '@/store/services/appointmentApi';

const { data: slots } = useGetAvailableSlotsQuery({
  serviceId: "service-uuid",
  startDate: "2024-01-15",
  endDate: "2024-01-20"
});

return (
  <View>
    {slots?.map((slot) => (
      <TouchableOpacity key={slot.start_time}>
        <Text>{slot.start_time} - {slot.end_time}</Text>
      </TouchableOpacity>
    ))}
  </View>
);
```

#### Create Appointment
```typescript
import { useCreateAppointmentMutation } from '@/store/services/appointmentApi';

const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

const handleBook = async () => {
  try {
    const appointment = await createAppointment({
      service_id: "service-uuid",
      scheduled_for: "2024-01-15T09:00:00",
      scheduled_until: "2024-01-15T10:00:00",
      amount: 15000,
      currency: "XAF"
    }).unwrap();
    
    // Appointment status is "pending"
    router.push(`/booking/payment?id=${appointment.id}`);
  } catch (err) {
    Alert.alert('Error', 'Failed to create appointment');
  }
};
```

#### Confirm Payment
```typescript
import { useConfirmPaymentMutation } from '@/store/services/appointmentApi';

const [confirmPayment, { isLoading }] = useConfirmPaymentMutation();

const handleConfirmPayment = async (appointmentId: string) => {
  try {
    await confirmPayment(appointmentId).unwrap();
    // Status changes to "confirmed"
    Alert.alert('Success', 'Payment confirmed!');
    router.push('/booking/status');
  } catch (err) {
    Alert.alert('Error', 'Payment confirmation failed');
  }
};
```

#### Get My Appointments
```typescript
import { useGetMyAppointmentsQuery } from '@/store/services/appointmentApi';

// All appointments
const { data: allAppointments } = useGetMyAppointmentsQuery({});

// Filtered by status
const { data: confirmedAppointments } = useGetMyAppointmentsQuery({ 
  status: "confirmed" 
});

return (
  <FlatList
    data={allAppointments}
    renderItem={({ item }) => (
      <View>
        <Text>{item.service?.name}</Text>
        <Text>{item.scheduled_for}</Text>
        <Text>Status: {item.status}</Text>
      </View>
    )}
  />
);
```

#### Cancel Appointment
```typescript
import { useCancelAppointmentMutation } from '@/store/services/appointmentApi';

const [cancelAppointment, { isLoading }] = useCancelAppointmentMutation();

const handleCancel = async (appointmentId: string) => {
  try {
    await cancelAppointment({
      appointmentId,
      reason: "Client emergency"
    }).unwrap();
    Alert.alert('Success', 'Appointment cancelled');
  } catch (err) {
    Alert.alert('Error', 'Failed to cancel appointment');
  }
};
```

---

### Profile

#### Get My Profile
```typescript
import { useGetUnifiedProfileQuery } from '@/store/services/profileApi';

const { data: profile, isLoading } = useGetUnifiedProfileQuery();

return (
  <View>
    <Image source={{ uri: profile?.profile_photo }} />
    <Text>{profile?.full_name}</Text>
    <Text>{profile?.email}</Text>
    <Text>{profile?.phone_number}</Text>
  </View>
);
```

#### Update Profile
```typescript
import { useUpdateUnifiedProfileMutation } from '@/store/services/profileApi';

const [updateProfile, { isLoading }] = useUpdateUnifiedProfileMutation();

const handleUpdate = async () => {
  try {
    await updateProfile({
      phone_number: "+237699000111",
      city: "Yaoundé",
      about_me: "Software engineer"
    }).unwrap();
    Alert.alert('Success', 'Profile updated!');
  } catch (err) {
    Alert.alert('Error', 'Failed to update profile');
  }
};
```

#### Apply to Become Provider
```typescript
import { useApplyForProviderMutation } from '@/store/services/profileApi';

const [applyProvider, { isLoading }] = useApplyForProviderMutation();

const handleApply = async () => {
  try {
    await applyProvider({
      specialty: "Hair Styling",
      experience: "5 years",
      certifications: "Licensed Cosmetologist",
      reason: "Passionate about beauty services"
    }).unwrap();
    Alert.alert('Success', 'Application submitted!');
  } catch (err) {
    Alert.alert('Error', 'Application failed');
  }
};
```

#### Check Application Status
```typescript
import { useGetApplicationStatusQuery } from '@/store/services/profileApi';

const { data: status } = useGetApplicationStatusQuery();

return (
  <View>
    <Text>Status: {status?.status}</Text>
    {status?.status === 'pending' && (
      <Text>Your application is under review</Text>
    )}
  </View>
);
```

---

### Provider Availability

#### Set Availability
```typescript
import { useSetProviderAvailabilityMutation } from '@/store/services/appointmentApi';

const [setAvailability] = useSetProviderAvailabilityMutation();

const handleSetAvailability = async () => {
  try {
    await setAvailability({
      day_of_week: 1, // Monday
      start_time: "09:00:00",
      end_time: "17:00:00"
    }).unwrap();
    Alert.alert('Success', 'Availability set!');
  } catch (err) {
    Alert.alert('Error', 'Failed to set availability');
  }
};
```

#### Get My Availability
```typescript
import { useGetProviderAvailabilityQuery } from '@/store/services/appointmentApi';

const { data: availability } = useGetProviderAvailabilityQuery();

return (
  <View>
    {availability?.map((slot) => (
      <View key={slot.id}>
        <Text>{slot.day_of_week_display}</Text>
        <Text>{slot.start_time} - {slot.end_time}</Text>
      </View>
    ))}
  </View>
);
```

---

## 🎨 UI Patterns

### Loading State
```typescript
const { data, isLoading, error } = useGetServicesQuery();

if (isLoading) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2D1A46" />
    </View>
  );
}
```

### Error State
```typescript
if (error) {
  return (
    <View style={styles.error}>
      <Text>Something went wrong</Text>
      <TouchableOpacity onPress={() => refetch()}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Empty State
```typescript
if (!data || data.length === 0) {
  return (
    <View style={styles.empty}>
      <Text>No items found</Text>
    </View>
  );
}
```

### Pull to Refresh
```typescript
import { RefreshControl } from 'react-native';

const { data, isLoading, refetch } = useGetServicesQuery();

return (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={isLoading}
        onRefresh={refetch}
      />
    }
  >
    {/* Content */}
  </ScrollView>
);
```

---

## 🔐 Auth Protection

### Protect Route (Check if Logged In)
```typescript
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ProtectedScreen() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);
  
  // Rest of your screen
}
```

### Check User Role
```typescript
import { useGetCurrentUserQuery } from '@/store/services/authApi';

const { data: user } = useGetCurrentUserQuery();

if (user?.role === 'provider') {
  // Show provider-specific content
}

if (user?.role === 'client') {
  // Show client-specific content
}
```

---

## 📝 Form Handling

### Login Form
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [login, { isLoading }] = useLoginMutation();

return (
  <View>
    <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder="Email"
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <TextInput
      value={password}
      onChangeText={setPassword}
      placeholder="Password"
      secureTextEntry
    />
    <TouchableOpacity 
      onPress={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text>Login</Text>
      )}
    </TouchableOpacity>
  </View>
);
```

---

## 🔄 Data Synchronization

### Auto-Refetch on Focus
```typescript
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const { refetch } = useGetServicesQuery();

useFocusEffect(
  useCallback(() => {
    refetch();
  }, [refetch])
);
```

### Manual Refetch
```typescript
const { data, refetch } = useGetServicesQuery();

return (
  <TouchableOpacity onPress={() => refetch()}>
    <Text>Refresh</Text>
  </TouchableOpacity>
);
```

---

## 💡 Pro Tips

1. **Always handle loading states** - Users should see feedback while data loads
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Use refetch for manual refresh** - Let users pull-to-refresh
4. **Cache is automatic** - RTK Query caches responses
5. **Optimistic updates** - Update UI before API responds for better UX
6. **Type safety** - All responses are typed, use TypeScript
7. **Invalidate tags** - Mutations automatically refetch related queries

---

## 🚨 Error Handling Pattern

```typescript
const handleAction = async () => {
  try {
    await mutation(data).unwrap();
    Alert.alert('Success', 'Action completed!');
  } catch (err: any) {
    console.error('Error:', err);
    
    if (err.status === 401) {
      Alert.alert('Error', 'Please login again');
      router.replace('/login');
    } else if (err.status === 400) {
      Alert.alert('Error', err.data?.message || 'Invalid data');
    } else if (err.status === 404) {
      Alert.alert('Error', 'Not found');
    } else {
      Alert.alert('Error', 'Something went wrong');
    }
  }
};
```

---

This quick reference covers the most common patterns you'll need! 🎉
