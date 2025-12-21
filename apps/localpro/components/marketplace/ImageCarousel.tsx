import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

export function ImageCarousel({ images, height = 300 }: ImageCarouselProps) {
  const colors = useThemeColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { height, backgroundColor: colors.neutral.gray100 }]}>
        <View style={styles.placeholderContent}>
          <Ionicons name="image-outline" size={80} color={colors.text.tertiary} />
          <Text style={[styles.placeholderText, { color: colors.text.secondary }]}>
            No images available
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.text.tertiary }]}>
            Images will appear here when added
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.image, { width: screenWidth, height }]}
            resizeMode="cover"
          />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {/* Image indicators */}
      {images.length > 1 && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                activeIndex === index && styles.indicatorActive,
                { backgroundColor: activeIndex === index ? Colors.background.primary : Colors.neutral.gray400 },
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <View style={styles.counter}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Colors.neutral.gray100,
  },
  placeholderContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  image: {
    width: '100%',
  },
  indicators: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  indicatorActive: {
    opacity: 1,
    width: 24,
  },
  counter: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  counterBadge: {
    backgroundColor: Colors.background.inverse,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    opacity: 0.8,
  },
  counterText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
});

