-- =============================================
-- MIGRATION: Add phone to clubs + 3 Dijon clubs
-- Run this in Supabase SQL Editor if schema.sql was already applied
-- =============================================

-- Add phone column
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS phone TEXT;

-- Insert 3 Dijon clubs
INSERT INTO clubs (name, city, address, phone, description, courts_count) VALUES
  ('Dijon Padel', 'Dijon', 'Allee Jacques Laffite, 21490 Norges-la-Ville', '03 80 35 76 63', 'Club de padel a Norges-la-Ville pres de Dijon.', 6),
  ('UrbanPadel Dijon', 'Dijon', '28 Rue de Cracovie, 21850 Saint-Apollinaire', '07 68 65 56 82', 'Padel urbain a Saint-Apollinaire.', 4),
  ('Padel Park TCD', 'Dijon', '1 Bd Marechal de Lattre de Tassigny, 21000 Dijon', '09 73 88 43 96', 'Padel au coeur de Dijon.', 2);
