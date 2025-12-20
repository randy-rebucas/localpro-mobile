import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  count?: number;
}

export function LoadingSkeleton({ viewMode, count = 6 }: LoadingSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.gridSkeleton}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonContent}>
              <View style={[styles.skeletonLine, { width: '90%' }]} />
              <View style={[styles.skeletonLine, { width: '60%', marginTop: Spacing.xs }]} />
              <View style={[styles.skeletonLine, { width: '40%', marginTop: Spacing.sm }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listSkeleton}>
          <View style={styles.skeletonImageList} />
          <View style={styles.skeletonContentList}>
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '100%', marginTop: Spacing.xs }]} />
            <View style={[styles.skeletonLine, { width: '100%', marginTop: Spacing.xs }]} />
            <View style={styles.skeletonFooter}>
              <View style={[styles.skeletonLine, { width: '50%' }]} />
              <View style={[styles.skeletonLine, { width: '30%' }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  gridSkeleton: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
  },
  listSkeleton: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  skeletonImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.neutral.gray200,
  },
  skeletonImageList: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray200,
  },
  skeletonContent: {
    padding: Spacing.sm,
  },
  skeletonContentList: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.sm,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
});

