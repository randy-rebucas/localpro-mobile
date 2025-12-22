import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../hooks/use-theme';

interface WavyBackgroundProps {
  colors?: ReturnType<typeof useThemeColors>;
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({ colors: colorsProp }) => {
  const themeColors = useThemeColors();
  const colors = colorsProp || themeColors;

  return (
    <View style={styles.wavyBackgroundContainer} pointerEvents="none">
      {/* Top wave - Blue */}
      <View style={styles.waveContainer}>
        <View style={[styles.waveTop, { backgroundColor: colors.primary[200] }]} />
        <View style={[styles.waveTopOverlay, { backgroundColor: colors.primary[100] }]} />
      </View>
      {/* Middle wave - Green */}
      <View style={styles.waveContainer}>
        <View style={[styles.waveMiddle, { backgroundColor: colors.secondary[200] }]} />
        <View style={[styles.waveMiddleOverlay, { backgroundColor: colors.secondary[100] }]} />
      </View>
      {/* Bottom wave - Blue */}
      <View style={styles.waveContainer}>
        <View style={[styles.waveBottom, { backgroundColor: colors.primary[200] }]} />
        <View style={[styles.waveBottomOverlay, { backgroundColor: colors.primary[100] }]} />
      </View>
      {/* Additional accent waves */}
      <View style={styles.waveContainer}>
        <View style={[styles.waveAccent1, { backgroundColor: colors.primary[300] }]} />
      </View>
      <View style={styles.waveContainer}>
        <View style={[styles.waveAccent2, { backgroundColor: colors.secondary[300] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wavyBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    width: '100%',
  },
  waveTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: '170%',
    height: 220,
    borderRadius: Platform.select({ ios: 120, android: 140 }),
    opacity: 0.6,
    transform: [{ rotate: '-12deg' }],
  },
  waveTopOverlay: {
    position: 'absolute',
    top: -70,
    left: -20,
    width: '160%',
    height: 200,
    borderRadius: Platform.select({ ios: 110, android: 130 }),
    opacity: 0.5,
    transform: [{ rotate: '10deg' }],
  },
  waveMiddle: {
    position: 'absolute',
    top: '25%',
    right: -50,
    width: '180%',
    height: 240,
    borderRadius: Platform.select({ ios: 130, android: 150 }),
    opacity: 0.55,
    transform: [{ rotate: '18deg' }],
  },
  waveMiddleOverlay: {
    position: 'absolute',
    top: '27%',
    right: -30,
    width: '170%',
    height: 220,
    borderRadius: Platform.select({ ios: 120, android: 140 }),
    opacity: 0.45,
    transform: [{ rotate: '-10deg' }],
  },
  waveBottom: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: '175%',
    height: 230,
    borderRadius: Platform.select({ ios: 125, android: 145 }),
    opacity: 0.58,
    transform: [{ rotate: '-15deg' }],
  },
  waveBottomOverlay: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: '165%',
    height: 210,
    borderRadius: Platform.select({ ios: 115, android: 135 }),
    opacity: 0.48,
    transform: [{ rotate: '12deg' }],
  },
  waveAccent1: {
    position: 'absolute',
    top: '15%',
    left: -40,
    width: '140%',
    height: 180,
    borderRadius: Platform.select({ ios: 100, android: 120 }),
    opacity: 0.4,
    transform: [{ rotate: '5deg' }],
  },
  waveAccent2: {
    position: 'absolute',
    bottom: '20%',
    right: -35,
    width: '145%',
    height: 190,
    borderRadius: Platform.select({ ios: 105, android: 125 }),
    opacity: 0.38,
    transform: [{ rotate: '-8deg' }],
  },
});

