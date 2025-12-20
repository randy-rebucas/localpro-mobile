import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isOnline?: boolean;
}

export default function TeamTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'owner' | 'admin' | 'member'>('all');

  // Mock team members data - replace with actual API call
  const teamMembers: TeamMember[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'people-outline' as const },
    { key: 'owner' as const, label: 'Owners', icon: 'shield-outline' as const },
    { key: 'admin' as const, label: 'Admins', icon: 'star-outline' as const },
    { key: 'member' as const, label: 'Members', icon: 'person-outline' as const },
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone?.includes(searchQuery);
    const matchesFilter = activeFilter === 'all' || member.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getRoleBadgeColor = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return colors.primary[600];
      case 'admin':
        return colors.secondary[600];
      case 'member':
        return colors.neutral.gray500;
      default:
        return colors.neutral.gray500;
    }
  };

  const getRoleLabel = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  };

  const getRoleIcon = (role: 'owner' | 'admin' | 'member'): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case 'owner':
        return 'shield';
      case 'admin':
        return 'star';
      case 'member':
        return 'person';
      default:
        return 'person';
    }
  };

  const handleAddMember = () => {
    // TODO: Navigate to add member screen
    // router.push('/(app)/add-team-member');
    console.log('Add team member');
  };

  const handleMemberPress = (memberId: string) => {
    // TODO: Navigate to member detail screen
    // router.push(`/(app)/team-member/${memberId}`);
    console.log('View member:', memberId);
  };

  const formatJoinDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Team</Text>
            <Text style={styles.subtitle}>Manage your team members</Text>
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
                placeholder="Search team members..."
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
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
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

          {/* Add Member Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
            onPress={handleAddMember}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.addButtonText}>Add Team Member</Text>
          </TouchableOpacity>

          {/* Team Members List */}
          {filteredMembers.length > 0 ? (
            <View style={styles.membersList}>
              {filteredMembers.map((member) => {
                const roleColor = getRoleBadgeColor(member.role);
                return (
                  <Card key={member.id} style={styles.memberCard}>
                    <TouchableOpacity
                      onPress={() => handleMemberPress(member.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.memberHeader}>
                        <View style={styles.avatarContainer}>
                          {member.avatar ? (
                            <Image source={{ uri: member.avatar }} style={styles.avatar} />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <Text style={styles.avatarText}>
                                {member.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          {member.isOnline && (
                            <View style={[styles.onlineIndicator, { backgroundColor: colors.semantic.success }]} />
                          )}
                        </View>
                        <View style={styles.memberInfo}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName} numberOfLines={1}>
                              {member.name}
                            </Text>
                            <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
                              <Ionicons 
                                name={getRoleIcon(member.role)} 
                                size={12} 
                                color={roleColor} 
                              />
                              <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                                {getRoleLabel(member.role)}
                              </Text>
                            </View>
                          </View>
                          {member.email && (
                            <View style={styles.memberContact}>
                              <Ionicons name="mail-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.memberContactText}>{member.email}</Text>
                            </View>
                          )}
                          {member.phone && (
                            <View style={styles.memberContact}>
                              <Ionicons name="call-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.memberContactText}>{member.phone}</Text>
                            </View>
                          )}
                          <Text style={styles.memberJoinDate}>
                            Joined {formatJoinDate(member.joinedAt)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'people-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Members Found' : 'No Team Members Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add team members to get started'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleAddMember}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Add Team Member</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  membersList: {
    gap: Spacing.md,
  },
  memberCard: {
    marginBottom: Spacing.md,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral.gray200,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary[600],
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
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  memberContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.xs,
  },
  memberContactText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  memberJoinDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
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
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

