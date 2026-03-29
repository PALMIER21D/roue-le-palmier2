import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';
import { StatCard } from '../../src/components/StatCard';
import { Card } from '../../src/components/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { LEVEL_LABELS, POSITION_LABELS, SkillLevel } from '../../src/types';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from '../../src/lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Deconnexion', 'Es-tu sur de vouloir te deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se deconnecter',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const winRate =
    profile && profile.matches_played > 0
      ? Math.round((profile.matches_won / profile.matches_played) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon profil</Text>
        </View>

        {/* Profile card */}
        <View style={[styles.profileCard, shadows.md]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.grayMedium} />
            </View>
          </View>

          <Text style={styles.name}>{profile?.display_name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.grayText} />
            <Text style={styles.location}>{profile?.city}</Text>
          </View>

          <View style={styles.badgeRow}>
            <Badge
              label={`Niveau ${profile?.level} - ${LEVEL_LABELS[(profile?.level || 3) as SkillLevel]}`}
              variant="green"
              size="md"
            />
            <Badge
              label={POSITION_LABELS[profile?.preferred_position || 'both']}
              variant="blue"
              size="md"
            />
          </View>

          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Statistiques</Text>
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
            label="Taux"
            value={`${winRate}%`}
            icon="stats-chart-outline"
            color={colors.blue}
          />
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Parametres</Text>
        <Card style={styles.settingsCard}>
          <SettingsRow
            icon="person-outline"
            label="Modifier mon profil"
            onPress={() => {}}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
          <SettingsRow
            icon="shield-outline"
            label="Confidentialite"
            onPress={() => {}}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Aide & Support"
            onPress={() => {}}
            isLast
          />
        </Card>

        <Button
          title="Se deconnecter"
          onPress={handleSignOut}
          variant="outline"
          size="lg"
          style={styles.logoutButton}
          textStyle={{ color: colors.red }}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.red} />}
        />

        <Text style={styles.version}>Padel Connect v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}
    >
      <View style={styles.settingsRowLeft}>
        <Ionicons name={icon} size={20} color={colors.grayText} />
        <Text style={styles.settingsRowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.grayMedium} />
    </TouchableOpacity>
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
    paddingBottom: spacing['5xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.green,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.grayText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  settingsCard: {
    padding: 0,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsRowLabel: {
    fontSize: fontSize.md,
    color: colors.black,
  },
  logoutButton: {
    borderColor: colors.red,
    marginBottom: spacing.lg,
  },
  version: {
    fontSize: fontSize.xs,
    color: colors.grayMedium,
    textAlign: 'center',
  },
});
