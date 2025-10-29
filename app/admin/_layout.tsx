import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="applications" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="users" />
    </Stack>
  );
}
