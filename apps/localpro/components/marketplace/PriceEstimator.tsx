import { Ionicons } from '@expo/vector-icons';
import { MarketplaceService } from '@localpro/marketplace';
import { Button, Card, Input } from '@localpro/ui';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

export function PriceEstimator() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
  });
  const [estimate, setEstimate] = useState<{
    estimatedPrice: number;
    priceRange: { min: number; max: number };
  } | null>(null);

  const categories = [
    'Cleaning',
    'Plumbing',
    'Electrical',
    'Handyman',
    'Landscaping',
    'Painting',
    'Moving',
    'Photography',
    'Other',
  ];

  const handleEstimate = async () => {
    if (!formData.title.trim() || !formData.category) {
      Alert.alert('Required Fields', 'Please fill in title and category');
      return;
    }

    setLoading(true);
    setEstimate(null);
    try {
      const result = await MarketplaceService.estimatePrice({
        title: formData.title,
        category: formData.category,
        description: formData.description || undefined,
      });
      setEstimate(result);
    } catch (error: any) {
      console.error('Estimate error:', error);
      Alert.alert('Error', error.message || 'Failed to estimate price');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="calculator-outline" size={24} color={colors.primary[600]} />
          <Text style={styles.title}>Price Estimator</Text>
        </View>
        <Text style={styles.subtitle}>
          Get an AI-powered price estimate for your service
        </Text>

        <View style={styles.form}>
          <Input
            label="Service Title *"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Professional House Cleaning"
          />

          <View style={styles.categoryContainer}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && {
                      backgroundColor: colors.primary[600],
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === category && { color: Colors.text.inverse },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Brief description of your service..."
            multiline
          />

          <Button
            title="Estimate Price"
            onPress={handleEstimate}
            variant="primary"
            loading={loading}
            disabled={loading || !formData.title.trim() || !formData.category}
          />
        </View>

        {estimate && (
          <View style={[styles.resultContainer, { backgroundColor: colors.primary[50] }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
              <Text style={styles.resultTitle}>Estimated Price</Text>
            </View>
            <Text style={[styles.estimatedPrice, { color: colors.primary[600] }]}>
              {formatCurrency(estimate.estimatedPrice)}
            </Text>
            <View style={styles.rangeContainer}>
              <Text style={styles.rangeLabel}>Price Range:</Text>
              <Text style={styles.rangeValue}>
                {formatCurrency(estimate.priceRange.min)} - {formatCurrency(estimate.priceRange.max)}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                This is an AI-generated estimate based on market data. Actual pricing may vary.
              </Text>
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  form: {
    gap: Spacing.md,
  },
  categoryContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text.primary,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  estimatedPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rangeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});

