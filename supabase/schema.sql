-- ==============================================================================
-- HUNTX PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase)
-- THE ULTIMATE OUTDOOR HUNT — Multiplayer Hunters vs Runners Engine
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users or guest identities)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_guest BOOLEAN DEFAULT FALSE,
    guest_expires_at TIMESTAMPTZ,
    games_played INT DEFAULT 0,
    games_won INT DEFAULT 0,
    total_captures INT DEFAULT 0,
    total_escapes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(8) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_mode VARCHAR(40) DEFAULT 'classic', -- 'classic', 'survival', 'mission', 'custom'
    status VARCHAR(30) DEFAULT 'lobby', -- 'lobby', 'countdown', 'headstart', 'active', 'paused', 'finished'
    max_players INT DEFAULT 30,
    head_start_duration INT DEFAULT 60, -- seconds
    game_duration INT DEFAULT 1800, -- 30 minutes in seconds
    countdown_start_time TIMESTAMPTZ,
    game_start_time TIMESTAMPTZ,
    game_end_time TIMESTAMPTZ,
    winning_team VARCHAR(20), -- 'hunters', 'runners', 'draw'
    is_emergency_paused BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAME SETTINGS
CREATE TABLE IF NOT EXISTS public.game_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE UNIQUE,
    capture_verification VARCHAR(40) DEFAULT 'runner_confirmation', -- 'runner_confirmation', 'host_approval', 'instant'
    capture_rule VARCHAR(40) DEFAULT 'elimination', -- 'elimination', 'team_switch', 'waiting_area', 'custom'
    outside_countdown_seconds INT DEFAULT 30,
    hunter_penalty VARCHAR(40) DEFAULT 'freeze_60s', -- 'penalty_point', 'freeze_60s', 'elimination'
    runner_penalty VARCHAR(40) DEFAULT 'elimination',
    location_sharing_enabled BOOLEAN DEFAULT TRUE,
    team_location_visibility VARCHAR(40) DEFAULT 'team_only', -- 'team_only', 'all', 'none'
    custom_rules_text TEXT,
    zone_shrink_stages_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GAME PLAYERS & TEAMS
CREATE TABLE IF NOT EXISTS public.game_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'runner', -- 'host', 'co-host', 'hunter', 'runner', 'spectator'
    team VARCHAR(30) DEFAULT 'runners', -- 'hunters', 'runners', 'spectators'
    is_ready BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_captured BOOLEAN DEFAULT FALSE,
    captured_at TIMESTAMPTZ,
    captured_by UUID REFERENCES public.profiles(id),
    qr_token TEXT NOT NULL,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    location_shared BOOLEAN DEFAULT FALSE,
    is_outside_zone BOOLEAN DEFAULT FALSE,
    outside_since TIMESTAMPTZ,
    penalty_points INT DEFAULT 0,
    frozen_until TIMESTAMPTZ,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, profile_id)
);

-- 5. ZONE BOUNDARIES
CREATE TABLE IF NOT EXISTS public.zone_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE UNIQUE,
    zone_type VARCHAR(20) DEFAULT 'circle', -- 'circle', 'polygon'
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    initial_radius_meters DOUBLE PRECISION DEFAULT 500,
    current_radius_meters DOUBLE PRECISION DEFAULT 500,
    initial_polygon_coords JSONB, -- Array of [lat, lng]
    current_polygon_coords JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ZONE SHRINKING STAGES
CREATE TABLE IF NOT EXISTS public.zone_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    stage_number INT NOT NULL,
    start_offset_seconds INT NOT NULL, -- Offset from game start when shrink begins
    shrink_duration_seconds INT NOT NULL DEFAULT 120,
    target_radius_meters DOUBLE PRECISION,
    target_radius_ratio DOUBLE PRECISION DEFAULT 0.7, -- 70% of previous
    target_polygon_coords JSONB,
    warning_offset_seconds INT DEFAULT 60, -- Time before stage to send audio/visual warning
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, stage_number)
);

-- 7. QR TOKENS & VERIFICATION
CREATE TABLE IF NOT EXISTS public.qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CAPTURE REQUESTS
CREATE TABLE IF NOT EXISTS public.capture_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    hunter_player_id UUID NOT NULL REFERENCES public.game_players(id),
    runner_player_id UUID NOT NULL REFERENCES public.game_players(id),
    verification_mode VARCHAR(40) NOT NULL, -- 'runner_confirmation', 'host_approval', 'instant'
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id)
);

-- 9. CAPTURES LOG
CREATE TABLE IF NOT EXISTS public.captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    hunter_id UUID NOT NULL REFERENCES public.profiles(id),
    runner_id UUID NOT NULL REFERENCES public.profiles(id),
    capture_time TIMESTAMPTZ DEFAULT NOW(),
    capture_location_lat DOUBLE PRECISION,
    capture_location_lng DOUBLE PRECISION,
    capture_rule_applied VARCHAR(40),
    points_awarded INT DEFAULT 100
);

-- 10. ZONE VIOLATIONS
CREATE TABLE IF NOT EXISTS public.zone_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.game_players(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT,
    penalty_applied VARCHAR(50)
);

-- 11. GAME OBJECTIVES (Mission Mode)
CREATE TABLE IF NOT EXISTS public.game_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION DEFAULT 20,
    points INT DEFAULT 50,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by UUID REFERENCES public.profiles(id),
    completed_at TIMESTAMPTZ
);

-- 12. CUSTOM GAME MODES PRESETS
CREATE TABLE IF NOT EXISTS public.custom_game_modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.profiles(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info', -- 'alert', 'warning', 'capture', 'zone', 'info'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. GAME HISTORY & PLAYER STATS
CREATE TABLE IF NOT EXISTS public.game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL,
    team VARCHAR(30) NOT NULL,
    won BOOLEAN DEFAULT FALSE,
    captures INT DEFAULT 0,
    survival_seconds INT DEFAULT 0,
    zone_violations INT DEFAULT 0,
    final_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_games_room_code ON public.games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON public.game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_profile_id ON public.game_players(profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON public.qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_capture_requests_game_status ON public.capture_requests(game_id, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capture_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_stages ENABLE ROW LEVEL SECURITY;

-- Allow public read of games and profiles for game lobbies and live scoring
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR is_guest = true);

CREATE POLICY "Public read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Hosts can insert/update games" ON public.games FOR ALL USING (true);

CREATE POLICY "Public read game_players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Players can update own status" ON public.game_players FOR ALL USING (true);

CREATE POLICY "Public read zone_boundaries" ON public.zone_boundaries FOR SELECT USING (true);
CREATE POLICY "Public read capture_requests" ON public.capture_requests FOR ALL USING (true);

-- REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.capture_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_boundaries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
