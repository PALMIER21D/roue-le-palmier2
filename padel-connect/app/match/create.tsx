import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { LevelSelector } from '../../src/components/LevelSelector';
import { useAuthStore } from '../../src/stores/authStore';
import { useMatchStore } from '../../src/stores/matchStore';
import { supabase } from '../../src/lib/supabase';
import { Club, SkillLevel } from '../../src/types';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from '../../src/lib/theme';

const schema = z.object({
  title: z.string().min(3, 'Titre requis (min 3 car.)'),
  city: z.string().min(2, 'Ville requise'),
  date: z.string().min(1, 'Date requise'),
  time: z.string().min(1, 'Heure requise'),
  duration: z.string().min(1, 'Duree requise'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateMatchScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { createMatch } = useMatchStore();

  const [isLoading, setIsLoading] = useState(false);
  const [levelMin, setLevelMin] = useState<SkillLevel>((profile?.level || 3) as SkillLevel);
  const [levelMax, setLevelMax] = useState<SkillLevel>(
    Math.min(8, ((profile?.level || 3) + 2)) as SkillLevel
  );
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      city: profile?.city || '',
      date: '',
      time: '',
      duration: '90',
      description: '',
    },
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .order('name');
    if (data) setClubs(data as Club[]);
  };

  const onSubmit = async (data: FormData) => {
    if (!profile) return;

    setIsLoading(true);
    const { error } = await createMatch({
      title: data.title,
      city: data.city,
      date: data.date,
      time: data.time,
      duration_minutes: parseInt(data.duration),
      level_min: levelMin,
      level_max: levelMax,
      max_players: 4,
      current_players: 0,
      status: 'open',
      creator_id: profile.id,
      club_id: selectedClubId || undefined,
      description: data.description || null,
      is_private: false,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de creer le match');
    } else {
      Alert.alert('Match cree !', 'Ton match a bien ete cree.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Informations du match</Text>

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Titre du match"
              placeholder="Ex: Match du dimanche matin"
              leftIcon="tennisball-outline"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Ville"
              placeholder="Ex: Paris"
              leftIcon="location-outline"
              value={value}
              onChangeText={onChange}
              error={errors.city?.message}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Date"
                  placeholder="AAAA-MM-JJ"
                  leftIcon="calendar-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.date?.message}
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="time"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Heure"
                  placeholder="HH:MM"
                  leftIcon="time-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.time?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="duration"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Duree (minutes)"
              placeholder="90"
              leftIcon="hourglass-outline"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              error={errors.duration?.message}
            />
          )}
        />

        <Text style={styles.sectionTitle}>Niveau requis</Text>

        <Text style={styles.subLabel}>Niveau minimum</Text>
        <LevelSelector value={levelMin} onChange={setLevelMin} />

        <Text style={styles.subLabel}>Niveau maximum</Text>
        <LevelSelector value={levelMax} onChange={setLevelMax} />

        <Text style={styles.sectionTitle}>Details supplementaires</Text>

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description (facultatif)"
              placeholder="Ambiance detendue, venez comme vous etes !"
              leftIcon="chatbubble-outline"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          )}
        />

        <Button
          title="Creer le match"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          size="lg"
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  subLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.grayText,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing['2xl'],
  },
});
