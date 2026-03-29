import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MatchCard } from '../../src/components/MatchCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/Button';
import { useMatchStore } from '../../src/stores/matchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, fontSize, fontWeight, spacing } from '../../src/lib/theme';

type Tab = 'upcoming' | 'past';

export default function MatchesScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { myMatches, upcomingMatches, fetchMyMatches, fetchUpcomingMatches } =
    useMatchStore();

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    await Promise.all([
      fetchMyMatches(profile.id),
      fetchUpcomingMatches(profile.id),
    ]);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayedMatches = activeTab === 'upcoming' ? upcomingMatches : myMatches;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes matchs</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            A venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
      >
        {displayedMatches.length === 0 ? (
          <EmptyState
            icon="tennisball-outline"
            title={
              activeTab === 'upcoming'
                ? 'Aucun match a venir'
                : 'Aucun match joue'
            }
            description={
              activeTab === 'upcoming'
                ? 'Trouve ou cree un match pour commencer !'
                : 'Tes matchs passes apparaitront ici.'
            }
            action={
              activeTab === 'upcoming' ? (
                <Button
                  title="Trouver un match"
                  onPress={() => router.push('/(tabs)/search')}
                  size="sm"
                  style={{ marginTop: spacing.lg }}
                />
              ) : undefined
            }
          />
        ) : (
          displayedMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPress={() => router.push(`/match/${match.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.green,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.grayText,
  },
  tabTextActive: {
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
});
