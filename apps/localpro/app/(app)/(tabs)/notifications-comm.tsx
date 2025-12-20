import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { Notification } from '@localpro/types';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

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

const getNotificationIconColor = (type: string, colors: any) => {
  switch (type) {
    case 'booking':
      return colors.primary[600];
    case 'message':
      return colors.secondary[600];
    case 'job':
      return colors.primary[600];
    case 'payment':
      return colors.secondary[600];
    case 'system':
      return colors.text.secondary;
    case 'marketing':
      return colors.primary[600];
    default:
      return colors.text.secondary;
  }
};

const formatDate = (date: Date | string): string => {
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

export default function NotificationsCommTabScreen() {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const response = await CommunicationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await CommunicationService.getNotifications({
        page: 1,
        limit: 50,
      });
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
      if (error.message && !error.message.includes('Network')) {
        Alert.alert('Error', error.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadUnreadCount();
    } else {
      setLoading(false);
    }
  }, [user?.id, loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await CommunicationService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await CommunicationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await CommunicationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await CommunicationService.deleteAllNotifications();
              setNotifications([]);
              setUnreadCount(0);
            } catch (error) {
              console.error('Failed to delete all:', error);
              Alert.alert('Error', 'Failed to delete all notifications');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </Text>
            </View>
            {notifications.length > 0 && (
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleMarkAllAsRead}
                  >
                    <Ionicons name="checkmark-done" size={16} color={colors.text.inverse} />
                    <Text style={styles.actionButtonText}>Mark All Read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.semantic.error }]}
                  onPress={handleDeleteAll}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.text.inverse} />
                  <Text style={styles.actionButtonText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {notifications.map((notification) => {
                const iconColor = getNotificationIconColor(notification.type, colors);
                const isUnread = !notification.read;
                return (
                  <View key={notification.id} style={[styles.notificationCard, isUnread && { backgroundColor: `${colors.primary[600]}08`, borderLeftWidth: 3, borderLeftColor: colors.primary[600] }]}>
                    <TouchableOpacity
                      onPress={() => handleMarkAsRead(notification.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notificationContent}>
                        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                          <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={24}
                            color={iconColor}
                          />
                        </View>
                        <View style={styles.notificationInfo}>
                          <View style={styles.notificationHeader}>
                            <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]}>
                              {notification.title}
                            </Text>
                            {isUnread && (
                              <View style={[styles.unreadDot, { backgroundColor: colors.primary[600] }]} />
                            )}
                          </View>
                          <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.body}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {formatDate(notification.createdAt)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(notification.id)}
                        >
                          <Ionicons name="close" size={18} color={colors.text.tertiary} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View> 
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No Notifications</Text>
                <Text style={styles.emptyStateText}>
                  You&apos;re all caught up! New notifications will appear here
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  notificationsList: {
    gap: Spacing.md,
  },
  notificationCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

