import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { MatchCard } from '../../src/components/MatchCard';
import { StatCard } from '../../src/components/StatCard';
import { Badge } from '../../src/components/Badge';
import { EmptyState } from '../../src/components/EmptyState';
import { useAuthStore } from '../../src/stores/authStore';
import { useMatchStore } from '../../src/stores/matchStore';
import { LEVEL_LABELS, SkillLevel } from '../../src/types';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from '../../src/lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { matches, upcomingMatches, fetchMatches, fetchUpcomingMatches, isLoading } =
    useMatchStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    if (!profile) return;
    await Promise.all([
      fetchMatches({ city: profile.city, has_spots: true }),
      fetchUpcomingMatches(profile.id),
    ]);
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const firstName = profile?.display_name?.split(' ')[0] || 'Joueur';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Salut {firstName} !</Text>
            <Text style={styles.subGreeting}>Pret pour un match ?</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.grayMedium} />
          </View>
        </View>

        {/* Profile summary */}
        <View style={[styles.profileCard, shadows.md]}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>{profile?.display_name}</Text>
            <Badge
              label={`Niv. ${profile?.level} - ${LEVEL_LABELS[(profile?.level || 3) as SkillLevel]}`}
              variant="green"
              size="md"
            />
          </View>
          <View style={styles.profileCity}>
            <Ionicons name="location" size={14} color={colors.grayText} />
            <Text style={styles.profileCityText}>{profile?.city}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Matchs"
            value={profile?.matches_played || 0}
            icon="tennisball-outline"
            color={colors.green}
          />
          <StatCard
            label="Victoires"
            value={profile?.matches_won || 0}
            icon="trophy-outline"
            color={colors.orange}
          />
          <StatCard
            label="Niveau"
            value={profile?.level || 0}
            icon="trending-up-outline"
            color={colors.blue}
          />
        </View>

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <Button
            title="Trouver un match"
            onPress={() => router.push('/(tabs)/search')}
            size="lg"
            style={styles.ctaButton}
            icon={<Ionicons name="search" size={20} color={colors.white} />}
          />
          <Button
            title="Creer un match"
            onPress={() => router.push('/match/create')}
            variant="outline"
            size="lg"
            style={styles.ctaButton}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.black} />}
          />
        </View>

        {/* Upcoming matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes prochains matchs</Text>
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Aucun match prevu"
              description="Rejoins ou cree un match pour commencer !"
            />
          ) : (
            upcomingMatches.slice(0, 3).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => router.push(`/match/${match.id}`)}
              />
            ))
          )}
        </View>

        {/* Nearby matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matchs pres de chez toi</Text>
            <Button
              title="Voir tout"
              onPress={() => router.push('/(tabs)/search')}
              variant="ghost"
              size="sm"
            />
          </View>
          {matches.length === 0 ? (
            <EmptyState
              icon="tennisball-outline"
              title="Aucun match disponible"
              description="Sois le premier a creer un match dans ta ville !"
              action={
                <Button
                  title="Creer un match"
                  onPress={() => router.push('/match/create')}
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: spacing.lg }}
                />
              }
            />
          ) : (
            matches.slice(0, 5).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => router.push(`/match/${match.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  greeting: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  subGreeting: {
    fontSize: fontSize.md,
    color: colors.grayText,
    marginTop: spacing.xs,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  profileCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileCityText: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  ctaRow: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  ctaButton: {
    width: '100%',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.lg,
  },
});
