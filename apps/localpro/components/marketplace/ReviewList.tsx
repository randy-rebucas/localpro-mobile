import { Ionicons } from '@expo/vector-icons';
import type { Review } from '@localpro/types';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';
import { ReviewSentiment } from './ReviewSentiment';

interface ReviewListProps {
  reviews: Review[];
  serviceId: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function ReviewItem({ review }: { review: Review }) {
  const colors = useThemeColors();
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewHeaderLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primary[100] }]}>
            <Ionicons name="person" size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewerName}>
              User {review.userId ? review.userId.slice(0, 8) : 'Unknown'}
            </Text>
            <View style={styles.stars}>
              {stars.map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? 'star' : 'star-outline'}
                  size={12}
                  color={colors.semantic.warning}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
      
      {/* Review Sentiment Analysis */}
      <View style={styles.sentimentContainer}>
        <ReviewSentiment reviewId={review.id} autoLoad={true} />
      </View>
    </View>
  );
}

export function ReviewList({ reviews, serviceId, onLoadMore, hasMore }: ReviewListProps) {
  const colors = useThemeColors();

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyStateText}>No reviews yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Be the first to review this service
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id || `review-${Math.random()}`}
        renderItem={({ item }) => <ReviewItem review={item} />}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  reviewItem: {
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  separator: {
    height: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  sentimentContainer: {
    marginTop: Spacing.sm,
  },
});

