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
  description: string;
  instructor: string;
  category: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  lessons: any[];
  enrolledCount: number;
  rating?: number;
}

export default function CoursesTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeLevel, setActiveLevel] = useState<string>('all');

  // Mock courses data - replace with actual API call
  const courses: Course[] = [];

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-outline' as const },
    { key: 'business', label: 'Business', icon: 'briefcase-outline' as const },
    { key: 'technology', label: 'Technology', icon: 'laptop-outline' as const },
    { key: 'design', label: 'Design', icon: 'color-palette-outline' as const },
    { key: 'marketing', label: 'Marketing', icon: 'megaphone-outline' as const },
    { key: 'finance', label: 'Finance', icon: 'cash-outline' as const },
  ];

  const levels = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesLevel = activeLevel === 'all' || course.level === activeLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return colors.semantic.success;
      case 'intermediate':
        return colors.semantic.warning;
      case 'advanced':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const getLevelLabel = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Unknown';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleCoursePress = (courseId: string) => {
    // TODO: Navigate to course detail screen
    // router.push(`/(app)/course/${courseId}`);
    console.log('View course:', courseId);
  };

  const handleEnroll = (courseId: string) => {
    // TODO: Implement enrollment functionality
    console.log('Enroll in course:', courseId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Courses</Text>
            <Text style={styles.subtitle}>Browse and enroll in courses</Text>
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

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveCategory(category.key)}
                >
                  <Ionicons
                    name={category.icon}
                    size={16}
                    color={isActive ? colors.text.inverse : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.categoryTabText,
                      isActive && styles.categoryTabTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Level Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelsContainer}
            contentContainerStyle={styles.levelsContent}
          >
            {levels.map((level) => {
              const isActive = activeLevel === level.key;
              return (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.levelTab,
                    isActive && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => setActiveLevel(level.key)}
                >
                  <Text
                    style={[
                      styles.levelTabText,
                      isActive && styles.levelTabTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Courses List */}
          {filteredCourses.length > 0 ? (
            <View style={styles.coursesList}>
              {filteredCourses.map((course) => {
                const levelColor = getLevelColor(course.level);
                return (
                  <Card key={course.id} style={styles.courseCard}>
                    <TouchableOpacity
                      onPress={() => handleCoursePress(course.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.courseHeader}>
                        <View style={styles.courseImageContainer}>
                          {course.thumbnail ? (
                            <Image 
                              source={{ uri: course.thumbnail }} 
                              style={styles.courseImage}
                            />
                          ) : (
                            <View style={[styles.courseImagePlaceholder, { backgroundColor: colors.primary[100] }]}>
                              <Ionicons name="library-outline" size={40} color={colors.primary[600]} />
                            </View>
                          )}
                          <View style={[styles.levelBadge, { backgroundColor: `${levelColor}15` }]}>
                            <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                              {getLevelLabel(course.level)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.courseInfo}>
                          <Text style={styles.courseTitle} numberOfLines={2}>
                            {course.title}
                          </Text>
                          <Text style={styles.courseInstructor}>
                            by {course.instructor}
                          </Text>
                          <Text style={styles.courseDescription} numberOfLines={2}>
                            {course.description}
                          </Text>
                          <View style={styles.courseMeta}>
                            <View style={styles.courseMetaItem}>
                              <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.courseMetaText}>
                                {formatDuration(course.duration)}
                              </Text>
                            </View>
                            <View style={styles.courseMetaItem}>
                              <Ionicons name="list-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.courseMetaText}>
                                {course.lessons.length} lessons
                              </Text>
                            </View>
                            <View style={styles.courseMetaItem}>
                              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                              <Text style={styles.courseMetaText}>
                                {course.enrolledCount} enrolled
                              </Text>
                            </View>
                          </View>
                          {course.rating && (
                            <View style={styles.ratingContainer}>
                              <Ionicons name="star" size={14} color={colors.semantic.warning} />
                              <Text style={styles.ratingText}>
                                {course.rating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.courseFooter}>
                        <View style={styles.coursePriceContainer}>
                          <Text style={styles.coursePrice}>
                            {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.enrollButton, { backgroundColor: colors.primary[600] }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEnroll(course.id);
                          }}
                        >
                          <Text style={styles.enrollButtonText}>
                            {course.price > 0 ? 'Enroll' : 'Start Free'}
                          </Text>
                        </TouchableOpacity>
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
                  name={searchQuery ? 'search-outline' : 'library-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Courses Found' : 'No Courses Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Check back later for new courses'}
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
  categoriesContainer: {
    marginBottom: Spacing.sm,
  },
  categoriesContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  categoryTab: {
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
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  categoryTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  levelsContainer: {
    marginBottom: Spacing.lg,
  },
  levelsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  levelTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: Spacing.sm,
  },
  levelTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  levelTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  coursesList: {
    gap: Spacing.md,
  },
  courseCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: 120,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray200,
  },
  courseImagePlaceholder: {
    width: 120,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  courseInfo: {
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
  courseDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  coursePriceContainer: {
    flex: 1,
  },
  coursePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  enrollButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  enrollButtonText: {
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
  },
});

