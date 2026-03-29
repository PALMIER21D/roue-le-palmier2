import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { LevelSelector } from '../src/components/LevelSelector';
import { PositionSelector } from '../src/components/PositionSelector';
import { useAuthStore } from '../src/stores/authStore';
import { SkillLevel, CourtPosition } from '../src/types';
import { colors, fontSize, fontWeight, spacing } from '../src/lib/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState<SkillLevel>(3);
  const [position, setPosition] = useState<CourtPosition>('both');
  const [bio, setBio] = useState('');

  const steps = [
    {
      title: 'Comment tu t\'appelles ?',
      subtitle: 'C\'est le nom que les autres joueurs verront.',
    },
    {
      title: 'Ou joues-tu ?',
      subtitle: 'On t\'affichera les matchs pres de chez toi.',
    },
    {
      title: 'Quel est ton niveau ?',
      subtitle: 'Pour te matcher avec des joueurs de ton niveau.',
    },
    {
      title: 'Position preferee ?',
      subtitle: 'Gauche, droite ou les deux ?',
    },
    {
      title: 'Quelques mots sur toi',
      subtitle: 'Facultatif, mais ca aide a se connaitre !',
    },
  ];

  const canContinue = () => {
    if (step === 0) return displayName.trim().length >= 2;
    if (step === 1) return city.trim().length >= 2;
    return true;
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      city: city.trim(),
      level,
      preferred_position: position,
      bio: bio.trim() || null,
      onboarding_completed: true,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder ton profil');
    } else {
      await fetchProfile();
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{steps[step].title}</Text>
          <Text style={styles.subtitle}>{steps[step].subtitle}</Text>

          <View style={styles.inputArea}>
            {step === 0 && (
              <Input
                placeholder="Ton prenom ou pseudo"
                leftIcon="person-outline"
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
              />
            )}

            {step === 1 && (
              <Input
                placeholder="Ex: Paris, Lyon, Marseille..."
                leftIcon="location-outline"
                value={city}
                onChangeText={setCity}
                autoFocus
              />
            )}

            {step === 2 && (
              <LevelSelector value={level} onChange={setLevel} />
            )}

            {step === 3 && (
              <PositionSelector value={position} onChange={setPosition} />
            )}

            {step === 4 && (
              <Input
                placeholder="Joueur passionne, dispo le weekend..."
                leftIcon="chatbubble-outline"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
                autoFocus
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {step > 0 && (
            <Button
              title="Retour"
              onPress={() => setStep(step - 1)}
              variant="outline"
              style={{ flex: 1, marginRight: spacing.md }}
            />
          )}
          <Button
            title={step === steps.length - 1 ? 'Terminer' : 'Continuer'}
            onPress={handleNext}
            disabled={!canContinue()}
            isLoading={isLoading}
            size="lg"
            style={{ flex: step > 0 ? 1 : undefined }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['4xl'],
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayBorder,
  },
  progressDotActive: {
    backgroundColor: colors.green,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.grayText,
    marginBottom: spacing['3xl'],
    lineHeight: 24,
  },
  inputArea: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing['2xl'],
  },
});
