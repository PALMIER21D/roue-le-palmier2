import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { Logo } from '../src/components/Logo';
import { colors, spacing } from '../src/lib/theme';

export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated, profile } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
    } else if (!profile?.onboarding_completed) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated, profile]);

  return (
    <View style={styles.container}>
      <Logo size="lg" />
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginTop: spacing['3xl'] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
