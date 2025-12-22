import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@localpro/auth';
import { CommunicationService } from '@localpro/communication';
import type { Notification, NotificationType } from '@localpro/types';
import { Card } from '@localpro/ui';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingSkeleton } from '../../../components/marketplace';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type FilterType = 'all' | 'unread' | NotificationType;

const NOTIFICATION_TYPES: { key: NotificationType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'booking', label: 'Bookings', icon: 'calendar-outline' },
  { key: 'message', label: 'Messages', icon: 'chatbubble-outline' },
  { key: 'job', label: 'Jobs', icon: 'briefcase-outline' },
  { key: 'payment', label: 'Payments', icon: 'card-outline' },
  { key: 'system', label: 'System', icon: 'information-circle-outline' },
  { key: 'marketing', label: 'Marketing', icon: 'megaphone-outline' },
];

const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  const typeInfo = NOTIFICATION_TYPES.find((t) => t.key === type);
  return typeInfo?.icon || 'notifications-outline';
};

const getNotificationIconColor = (type: string, colors: ReturnType<typeof useThemeColors>) => {
  switch (type) {
    case 'booking':
      return colors.primary[600];
    case 'message':
      return colors.secondary[600];
    case 'job':
      return colors.primary[600];
    case 'payment':
      return colors.semantic.success[600];
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
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {};
  const now = new Date();
  
  notifications.forEach((notification) => {
    const date = typeof notification.createdAt === 'string' 
      ? new Date(notification.createdAt) 
      : notification.createdAt;
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    let groupKey: string;
    if (days === 0) {
      groupKey = 'Today';
    } else if (days === 1) {
      groupKey = 'Yesterday';
    } else if (days < 7) {
      groupKey = 'This Week';
    } else if (days < 30) {
      groupKey = 'This Month';
    } else {
      groupKey = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  return groups;
};

export default function NotificationsScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const colors = useThemeColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await CommunicationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  const loadNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
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

        const params: { page?: number; limit?: number; read?: boolean; type?: string } = {
          page: pageNum,
          limit,
        };

        if (selectedFilter === 'unread') {
          params.read = false;
        } else if (selectedFilter !== 'all') {
          params.type = selectedFilter;
        }

        const response = await CommunicationService.getNotifications(params);

        if (append) {
          setNotifications((prev) => [...prev, ...(response.data || [])]);
        } else {
          setNotifications(response.data || []);
        }

        setPage(pageNum);
        setHasMore(response.pagination?.hasNext || false);
      } catch (error: any) {
        console.error('Failed to load notifications:', error);
        if (!append) {
          setNotifications([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [user?.id, limit, selectedFilter]
  );

  useEffect(() => {
    if (user?.id) {
      loadNotifications(1, false);
      loadUnreadCount();
    } else {
      setLoading(false);
    }
  }, [user?.id, loadNotifications, loadUnreadCount]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(1, false);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadNotifications(page + 1, true);
    }
  }, [page, hasMore, loadingMore, loadNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.read) {
        try {
          await CommunicationService.markNotificationAsRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error: any) {
          console.error('Failed to mark notification as read:', error);
        }
      }

      // Handle navigation based on notification type and data
      if (notification.data?.route) {
        router.push(notification.data.route as any);
      } else if (notification.data?.bookingId) {
        router.push(`/(stack)/booking/${notification.data.bookingId}` as any);
      } else if (notification.data?.jobId) {
        router.push(`/(stack)/job/${notification.data.jobId}` as any);
      } else if (notification.data?.applicationId) {
        router.push(`/(stack)/application/${notification.data.applicationId}` as any);
      } else if (notification.data?.chatId) {
        router.push(`/(stack)/chat/${notification.data.chatId}` as any);
      } else if (notification.type === 'message') {
        router.push('/(app)/(tabs)/messages' as any);
      } else if (notification.type === 'job') {
        router.push('/(app)/(tabs)/browse-jobs' as any);
      } else if (notification.type === 'booking') {
        router.push('/(app)/(tabs)/bookings' as any);
      }
    },
    [router]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await CommunicationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', error.message || 'Failed to mark all as read');
    }
  }, []);

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
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
                setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
                const deleted = notifications.find((n) => n.id === notificationId && !n.read);
                if (deleted) {
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }
              } catch (error: any) {
                console.error('Failed to delete notification:', error);
                Alert.alert('Error', error.message || 'Failed to delete notification');
              }
            },
          },
        ]
      );
    },
    [notifications]
  );

  const handleDeleteAll = useCallback(() => {
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
  }, []);

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (selectedFilter === 'unread') {
      result = result.filter((n) => !n.read);
    } else if (selectedFilter !== 'all') {
      result = result.filter((n) => n.type === selectedFilter);
    }

    return result;
  }, [notifications, selectedFilter]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const notificationSections = useMemo(() => {
    return Object.keys(groupedNotifications).map((key) => ({
      title: key,
      data: groupedNotifications[key],
    }));
  }, [groupedNotifications]);

  const renderNotificationItem = useCallback(
    ({ item }: { item: Notification }) => {
      const iconColor = getNotificationIconColor(item.type, colors);

      return (
        <TouchableOpacity
          style={styles.notificationItem}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
        >
          <Card
            style={StyleSheet.flatten([
              styles.notificationCard,
              !item.read && styles.unreadCard,
              !item.read && { backgroundColor: colors.primary[50], borderLeftColor: colors.primary[600] },
            ])}
          >
            <View style={styles.notificationContent}>
              <View
                style={[
                  styles.iconContainer,
                  !item.read && [
                    styles.unreadIconContainer,
                    { backgroundColor: `${iconColor}15` },
                  ],
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(item.type)}
                  size={24}
                  color={item.read ? colors.text.secondary : iconColor}
                />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.notificationHeader}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !item.read && styles.unreadTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary[600] }]} />
                  )}
                </View>
                <Text style={styles.notificationBody} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(item.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Ionicons name="close-outline" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [colors, handleNotificationPress, handleDeleteNotification]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Notification[] } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <FlatList
        data={notificationSections}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item: section }) => (
          <View>
            {renderSectionHeader({ section })}
            {section.data.map((notification) => (
              <View key={notification.id}>
                {renderNotificationItem({ item: notification })}
              </View>
            ))}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Header */}
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
                      <TouchableOpacity
                        onPress={markAllAsRead}
                        style={styles.headerButton}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text style={[styles.headerButtonText, { color: colors.primary[600] }]}>
                          Mark all read
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={handleDeleteAll}
                      style={styles.headerButton}
                      activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.semantic.error[600]} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'all' && {
                    backgroundColor: colors.primary[600],
                    borderColor: colors.primary[600],
                  },
                ]}
                onPress={() => setSelectedFilter('all')}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'all' && { color: Colors.text.inverse },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'unread' && {
                    backgroundColor: colors.primary[600],
                    borderColor: colors.primary[600],
                  },
                ]}
                onPress={() => setSelectedFilter('unread')}
                activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'unread' && { color: Colors.text.inverse },
                  ]}
                >
                  Unread
                </Text>
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      selectedFilter === 'unread' && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        selectedFilter === 'unread' && styles.filterBadgeTextActive,
                      ]}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {NOTIFICATION_TYPES.map((type) => {
                const count = notifications.filter((n) => n.type === type.key).length;
                const isSelected = selectedFilter === type.key;
                return (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.filterChip,
                      isSelected && {
                        backgroundColor: colors.primary[600],
                        borderColor: colors.primary[600],
                      },
                    ]}
                    onPress={() => setSelectedFilter(type.key)}
                    activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                  >
                    <Ionicons
                      name={type.icon}
                      size={16}
                      color={isSelected ? Colors.text.inverse : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && { color: Colors.text.inverse },
                      ]}
                    >
                      {type.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          isSelected && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            isSelected && styles.filterBadgeTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSkeleton viewMode="list" count={5} />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="notifications-off-outline"
                title="No notifications"
                subtitle={
                  selectedFilter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You're all caught up! No notifications yet."
                }
              />
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerContent: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
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
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
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
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeActive: {
    backgroundColor: Colors.text.inverse + '30',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  filterBadgeTextActive: {
    color: Colors.text.inverse,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.secondary,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  notificationItem: {
    marginBottom: Spacing.sm,
  },
  notificationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
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
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
  unreadTitle: {
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily?.bold || 'System',
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
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  emptyContainer: {
    paddingTop: Spacing['2xl'],
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

