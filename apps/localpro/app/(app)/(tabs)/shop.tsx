import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  supplierName: string;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
}

export default function ShopTabScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock products data - replace with actual API call
  const products: Product[] = [];

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-outline' as const },
    { key: 'tools', label: 'Tools', icon: 'hammer-outline' as const },
    { key: 'materials', label: 'Materials', icon: 'cube-outline' as const },
    { key: 'equipment', label: 'Equipment', icon: 'construct-outline' as const },
    { key: 'safety', label: 'Safety', icon: 'shield-outline' as const },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductPress = (productId: string) => {
    // TODO: Navigate to product detail screen
    // router.push(`/(app)/product/${productId}`);
    console.log('View product:', productId);
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', productId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Shop</Text>
            <Text style={styles.subtitle}>Browse products and supplies</Text>
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
                placeholder="Search products..."
                placeholderTextColor={colors.text.tertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.viewModeButton, { backgroundColor: colors.background.primary }]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
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

          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <View style={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  style={viewMode === 'grid' ? styles.productCardGrid : styles.productCardList}
                >
                  <TouchableOpacity
                    onPress={() => handleProductPress(product.id)}
                    activeOpacity={0.7}
                  >
                    <View style={viewMode === 'grid' ? styles.productImageContainerGrid : styles.productImageContainerList}>
                      {product.images && product.images.length > 0 ? (
                        <Image 
                          source={{ uri: product.images[0] }} 
                          style={viewMode === 'grid' ? styles.productImageGrid : styles.productImageList}
                        />
                      ) : (
                        <View style={[viewMode === 'grid' ? styles.productImagePlaceholderGrid : styles.productImagePlaceholderList, { backgroundColor: colors.neutral.gray200 }]}>
                          <Ionicons name="cube-outline" size={32} color={colors.text.tertiary} />
                        </View>
                      )}
                      {!product.inStock && (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                      )}
                      {product.rating && (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color={colors.semantic.warning} />
                          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={viewMode === 'grid' ? 2 : 1}>
                        {product.name}
                      </Text>
                      {viewMode === 'list' && (
                        <Text style={styles.productDescription} numberOfLines={2}>
                          {product.description}
                        </Text>
                      )}
                      <View style={styles.productFooter}>
                        <View style={styles.productPriceContainer}>
                          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                          <Text style={styles.productUnit}>/{product.unit}</Text>
                        </View>
                        {product.inStock && (
                          <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary[600] }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.id);
                            }}
                          >
                            <Ionicons name="add" size={18} color={colors.text.inverse} />
                          </TouchableOpacity>
                        )}
                      </View>
                      {product.supplierName && (
                        <Text style={styles.productSupplier}>by {product.supplierName}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={searchQuery ? 'search-outline' : 'cube-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No Products Found' : 'No Products Available'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new products'}
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
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
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
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  categoriesContainer: {
    marginBottom: Spacing.lg,
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  productsList: {
    gap: Spacing.md,
  },
  productCardGrid: {
    width: '47%',
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  productCardList: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  productImageContainerGrid: {
    position: 'relative',
    width: '100%',
    height: 160,
    marginBottom: Spacing.sm,
  },
  productImageContainerList: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: Spacing.sm,
  },
  productImageGrid: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral.gray200,
  },
  productImageList: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral.gray200,
  },
  productImagePlaceholderGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderList: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.semantic.error,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.inverse,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  productUnit: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSupplier: {
    fontSize: 11,
    color: Colors.text.tertiary,
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

