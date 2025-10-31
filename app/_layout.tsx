import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { trpc, trpcClient } from "@/lib/trpc";
import { initializeAuth } from "@/store/authSlice";
import { authApi } from "@/store/services/authApi";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="client-profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="agent-profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="service-detail" options={{ headerShown: false }} />
      <Stack.Screen name="booking/select-datetime" options={{ headerShown: false }} />
      <Stack.Screen name="booking/choose-location" options={{ headerShown: false }} />
      <Stack.Screen name="booking/summary" options={{ headerShown: false }} />
      <Stack.Screen name="booking/payment" options={{ headerShown: false }} />
      <Stack.Screen name="booking/status" options={{ headerShown: false }} />
      <Stack.Screen name="booking/reschedule" options={{ headerShown: false }} />
      <Stack.Screen name="my-bookings" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services/create" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services/edit" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await store.dispatch(initializeAuth()).unwrap();
        
        if (result) {
          console.log('Auth tokens loaded from storage, fetching user data...');
          store.dispatch(authApi.endpoints.getCurrentUser.initiate());
        } else {
          console.log('No stored auth tokens found');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initAuth();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <LanguageProvider>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </QueryClientProvider>
          </trpc.Provider>
        </LanguageProvider>
      </SafeAreaProvider>
    </Provider>
  );
}