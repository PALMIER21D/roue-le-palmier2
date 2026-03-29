import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../lib/theme';
import { SkillLevel, LEVEL_LABELS } from '../types';

interface LevelSelectorProps {
  value: SkillLevel;
  onChange: (level: SkillLevel) => void;
  label?: string;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  const levels: SkillLevel[] = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(level)}
            style={[
              styles.levelButton,
              value === level && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.levelNumber,
                value === level && styles.selectedText,
              ]}
            >
              {level}
            </Text>
            <Text
              style={[
                styles.levelLabel,
                value === level && styles.selectedSubText,
              ]}
              numberOfLines={1}
            >
              {LEVEL_LABELS[level]}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  levelButton: {
    width: '23%',
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.grayLight,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.greenLight,
    borderColor: colors.green,
  },
  levelNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  selectedText: {
    color: colors.green,
  },
  levelLabel: {
    fontSize: 10,
    color: colors.grayText,
    marginTop: 2,
  },
  selectedSubText: {
    color: colors.greenDark,
  },
});
