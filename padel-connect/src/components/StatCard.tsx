import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../lib/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = colors.green,
}) => {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grayBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.grayText,
    marginTop: spacing.xs,
  },
});
