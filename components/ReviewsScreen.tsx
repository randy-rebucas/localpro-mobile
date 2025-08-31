import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Mock data for reviews
const reviews = [
  {
    id: '1',
    provider: 'Sarah Johnson',
    service: 'House Cleaning',
    rating: 5,
    review: 'Excellent service! Sarah was very thorough and professional. The house looks spotless and she went above and beyond my expectations. Highly recommend!',
    date: '2 days ago',
    avatar: 'SJ',
    verified: true,
    helpful: 12
  },
  {
    id: '2',
    provider: 'Mike Chen',
    service: 'Plumbing',
    rating: 4,
    review: 'Fixed the leak quickly and explained what was wrong. Very knowledgeable and professional. Would definitely hire again.',
    date: '1 week ago',
    avatar: 'MC',
    verified: true,
    helpful: 8
  },
  {
    id: '3',
    provider: 'Emma Davis',
    service: 'Electrical',
    rating: 5,
    review: 'Great work installing the new outlets. Very clean and professional installation. Emma was punctual and completed the job efficiently.',
    date: '2 weeks ago',
    avatar: 'ED',
    verified: false,
    helpful: 15
  },
  {
    id: '4',
    provider: 'David Wilson',
    service: 'Landscaping',
    rating: 4,
    review: 'Beautiful garden design and implementation. The plants are thriving and the overall design exceeded my expectations. Great attention to detail.',
    date: '3 weeks ago',
    avatar: 'DW',
    verified: true,
    helpful: 6
  },
  {
    id: '5',
    provider: 'Lisa Thompson',
    service: 'Painting',
    rating: 5,
    review: 'Amazing attention to detail. The paint job looks perfect and professional. Lisa was very careful with furniture and cleaned up thoroughly.',
    date: '1 month ago',
    avatar: 'LT',
    verified: true,
    helpful: 20
  },
];

// Calculate overall rating statistics
const overallRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
const totalReviews = reviews.length;
const fiveStarReviews = reviews.filter(review => review.rating === 5).length;
const fourStarReviews = reviews.filter(review => review.rating === 4).length;

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? '#FFD700' : '#E0E0E0'}
          style={styles.star}
        />
      ))}
    </View>
  );
};

const RatingBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
  const percentage = (count / total) * 100;
  
  return (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingLabel}>{rating} stars</Text>
      <View style={styles.ratingBar}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
};

const ReviewCard = ({ review }: { review: any }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{review.avatar}</Text>
        </LinearGradient>
        {review.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
          </View>
        )}
      </View>
      <View style={styles.reviewInfo}>
        <View style={styles.reviewInfoHeader}>
          <Text style={styles.providerName}>{review.provider}</Text>
          <Text style={styles.date}>{review.date}</Text>
        </View>
        <Text style={styles.serviceName}>{review.service}</Text>
        <StarRating rating={review.rating} />
      </View>
    </View>
    <Text style={styles.reviewText}>{review.review}</Text>
    <View style={styles.reviewActions}>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="thumbs-up-outline" size={16} color="#667eea" />
        <Text style={styles.actionText}>Helpful ({review.helpful})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="chatbubble-outline" size={16} color="#667eea" />
        <Text style={styles.actionText}>Reply</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const ReviewsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

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
            <Text style={styles.headerTitle}>Reviews</Text>
            <Text style={styles.headerSubtitle}>What our customers say</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.ratingOverview}>
          <View style={styles.overallRating}>
            <Text style={styles.overallRatingNumber}>{overallRating.toFixed(1)}</Text>
            <StarRating rating={Math.round(overallRating)} size={20} />
            <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
          </View>
          <View style={styles.ratingBreakdown}>
            <RatingBar rating={5} count={fiveStarReviews} total={totalReviews} />
            <RatingBar rating={4} count={fourStarReviews} total={totalReviews} />
            <RatingBar rating={3} count={2} total={totalReviews} />
            <RatingBar rating={2} count={1} total={totalReviews} />
            <RatingBar rating={1} count={0} total={totalReviews} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
            All Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === '5star' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('5star')}
        >
          <Text style={[styles.filterTabText, selectedFilter === '5star' && styles.filterTabTextActive]}>
            5 Stars
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === '4star' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('4star')}
        >
          <Text style={[styles.filterTabText, selectedFilter === '4star' && styles.filterTabTextActive]}>
            4 Stars
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'verified' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('verified')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'verified' && styles.filterTabTextActive]}>
            Verified
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
        {renderFilterTabs()}
        <View style={styles.reviewsContainer}>
          <FlatList
            data={reviews}
            renderItem={({ item }) => <ReviewCard review={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reviewsList}
            scrollEnabled={false}
          />
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
  filterButton: {
    padding: 8,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  overallRating: {
    alignItems: 'center',
    marginRight: 30,
  },
  overallRatingNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  ratingBreakdown: {
    flex: 1,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    width: 40,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    width: 20,
    textAlign: 'right',
  },
  filterTabs: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
  reviewsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  serviceName: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 6,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  reviewText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
});
