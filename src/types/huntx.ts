// ==============================================================================
// HUNTX DOMAIN TYPES & INTERFACES
// ==============================================================================

export type GameRole = 'host' | 'co-host' | 'hunter' | 'runner' | 'spectator';
export type GameTeam = 'hunters' | 'runners' | 'spectators';
export type GameStatus = 'lobby' | 'countdown' | 'headstart' | 'active' | 'paused' | 'finished';
export type GameModeType = 'classic' | 'survival' | 'mission' | 'custom';

export type CaptureVerificationMode = 'runner_confirmation' | 'host_approval' | 'instant';
export type CaptureRuleType = 'elimination' | 'team_switch' | 'waiting_area' | 'custom';
export type OutsidePenaltyType = 'penalty_point' | 'freeze_60s' | 'elimination' | 'warning_only';

export interface UserProfile {
  id: string;
  user_id?: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_guest: boolean;
  guest_expires_at?: string;
  games_played: number;
  games_won: number;
  total_captures: number;
  total_escapes: number;
  created_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ZoneBoundary {
  id: string;
  game_id: string;
  zone_type: 'circle' | 'polygon';
  center: LatLng;
  initial_radius_meters: number;
  current_radius_meters: number;
  initial_polygon?: LatLng[];
  current_polygon?: LatLng[];
}

export interface ZoneStage {
  id: string;
  stage_number: number;
  start_offset_seconds: number; // e.g. 300s into match
  shrink_duration_seconds: number; // e.g. 60s
  target_radius_ratio: number; // e.g. 0.7 = 70% of previous
  target_radius_meters?: number;
  target_polygon?: LatLng[];
  is_completed?: boolean;
}

export interface GameSettings {
  capture_verification: CaptureVerificationMode;
  capture_rule: CaptureRuleType;
  outside_countdown_seconds: number;
  hunter_penalty: OutsidePenaltyType;
  runner_penalty: OutsidePenaltyType;
  location_sharing_enabled: boolean;
  team_location_visibility: 'team_only' | 'all' | 'none';
  custom_rules_text?: string;
  zone_shrink_stages_enabled: boolean;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  profile_id: string;
  display_name: string;
  role: GameRole;
  team: GameTeam;
  is_ready: boolean;
  is_active: boolean;
  is_captured: boolean;
  captured_at?: string;
  captured_by_id?: string;
  captured_by_name?: string;
  qr_token: string;
  current_lat?: number;
  current_lng?: number;
  location_shared: boolean;
  is_outside_zone: boolean;
  outside_since?: string;
  outside_countdown_remaining?: number;
  penalty_points: number;
  is_frozen?: boolean;
  frozen_until?: string;
  last_ping: string;
}

export interface GameSession {
  id: string;
  room_code: string;
  name: string;
  host_id: string;
  host_name: string;
  game_mode: GameModeType;
  status: GameStatus;
  max_players: number;
  head_start_duration: number; // seconds
  game_duration: number; // seconds
  countdown_start_time?: string;
  game_start_time?: string;
  game_end_time?: string;
  winning_team?: GameTeam | 'draw';
  is_emergency_paused: boolean;
  settings: GameSettings;
  zone?: ZoneBoundary;
  stages: ZoneStage[];
  current_stage_index: number;
  created_at: string;
}

export interface CaptureRequest {
  id: string;
  game_id: string;
  hunter_player_id: string;
  hunter_name: string;
  runner_player_id: string;
  runner_name: string;
  verification_mode: CaptureVerificationMode;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
}

export interface CaptureRecord {
  id: string;
  game_id: string;
  hunter_id: string;
  hunter_name: string;
  runner_id: string;
  runner_name: string;
  capture_time: string;
  capture_rule_applied: CaptureRuleType;
  points_awarded: number;
  lat?: number;
  lng?: number;
}

export interface GameObjective {
  id: string;
  game_id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  radius_meters: number;
  points: number;
  is_completed: boolean;
  completed_by_name?: string;
}

export interface CustomGameModePreset {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  game_duration_min: number;
  head_start_sec: number;
  capture_verification: CaptureVerificationMode;
  capture_rule: CaptureRuleType;
  outside_countdown_sec: number;
  hunter_penalty: OutsidePenaltyType;
  runner_penalty: OutsidePenaltyType;
  zone_type: 'circle' | 'polygon';
  num_shrink_stages: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'capture' | 'zone' | 'info' | 'success';
  created_at: string;
  read: boolean;
}

export interface GameHistoryItem {
  id: string;
  game_id: string;
  game_name: string;
  date: string;
  role: GameRole;
  team: GameTeam;
  won: boolean;
  captures: number;
  survival_duration_sec: number;
  zone_violations: number;
  final_score: number;
}
