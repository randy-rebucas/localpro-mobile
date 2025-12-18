import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { Notification } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'booking':
      return 'calendar-outline';
    case 'message':
      return 'chatbubble-outline';
    case 'job':
      return 'briefcase-outline';
    case 'payment':
      return 'card-outline';
    case 'system':
      return 'information-circle-outline';
    case 'marketing':
      return 'megaphone-outline';
    default:
      return 'notifications-outline';
  }
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function NotificationsScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await CommunicationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await CommunicationService.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Handle navigation based on notification type and data
    if (notification.data?.route) {
      router.push(notification.data.route as any);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    try {
      await Promise.all(
        unreadNotifications.map(n => CommunicationService.markNotificationAsRead(n.id))
      );
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>You're all caught up!</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <Card style={StyleSheet.flatten([
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]) as ViewStyle}>
                  <View style={styles.notificationContent}>
                    <View style={[
                      styles.iconContainer,
                      !notification.read && styles.unreadIconContainer
                    ]}>
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={24}
                        color={notification.read ? '#666' : '#007AFF'}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <View style={styles.notificationHeader}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadTitle
                        ]}>
                          {notification.title}
                        </Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationBody} numberOfLines={2}>
                        {notification.body}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: '#E6F4FE',
  },
  textContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});

