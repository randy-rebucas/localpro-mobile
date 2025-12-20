import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface ProgressStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  certificatesEarned: number;
}

interface CategoryProgress {
  category: string;
  courses: number;
  completed: number;
  progress: number;
}

export default function ProgressTabScreen() {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<'week' | 'month' | 'all'>('all');

  // Mock progress stats - replace with actual API call
  const stats: ProgressStats = {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    certificatesEarned: 0,
  };

  // Mock category progress - replace with actual API call
  const categoryProgress: CategoryProgress[] = [];

  const periods = [
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
    { key: 'all' as const, label: 'All Time' },
  ];

  const overallProgress = stats.totalCourses > 0 
    ? (stats.completedCourses / stats.totalCourses) * 100 
    : 0;

  const lessonsProgress = stats.totalLessons > 0
    ? (stats.completedLessons / stats.totalLessons) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Learning Progress</Text>
            <Text style={styles.subtitle}>Track your educational journey</Text>
          </View>

          {/* Time Period Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodsContainer}
            contentContainerStyle={styles.periodsContent}
          >
            {periods.map((period) => {
              const isActive = activePeriod === period.key;
              return (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActivePeriod(period.key)}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      isActive && styles.periodTabTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Overall Progress Card */}
          <Card style={styles.overallProgressCard}>
            <View style={styles.overallProgressHeader}>
              <Ionicons name="trophy" size={32} color={colors.primary[600]} />
              <View style={styles.overallProgressInfo}>
                <Text style={styles.overallProgressLabel}>Overall Progress</Text>
                <Text style={styles.overallProgressValue}>
                  {Math.round(overallProgress)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${overallProgress}%`,
                    backgroundColor: colors.primary[600],
                  },
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.completedCourses} of {stats.totalCourses} courses completed
            </Text>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary[600]}15` }]}>
                <Ionicons name="library" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.statValue}>{stats.totalCourses}</Text>
              <Text style={styles.statLabel}>Total Courses</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.semantic.success}15` }]}>
                <Ionicons name="checkmark-done" size={24} color={colors.semantic.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.semantic.success }]}>
                {stats.completedCourses}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.secondary[600]}15` }]}>
                <Ionicons name="play-circle" size={24} color={colors.secondary[600]} />
              </View>
              <Text style={[styles.statValue, { color: colors.secondary[600] }]}>
                {stats.inProgressCourses}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.semantic.warning}15` }]}>
                <Ionicons name="ribbon" size={24} color={colors.semantic.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.semantic.warning }]}>
                {stats.certificatesEarned}
              </Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </Card>
          </View>

          {/* Learning Stats */}
          <Card style={styles.learningStatsCard}>
            <Text style={styles.sectionTitle}>Learning Statistics</Text>
            <View style={styles.learningStatsList}>
              <View style={styles.learningStatRow}>
                <View style={styles.learningStatLeft}>
                  <Ionicons name="list" size={20} color={colors.text.secondary} />
                  <Text style={styles.learningStatLabel}>Lessons Completed</Text>
                </View>
                <View style={styles.learningStatRight}>
                  <Text style={styles.learningStatValue}>
                    {stats.completedLessons} / {stats.totalLessons}
                  </Text>
                  <View style={styles.miniProgressBar}>
                    <View 
                      style={[
                        styles.miniProgressBarFill,
                        { 
                          width: `${lessonsProgress}%`,
                          backgroundColor: colors.primary[600],
                        },
                      ]} 
                    />
                  </View>
                </View>
              </View>
              <View style={styles.learningStatRow}>
                <View style={styles.learningStatLeft}>
                  <Ionicons name="time" size={20} color={colors.text.secondary} />
                  <Text style={styles.learningStatLabel}>Total Learning Time</Text>
                </View>
                <Text style={styles.learningStatValue}>
                  {stats.totalHours}h
                </Text>
              </View>
              <View style={styles.learningStatRow}>
                <View style={styles.learningStatLeft}>
                  <Ionicons name="flame" size={20} color={colors.semantic.warning} />
                  <Text style={styles.learningStatLabel}>Current Streak</Text>
                </View>
                <Text style={[styles.learningStatValue, { color: colors.semantic.warning }]}>
                  {stats.currentStreak} days
                </Text>
              </View>
              <View style={styles.learningStatRow}>
                <View style={styles.learningStatLeft}>
                  <Ionicons name="trophy" size={20} color={colors.semantic.warning} />
                  <Text style={styles.learningStatLabel}>Longest Streak</Text>
                </View>
                <Text style={[styles.learningStatValue, { color: colors.semantic.warning }]}>
                  {stats.longestStreak} days
                </Text>
              </View>
            </View>
          </Card>

          {/* Category Progress */}
          {categoryProgress.length > 0 && (
            <Card style={styles.categoryProgressCard}>
              <Text style={styles.sectionTitle}>Progress by Category</Text>
              <View style={styles.categoryProgressList}>
                {categoryProgress.map((category, index) => (
                  <View key={index} style={styles.categoryProgressItem}>
                    <View style={styles.categoryProgressHeader}>
                      <Text style={styles.categoryProgressName}>{category.category}</Text>
                      <Text style={styles.categoryProgressPercentage}>
                        {Math.round(category.progress)}%
                      </Text>
                    </View>
                    <View style={styles.categoryProgressBar}>
                      <View 
                        style={[
                          styles.categoryProgressBarFill,
                          { 
                            width: `${category.progress}%`,
                            backgroundColor: colors.primary[600],
                          },
                        ]} 
                      />
                    </View>
                    <Text style={styles.categoryProgressText}>
                      {category.completed} of {category.courses} courses
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Chart Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Progress Over Time</Text>
              <Ionicons name="stats-chart-outline" size={20} color={colors.text.secondary} />
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.chartPlaceholderText}>Progress visualization</Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Chart will show your learning progress over time
              </Text>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => router.push('/(app)/(tabs)/my-courses')}
            >
              <Ionicons name="book" size={20} color={colors.text.inverse} />
              <Text style={styles.quickActionText}>My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionButtonSecondary, { borderColor: colors.secondary[600] }]}
              onPress={() => router.push('/(app)/(tabs)/certificates')}
            >
              <Ionicons name="ribbon" size={20} color={colors.secondary[600]} />
              <Text style={[styles.quickActionText, { color: colors.secondary[600] }]}>
                Certificates
              </Text>
            </TouchableOpacity>
          </View>
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
  periodsContainer: {
    marginBottom: Spacing.lg,
  },
  periodsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  periodTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  periodTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  overallProgressCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  overallProgressInfo: {
    flex: 1,
  },
  overallProgressLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  overallProgressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  learningStatsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  learningStatsList: {
    gap: Spacing.md,
  },
  learningStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  learningStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  learningStatLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  learningStatRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  learningStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  miniProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  categoryProgressCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  categoryProgressList: {
    gap: Spacing.md,
  },
  categoryProgressItem: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  categoryProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryProgressName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  categoryProgressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  categoryProgressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  categoryProgressText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  chartCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  quickActionButtonSecondary: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

