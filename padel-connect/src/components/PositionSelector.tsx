import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../lib/theme';
import { CourtPosition, POSITION_LABELS } from '../types';

interface PositionSelectorProps {
  value: CourtPosition;
  onChange: (position: CourtPosition) => void;
  label?: string;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  const positions: { key: CourtPosition; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'left', icon: 'arrow-back-circle-outline' },
    { key: 'right', icon: 'arrow-forward-circle-outline' },
    { key: 'both', icon: 'swap-horizontal-outline' },
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {positions.map((pos) => (
          <TouchableOpacity
            key={pos.key}
            onPress={() => onChange(pos.key)}
            style={[
              styles.button,
              value === pos.key && styles.selected,
            ]}
          >
            <Ionicons
              name={pos.icon}
              size={24}
              color={value === pos.key ? colors.green : colors.grayText}
            />
            <Text
              style={[
                styles.text,
                value === pos.key && styles.selectedText,
              ]}
            >
              {POSITION_LABELS[pos.key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.grayLight,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  selected: {
    backgroundColor: colors.greenLight,
    borderColor: colors.green,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.grayText,
  },
  selectedText: {
    color: colors.green,
  },
});
