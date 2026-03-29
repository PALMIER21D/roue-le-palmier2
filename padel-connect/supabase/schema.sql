-- =============================================
-- PADEL CONNECT - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  level SMALLINT NOT NULL DEFAULT 3 CHECK (level >= 1 AND level <= 8),
  preferred_position TEXT NOT NULL DEFAULT 'both' CHECK (preferred_position IN ('left', 'right', 'both')),
  bio TEXT,
  avatar_url TEXT,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- CLUBS TABLE
-- =============================================
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT,
  description TEXT,
  logo_url TEXT,
  courts_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MATCHES TABLE
-- =============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  level_min SMALLINT NOT NULL DEFAULT 1 CHECK (level_min >= 1 AND level_min <= 8),
  level_max SMALLINT NOT NULL DEFAULT 8 CHECK (level_max >= 1 AND level_max <= 8),
  max_players INTEGER NOT NULL DEFAULT 4,
  current_players INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MATCH PLAYERS TABLE
-- =============================================
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position TEXT NOT NULL DEFAULT 'both' CHECK (position IN ('left', 'right', 'both')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, player_id)
);

-- =============================================
-- RPC FUNCTIONS
-- =============================================

-- Increment match player count
CREATE OR REPLACE FUNCTION increment_match_players(match_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE matches
  SET current_players = current_players + 1,
      status = CASE WHEN current_players + 1 >= max_players THEN 'full' ELSE 'open' END
  WHERE id = match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement match player count
CREATE OR REPLACE FUNCTION decrement_match_players(match_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE matches
  SET current_players = GREATEST(current_players - 1, 0),
      status = 'open'
  WHERE id = match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs: everyone can read
CREATE POLICY "Clubs are viewable by everyone" ON clubs
  FOR SELECT USING (true);

-- Matches: everyone can read, authenticated can create
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = creator_id);

-- Match players: everyone can read, authenticated can join/leave
CREATE POLICY "Match players are viewable by everyone" ON match_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join matches" ON match_players
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can leave matches" ON match_players
  FOR DELETE USING (auth.uid() = player_id);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_matches_city ON matches(city);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_creator ON matches(creator_id);
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_match_players_player ON match_players(player_id);
CREATE INDEX idx_profiles_city ON profiles(city);

-- =============================================
-- SEED DATA - Sample clubs
-- =============================================
INSERT INTO clubs (name, city, address, phone, description, courts_count) VALUES
  ('Padel Club Paris', 'Paris', '12 Rue du Sport, 75015 Paris', NULL, 'Le premier club de padel parisien.', 6),
  ('Lyon Padel Arena', 'Lyon', '45 Avenue Jean Jaures, 69007 Lyon', NULL, 'Centre premium de padel a Lyon.', 4),
  ('Marseille Padel Center', 'Marseille', '8 Boulevard du Littoral, 13008 Marseille', NULL, 'Padel face a la mer.', 5),
  ('Toulouse Padel Club', 'Toulouse', '23 Rue de la Republique, 31000 Toulouse', NULL, 'Le padel au coeur de Toulouse.', 3),
  ('Bordeaux Padel', 'Bordeaux', '67 Cours de la Marne, 33000 Bordeaux', NULL, 'Padel et convivialite a Bordeaux.', 4),
  ('Nice Padel', 'Nice', '15 Promenade des Anglais, 06000 Nice', NULL, 'Padel sur la Cote d''Azur.', 3),
  ('Lille Padel Club', 'Lille', '34 Rue Faidherbe, 59000 Lille', NULL, 'Le padel dans le Nord.', 3),
  ('Nantes Padel Arena', 'Nantes', '56 Quai de la Fosse, 44000 Nantes', NULL, 'Padel a Nantes.', 4),
  ('Dijon Padel', 'Dijon', 'Allee Jacques Laffite, 21490 Norges-la-Ville', '03 80 35 76 63', 'Club de padel a Norges-la-Ville pres de Dijon.', 6),
  ('UrbanPadel Dijon', 'Dijon', '28 Rue de Cracovie, 21850 Saint-Apollinaire', '07 68 65 56 82', 'Padel urbain a Saint-Apollinaire.', 4),
  ('Padel Park TCD', 'Dijon', '1 Bd Marechal de Lattre de Tassigny, 21000 Dijon', '09 73 88 43 96', 'Padel au coeur de Dijon.', 2);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;
