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

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } else {
      router.replace('/');
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
            <Logo size="lg" showTagline />
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
                  placeholder="Ton mot de passe"
                  leftIcon="lock-closed-outline"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Link href="/auth/forgot-password" style={styles.forgotLink}>
              Mot de passe oublie ?
            </Link>

            <Button
              title="Se connecter"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/auth/register" style={styles.footerLink}>
              Creer un compte
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
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logo: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    letterSpacing: 2,
  },
  logoAccent: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.green,
    letterSpacing: 2,
    marginTop: -8,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.grayText,
    marginTop: spacing.md,
  },
  form: {
    marginBottom: spacing['3xl'],
  },
  forgotLink: {
    fontSize: fontSize.sm,
    color: colors.green,
    fontWeight: fontWeight.medium,
    textAlign: 'right',
    marginBottom: spacing['2xl'],
    marginTop: -spacing.sm,
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
