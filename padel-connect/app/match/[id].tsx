import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useMatchStore } from '../../src/stores/matchStore';
import { supabase } from '../../src/lib/supabase';
import { Match, LEVEL_LABELS, SkillLevel } from '../../src/types';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from '../../src/lib/theme';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { joinMatch, leaveMatch } = useMatchStore();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('matches')
      .select('*, club:clubs(*), creator:profiles!creator_id(*), players:match_players(*, player:profiles(*))')
      .eq('id', id)
      .single();

    if (data) {
      setMatch(data as unknown as Match);
      const joined = data.players?.some(
        (p: any) => p.player_id === profile?.id
      );
      setHasJoined(!!joined);
    }
    setIsLoading(false);
  };

  const handleJoin = async () => {
    if (!match || !profile) return;
    setIsJoining(true);
    const { error } = await joinMatch(match.id, profile.id, profile.preferred_position);
    setIsJoining(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de rejoindre le match');
    } else {
      setHasJoined(true);
      loadMatch();
    }
  };

  const handleLeave = async () => {
    if (!match || !profile) return;
    Alert.alert('Quitter le match', 'Es-tu sur de vouloir quitter ce match ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: async () => {
          const { error } = await leaveMatch(match.id, profile.id);
          if (!error) {
            setHasJoined(false);
            loadMatch();
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Match introuvable</Text>
      </View>
    );
  }

  const spotsLeft = match.max_players - match.current_players;
  const isCreator = match.creator_id === profile?.id;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Status badge */}
      <View style={styles.statusRow}>
        <Badge
          label={spotsLeft > 0 ? `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} disponible${spotsLeft > 1 ? 's' : ''}` : 'Match complet'}
          variant={spotsLeft > 0 ? 'green' : 'red'}
          size="md"
        />
        {isCreator && <Badge label="Organisateur" variant="blue" size="md" />}
      </View>

      {/* Title */}
      <Text style={styles.title}>{match.title}</Text>

      {/* Info cards */}
      <Card style={styles.infoCard}>
        <InfoRow icon="location-outline" label="Club" value={match.club?.name || 'N/A'} />
        <InfoRow icon="navigate-outline" label="Ville" value={match.city} />
        <InfoRow icon="calendar-outline" label="Date" value={match.date} />
        <InfoRow icon="time-outline" label="Heure" value={match.time} />
        <InfoRow
          icon="hourglass-outline"
          label="Duree"
          value={`${match.duration_minutes} min`}
        />
        <InfoRow
          icon="trophy-outline"
          label="Niveau"
          value={`${match.level_min} - ${match.level_max} (${LEVEL_LABELS[match.level_min as SkillLevel]} a ${LEVEL_LABELS[match.level_max as SkillLevel]})`}
          isLast
        />
      </Card>

      {/* Description */}
      {match.description && (
        <Card style={styles.descCard}>
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{match.description}</Text>
        </Card>
      )}

      {/* Players */}
      <Text style={styles.sectionTitle}>
        Joueurs ({match.current_players}/{match.max_players})
      </Text>
      <Card style={styles.playersCard}>
        {match.players && match.players.length > 0 ? (
          match.players.map((mp, index) => (
            <View
              key={mp.id}
              style={[
                styles.playerRow,
                index < match.players!.length - 1 && styles.playerRowBorder,
              ]}
            >
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={18} color={colors.grayMedium} />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {mp.player?.display_name || 'Joueur'}
                </Text>
                <Text style={styles.playerLevel}>
                  Niv. {mp.player?.level}
                </Text>
              </View>
              {mp.player_id === match.creator_id && (
                <Badge label="Orga" variant="blue" size="sm" />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noPlayers}>Aucun joueur inscrit</Text>
        )}

        {/* Empty spots */}
        {Array.from({ length: spotsLeft }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.playerRow, styles.playerRowBorder]}>
            <View style={[styles.playerAvatar, styles.emptyAvatar]}>
              <Ionicons name="add" size={18} color={colors.grayMedium} />
            </View>
            <Text style={styles.emptySlot}>Place disponible</Text>
          </View>
        ))}
      </Card>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        {hasJoined ? (
          <Button
            title="Quitter le match"
            onPress={handleLeave}
            variant="outline"
            size="lg"
            textStyle={{ color: colors.red }}
          />
        ) : spotsLeft > 0 ? (
          <Button
            title="Rejoindre le match"
            onPress={handleJoin}
            isLoading={isJoining}
            size="lg"
          />
        ) : (
          <Button
            title="Match complet"
            onPress={() => {}}
            disabled
            size="lg"
          />
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={colors.grayText} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grayLight,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.grayText,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  infoCard: {
    padding: 0,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.black,
    maxWidth: '55%',
    textAlign: 'right',
  },
  descCard: {
    marginBottom: spacing.lg,
  },
  descTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: fontSize.sm,
    color: colors.grayText,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  playersCard: {
    padding: 0,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  playerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emptyAvatar: {
    borderWidth: 1.5,
    borderColor: colors.grayBorder,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  playerLevel: {
    fontSize: fontSize.xs,
    color: colors.grayText,
  },
  noPlayers: {
    padding: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.grayText,
    textAlign: 'center',
  },
  emptySlot: {
    fontSize: fontSize.sm,
    color: colors.grayMedium,
    fontStyle: 'italic',
  },
  ctaContainer: {
    marginTop: spacing.md,
  },
});
