import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { Menu, User, Calendar, Receipt, Briefcase, Play, Settings, X, Users, Bell } from 'lucide-react-native';
import { useAppSelector } from '@/store/hooks';
import { router } from 'expo-router';

export default function StickyHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAppSelector(state => state.auth);

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleCTAPress = () => {
    router.push('/agent-profile-setup' as any);
  };

  const handleMenuItemPress = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const menuItems = [
    {
      title: 'Manage Profile',
      icon: User,
      route: '/profile-settings',
    },
    {
      title: 'My Bookings',
      icon: Calendar,
      route: '/my-bookings',
    },
    {
      title: 'View Service Providers',
      icon: Users,
      route: '/(tabs)/providers',
    },
    {
      title: 'Payments & History',
      icon: Receipt,
      route: '/booking/payment-status', // This might need to be updated to a dedicated payments history screen
    },
  ];

  const businessItems = [
    {
      title: 'Setup My Business',
      icon: Briefcase,
      route: '/agent-profile-setup',
    },
    {
      title: 'How to Get Started',
      icon: Play,
      route: '/application-status', // This might need to be updated to a proper guide screen
    },
    {
      title: 'Manage My Business',
      icon: Settings,
      route: '/provider-services',
    },
  ];

  const isProvider = user?.role === 'provider';

  return (
    <>
      <View style={styles.container}>
        {/* Left: Hamburger Menu */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          accessibilityLabel="Open menu"
        >
          <Menu color="#2D1A46" size={24} />
        </TouchableOpacity>

        {/* Center: Brand Wordmark */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>Mubaku Lifestyle</Text>
        </View>

        {/* Right: Notification and CTA */}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/messages')}
            accessibilityLabel="Notifications"
          >
            <Bell color="#2D1A46" size={20} />
            {/* Add badge for unread notifications if needed */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleCTAPress}
            accessibilityLabel="Set up my business"
          >
            <Briefcase color="white" size={16} />
            <Text style={styles.ctaText}>Set up my business</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              {/* General Menu Items */}
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <IconComponent color="#2D1A46" size={20} />
                      </View>
                      <Text style={styles.menuItemText}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Business Owners Section */}
              <View style={styles.businessSection}>
                <Text style={styles.businessHeading}>For Business Owners</Text>
                {businessItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isProviderOnly = index >= 1; // Last 2 items are provider-only
                  const isVisible = !isProviderOnly || isProvider;

                  if (!isVisible) return null;

                  return (
                    <TouchableOpacity
                      key={`business-${index}`}
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress(item.route)}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={styles.menuIconContainer}>
                          <IconComponent color="#4CAF50" size={20} />
                        </View>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1A46',
    letterSpacing: 0.5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4A896',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  ctaText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2D1A46',
    fontWeight: '500',
  },
  businessSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  businessHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
});
