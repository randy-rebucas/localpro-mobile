import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import { Button, Card } from '@localpro/ui';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface PricingOptimizerProps {
  serviceId: string;
  currentPrice: number;
  onPriceUpdate?: (newPrice: number) => void;
}

export function PricingOptimizer({
  serviceId,
  currentPrice,
  onPriceUpdate,
}: PricingOptimizerProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<{
    suggestedPrice: number;
    reasoning: string;
    marketAnalysis: {
      averagePrice: number;
      competitorRange: { min: number; max: number };
      demandLevel: 'low' | 'medium' | 'high';
    };
  } | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setOptimization(null);
    try {
      const result = await MarketplaceService.optimizePricing(serviceId);
      setOptimization(result);
    } catch (error: any) {
      console.error('Optimization error:', error);
      Alert.alert('Error', error.message || 'Failed to optimize pricing');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high':
        return colors.secondary[600];
      case 'medium':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'high':
        return 'trending-up' as const;
      case 'medium':
        return 'remove' as const;
      default:
        return 'trending-down' as const;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={24} color={colors.primary[600]} />
        <Text style={styles.title}>Pricing Optimizer</Text>
      </View>
      <Text style={styles.subtitle}>
        Get AI-powered pricing recommendations based on market analysis
      </Text>

      <View style={styles.currentPriceContainer}>
        <Text style={styles.currentPriceLabel}>Current Price:</Text>
        <Text style={[styles.currentPrice, { color: colors.primary[600] }]}>
          {formatCurrency(currentPrice)}
        </Text>
      </View>

      <Button
        title="Optimize Pricing"
        onPress={handleOptimize}
        variant="primary"
        loading={loading}
        disabled={loading}
        // Removed 'icon' prop as it is not a valid Button prop
      />

      {optimization && (
        <View style={[styles.resultContainer, { backgroundColor: colors.primary[50] }]}>
          <View style={styles.resultHeader}>
            <Ionicons name="bulb-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.resultTitle}>Recommended Price</Text>
          </View>

          <View style={styles.priceComparison}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current</Text>
              <Text style={styles.priceValue}>{formatCurrency(currentPrice)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.text.secondary} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Suggested</Text>
              <Text style={[styles.priceValue, { color: colors.primary[600] }]}>
                {formatCurrency(optimization.suggestedPrice)}
              </Text>
            </View>
          </View>

          {optimization.suggestedPrice !== currentPrice && (
            <View style={styles.differenceContainer}>
              <Text style={styles.differenceLabel}>Difference:</Text>
              <Text
                style={[
                  styles.differenceValue,
                  {
                    color:
                      optimization.suggestedPrice > currentPrice
                        ? colors.secondary[600]
                        : colors.semantic.error,
                  },
                ]}
              >
                {optimization.suggestedPrice > currentPrice ? '+' : ''}
                {formatCurrency(optimization.suggestedPrice - currentPrice)}
              </Text>
            </View>
          )}

          <View style={styles.reasoningContainer}>
            <Text style={styles.reasoningTitle}>Why this price?</Text>
            <Text style={styles.reasoningText}>{optimization.reasoning}</Text>
          </View>

          <View style={styles.marketAnalysisContainer}>
            <Text style={styles.analysisTitle}>Market Analysis</Text>
            
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Average Market Price:</Text>
              <Text style={styles.analysisValue}>
                {formatCurrency(optimization.marketAnalysis.averagePrice)}
              </Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Competitor Range:</Text>
              <Text style={styles.analysisValue}>
                {formatCurrency(optimization.marketAnalysis.competitorRange.min)} -{' '}
                {formatCurrency(optimization.marketAnalysis.competitorRange.max)}
              </Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Demand Level:</Text>
              <View style={styles.demandBadge}>
                <Ionicons
                  name={getDemandIcon(optimization.marketAnalysis.demandLevel)}
                  size={16}
                  color={getDemandColor(optimization.marketAnalysis.demandLevel)}
                />
                <Text
                  style={[
                    styles.demandText,
                    { color: getDemandColor(optimization.marketAnalysis.demandLevel) },
                  ]}
                >
                  {optimization.marketAnalysis.demandLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {onPriceUpdate && (
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.primary[600] }]}
              onPress={() => {
                Alert.alert(
                  'Update Price',
                  `Update price to ${formatCurrency(optimization.suggestedPrice)}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Update',
                      onPress: () => onPriceUpdate(optimization.suggestedPrice),
                    },
                  ]
                );
              }}
            >
              <Text style={styles.updateButtonText}>Apply Suggested Price</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  currentPriceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
  },
  priceItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  differenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
  },
  differenceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reasoningContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  reasoningText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  marketAnalysisContainer: {
    gap: Spacing.sm,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  analysisLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  demandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
  },
  demandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  updateButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});

