// ==============================================================================
// HUNTX SUPABASE CLIENT & REAL-TIME STATE SYNCHRONIZATION ENGINE
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  GameSession,
  GamePlayer,
  UserProfile,
  CaptureRequest,
  CaptureRecord,
  ZoneBoundary,
  ZoneStage,
  CustomGameModePreset,
  AppNotification,
  GameHistoryItem,
} from '../types/huntx';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
);

// Real client instance (if configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// ==============================================================================
// MULTI-CLIENT LOCAL SYNCHRONIZATION ENGINE (For Instant Zero-Config Live Play)
// BroadcastChannel enables real-time inter-tab & device synchronization
// ==============================================================================

const BROADCAST_CHANNEL_NAME = 'HUNTX_REALTIME_BUS_V1';
let bus: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    bus = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment, using localStorage events fallback', e);
  }
}

export interface RealtimeEventPayload {
  type:
    | 'GAME_UPDATE'
    | 'PLAYERS_UPDATE'
    | 'CAPTURE_REQUEST'
    | 'CAPTURE_RESOLVED'
    | 'ZONE_UPDATE'
    | 'EMERGENCY_PAUSE'
    | 'NOTIFICATION';
  gameId: string;
  data: unknown;
  timestamp: number;
}

type EventListener = (payload: RealtimeEventPayload) => void;
const listeners: Set<EventListener> = new Set();

if (bus) {
  bus.onmessage = (event: MessageEvent<RealtimeEventPayload>) => {
    listeners.forEach((fn) => fn(event.data));
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'HUNTX_EVENT_DISPATCH' && event.newValue) {
      try {
        const payload: RealtimeEventPayload = JSON.parse(event.newValue);
        listeners.forEach((fn) => fn(payload));
      } catch {
        // Ignore JSON error
      }
    }
  });
}

export function broadcastGameEvent(
  type: RealtimeEventPayload['type'],
  gameId: string,
  data: unknown
) {
  const payload: RealtimeEventPayload = {
    type,
    gameId,
    data,
    timestamp: Date.now(),
  };

  // Local notify
  listeners.forEach((fn) => fn(payload));

  // Multi-tab broadcast
  if (bus) {
    bus.postMessage(payload);
  }

  // Fallback to storage event for cross-window
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('HUNTX_EVENT_DISPATCH', JSON.stringify(payload));
    } catch {
      // Storage might be full
    }
  }
}

export function subscribeToRealtimeGame(
  gameId: string,
  callback: (payload: RealtimeEventPayload) => void
): () => void {
  const listener: EventListener = (payload) => {
    if (payload.gameId === gameId || payload.gameId === '*') {
      callback(payload);
    }
  };
  listeners.add(listener);

  // If using live Supabase Realtime, also connect to Postgres channel:
  let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
  if (supabase) {
    channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `game_id=eq.${gameId}` },
        (change) => {
          callback({
            type: 'GAME_UPDATE',
            gameId,
            data: change,
            timestamp: Date.now(),
          });
        }
      )
      .subscribe();
  }

  return () => {
    listeners.delete(listener);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
}

// ==============================================================================
// PERSISTENT LOCAL STORAGE STORE (Dual Backend Fallback)
// Ensures full functionality offline and immediately without setup friction
// ==============================================================================

const STORAGE_KEYS = {
  USERS: 'HUNTX_USERS_STORE',
  GAMES: 'HUNTX_GAMES_STORE',
  PLAYERS: 'HUNTX_PLAYERS_STORE',
  CAPTURE_REQUESTS: 'HUNTX_CAPTURE_REQUESTS_STORE',
  CAPTURES: 'HUNTX_CAPTURES_STORE',
  PRESETS: 'HUNTX_PRESETS_STORE',
  HISTORY: 'HUNTX_HISTORY_STORE',
  NOTIFICATIONS: 'HUNTX_NOTIFICATIONS_STORE',
  ACTIVE_USER: 'HUNTX_CURRENT_USER',
};

function readStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function writeStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Failed writing ${key} to localStorage`, err);
  }
}

// INITIAL DEMO PRESETS
const DEFAULT_PRESETS: CustomGameModePreset[] = [
  {
    id: 'preset-classic',
    creator_id: 'system',
    title: 'Standard Hunt 30m',
    description: '30 minute competitive hunt with 60s Runner head-start and 3-stage zone shrink.',
    game_duration_min: 30,
    head_start_sec: 60,
    capture_verification: 'runner_confirmation',
    capture_rule: 'elimination',
    outside_countdown_sec: 30,
    hunter_penalty: 'freeze_60s',
    runner_penalty: 'elimination',
    zone_type: 'circle',
    num_shrink_stages: 3,
  },
  {
    id: 'preset-blitz',
    creator_id: 'system',
    title: 'Esports Blitz 15m',
    description: 'High-intensity 15m match with rapid zone shrinking and instant capture confirmation.',
    game_duration_min: 15,
    head_start_sec: 30,
    capture_verification: 'instant',
    capture_rule: 'team_switch',
    outside_countdown_sec: 15,
    hunter_penalty: 'penalty_point',
    runner_penalty: 'elimination',
    zone_type: 'circle',
    num_shrink_stages: 4,
  },
  {
    id: 'preset-infection',
    creator_id: 'system',
    title: 'Infection Mode',
    description: 'Captured Runners instantly turn into Hunters until no Runners remain!',
    game_duration_min: 25,
    head_start_sec: 45,
    capture_verification: 'runner_confirmation',
    capture_rule: 'team_switch',
    outside_countdown_sec: 20,
    hunter_penalty: 'freeze_60s',
    runner_penalty: 'elimination',
    zone_type: 'polygon',
    num_shrink_stages: 2,
  },
];

export const LocalStore = {
  getUsers: () => readStorage<UserProfile[]>(STORAGE_KEYS.USERS, []),
  saveUsers: (users: UserProfile[]) => writeStorage(STORAGE_KEYS.USERS, users),

  getCurrentUser: () => readStorage<UserProfile | null>(STORAGE_KEYS.ACTIVE_USER, null),
  setCurrentUser: (user: UserProfile | null) => writeStorage(STORAGE_KEYS.ACTIVE_USER, user),

  getGames: () => readStorage<GameSession[]>(STORAGE_KEYS.GAMES, []),
  saveGames: (games: GameSession[]) => writeStorage(STORAGE_KEYS.GAMES, games),

  getGameById: (id: string) => {
    const games = readStorage<GameSession[]>(STORAGE_KEYS.GAMES, []);
    return games.find((g) => g.id === id || g.room_code.toUpperCase() === id.toUpperCase());
  },

  upsertGame: (game: GameSession) => {
    const games = readStorage<GameSession[]>(STORAGE_KEYS.GAMES, []);
    const idx = games.findIndex((g) => g.id === game.id);
    if (idx >= 0) {
      games[idx] = game;
    } else {
      games.push(game);
    }
    writeStorage(STORAGE_KEYS.GAMES, games);
    broadcastGameEvent('GAME_UPDATE', game.id, game);
  },

  getPlayers: (gameId: string) => {
    const all = readStorage<GamePlayer[]>(STORAGE_KEYS.PLAYERS, []);
    return all.filter((p) => p.game_id === gameId);
  },

  savePlayers: (players: GamePlayer[]) => writeStorage(STORAGE_KEYS.PLAYERS, players),

  upsertPlayer: (player: GamePlayer) => {
    const all = readStorage<GamePlayer[]>(STORAGE_KEYS.PLAYERS, []);
    const idx = all.findIndex((p) => p.id === player.id || (p.game_id === player.game_id && p.profile_id === player.profile_id));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...player };
    } else {
      all.push(player);
    }
    writeStorage(STORAGE_KEYS.PLAYERS, all);
    broadcastGameEvent('PLAYERS_UPDATE', player.game_id, all.filter((p) => p.game_id === player.game_id));
  },

  getCaptureRequests: (gameId: string) => {
    const all = readStorage<CaptureRequest[]>(STORAGE_KEYS.CAPTURE_REQUESTS, []);
    return all.filter((r) => r.game_id === gameId);
  },

  upsertCaptureRequest: (req: CaptureRequest) => {
    const all = readStorage<CaptureRequest[]>(STORAGE_KEYS.CAPTURE_REQUESTS, []);
    const idx = all.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      all[idx] = req;
    } else {
      all.push(req);
    }
    writeStorage(STORAGE_KEYS.CAPTURE_REQUESTS, all);
    broadcastGameEvent('CAPTURE_REQUEST', req.game_id, req);
  },

  getCaptures: (gameId: string) => {
    const all = readStorage<CaptureRecord[]>(STORAGE_KEYS.CAPTURES, []);
    return all.filter((c) => c.game_id === gameId);
  },

  addCapture: (record: CaptureRecord) => {
    const all = readStorage<CaptureRecord[]>(STORAGE_KEYS.CAPTURES, []);
    all.unshift(record);
    writeStorage(STORAGE_KEYS.CAPTURES, all);
    broadcastGameEvent('CAPTURE_RESOLVED', record.game_id, record);
  },

  getCustomPresets: () => readStorage<CustomGameModePreset[]>(STORAGE_KEYS.PRESETS, DEFAULT_PRESETS),
  saveCustomPreset: (preset: CustomGameModePreset) => {
    const current = readStorage<CustomGameModePreset[]>(STORAGE_KEYS.PRESETS, DEFAULT_PRESETS);
    current.unshift(preset);
    writeStorage(STORAGE_KEYS.PRESETS, current);
  },

  getHistory: (userId: string) => {
    const all = readStorage<GameHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
    return all.filter((h) => !userId || true);
  },

  addHistory: (item: GameHistoryItem) => {
    const all = readStorage<GameHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
    all.unshift(item);
    writeStorage(STORAGE_KEYS.HISTORY, all);
  },

  getNotifications: () => readStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
  addNotification: (n: AppNotification) => {
    const all = readStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.unshift(n);
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, all.slice(0, 50));
  },
};
