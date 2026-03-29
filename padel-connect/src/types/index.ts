export type CourtPosition = 'left' | 'right' | 'both';

export type MatchStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';

export type SkillLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  city: string;
  level: SkillLevel;
  preferred_position: CourtPosition;
  bio: string | null;
  avatar_url: string | null;
  matches_played: number;
  matches_won: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string | null;
  logo_url: string | null;
  courts_count: number;
  created_at: string;
}

export interface Match {
  id: string;
  title: string;
  club_id: string;
  club?: Club;
  creator_id: string;
  creator?: Profile;
  city: string;
  date: string;
  time: string;
  duration_minutes: number;
  level_min: SkillLevel;
  level_max: SkillLevel;
  max_players: number;
  current_players: number;
  status: MatchStatus;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  players?: MatchPlayer[];
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  player?: Profile;
  position: CourtPosition;
  joined_at: string;
}

export interface MatchFilters {
  city?: string;
  date?: string;
  time?: string;
  club_id?: string;
  level_min?: SkillLevel;
  level_max?: SkillLevel;
  has_spots?: boolean;
}

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  1: 'Debutant',
  2: 'Debutant+',
  3: 'Intermediaire',
  4: 'Intermediaire+',
  5: 'Avance',
  6: 'Avance+',
  7: 'Expert',
  8: 'Pro',
};

export const POSITION_LABELS: Record<CourtPosition, string> = {
  left: 'Gauche',
  right: 'Droite',
  both: 'Les deux',
};
