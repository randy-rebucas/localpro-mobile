import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { Notification } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
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
  const colors = useThemeColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  const loadUnreadCount = async () => {
    try {
      const response = await CommunicationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await CommunicationService.getNotifications({
        page: pageNum,
        limit,
      });
      
      console.log('Notifications response:', response);
      
      if (append) {
        setNotifications(prev => [...prev, ...(response.data || [])]);
      } else {
        setNotifications(response.data || []);
      }

      setPage(pageNum);
      setHasMore(response.pagination?.hasNext || false);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      // Set empty array on error to show empty state
      if (!append) {
        setNotifications([]);
      }
      // Don't show alert for every error, just log it
      if (error.message && !error.message.includes('Network')) {
        Alert.alert('Error', error.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user?.id, limit]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadUnreadCount();
    } else {
      // If user is not available, stop loading
      setLoading(false);
    }
  }, [user?.id, loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(1, false);
    loadUnreadCount();
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadNotifications(page + 1, true);
    }
  }, [page, hasMore, loadingMore, loadNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await CommunicationService.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error: any) {
        console.error('Failed to mark notification as read:', error);
        Alert.alert('Error', error.message || 'Failed to mark notification as read');
      }
    }

    // Handle navigation based on notification type and data
    if (notification.data?.route) {
      router.push(notification.data.route as any);
    }
  };

  const markAllAsRead = async () => {
    try {
      await CommunicationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', error.message || 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CommunicationService.deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
              if (notifications.find(n => n.id === notificationId && !n.read)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            } catch (error: any) {
              console.error('Failed to delete notification:', error);
              Alert.alert('Error', error.message || 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
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
            } catch (error: any) {
              console.error('Failed to delete all notifications:', error);
              Alert.alert('Error', error.message || 'Failed to delete all notifications');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary[600] }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                  <Text style={[styles.headerButtonText, { color: colors.primary[600] }]}>
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDeleteAll} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      ) : notifications.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyState}>
            <Ionicons 
              name="notifications-off-outline" 
              size={64} 
              color={colors.text.tertiary} 
            />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
          </View>
        </Card>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.content}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationWrapper}>
                <TouchableOpacity
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                  style={styles.notificationTouchable}
                >
                  <Card style={StyleSheet.flatten([
                    styles.notificationCard,
                    !notification.read && styles.unreadCard,
                    !notification.read && { 
                      backgroundColor: colors.primary[50],
                      borderLeftColor: colors.primary[600] 
                    }
                  ])}>
                    <View style={styles.notificationContent}>
                      <View style={[
                        styles.iconContainer,
                        !notification.read && [styles.unreadIconContainer, { 
                          backgroundColor: `${getNotificationIconColor(notification.type, colors)}15` 
                        }]
                      ]}>
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={24}
                          color={notification.read 
                            ? colors.text.secondary 
                            : getNotificationIconColor(notification.type, colors)}
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
                          {!notification.read && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.primary[600] }]} />
                          )}
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
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(notification.id)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.semantic.error} />
                </TouchableOpacity>
              </View>
            ))}
            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  badge: {
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  emptyCard: {
    margin: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  notificationCard: {
    marginBottom: Spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 3,
  },
  notificationContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  unreadIconContainer: {
    // Background color set dynamically
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
    color: Colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  notificationWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  notificationTouchable: {
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    padding: Spacing.xs,
    zIndex: 1,
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

