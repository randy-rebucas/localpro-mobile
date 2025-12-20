import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type ApplicationStatus = 'all' | 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

export default function ApplicationsTabScreen() {
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus>('all');
  const colors = useThemeColors();

  // Mock applications data - replace with actual API call
  const applications: any[] = [];

  const filters: { key: ApplicationStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'reviewed', label: 'Reviewed', icon: 'eye-outline' },
    { key: 'interview', label: 'Interview', icon: 'calendar-outline' },
    { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
    { key: 'rejected', label: 'Rejected', icon: 'close-circle-outline' },
  ];

  const filteredApplications = activeFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'reviewed':
        return colors.primary[600];
      case 'interview':
        return colors.secondary[600];
      case 'accepted':
        return colors.secondary[600];
      case 'rejected':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'reviewed':
        return 'eye-outline';
      case 'interview':
        return 'calendar-outline';
      case 'accepted':
        return 'checkmark-circle-outline';
      case 'rejected':
        return 'close-circle-outline';
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

  const getJobTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'full-time':
        return 'briefcase-outline';
      case 'part-time':
        return 'time-outline';
      case 'contract':
        return 'document-text-outline';
      case 'freelance':
        return 'laptop-outline';
      default:
        return 'briefcase-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Applications</Text>
            <Text style={styles.subtitle}>Track your job applications</Text>
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

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <View style={styles.applicationsList}>
              {filteredApplications.map((application) => (
                <Card key={application.id} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <View style={styles.applicationHeaderLeft}>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(application.status)}15` }]}>
                        <Ionicons
                          name={getStatusIcon(application.status)}
                          size={16}
                          color={getStatusColor(application.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.applicationDate}>
                      {formatDate(application.appliedAt || application.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.applicationContent}>
                    <Text style={styles.jobTitle}>
                      {application.job?.title || 'Job Title'}
                    </Text>
                    <View style={styles.jobInfo}>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="business-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.jobInfoText}>
                          {application.job?.company || 'Company Name'}
                        </Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.jobInfoText}>
                          {application.job?.location || 'Location'}
                        </Text>
                      </View>
                      {application.job?.type && (
                        <View style={styles.jobInfoItem}>
                          <Ionicons 
                            name={getJobTypeIcon(application.job.type)} 
                            size={16} 
                            color={colors.text.secondary} 
                          />
                          <Text style={styles.jobInfoText}>
                            {application.job.type.charAt(0).toUpperCase() + application.job.type.slice(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {application.job?.salary && (
                      <Text style={styles.salary}>
                        {application.job.salary.currency} {application.job.salary.min.toLocaleString()} - {application.job.salary.max.toLocaleString()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.applicationActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    {application.status === 'pending' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.withdrawButton]}
                      >
                        <Text style={[styles.actionButtonText, styles.withdrawButtonText]}>Withdraw</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeFilter === 'all' ? 'document-text-outline' : getStatusIcon(activeFilter)} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeFilter === 'all' ? 'No Applications Yet' : `No ${filters.find(f => f.key === activeFilter)?.label} Applications`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'all' 
                    ? 'Your job applications will appear here when you apply for positions'
                    : `You don't have any ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} applications at the moment`}
                </Text>
                <TouchableOpacity 
                  style={[styles.browseJobsButton, { backgroundColor: colors.primary[600] }]}
                >
                  <Ionicons name="search-outline" size={20} color={colors.text.inverse} />
                  <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
                </TouchableOpacity>
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
  filtersContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  filtersContent: {
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  filterTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  applicationsList: {
    gap: Spacing.md,
  },
  applicationCard: {
    marginBottom: Spacing.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  applicationHeaderLeft: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  applicationContent: {
    marginBottom: Spacing.md,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  jobInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  jobInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary[600],
    marginTop: Spacing.xs,
  },
  applicationActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  withdrawButton: {
    backgroundColor: Colors.neutral.gray100,
    borderColor: Colors.border.light,
  },
  withdrawButtonText: {
    color: Colors.semantic.error,
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
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  browseJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  browseJobsButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});