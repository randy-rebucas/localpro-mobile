import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type ContractStatus = 'all' | 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';

interface Contract {
  id: string;
  title: string;
  facilityName: string;
  providerName: string;
  serviceType: string;
  startDate: Date;
  endDate: Date;
  value: number;
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';
  renewalDate?: Date;
  terms?: string;
}

export default function ContractsTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContractStatus>('all');

  // Mock contracts data - replace with actual API call
  const contracts: Contract[] = [];

  const filters: { key: ContractStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'draft', label: 'Draft', icon: 'document-text-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'active', label: 'Active', icon: 'checkmark-circle-outline' },
    { key: 'expired', label: 'Expired', icon: 'calendar-outline' },
    { key: 'terminated', label: 'Terminated', icon: 'close-circle-outline' },
    { key: 'renewed', label: 'Renewed', icon: 'refresh-outline' },
  ];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || contract.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleContractPress = (contractId: string) => {
    // TODO: Navigate to contract detail screen
    // router.push(`/(app)/contract/${contractId}`);
    console.log('View contract:', contractId);
  };

  const handleRenewContract = (contractId: string) => {
    Alert.alert(
      'Renew Contract',
      'Are you sure you want to renew this contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: () => {
            // TODO: Implement renew contract functionality
            Alert.alert('Success', 'Contract renewal initiated');
            console.log('Renew contract:', contractId);
          },
        },
      ]
    );
  };

  const handleTerminateContract = (contractId: string) => {
    Alert.alert(
      'Terminate Contract',
      'Are you sure you want to terminate this contract? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement terminate contract functionality
            Alert.alert('Success', 'Contract terminated');
            console.log('Terminate contract:', contractId);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return colors.neutral.gray500;
      case 'pending':
        return colors.semantic.warning;
      case 'active':
        return colors.semantic.success;
      case 'expired':
        return colors.semantic.error;
      case 'terminated':
        return colors.semantic.error;
      case 'renewed':
        return colors.primary[600];
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Contract['status']): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'draft':
        return 'document-text-outline';
      case 'pending':
        return 'time-outline';
      case 'active':
        return 'checkmark-circle-outline';
      case 'expired':
        return 'calendar-outline';
      case 'terminated':
        return 'close-circle-outline';
      case 'renewed':
        return 'refresh-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isExpiringSoon = (endDate: Date) => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Contracts</Text>
            <Text style={styles.subtitle}>Manage your facility care contracts</Text>
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
                placeholder="Search contracts..."
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

          {/* Contracts List */}
          {filteredContracts.length > 0 ? (
            <View style={styles.contractsList}>
              {filteredContracts.map((contract) => {
                const statusColor = getStatusColor(contract.status);
                const expiringSoon = contract.status === 'active' && isExpiringSoon(contract.endDate);
                return (
                  <Card key={contract.id} style={styles.contractCard}>
                    <TouchableOpacity
                      onPress={() => handleContractPress(contract.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.contractHeader}>
                        <View style={styles.contractTitleSection}>
                          <Text style={styles.contractTitle} numberOfLines={2}>
                            {contract.title}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Ionicons 
                              name={getStatusIcon(contract.status)} 
                              size={12} 
                              color={statusColor} 
                            />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.contractDetails}>
                        <View style={styles.contractDetailRow}>
                          <Ionicons name="business-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.contractDetailText}>{contract.facilityName}</Text>
                        </View>
                        <View style={styles.contractDetailRow}>
                          <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.contractDetailText}>{contract.providerName}</Text>
                        </View>
                        <View style={styles.contractDetailRow}>
                          <Ionicons name="construct-outline" size={16} color={colors.text.secondary} />
                          <Text style={styles.contractDetailText}>{contract.serviceType}</Text>
                        </View>
                      </View>

                      <View style={styles.contractDates}>
                        <View style={styles.dateItem}>
                          <Text style={styles.dateLabel}>Start Date</Text>
                          <Text style={styles.dateValue}>{formatDate(contract.startDate)}</Text>
                        </View>
                        <View style={styles.dateItem}>
                          <Text style={styles.dateLabel}>End Date</Text>
                          <Text style={[styles.dateValue, expiringSoon && { color: colors.semantic.warning }]}>
                            {formatDate(contract.endDate)}
                            {expiringSoon && ' ⚠️'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.contractValue}>
                        <Ionicons name="cash-outline" size={18} color={colors.primary[600]} />
                        <Text style={styles.contractValueText}>
                          Contract Value: {formatCurrency(contract.value)}
                        </Text>
                      </View>

                      {contract.renewalDate && (
                        <View style={styles.renewalInfo}>
                          <Ionicons name="refresh-outline" size={14} color={colors.primary[600]} />
                          <Text style={styles.renewalText}>
                            Renewal Date: {formatDate(contract.renewalDate)}
                          </Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        {contract.status === 'active' && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.renewButton, { borderColor: colors.primary[600] }]}
                              onPress={() => handleRenewContract(contract.id)}
                            >
                              <Ionicons name="refresh-outline" size={16} color={colors.primary[600]} />
                              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                                Renew
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.terminateButton, { borderColor: colors.semantic.error }]}
                              onPress={() => handleTerminateContract(contract.id)}
                            >
                              <Ionicons name="close-outline" size={16} color={colors.semantic.error} />
                              <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>
                                Terminate
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {contract.status === 'pending' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.viewButton, { borderColor: colors.secondary[600] }]}
                            onPress={() => handleContractPress(contract.id)}
                          >
                            <Ionicons name="eye-outline" size={16} color={colors.secondary[600]} />
                            <Text style={[styles.actionButtonText, { color: colors.secondary[600] }]}>
                              Review
                            </Text>
                          </TouchableOpacity>
                        )}
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
                  name={searchQuery ? 'search-outline' : 'document-text-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Contracts Found' : 'No Contracts Yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Your facility care contracts will appear here'}
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
  contractsList: {
    gap: Spacing.md,
  },
  contractCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  contractHeader: {
    marginBottom: Spacing.md,
  },
  contractTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  contractTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contractDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  contractDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contractDetailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  contractDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  contractValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  contractValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  renewalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  renewalText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  renewButton: {
    backgroundColor: Colors.background.primary,
  },
  terminateButton: {
    backgroundColor: Colors.background.primary,
  },
  viewButton: {
    backgroundColor: Colors.background.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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

