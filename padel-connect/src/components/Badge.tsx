import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../lib/theme';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantColors = {
  green: { bg: colors.greenLight, text: colors.green },
  orange: { bg: colors.orangeLight, text: colors.orange },
  blue: { bg: colors.blueLight, text: colors.blue },
  red: { bg: colors.redLight, text: colors.red },
  gray: { bg: colors.grayLight, text: colors.grayText },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'green',
  size = 'sm',
  style,
}) => {
  const c = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg },
        size === 'md' && styles.md,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: c.text },
          size === 'md' && styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});
