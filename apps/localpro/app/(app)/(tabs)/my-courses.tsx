import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons: any[];
}

interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  progress: number;
  completed: boolean;
  enrolledAt: Date;
  completedAt?: Date;
}

export default function MyCoursesTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  // Mock enrollments data - replace with actual API call
  const enrollments: Enrollment[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'in-progress' as const, label: 'In Progress', icon: 'play-circle-outline' as const },
    { key: 'completed' as const, label: 'Completed', icon: 'checkmark-done-outline' as const },
  ];

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         enrollment.course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'in-progress' && !enrollment.completed) ||
                         (activeFilter === 'completed' && enrollment.completed);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCoursePress = (courseId: string) => {
    // TODO: Navigate to course detail/learning screen
    // router.push(`/(app)/course/${courseId}/learn`);
    console.log('View course:', courseId);
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to continue course
    // router.push(`/(app)/course/${courseId}/learn`);
    console.log('Continue course:', courseId);
  };

  const handleViewCertificate = (courseId: string) => {
    // TODO: Navigate to certificate view
    // router.push(`/(app)/course/${courseId}/certificate`);
    console.log('View certificate:', courseId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Courses</Text>
            <Text style={styles.subtitle}>Continue your learning journey</Text>
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
                placeholder="Search courses..."
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

          {/* Enrollments List */}
          {filteredEnrollments.length > 0 ? (
            <View style={styles.enrollmentsList}>
              {filteredEnrollments.map((enrollment) => {
                const { course } = enrollment;
                return (
                  <Card key={enrollment.id} style={styles.enrollmentCard}>
                    <TouchableOpacity
                      onPress={() => handleCoursePress(course.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.enrollmentHeader}>
                        <View style={styles.courseImageContainer}>
                          {course.thumbnail ? (
                            <Image 
                              source={{ uri: course.thumbnail }} 
                              style={styles.courseImage}
                            />
                          ) : (
                            <View style={[styles.courseImagePlaceholder, { backgroundColor: colors.primary[100] }]}>
                              <Ionicons name="library-outline" size={32} color={colors.primary[600]} />
                            </View>
                          )}
                          {enrollment.completed && (
                            <View style={styles.completedBadge}>
                              <Ionicons name="checkmark-circle" size={20} color={colors.semantic.success} />
                            </View>
                          )}
                        </View>
                        <View style={styles.enrollmentInfo}>
                          <Text style={styles.courseTitle} numberOfLines={2}>
                            {course.title}
                          </Text>
                          <Text style={styles.courseInstructor}>
                            by {course.instructor}
                          </Text>
                          <View style={styles.courseMeta}>
                            <View style={styles.courseMetaItem}>
                              <Ionicons name="list-outline" size={12} color={colors.text.secondary} />
                              <Text style={styles.courseMetaText}>
                                {course.lessons.length} lessons
                              </Text>
                            </View>
                            <View style={styles.courseMetaItem}>
                              <Ionicons name="grid-outline" size={12} color={colors.text.secondary} />
                              <Text style={styles.courseMetaText}>
                                {course.category}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>
                            {enrollment.completed ? 'Completed' : 'Progress'}
                          </Text>
                          <Text style={styles.progressPercentage}>
                            {Math.round(enrollment.progress)}%
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressBar,
                              { 
                                width: `${enrollment.progress}%`,
                                backgroundColor: enrollment.completed 
                                  ? colors.semantic.success 
                                  : colors.primary[600],
                              },
                            ]} 
                          />
                        </View>
                      </View>

                      {/* Enrollment Footer */}
                      <View style={styles.enrollmentFooter}>
                        <Text style={styles.enrollmentDate}>
                          Enrolled {formatDate(enrollment.enrolledAt)}
                        </Text>
                        {enrollment.completed && enrollment.completedAt && (
                          <Text style={styles.completionDate}>
                            Completed {formatDate(enrollment.completedAt)}
                          </Text>
                        )}
                      </View>

                      {/* Action Button */}
                      <View style={styles.actionButtonContainer}>
                        {enrollment.completed ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.certificateButton, { borderColor: colors.primary[600] }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleViewCertificate(course.id);
                            }}
                          >
                            <Ionicons name="ribbon-outline" size={18} color={colors.primary[600]} />
                            <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                              View Certificate
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary[600] }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleContinueCourse(course.id);
                            }}
                          >
                            <Ionicons name="play" size={18} color={colors.text.inverse} />
                            <Text style={styles.actionButtonText}>
                              Continue Learning
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
                  name={searchQuery ? 'search-outline' : 'book-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Courses Found' : 'No Enrolled Courses'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Browse courses and enroll to start learning'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={() => router.push('/(app)/(tabs)/courses')}
                  >
                    <Ionicons name="library-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Browse Courses</Text>
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
    marginBottom: Spacing.lg,
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
  enrollmentsList: {
    gap: Spacing.md,
  },
  enrollmentCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: 100,
    height: 70,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray200,
  },
  courseImagePlaceholder: {
    width: 100,
    height: 70,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
  },
  enrollmentInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  courseInstructor: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressSection: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  enrollmentFooter: {
    marginBottom: Spacing.md,
    gap: 4,
  },
  enrollmentDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  completionDate: {
    fontSize: 12,
    color: Colors.semantic.success,
    fontWeight: '500',
  },
  actionButtonContainer: {
    marginTop: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  certificateButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
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

