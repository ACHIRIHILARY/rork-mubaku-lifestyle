import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Calendar, Users, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface TabItem {
  name: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  route: string;
  label: string;
}

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    { name: 'home', icon: Home, route: '/(tabs)/home', label: t('home') },
    { name: 'providers', icon: Users, route: '/(tabs)/providers', label: t('providers') },
    { name: 'my-bookings', icon: Calendar, route: '/(tabs)/my-bookings', label: t('bookings') },
    { name: 'profile', icon: User, route: '/(tabs)/profile', label: t('profile') },
  ];

  const isActiveTab = (route: string) => {
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const tabBarPaddingBottom = Platform.select({
    ios: Math.max(insets.bottom, 8),
    android: Math.max(insets.bottom, 8),
    default: 8,
  });

  return (
    <View style={[styles.container, { paddingBottom: tabBarPaddingBottom }]}>
      {tabs.map((tab) => {
        const isActive = isActiveTab(tab.route);
        const IconComponent = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <IconComponent
              color={isActive ? '#2D1A46' : '#999'}
              size={24}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#999',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#2D1A46',
  },
});
