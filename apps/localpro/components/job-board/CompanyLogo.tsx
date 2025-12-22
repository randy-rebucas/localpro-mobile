import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface CompanyLogoProps {
  logo?: string;
  companyName: string;
  size?: number;
}

export function CompanyLogo({ logo, companyName, size = 64 }: CompanyLogoProps) {
  const colors = useThemeColors();

  if (logo) {
    return (
      <Image
        source={{ uri: logo }}
        style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        placeholder={require('../../assets/images/icon.png')}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary[100],
        },
      ]}
    >
      <Ionicons name="business" size={size * 0.5} color={colors.primary[600]} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: Colors.background.secondary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

