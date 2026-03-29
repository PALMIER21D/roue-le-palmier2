import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Match, MatchFilters } from '../types';

interface MatchState {
  matches: Match[];
  myMatches: Match[];
  upcomingMatches: Match[];
  isLoading: boolean;
  filters: MatchFilters;
  fetchMatches: (filters?: MatchFilters) => Promise<void>;
  fetchMyMatches: (userId: string) => Promise<void>;
  fetchUpcomingMatches: (userId: string) => Promise<void>;
  createMatch: (match: Partial<Match>) => Promise<{ error: any; data: Match | null }>;
  joinMatch: (matchId: string, userId: string, position: string) => Promise<{ error: any }>;
  leaveMatch: (matchId: string, userId: string) => Promise<{ error: any }>;
  setFilters: (filters: MatchFilters) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  myMatches: [],
  upcomingMatches: [],
  isLoading: false,
  filters: {},

  setFilters: (filters) => set({ filters }),

  fetchMatches: async (filters) => {
    set({ isLoading: true });
    try {
      let query = supabase
        .from('matches')
        .select('*, club:clubs(*), creator:profiles!creator_id(*)')
        .eq('status', 'open')
        .order('date', { ascending: true });

      const f = filters || get().filters;
      if (f.city) query = query.ilike('city', `%${f.city}%`);
      if (f.date) query = query.eq('date', f.date);
      if (f.club_id) query = query.eq('club_id', f.club_id);
      if (f.level_min) query = query.gte('level_min', f.level_min);
      if (f.level_max) query = query.lte('level_max', f.level_max);
      if (f.has_spots) query = query.lt('current_players', 4);

      const { data } = await query;
      set({ matches: (data as Match[]) || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyMatches: async (userId) => {
    const { data } = await supabase
      .from('match_players')
      .select('match:matches(*, club:clubs(*))')
      .eq('player_id', userId);

    const matches = data?.map((mp: any) => mp.match).filter(Boolean) || [];
    set({ myMatches: matches as Match[] });
  },

  fetchUpcomingMatches: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('match_players')
      .select('match:matches(*, club:clubs(*))')
      .eq('player_id', userId)
      .gte('match.date', today);

    const matches = data?.map((mp: any) => mp.match).filter(Boolean) || [];
    set({ upcomingMatches: matches as Match[] });
  },

  createMatch: async (matchData) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select('*, club:clubs(*)')
      .single();

    if (!error && data) {
      // Auto-join creator
      await supabase.from('match_players').insert({
        match_id: data.id,
        player_id: matchData.creator_id,
        position: 'both',
      });
      await supabase
        .from('matches')
        .update({ current_players: 1 })
        .eq('id', data.id);
    }
    return { error, data: data as Match | null };
  },

  joinMatch: async (matchId, userId, position) => {
    const { error } = await supabase.from('match_players').insert({
      match_id: matchId,
      player_id: userId,
      position,
    });

    if (!error) {
      await supabase.rpc('increment_match_players', { match_id: matchId });
    }
    return { error };
  },

  leaveMatch: async (matchId, userId) => {
    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', userId);

    if (!error) {
      await supabase.rpc('decrement_match_players', { match_id: matchId });
    }
    return { error };
  },
}));
