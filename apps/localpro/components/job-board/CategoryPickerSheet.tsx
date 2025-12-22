import { Ionicons } from '@expo/vector-icons';
import { JobBoardService } from '@localpro/job-board';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CategoryPickerSheetProps {
  visible: boolean;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  onClose: () => void;
  required?: boolean;
}

export function CategoryPickerSheet({
  visible,
  selectedCategoryId,
  onSelectCategory,
  onClose,
  required = false,
}: CategoryPickerSheetProps) {
  const colors = useThemeColors();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CategoryPickerSheet visible changed:', visible);
    if (visible) {
      fetchCategories();
    } else {
      // Reset loading when closed
      setLoading(true);
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('CategoryPickerSheet: Fetching categories from /api/job-categories...');
      const data = await JobBoardService.getCategories();
      console.log('CategoryPickerSheet: Categories fetched successfully:', data);
      if (data && data.length > 0) {
        setCategories(data);
        console.log(`CategoryPickerSheet: Loaded ${data.length} categories`);
      } else {
        console.warn('CategoryPickerSheet: No categories returned from API');
      }
    } catch (err: any) {
      console.error('CategoryPickerSheet: Error fetching categories from /api/job-categories:', err);
      console.error('CategoryPickerSheet: Error details:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const isSelected = selectedCategoryId === categoryId;
    onSelectCategory(isSelected ? undefined : categoryId);
    if (!isSelected) {
      // Close sheet after selection
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  console.log('CategoryPickerSheet render - visible:', visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Select Category</Text>
              {required && <Text style={styles.required}>*</Text>}
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary[600]} />
                  <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    Loading categories...
                  </Text>
                </View>
              ) : categories.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-outline" size={48} color={colors.text.tertiary} />
                  <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
                    No categories available
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
                    Please try again later
                  </Text>
                </View>
              ) : (
                <View style={styles.categoriesList}>
                  {categories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          {
                            backgroundColor: isSelected
                              ? colors.primary[50]
                              : colors.background.secondary,
                            borderColor: isSelected ? colors.primary[600] : colors.border.light,
                          },
                        ]}
                        onPress={() => handleSelectCategory(category.id)}
                        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
                      >
                        <Text
                          style={[
                            styles.categoryName,
                            {
                              color: isSelected ? colors.primary[600] : colors.text.primary,
                              fontWeight: isSelected
                                ? Typography.fontWeight.semibold
                                : Typography.fontWeight.regular,
                            },
                          ]}
                        >
                          {category.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '90%',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: Platform.select({ ios: 1, android: 1.5 }),
    borderBottomColor: Colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  required: {
    fontSize: 20,
    color: Colors.semantic.error[600],
    fontFamily: Typography.fontFamily?.bold || 'System',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily?.medium || 'System',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  categoriesList: {
    gap: Spacing.xs,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: Platform.select({ ios: 1, android: 1.5 }),
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: Typography.fontFamily?.regular || 'System',
    flex: 1,
  },
});

