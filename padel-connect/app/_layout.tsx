import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const { initialize, setUser } = useAuthStore();

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="match/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Detail du match',
            headerBackTitle: 'Retour',
          }}
        />
        <Stack.Screen
          name="match/create"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Creer un match',
          }}
        />
      </Stack>
    </>
  );
}
