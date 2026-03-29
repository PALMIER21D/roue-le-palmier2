import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../lib/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  showTagline?: boolean;
}

const logoSource = require('../../assets/logo.png');

const dimensions = {
  sm: { width: 150, height: 45 },
  md: { width: 240, height: 72 },
  lg: { width: 300, height: 90 },
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', style, showTagline = false }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={dimensions[size]}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={styles.tagline}>
          Trouve ton match. Joue. Progresse.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.grayText,
    marginTop: spacing.md,
  },
});
