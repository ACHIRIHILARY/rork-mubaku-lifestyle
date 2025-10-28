import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Bell, CreditCard, Settings } from 'lucide-react-native';
import { mockNotifications } from '../mockData';

export default function NotificationsScreen() {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Bell;
      case 'payment':
        return CreditCard;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#F4A896';
      case 'payment':
        return '#4CAF50';
      case 'system':
        return '#2D1A46';
      default:
        return '#F4A896';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.content}>
        {mockNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You'll see your notifications here when you have them
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {mockNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
                    <IconComponent color="white" size={24} />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationMessage,
                      !notification.read && styles.unreadMessage
                    ]}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {new Date(notification.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F4A896',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F4A896',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  unreadMessage: {
    color: '#2D1A46',
    fontWeight: '500',
  },
  notificationDate: {
    fontSize: 14,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4A896',
    marginLeft: 8,
  },
});