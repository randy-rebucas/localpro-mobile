import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat';
}

// Theme colors - matching logo brand colors
const themeColors = {
  white: '#FFFFFF',
  beige: '#F5F5F0',  // Light beige background from logo
};

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  return (
    <View style={[
      styles.card,
      variant === 'flat' && styles.cardFlat,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: themeColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFlat: {
    shadowOpacity: 0,
    elevation: 0,
  },
});

