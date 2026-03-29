import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { Match, LEVEL_LABELS, SkillLevel } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../lib/theme';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const spotsLeft = match.max_players - match.current_players;
  const levelLabel = `Niv. ${match.level_min}-${match.level_max}`;

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {match.title}
        </Text>
        <Badge
          label={spotsLeft > 0 ? `${spotsLeft} place${spotsLeft > 1 ? 's' : ''}` : 'Complet'}
          variant={spotsLeft > 0 ? 'green' : 'red'}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.grayText} />
          <Text style={styles.detailText}>
            {match.club?.name || 'Club'} - {match.city}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.grayText} />
          <Text style={styles.detailText}>{match.date}</Text>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.grayText}
            style={{ marginLeft: spacing.md }}
          />
          <Text style={styles.detailText}>{match.time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="trophy-outline" size={16} color={colors.grayText} />
          <Text style={styles.detailText}>{levelLabel}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.players}>
          {Array.from({ length: match.max_players }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.playerDot,
                i < match.current_players && styles.playerDotFilled,
              ]}
            />
          ))}
          <Text style={styles.playerCount}>
            {match.current_players}/{match.max_players}
          </Text>
        </View>
        <Badge label={levelLabel} variant="blue" size="sm" />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    flex: 1,
    marginRight: spacing.sm,
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.grayBorder,
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.grayBorder,
  },
  playerDotFilled: {
    backgroundColor: colors.green,
  },
  playerCount: {
    fontSize: fontSize.xs,
    color: colors.grayText,
    marginLeft: spacing.xs,
  },
});
