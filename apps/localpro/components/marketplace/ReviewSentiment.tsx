import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ReviewSentimentProps {
  reviewId: string;
  autoLoad?: boolean;
}

type Sentiment = 'positive' | 'neutral' | 'negative';

interface SentimentData {
  sentiment: Sentiment;
  score: number;
  keywords: string[];
}

export function ReviewSentiment({ reviewId, autoLoad = true }: ReviewSentimentProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad && reviewId) {
      loadSentiment();
    }
  }, [reviewId, autoLoad]);

  const loadSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MarketplaceService.analyzeReviewSentiment(reviewId);
      setSentimentData(data);
    } catch (err: any) {
      console.error('Error loading sentiment:', err);
      setError(err.message || 'Failed to load sentiment analysis');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentConfig = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return {
          color: colors.secondary[600],
          icon: 'happy-outline' as const,
          label: 'Positive',
          bgColor: colors.secondary[50],
        };
      case 'negative':
        return {
          color: colors.semantic.error,
          icon: 'sad-outline' as const,
          label: 'Negative',
          bgColor: colors.semantic.error + '20',
        };
      default:
        return {
          color: colors.text.secondary,
          icon: 'remove-outline' as const,
          label: 'Neutral',
          bgColor: Colors.neutral.gray100,
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Analyzing sentiment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!sentimentData) {
    return null;
  }

  const config = getSentimentConfig(sentimentData.sentiment);
  const scorePercentage = Math.round(sentimentData.score * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.sentimentBadge, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.sentimentLabel, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={[styles.scoreText, { color: config.color }]}>
          {scorePercentage}%
        </Text>
      </View>
      
      {sentimentData.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          <Text style={styles.keywordsLabel}>Key Topics:</Text>
          <View style={styles.keywordsList}>
            {sentimentData.keywords.slice(0, 5).map((keyword, index) => (
              <View key={index} style={[styles.keywordTag, { backgroundColor: colors.primary[50] }]}>
                <Text style={[styles.keywordText, { color: colors.primary[700] }]}>
                  {keyword}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.semantic.error,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  sentimentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  keywordsContainer: {
    marginTop: Spacing.xs,
  },
  keywordsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  keywordTag: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

