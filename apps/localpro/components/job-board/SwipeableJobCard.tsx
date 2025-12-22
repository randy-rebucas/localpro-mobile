import { Ionicons } from '@expo/vector-icons';
import type { Job } from '@localpro/types';
import React, { useRef } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface SwipeableJobCardProps {
  job: Job;
  onPress: (jobId: string) => void;
  onSave: (jobId: string, isSaved: boolean) => void;
  onQuickApply: (jobId: string) => void;
  isSaved?: boolean;
  children: React.ReactNode;
  viewMode?: 'grid' | 'list';
}

const ACTION_WIDTH = 100;

export function SwipeableJobCard({
  job,
  onPress,
  onSave,
  onQuickApply,
  isSaved = false,
  children,
  viewMode = 'list',
}: SwipeableJobCardProps) {
  const colors = useThemeColors();
  const swipeableRef = useRef<Swipeable>(null);

  const handleSave = () => {
    onSave(job.id, !isSaved);
    swipeableRef.current?.close();
  };

  const handleQuickApply = () => {
    onQuickApply(job.id);
    swipeableRef.current?.close();
  };

  const renderLeftActions = () => (
    <View style={[styles.actionContainer, styles.leftAction, { backgroundColor: isSaved ? colors.semantic.error[50] : colors.primary[50] }]}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSave}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        <Ionicons
          name={isSaved ? 'heart' : 'heart-outline'}
          size={24}
          color={isSaved ? colors.semantic.error[600] : colors.primary[600]}
        />
        <Text
          style={[
            styles.actionText,
            { color: isSaved ? colors.semantic.error[600] : colors.primary[600] },
          ]}
        >
          {isSaved ? 'Unsave' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = () => (
    <View style={[styles.actionContainer, styles.rightAction, { backgroundColor: colors.secondary[50] }]}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleQuickApply}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        <Ionicons name="send-outline" size={24} color={colors.secondary[600]} />
        <Text style={[styles.actionText, { color: colors.secondary[600] }]}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          // Swipe left to save - auto-trigger after threshold
        } else if (direction === 'right') {
          // Swipe right to quick apply - auto-trigger after threshold
        }
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(job.id)}
        activeOpacity={Platform.select({ ios: 0.7, android: 0.8 })}
      >
        {children}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  leftAction: {
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  rightAction: {
    borderTopRightRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  actionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily?.semibold || 'System',
  },
});

