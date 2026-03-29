import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Logo } from '../../src/components/Logo';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, fontSize, fontWeight, spacing } from '../../src/lib/theme';

const schema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message || 'Impossible de creer le compte');
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size="md" style={{ marginBottom: spacing['2xl'] }} />
            <Text style={styles.title}>Creer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoins la communaute Padel Connect
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="ton@email.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Mot de passe"
                  placeholder="Minimum 6 caracteres"
                  leftIcon="lock-closed-outline"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirmer le mot de passe"
                  placeholder="Confirme ton mot de passe"
                  leftIcon="lock-closed-outline"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Creer mon compte"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Deja un compte ? </Text>
            <Link href="/auth/login" style={styles.footerLink}>
              Se connecter
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.grayText,
    marginTop: spacing.sm,
  },
  form: {
    marginBottom: spacing['3xl'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.grayText,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.green,
    fontWeight: fontWeight.semibold,
  },
});
