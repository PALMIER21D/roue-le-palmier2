import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  setUser: (user: any) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  signUp: async (email, password) => {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      set({ user: data.user, isAuthenticated: true });
    }
    return { error };
  },

  signIn: async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile();
    }
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) {
      set({ profile: data as Profile });
    }
  },

  updateProfile: async (profileData) => {
    const { user } = get();
    if (!user) return { error: new Error('Not authenticated') };
    const { error, data } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileData, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (!error && data) {
      set({ profile: data as Profile });
    }
    return { error };
  },
}));
