import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface VerifiedUser {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  verifiedTypes: ('identity' | 'business' | 'professional' | 'background')[];
  rating?: number;
  reviews: number;
  location?: string;
  profession?: string;
  trustScore: number;
}

export default function VerifiedTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const colors = useThemeColors();

  // Mock verified users - replace with actual API call
  const verifiedUsers: VerifiedUser[] = [];

  const verificationTypes = [
    { key: 'all', label: 'All Verified', icon: 'checkmark-circle-outline' as const },
    { key: 'identity', label: 'Identity', icon: 'person-outline' as const },
    { key: 'business', label: 'Business', icon: 'business-outline' as const },
    { key: 'professional', label: 'Professional', icon: 'school-outline' as const },
    { key: 'background', label: 'Background', icon: 'shield-checkmark-outline' as const },
  ];

  const filteredUsers = verifiedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || user.verifiedTypes.includes(selectedType as any);
    return matchesSearch && matchesType;
  });

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile screen
    // router.push(`/(app)/user/${userId}`);
    console.log('View user:', userId);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return colors.semantic.success;
    if (score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verified</Text>
            <Text style={styles.subtitle}>Browse verified accounts</Text>
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
                placeholder="Search verified users..."
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
            {verificationTypes.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Verified Users List */}
          {filteredUsers.length > 0 ? (
            <View style={styles.usersList}>
              {filteredUsers.map((user) => (
                <Card key={user.id} style={styles.userCard}>
                  <TouchableOpacity
                    onPress={() => handleUserPress(user.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userHeader}>
                      <View style={styles.avatarContainer}>
                        {user.avatar ? (
                          <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary[100] }]}>
                            <Ionicons name="person" size={32} color={colors.primary[600]} />
                          </View>
                        )}
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                        </View>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {user.name}
                        </Text>
                        {user.username && (
                          <Text style={styles.userUsername}>@{user.username}</Text>
                        )}
                        {user.profession && (
                          <View style={styles.userMeta}>
                            <Ionicons name="briefcase-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.userMetaText}>{user.profession}</Text>
                          </View>
                        )}
                        {user.location && (
                          <View style={styles.userMeta}>
                            <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                            <Text style={styles.userMetaText}>{user.location}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.verificationBadges}>
                      {user.verifiedTypes.map((type) => {
                        const typeLabels: Record<string, string> = {
                          identity: 'ID',
                          business: 'Business',
                          professional: 'License',
                          background: 'Background',
                        };
                        return (
                          <View key={type} style={[styles.verificationBadge, { backgroundColor: `${colors.primary[600]}15` }]}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.primary[600]} />
                            <Text style={[styles.verificationBadgeText, { color: colors.primary[600] }]}>
                              {typeLabels[type]}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.userStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        <Text style={styles.statText}>
                          {user.rating?.toFixed(1) || 'N/A'}
                        </Text>
                        <Text style={styles.statLabel}>({user.reviews})</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="shield-checkmark" size={14} color={getTrustScoreColor(user.trustScore)} />
                        <Text style={[styles.statText, { color: getTrustScoreColor(user.trustScore) }]}>
                          {user.trustScore}
                        </Text>
                        <Text style={styles.statLabel}>Trust</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'checkmark-circle-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Users Found' : 'No Verified Users'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Verified accounts will appear here'}
                </Text>
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
  usersList: {
    gap: Spacing.md,
  },
  userCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background.secondary,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  userUsername: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  userMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  verificationBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  verificationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
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

