import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Home, Calendar, Bell, User, Users, BarChart3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StickyHeader from '../components/StickyHeader';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const isProvider = user?.role === 'provider';

  const tabBarHeight = Platform.select({
    ios: 50 + insets.bottom,
    android: Math.max(60, 60 + insets.bottom),
    default: 60,
  });

  const tabBarPaddingBottom = Platform.select({
    ios: Math.max(insets.bottom, 0),
    android: Math.max(insets.bottom, 8),
    default: 8,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <StickyHeader />,
        tabBarActiveTintColor: '#2D1A46',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      {isProvider ? (
        <Tabs.Screen
          name="dashboard"
          options={{
            title: t('dashboard'),
            tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="home"
          options={{
            title: t('home'),
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
      )}
      <Tabs.Screen
        name="providers"
        options={{
          title: t('providers'),
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: t('bookings'),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
