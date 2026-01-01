import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Bell, CreditCard, Settings, Trash2 } from 'lucide-react-native';
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation } from '@/store/services/notificationsApi';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications, isLoading, error } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  
  console.log('Notifications loaded:', { count: notifications?.length, isLoading, error });
  
  const handleNotificationPress = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        console.log('Marking notification as read:', notificationId);
        await markAsRead(notificationId).unwrap();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };
  
  const handleDeleteNotification = (notificationId: string, message: string) => {
    Alert.alert(
      t('deleteNotification'),
      t('deleteNotificationConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting notification:', notificationId);
              await deleteNotification(notificationId).unwrap();
            } catch (err) {
              console.error('Failed to delete notification:', err);
              Alert.alert(t('error'), t('failedToDeleteNotification'));
            }
          },
        },
      ]
    );
  };
  
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
        <Text style={styles.headerTitle}>{t('notifications')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
            <Text style={styles.loadingText}>{t('loadingNotifications')}</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Bell color="#F44336" size={64} />
            <Text style={styles.emptyTitle}>{t('errorLoadingNotifications')}</Text>
            <Text style={styles.emptyMessage}>
              {t('failedToLoadNotifications')}
            </Text>
          </View>
        ) : !notifications || notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
            <Text style={styles.emptyMessage}>
              {t('seeNotificationsHere')}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.notification_type);
              const iconColor = getNotificationColor(notification.notification_type);
              
              return (
                <View
                  key={notification.id} 
                  style={[
                    styles.notificationCard,
                    !notification.is_read && styles.unreadCard
                  ]}
                >
                  <TouchableOpacity
                    style={styles.notificationTouchable}
                    onPress={() => handleNotificationPress(notification.id, notification.is_read)}
                  >
                  <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
                    <IconComponent color="white" size={24} />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    {notification.title && (
                      <Text style={[
                        styles.notificationTitle,
                        !notification.is_read && styles.unreadTitle
                      ]}>
                        {notification.title}
                      </Text>
                    )}
                    <Text style={[
                      styles.notificationMessage,
                      !notification.is_read && styles.unreadMessage
                    ]}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {!notification.is_read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.id, notification.message)}
                  >
                    <Trash2 color="#F44336" size={20} />
                  </TouchableOpacity>
                </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  notificationTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#2D1A46',
    fontWeight: 'bold',
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});