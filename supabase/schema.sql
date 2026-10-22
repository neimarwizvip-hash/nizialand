-- ============================================================================
-- NISIALAND — DATABASE SCHEMA & RLS POLICIES (Supabase / PostgreSQL)
-- Escola Municipal Nísia Vilela Fernandes • Duque de Caxias
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'NISIALAND English Adventure 2026',
  term TEXT NOT NULL DEFAULT '1º Bimestre',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ends_at TIMESTAMPTZ
);

-- 2. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  player_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 10 AND age <= 18),
  class_name TEXT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('blue', 'purple')),
  avatar TEXT NOT NULL DEFAULT '/assets/avatar_mateus.jpg',
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_players_code ON public.players(player_code);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team);
CREATE INDEX IF NOT EXISTS idx_players_class ON public.players(class_name);

-- 3. QUIZ RESULTS TABLE (MISSION 1)
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 1000),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= 10),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 3),
  attempts JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_player_quiz UNIQUE (player_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_player ON public.quiz_results(player_id);
CREATE INDEX IF NOT EXISTS idx_quiz_score ON public.quiz_results(total_score DESC);

-- 4. FLASHCARD RESULTS TABLE (MISSION 2)
CREATE TABLE IF NOT EXISTS public.flashcard_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 500),
  rounds_completed INTEGER NOT NULL CHECK (rounds_completed >= 0 AND rounds_completed <= 5),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 3),
  round_attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_player_flashcard UNIQUE (player_id)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_player ON public.flashcard_results(player_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_score ON public.flashcard_results(total_score DESC);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.teacher_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT 'Prof. Neimar Oliveira'
);

-- ============================================================================
-- LEADERBOARD COMPUTATION VIEW
-- ============================================================================
CREATE OR REPLACE VIEW public.v_leaderboard AS
SELECT
  p.id AS player_id,
  p.display_name,
  p.class_name,
  p.team,
  p.avatar,
  COALESCE(q.total_score, 0) AS quiz_score,
  COALESCE(f.total_score, 0) AS flashcard_score,
  (COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)) AS total_score,
  CASE
    WHEN (COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)) >= 1300 THEN 'gold'
    WHEN (COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)) >= 900 THEN 'silver'
    ELSE 'bronze'
  END AS medal,
  GREATEST(q.completed_at, f.completed_at, p.created_at) AS last_active_at,
  ROW_NUMBER() OVER (
    ORDER BY (COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)) DESC,
    GREATEST(q.completed_at, f.completed_at, p.created_at) ASC
  ) AS rank
FROM public.players p
LEFT JOIN public.quiz_results q ON q.player_id = p.id
LEFT JOIN public.flashcard_results f ON f.player_id = p.id;

-- ============================================================================
-- TEAM COMPARISON VIEW (BLUE TEAM VS PURPLE TEAM)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_team_standings AS
SELECT
  p.team,
  COUNT(p.id) AS players_count,
  SUM(COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)) AS total_points,
  ROUND(AVG(COALESCE(q.total_score, 0) + COALESCE(f.total_score, 0)), 1) AS average_score
FROM public.players p
LEFT JOIN public.quiz_results q ON q.player_id = p.id
LEFT JOIN public.flashcard_results f ON f.player_id = p.id
GROUP BY p.team;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- 1. Public can read leaderboard view & players public fields
CREATE POLICY "Allow public read players" ON public.players
  FOR SELECT USING (true);

-- 2. Public can insert new player registration
CREATE POLICY "Allow public insert player" ON public.players
  FOR INSERT WITH CHECK (true);

-- 3. Public can read results
CREATE POLICY "Allow public read quiz_results" ON public.quiz_results
  FOR SELECT USING (true);

CREATE POLICY "Allow public upsert quiz_results" ON public.quiz_results
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read flashcard_results" ON public.flashcard_results
  FOR SELECT USING (true);

CREATE POLICY "Allow public upsert flashcard_results" ON public.flashcard_results
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read competitions" ON public.competitions
  FOR SELECT USING (true);

CREATE POLICY "Allow insert audit logs" ON public.teacher_audit_logs
  FOR INSERT WITH CHECK (true);
