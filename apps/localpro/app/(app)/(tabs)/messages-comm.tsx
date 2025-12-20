import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Chat {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
  type?: 'user' | 'group' | 'support';
}

export default function MessagesCommTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'user' | 'group' | 'support'>('all');
  const colors = useThemeColors();

  // Mock chats data - replace with actual API call
  const chats: Chat[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'chatbubbles-outline' as const },
    { key: 'user' as const, label: 'Users', icon: 'person-outline' as const },
    { key: 'group' as const, label: 'Groups', icon: 'people-outline' as const },
    { key: 'support' as const, label: 'Support', icon: 'headset-outline' as const },
  ];

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.participantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || chat.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (date: Date | string | undefined): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleChatPress = (chatId: string) => {
    // TODO: Navigate to chat detail screen
    // router.push(`/(app)/chat/${chatId}`);
    console.log('Open chat:', chatId);
  };

  const handleNewMessage = () => {
    // TODO: Navigate to new message screen
    // router.push('/(app)/new-message');
    console.log('New message');
  };

  const getChatIcon = (type?: Chat['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'group':
        return 'people';
      case 'support':
        return 'headset';
      default:
        return 'person';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Messages</Text>
              <Text style={styles.subtitle}>Chat with service providers and clients</Text>
            </View>
            <TouchableOpacity
              style={[styles.newMessageButton, { backgroundColor: colors.primary[600] }]}
              onPress={handleNewMessage}
            >
              <Ionicons name="add" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons 
                name="search" 
                size={20} 
                color={colors.text.secondary} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search conversations..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Chats List */}
          {filteredChats.length > 0 ? (
            <View style={styles.chatsList}>
              {filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatItem}
                  onPress={() => handleChatPress(chat.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    {chat.participantAvatar ? (
                      <Image 
                        source={{ uri: chat.participantAvatar }} 
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons 
                          name={getChatIcon(chat.type)} 
                          size={24} 
                          color={colors.primary[600]} 
                        />
                      </View>
                    )}
                    {chat.isOnline && (
                      <View style={[styles.onlineIndicator, { backgroundColor: colors.semantic.success }]} />
                    )}
                    {chat.type === 'group' && (
                      <View style={[styles.typeBadge, { backgroundColor: colors.secondary[600] }]}>
                        <Ionicons name="people" size={10} color={colors.text.inverse} />
                      </View>
                    )}
                    {chat.type === 'support' && (
                      <View style={[styles.typeBadge, { backgroundColor: colors.primary[600] }]}>
                        <Ionicons name="headset" size={10} color={colors.text.inverse} />
                      </View>
                    )}
                  </View>

                  <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName} numberOfLines={1}>
                        {chat.participantName}
                      </Text>
                      {chat.lastMessageTime && (
                        <Text style={styles.chatTime}>
                          {formatTime(chat.lastMessageTime)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.chatMessageRow}>
                      <Text 
                        style={[
                          styles.chatMessage,
                          chat.unreadCount > 0 && styles.chatMessageUnread
                        ]}
                        numberOfLines={1}
                      >
                        {chat.lastMessage || 'No messages yet'}
                      </Text>
                      {chat.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary[600] }]}>
                          <Text style={styles.unreadCount}>
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'chatbubbles-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Conversations Found' : 'No Messages Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Start a conversation to get started'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.newMessageButtonLarge, { backgroundColor: colors.primary[600] }]}
                    onPress={handleNewMessage}
                  >
                    <Ionicons name="add" size={20} color={colors.text.inverse} />
                    <Text style={styles.newMessageButtonText}>New Message</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
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
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  chatsList: {
    gap: Spacing.sm,
  },
  chatItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.secondary,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  typeBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chatMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  chatMessageUnread: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.inverse,
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
    marginBottom: Spacing.lg,
  },
  newMessageButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  newMessageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

