import React, { useEffect, useState, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { MatchCard } from '../../src/components/MatchCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useMatchStore } from '../../src/stores/matchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { SkillLevel } from '../../src/types';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from '../../src/lib/theme';

export default function SearchScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { matches, fetchMatches, isLoading, filters, setFilters } = useMatchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState(profile?.city || '');
  const [dateFilter, setDateFilter] = useState('');
  const [levelMin, setLevelMin] = useState<string>('');
  const [levelMax, setLevelMax] = useState<string>('');

  useEffect(() => {
    fetchMatches({ city: profile?.city, has_spots: true });
  }, []);

  const applyFilters = () => {
    const newFilters = {
      city: cityFilter || undefined,
      date: dateFilter || undefined,
      level_min: levelMin ? (parseInt(levelMin) as SkillLevel) : undefined,
      level_max: levelMax ? (parseInt(levelMax) as SkillLevel) : undefined,
      has_spots: true,
    };
    setFilters(newFilters);
    fetchMatches(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setCityFilter('');
    setDateFilter('');
    setLevelMin('');
    setLevelMax('');
    setFilters({});
    fetchMatches({ has_spots: true });
    setShowFilters(false);
  };

  const onRefresh = useCallback(async () => {
    await fetchMatches(filters);
  }, [filters]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? colors.green : colors.black}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Rechercher par ville..."
          leftIcon="search-outline"
          value={cityFilter}
          onChangeText={setCityFilter}
          onSubmitEditing={applyFilters}
          returnKeyType="search"
        />
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Input
            label="Date"
            placeholder="AAAA-MM-JJ"
            leftIcon="calendar-outline"
            value={dateFilter}
            onChangeText={setDateFilter}
          />
          <View style={styles.levelRow}>
            <View style={styles.levelInput}>
              <Input
                label="Niveau min"
                placeholder="1"
                keyboardType="numeric"
                value={levelMin}
                onChangeText={setLevelMin}
              />
            </View>
            <View style={styles.levelInput}>
              <Input
                label="Niveau max"
                placeholder="8"
                keyboardType="numeric"
                value={levelMax}
                onChangeText={setLevelMax}
              />
            </View>
          </View>
          <View style={styles.filterActions}>
            <Button
              title="Effacer"
              onPress={clearFilters}
              variant="ghost"
              size="sm"
            />
            <Button
              title="Appliquer"
              onPress={applyFilters}
              size="sm"
            />
          </View>
        </View>
      )}

      {/* Results */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.results}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
      >
        <Text style={styles.resultCount}>
          {matches.length} match{matches.length !== 1 ? 's' : ''} disponible{matches.length !== 1 ? 's' : ''}
        </Text>

        {matches.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="Aucun match trouve"
            description="Essaie de modifier tes filtres ou cree ton propre match !"
            action={
              <Button
                title="Creer un match"
                onPress={() => router.push('/match/create')}
                size="sm"
                style={{ marginTop: spacing.lg }}
              />
            }
          />
        ) : (
          matches.map((match) => (
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  filtersPanel: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  levelRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  levelInput: {
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  results: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  resultCount: {
    fontSize: fontSize.sm,
    color: colors.grayText,
    marginBottom: spacing.lg,
  },
});
