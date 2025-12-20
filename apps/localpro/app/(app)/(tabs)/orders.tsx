import { Ionicons } from '@expo/vector-icons';
import { Card } from '@localpro/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../../constants/theme';
import { useThemeColors } from '../../../hooks/use-theme';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  supplyId: string;
  supplyName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
}

export default function OrdersTabScreen() {
  const colors = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');

  // Mock orders data - replace with actual API call
  const orders: Order[] = [];

  const filters = [
    { key: 'all' as const, label: 'All', icon: 'list-outline' as const },
    { key: 'pending' as const, label: 'Pending', icon: 'time-outline' as const },
    { key: 'processing' as const, label: 'Processing', icon: 'sync-outline' as const },
    { key: 'shipped' as const, label: 'Shipped', icon: 'car-outline' as const },
    { key: 'delivered' as const, label: 'Delivered', icon: 'checkmark-circle-outline' as const },
    { key: 'cancelled' as const, label: 'Cancelled', icon: 'close-circle-outline' as const },
  ];

  const filteredOrders = orders.filter(order => {
    return activeFilter === 'all' || order.status === activeFilter;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'processing':
        return colors.primary[600];
      case 'shipped':
        return colors.secondary[600];
      case 'delivered':
        return colors.semantic.success;
      case 'cancelled':
        return colors.semantic.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOrderPress = (orderId: string) => {
    // TODO: Navigate to order detail screen
    // router.push(`/(app)/order/${orderId}`);
    console.log('View order:', orderId);
  };

  const handleTrackOrder = (orderId: string) => {
    // TODO: Navigate to tracking screen
    console.log('Track order:', orderId);
  };

  const handleCancelOrder = (orderId: string) => {
    // TODO: Implement cancel order functionality
    console.log('Cancel order:', orderId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Orders</Text>
            <Text style={styles.subtitle}>View and track your orders</Text>
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

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <Card key={order.id} style={styles.orderCard}>
                    <TouchableOpacity
                      onPress={() => handleOrderPress(order.id)}
                      activeOpacity={0.7}
                    >
                      {/* Order Header */}
                      <View style={styles.orderHeader}>
                        <View style={styles.orderHeaderLeft}>
                          <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
                          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                            {getStatusLabel(order.status)}
                          </Text>
                        </View>
                      </View>

                      {/* Order Items */}
                      <View style={styles.orderItems}>
                        {order.items.slice(0, 3).map((item, index) => (
                          <View key={index} style={styles.orderItem}>
                            <Text style={styles.orderItemName} numberOfLines={1}>
                              {item.quantity}x {item.supplyName}
                            </Text>
                            <Text style={styles.orderItemPrice}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                        {order.items.length > 3 && (
                          <Text style={styles.moreItemsText}>
                            +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                          </Text>
                        )}
                      </View>

                      {/* Order Footer */}
                      <View style={styles.orderFooter}>
                        <View style={styles.orderTotal}>
                          <Text style={styles.orderTotalLabel}>Total</Text>
                          <Text style={styles.orderTotalAmount}>
                            ${order.totalAmount.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.orderActions}>
                          {order.status === 'shipped' && order.trackingNumber && (
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: colors.secondary[600] }]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleTrackOrder(order.id);
                              }}
                            >
                              <Ionicons name="location" size={16} color={colors.text.inverse} />
                              <Text style={styles.actionButtonText}>Track</Text>
                            </TouchableOpacity>
                          )}
                          {order.status === 'pending' && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.semantic.error }]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.id);
                              }}
                            >
                              <Ionicons name="close-circle" size={16} color={colors.semantic.error} />
                              <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>Cancel</Text>
                            </TouchableOpacity>
                          )}
                          {(order.status === 'delivered' || order.status === 'cancelled') && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.primary[600] }]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleOrderPress(order.id);
                              }}
                            >
                              <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>View Details</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <View style={styles.trackingInfo}>
                          <Ionicons name="cube-outline" size={14} color={colors.text.secondary} />
                          <Text style={styles.trackingText}>
                            Tracking: {order.trackingNumber}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons 
                  name={activeFilter === 'all' ? 'cube-outline' : 'filter-outline'} 
                  size={64} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeFilter === 'all' ? 'No Orders Yet' : `No ${filters.find(f => f.key === activeFilter)?.label} Orders`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'all'
                    ? 'Start shopping to see your orders here'
                    : `You don't have any ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} orders`}
                </Text>
                {activeFilter === 'all' && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: colors.primary[600] }]}
                    onPress={() => router.push('/(app)/(tabs)/shop')}
                  >
                    <Ionicons name="cart-outline" size={20} color={colors.text.inverse} />
                    <Text style={styles.emptyStateButtonText}>Start Shopping</Text>
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
  ordersList: {
    gap: Spacing.md,
  },
  orderCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderItems: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  moreItemsText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderTotal: {
    flex: 1,
  },
  orderTotalLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.xs,
  },
  trackingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
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

