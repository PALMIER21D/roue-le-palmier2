import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { ClubCard } from '../../src/components/ClubCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/Input';
import { supabase } from '../../src/lib/supabase';
import { Club } from '../../src/types';
import { colors, fontSize, fontWeight, spacing } from '../../src/lib/theme';

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClubs = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .order('city')
      .order('name');

    const result = (data as Club[]) || [];
    setClubs(result);
    setFilteredClubs(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredClubs(clubs);
    } else {
      const q = search.toLowerCase();
      setFilteredClubs(
        clubs.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q)
        )
      );
    }
  }, [search, clubs]);

  // Group clubs by city
  const groupedClubs = filteredClubs.reduce<Record<string, Club[]>>(
    (acc, club) => {
      if (!acc[club.city]) acc[club.city] = [];
      acc[club.city].push(club);
      return acc;
    },
    {}
  );

  const cities = Object.keys(groupedClubs).sort();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Clubs</Text>
        <Text style={styles.subtitle}>
          {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Rechercher un club ou une ville..."
          leftIcon="search-outline"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadClubs}
            tintColor={colors.green}
          />
        }
      >
        {filteredClubs.length === 0 ? (
          <EmptyState
            icon="business-outline"
            title="Aucun club trouve"
            description="Essaie de modifier ta recherche."
          />
        ) : (
          cities.map((city) => (
            <View key={city} style={styles.citySection}>
              <Text style={styles.cityTitle}>{city}</Text>
              {groupedClubs[city].map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  citySection: {
    marginBottom: spacing.lg,
  },
  cityTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
});
