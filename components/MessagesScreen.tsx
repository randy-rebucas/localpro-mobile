import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUserConversations } from '../lib/firestore';

const { width, height } = Dimensions.get('window');

// Fallback mock data in case Firebase fails
const fallbackMessages = [
  {
    id: '1',
    provider: 'Sarah Johnson',
    service: 'House Cleaning',
    lastMessage: 'I\'ll be there at 2 PM as scheduled. Should I bring any specific cleaning supplies?',
    time: '2 min ago',
    unread: true,
    avatar: 'SJ',
    online: true,
    messageCount: 3
  },
  {
    id: '2',
    provider: 'Mike Chen',
    service: 'Plumbing',
    lastMessage: 'The repair is complete. How does everything look? Let me know if you need any adjustments.',
    time: '1 hour ago',
    unread: false,
    avatar: 'MC',
    online: false,
    messageCount: 0
  },
];

const MessageCard = ({ message }: { message: any }) => (
  <TouchableOpacity style={[styles.messageCard, message.unread && styles.unreadCard]} activeOpacity={0.8}>
    <View style={styles.messageHeader}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{message.avatar}</Text>
        </LinearGradient>
        {message.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.messageInfo}>
        <View style={styles.messageInfoHeader}>
          <Text style={[styles.providerName, message.unread && styles.unreadText]}>
            {message.provider}
          </Text>
          <Text style={styles.time}>{message.time}</Text>
        </View>
        <Text style={styles.serviceName}>{message.service}</Text>
      </View>
      {message.unread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{message.messageCount}</Text>
        </View>
      )}
    </View>
    <View style={styles.messageContent}>
      <Text style={[styles.lastMessage, message.unread && styles.unreadText]} numberOfLines={2}>
        {message.lastMessage}
      </Text>
      {message.unread && (
        <View style={styles.unreadDot} />
      )}
    </View>
  </TouchableOpacity>
);

export const MessagesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock user ID - in a real app, this would come from authentication
  const mockUserId = 'user123';

  // Fetch messages from Firebase
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await getUserConversations(mockUserId);
        setMessages(messagesData);
        setFilteredMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
        Alert.alert('Error', 'Failed to load messages. Using sample data.');
        setMessages(fallbackMessages);
        setFilteredMessages(fallbackMessages);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages based on search query and selected filter
  useEffect(() => {
    let filtered = messages;
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(message =>
        message.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(message => message.unread);
        break;
      case 'online':
        filtered = filtered.filter(message => message.online);
        break;
      case 'recent':
        // Keep all messages as they're already sorted by recent
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    setFilteredMessages(filtered);
  }, [searchQuery, selectedFilter, messages]);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>Stay connected with your service providers</Text>
          </View>
          <TouchableOpacity style={styles.newMessageButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#667eea" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{messages.length}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{messages.filter(m => m.unread).length}</Text>
        <Text style={styles.statLabel}>Unread</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{messages.filter(m => m.online).length}</Text>
        <Text style={styles.statLabel}>Online</Text>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
            All Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'unread' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('unread')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'unread' && styles.filterTabTextActive]}>
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'online' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('online')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'online' && styles.filterTabTextActive]}>
            Online
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'recent' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('recent')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'recent' && styles.filterTabTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {renderHeader()}
        {renderStats()}
        {renderFilterTabs()}
        <View style={styles.messagesContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : filteredMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No messages found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Start a conversation with a provider!'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMessages}
              renderItem={({ item }) => <MessageCard message={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesList}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  filterTabs: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  filterTabActive: {
    backgroundColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messagesList: {
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageInfo: {
    flex: 1,
  },
  messageInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadText: {
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    position: 'relative',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingRight: 20,
  },
  unreadBadge: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
