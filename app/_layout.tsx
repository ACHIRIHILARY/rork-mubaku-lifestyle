import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { store } from "@/store/store";

import { initializeAuth, checkTokenExpiration } from "@/store/authSlice";
import { initializeLanguage } from "@/store/languageSlice";
import { authApi } from "@/store/services/authApi";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />

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
      <Stack.Screen name="booking/payment-status" options={{ headerShown: false }} />
      <Stack.Screen name="booking/transaction-details" options={{ headerShown: false }} />
      <Stack.Screen name="booking/reschedule" options={{ headerShown: false }} />
      <Stack.Screen name="my-bookings" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
      <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services/create" options={{ headerShown: false }} />
      <Stack.Screen name="provider-services/edit" options={{ headerShown: false }} />
      <Stack.Screen name="provider-availability" options={{ headerShown: false }} />
      <Stack.Screen name="category-detail" options={{ headerShown: false }} />
      <Stack.Screen name="application-status" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize both auth and language
        const [authResult] = await Promise.all([
          store.dispatch(initializeAuth()).unwrap(),
          store.dispatch(initializeLanguage()).unwrap(),
        ]);

        if (authResult) {
          console.log('Auth tokens loaded from storage, fetching user data...');
          store.dispatch(authApi.endpoints.getCurrentUser.initiate());
        } else {
          console.log('No stored auth tokens found');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  // Periodic token expiration check (every hour)
  useEffect(() => {
    const checkExpiration = () => {
      const state = store.getState();
      if (state.auth.isAuthenticated && state.auth.tokenCreatedAt) {
        store.dispatch(checkTokenExpiration());
      }
    };

    // Check immediately when component mounts
    checkExpiration();

    // Set up interval to check every hour (3600000 ms)
    const intervalId = setInterval(checkExpiration, 3600000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <I18nextProvider i18n={i18n}>
              <RootLayoutNav />
            </I18nextProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
