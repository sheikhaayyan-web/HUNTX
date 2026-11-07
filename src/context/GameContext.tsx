// ==============================================================================
// HUNTX GAME CONTEXT & REALTIME STATE MANAGER
// Orchestrates Lobbies, Teams, QR Captures, Dynamic Zones, & Match Execution
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  GameSession,
  GamePlayer,
  GameRole,
  GameTeam,
  GameStatus,
  GameModeType,
  CaptureRequest,
  CaptureRecord,
  ZoneBoundary,
  ZoneStage,
  CustomGameModePreset,
  AppNotification,
  LatLng,
} from '../types/huntx';
import { LocalStore, broadcastGameEvent, subscribeToRealtimeGame } from '../services/supabase';
import { useAuth } from './AuthContext';
import { sounds } from '../utils/sound';
import {
  evaluateDynamicZone,
  isPlayerInsideZone,
  shrinkPolygonTowardsCentroid,
} from '../utils/geo';

interface GameContextType {
  activeGame: GameSession | null;
  players: GamePlayer[];
  myPlayer: GamePlayer | null;
  captureRequests: CaptureRequest[];
  captures: CaptureRecord[];
  notifications: AppNotification[];
  isHost: boolean;
  isCoHost: boolean;
  currentRole: GameRole | null;
  currentTeam: GameTeam | null;
  // Match state
  elapsedSeconds: number;
  remainingSeconds: number;
  headStartRemaining: number;
  huntersReleased: boolean;
  isOutsideSafeZone: boolean;
  outsideSecondsRemaining: number;
  currentZoneRadius: number;
  currentZonePolygon?: LatLng[];
  isZoneShrinkingNow: boolean;
  zoneNotice: string;
  nextShrinkCountdown: number;

  // Actions
  createNewGame: (name: string, mode: GameModeType, preset?: CustomGameModePreset) => Promise<GameSession>;
  joinGameWithCode: (roomCode: string) => Promise<{ success: boolean; error?: string }>;
  leaveGame: () => void;
  assignTeam: (playerId: string, team: GameTeam) => void;
  assignRole: (playerId: string, role: GameRole) => void;
  autoBalanceTeams: () => void;
  togglePlayerReady: () => void;
  startGameCountdown: () => void;
  emergencyPauseGame: () => void;
  resumeGame: () => void;
  endGame: (winningTeam?: GameTeam | 'draw') => void;
  updateZoneBoundary: (zone: ZoneBoundary) => void;
  updateZoneStages: (stages: ZoneStage[]) => void;
  updatePlayerLocation: (lat: number, lng: number) => void;
  toggleLocationSharing: (enabled: boolean) => void;

  // Capture workflow
  submitCaptureScan: (qrToken: string) => Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }>;
  respondToCaptureRequest: (requestId: string, approve: boolean) => void;
  dismissNotification: (id: string) => void;
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Generate 6-letter room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate unique runner QR token
function generateQRToken(gameId: string, profileId: string): string {
  return `HUNTX:${gameId.substring(0, 8)}:${profileId.substring(0, 6)}:${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [captureRequests, setCaptureRequests] = useState<CaptureRequest[]>([]);
  const [captures, setCaptures] = useState<CaptureRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Real-time timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [headStartRemaining, setHeadStartRemaining] = useState<number>(0);
  const [huntersReleased, setHuntersReleased] = useState<boolean>(false);

  // Outside zone countdown
  const [isOutsideSafeZone, setIsOutsideSafeZone] = useState<boolean>(false);
  const [outsideSecondsRemaining, setOutsideSecondsRemaining] = useState<number>(30);

  // Dynamic zone math
  const [currentZoneRadius, setCurrentZoneRadius] = useState<number>(500);
  const [currentZonePolygon, setCurrentZonePolygon] = useState<LatLng[] | undefined>();
  const [isZoneShrinkingNow, setIsZoneShrinkingNow] = useState<boolean>(false);
  const [zoneNotice, setZoneNotice] = useState<string>('Safe zone established');
  const [nextShrinkCountdown, setNextShrinkCountdown] = useState<number>(0);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync myPlayer
  const myPlayer = players.find((p) => p.profile_id === currentUser?.id) || null;
  const isHost = activeGame?.host_id === currentUser?.id;
  const isCoHost = myPlayer?.role === 'co-host';
  const currentRole = myPlayer?.role || null;
  const currentTeam = myPlayer?.team || null;

  // Realtime subscription when game changes
  useEffect(() => {
    if (!activeGame) return;

    const unsubscribe = subscribeToRealtimeGame(activeGame.id, (event) => {
      if (event.type === 'GAME_UPDATE') {
        const updated = LocalStore.getGameById(activeGame.id);
        if (updated) setActiveGame(updated);
      } else if (event.type === 'PLAYERS_UPDATE') {
        const updatedPlayers = LocalStore.getPlayers(activeGame.id);
        setPlayers(updatedPlayers);
      } else if (event.type === 'CAPTURE_REQUEST') {
        const reqs = LocalStore.getCaptureRequests(activeGame.id);
        setCaptureRequests(reqs);
      } else if (event.type === 'CAPTURE_RESOLVED') {
        const caps = LocalStore.getCaptures(activeGame.id);
        setCaptures(caps);
        const updatedPlayers = LocalStore.getPlayers(activeGame.id);
        setPlayers(updatedPlayers);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeGame?.id]);

  // Main game tick timer
  useEffect(() => {
    if (!activeGame || activeGame.status === 'lobby' || activeGame.status === 'finished') {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      return;
    }

    if (activeGame.is_emergency_paused) {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      return;
    }

    gameTimerRef.current = setInterval(() => {
      // Calculate true elapsed time from start timestamp
      const startTime = activeGame.game_start_time ? new Date(activeGame.game_start_time).getTime() : Date.now();
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(elapsed);

      // Remaining match time
      const rem = Math.max(0, activeGame.game_duration - elapsed);
      setRemainingSeconds(rem);

      // Head-start calculations
      const headStartRem = Math.max(0, activeGame.head_start_duration - elapsed);
      setHeadStartRemaining(headStartRem);
      const huntersUncaged = elapsed >= activeGame.head_start_duration;
      setHuntersReleased(huntersUncaged);

      // Dynamic zone geometry evaluation
      if (activeGame.zone) {
        const zoneState = evaluateDynamicZone(activeGame.zone, activeGame.stages, elapsed);
        setCurrentZoneRadius(zoneState.currentRadiusMeters);
        setCurrentZonePolygon(zoneState.currentPolygon);
        setIsZoneShrinkingNow(zoneState.isShrinkingNow);
        setZoneNotice(zoneState.stageNotice);
        setNextShrinkCountdown(zoneState.nextStageSecondsRemaining);
      }

      // Check for match automatic timeout ending
      if (rem === 0 && activeGame.status === 'active') {
        endGame('runners'); // If time runs out, runners survive!
      }
    }, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [activeGame?.status, activeGame?.is_emergency_paused, activeGame?.game_start_time]);

  // Outside zone countdown tracker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOutsideSafeZone && activeGame?.status === 'active') {
      interval = setInterval(() => {
        setOutsideSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Apply outside penalty!
            sounds.playZoneWarningSound();
            applyOutsidePenalty();
            return 0;
          }
          sounds.playCountdownTick(prev <= 5);
          return prev - 1;
        });
      }, 1000);
    } else {
      setOutsideSecondsRemaining(activeGame?.settings.outside_countdown_seconds || 30);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOutsideSafeZone, activeGame?.status]);

  const applyOutsidePenalty = () => {
    if (!myPlayer || !activeGame) return;
    const penalty = myPlayer.team === 'hunters' ? activeGame.settings.hunter_penalty : activeGame.settings.runner_penalty;

    addNotification(
      'PENALTY APPLIED!',
      `Out of safe zone too long: ${penalty.replace('_', ' ').toUpperCase()}`,
      'alert'
    );

    if (penalty === 'elimination') {
      const updatedPlayer: GamePlayer = {
        ...myPlayer,
        is_captured: true,
        is_active: false,
        captured_at: new Date().toISOString(),
      };
      LocalStore.upsertPlayer(updatedPlayer);
    } else if (penalty === 'freeze_60s') {
      const updatedPlayer: GamePlayer = {
        ...myPlayer,
        is_frozen: true,
        frozen_until: new Date(Date.now() + 60000).toISOString(),
      };
      LocalStore.upsertPlayer(updatedPlayer);
    } else {
      const updatedPlayer: GamePlayer = {
        ...myPlayer,
        penalty_points: myPlayer.penalty_points + 100,
      };
      LocalStore.upsertPlayer(updatedPlayer);
    }
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const item: AppNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      created_at: new Date().toLocaleTimeString(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 10));
    LocalStore.addNotification(item);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 1. Create New Game
  const createNewGame = async (
    name: string,
    mode: GameModeType,
    preset?: CustomGameModePreset
  ): Promise<GameSession> => {
    if (!currentUser) throw new Error('Must be logged in to create a game');
    if (currentUser.is_guest) throw new Error('Guest accounts cannot host games. Please register an account.');

    const gameId = 'game_' + Math.random().toString(36).substring(2, 9);
    const roomCode = generateRoomCode();

    // Default zone: central park / default coordinates
    const defaultCenter: LatLng = { lat: 40.785091, lng: -73.968285 }; // Example landmark
    const defaultZone: ZoneBoundary = {
      id: 'zone_' + gameId,
      game_id: gameId,
      zone_type: preset?.zone_type || 'circle',
      center: defaultCenter,
      initial_radius_meters: 600,
      current_radius_meters: 600,
      initial_polygon: [
        { lat: defaultCenter.lat + 0.005, lng: defaultCenter.lng - 0.005 },
        { lat: defaultCenter.lat + 0.005, lng: defaultCenter.lng + 0.005 },
        { lat: defaultCenter.lat - 0.005, lng: defaultCenter.lng + 0.005 },
        { lat: defaultCenter.lat - 0.005, lng: defaultCenter.lng - 0.005 },
      ],
    };

    // Default 3 stages
    const defaultStages: ZoneStage[] = [
      {
        id: 'stg_1',
        stage_number: 1,
        start_offset_seconds: 300, // 5 min
        shrink_duration_seconds: 60,
        target_radius_ratio: 0.75,
      },
      {
        id: 'stg_2',
        stage_number: 2,
        start_offset_seconds: 600, // 10 min
        shrink_duration_seconds: 60,
        target_radius_ratio: 0.5,
      },
      {
        id: 'stg_3',
        stage_number: 3,
        start_offset_seconds: 900, // 15 min
        shrink_duration_seconds: 90,
        target_radius_ratio: 0.25,
      },
    ];

    const newGame: GameSession = {
      id: gameId,
      room_code: roomCode,
      name: name.trim() || 'HUNTX ESPORTS ARENA',
      host_id: currentUser.id,
      host_name: currentUser.display_name,
      game_mode: mode,
      status: 'lobby',
      max_players: 30,
      head_start_duration: preset ? preset.head_start_sec : 60,
      game_duration: preset ? preset.game_duration_min * 60 : 1800,
      is_emergency_paused: false,
      settings: {
        capture_verification: preset ? preset.capture_verification : 'runner_confirmation',
        capture_rule: preset ? preset.capture_rule : 'elimination',
        outside_countdown_seconds: preset ? preset.outside_countdown_sec : 30,
        hunter_penalty: preset ? preset.hunter_penalty : 'freeze_60s',
        runner_penalty: preset ? preset.runner_penalty : 'elimination',
        location_sharing_enabled: true,
        team_location_visibility: 'team_only',
        zone_shrink_stages_enabled: true,
      },
      zone: defaultZone,
      stages: defaultStages,
      current_stage_index: 0,
      created_at: new Date().toISOString(),
    };

    // Add Host as initial player
    const hostPlayer: GamePlayer = {
      id: 'plr_' + Math.random().toString(36).substring(2, 9),
      game_id: gameId,
      profile_id: currentUser.id,
      display_name: currentUser.display_name,
      role: 'host',
      team: 'hunters',
      is_ready: true,
      is_active: true,
      is_captured: false,
      qr_token: generateQRToken(gameId, currentUser.id),
      location_shared: true,
      is_outside_zone: false,
      penalty_points: 0,
      last_ping: new Date().toISOString(),
    };

    LocalStore.upsertGame(newGame);
    LocalStore.upsertPlayer(hostPlayer);

    setActiveGame(newGame);
    setPlayers([hostPlayer]);
    sounds.playTapSound();
    return newGame;
  };

  // 2. Join Game with Room Code
  const joinGameWithCode = async (
    roomCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'User must be authenticated' };

    const targetGame = LocalStore.getGameById(roomCode.trim().toUpperCase());
    if (!targetGame) {
      return { success: false, error: 'Room code not found. Verify the code and try again.' };
    }

    if (targetGame.status === 'finished') {
      return { success: false, error: 'This game has already finished.' };
    }

    // Check existing players
    const currentList = LocalStore.getPlayers(targetGame.id);
    let player = currentList.find((p) => p.profile_id === currentUser.id);

    if (!player) {
      // Auto-assign: Hunters vs Runners balance
      const huntersCount = currentList.filter((p) => p.team === 'hunters').length;
      const runnersCount = currentList.filter((p) => p.team === 'runners').length;
      const assignedTeam: GameTeam = runnersCount <= huntersCount ? 'runners' : 'hunters';
      const assignedRole: GameRole = assignedTeam === 'runners' ? 'runner' : 'hunter';

      player = {
        id: 'plr_' + Math.random().toString(36).substring(2, 9),
        game_id: targetGame.id,
        profile_id: currentUser.id,
        display_name: currentUser.display_name,
        role: assignedRole,
        team: assignedTeam,
        is_ready: false,
        is_active: true,
        is_captured: false,
        qr_token: generateQRToken(targetGame.id, currentUser.id),
        location_shared: false,
        is_outside_zone: false,
        penalty_points: 0,
        last_ping: new Date().toISOString(),
      };
      LocalStore.upsertPlayer(player);
    }

    setActiveGame(targetGame);
    const updatedPlayers = LocalStore.getPlayers(targetGame.id);
    setPlayers(updatedPlayers);
    addNotification('ROOM JOINED', `Connected to lobby: ${targetGame.name}`, 'info');
    sounds.playTapSound();
    return { success: true };
  };

  const leaveGame = () => {
    if (myPlayer && activeGame) {
      const remaining = players.filter((p) => p.id !== myPlayer.id);
      LocalStore.savePlayers(remaining);
      broadcastGameEvent('PLAYERS_UPDATE', activeGame.id, remaining);
    }
    setActiveGame(null);
    setPlayers([]);
    setCaptureRequests([]);
  };

  // 3. Team & Role Management
  const assignTeam = (playerId: string, team: GameTeam) => {
    if (activeGame?.status !== 'lobby' && !activeGame?.is_emergency_paused) {
      addNotification('LOCKED', 'Teams are locked during active gameplay.', 'warning');
      return;
    }
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    const newRole: GameRole = team === 'hunters' ? 'hunter' : team === 'runners' ? 'runner' : 'spectator';
    const updated: GamePlayer = {
      ...target,
      team,
      role: target.role === 'host' ? 'host' : newRole,
    };
    LocalStore.upsertPlayer(updated);
    sounds.playTapSound();
  };

  const assignRole = (playerId: string, role: GameRole) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;
    const updated = { ...target, role };
    LocalStore.upsertPlayer(updated);
    sounds.playTapSound();
  };

  const autoBalanceTeams = () => {
    if (!activeGame || (activeGame.status !== 'lobby' && !activeGame.is_emergency_paused)) return;

    // Keep spectators as spectators, balance active players
    const activeParticipants = players.filter((p) => p.team !== 'spectators');
    // Hunters:Runners target roughly 1:2 or balanced
    const hunterQuota = Math.max(1, Math.floor(activeParticipants.length / 3));

    const shuffled = [...activeParticipants].sort(() => Math.random() - 0.5);
    shuffled.forEach((plr, idx) => {
      const isHunter = idx < hunterQuota;
      const team: GameTeam = isHunter ? 'hunters' : 'runners';
      const role: GameRole = plr.role === 'host' ? 'host' : isHunter ? 'hunter' : 'runner';
      LocalStore.upsertPlayer({ ...plr, team, role });
    });
    sounds.playTapSound();
  };

  const togglePlayerReady = () => {
    if (!myPlayer) return;
    const updated = { ...myPlayer, is_ready: !myPlayer.is_ready };
    LocalStore.upsertPlayer(updated);
    sounds.playTapSound();
  };

  // 4. Start Game Countdown
  const startGameCountdown = () => {
    if (!activeGame || (!isHost && !isCoHost)) return;

    const updatedGame: GameSession = {
      ...activeGame,
      status: 'countdown',
      countdown_start_time: new Date().toISOString(),
      game_start_time: new Date(Date.now() + 5000).toISOString(),
    };

    LocalStore.upsertGame(updatedGame);
    setActiveGame(updatedGame);
    sounds.playCountdownTick(false);

    // After 5s, start actual match
    setTimeout(() => {
      const liveGame: GameSession = {
        ...updatedGame,
        status: 'active',
      };
      LocalStore.upsertGame(liveGame);
      setActiveGame(liveGame);
      sounds.playGameStartSound();
      addNotification('MATCH COMMENCED', 'Runners head-start active! Scatter immediately!', 'alert');
    }, 5000);
  };

  // Emergency Pause
  const emergencyPauseGame = () => {
    if (!activeGame) return;
    const paused = { ...activeGame, is_emergency_paused: true, status: 'paused' as GameStatus };
    LocalStore.upsertGame(paused);
    setActiveGame(paused);
    sounds.playZoneWarningSound();
    addNotification('EMERGENCY PAUSE', 'Game paused by Host. Stop in place safely.', 'alert');
  };

  const resumeGame = () => {
    if (!activeGame) return;
    const resumed = { ...activeGame, is_emergency_paused: false, status: 'active' as GameStatus };
    LocalStore.upsertGame(resumed);
    setActiveGame(resumed);
    sounds.playTapSound();
    addNotification('GAME RESUMED', 'Match play has resumed. Stay inside safe boundaries.', 'info');
  };

  // 5. Game Ending
  const endGame = (winnerOverride?: GameTeam | 'draw') => {
    if (!activeGame) return;

    // Calculate winning team automatically if not supplied
    let winningTeam: GameTeam | 'draw' = winnerOverride || 'draw';
    if (!winnerOverride) {
      const activeRunners = players.filter((p) => p.team === 'runners' && !p.is_captured);
      if (activeRunners.length === 0) {
        winningTeam = 'hunters';
      } else {
        winningTeam = 'runners';
      }
    }

    const finishedGame: GameSession = {
      ...activeGame,
      status: 'finished',
      game_end_time: new Date().toISOString(),
      winning_team: winningTeam,
    };

    LocalStore.upsertGame(finishedGame);
    setActiveGame(finishedGame);
    sounds.playVictorySound();

    // Record game history for user
    if (currentUser && myPlayer) {
      const won = myPlayer.team === winningTeam;
      LocalStore.addHistory({
        id: 'hist_' + Math.random().toString(36).substring(2, 9),
        game_id: activeGame.id,
        game_name: activeGame.name,
        date: new Date().toLocaleDateString(),
        role: myPlayer.role,
        team: myPlayer.team,
        won,
        captures: captures.filter((c) => c.hunter_id === currentUser.id).length,
        survival_duration_sec: elapsedSeconds,
        zone_violations: myPlayer.penalty_points / 100,
        final_score: won ? 1500 : 600,
      });
    }
  };

  // 6. Update Zones & Stages
  const updateZoneBoundary = (zone: ZoneBoundary) => {
    if (!activeGame) return;
    const updated = { ...activeGame, zone };
    LocalStore.upsertGame(updated);
    setActiveGame(updated);
  };

  const updateZoneStages = (stages: ZoneStage[]) => {
    if (!activeGame) return;
    const updated = { ...activeGame, stages };
    LocalStore.upsertGame(updated);
    setActiveGame(updated);
  };

  // 7. Update Player GPS Location & Check Boundary
  const updatePlayerLocation = (lat: number, lng: number) => {
    if (!myPlayer || !activeGame) return;

    const loc: LatLng = { lat, lng };
    let outside = false;

    if (activeGame.zone && activeGame.status === 'active') {
      outside = !isPlayerInsideZone(
        loc,
        activeGame.zone.zone_type,
        activeGame.zone.center,
        currentZoneRadius,
        currentZonePolygon
      );
    }

    setIsOutsideSafeZone(outside);

    const updated = {
      ...myPlayer,
      current_lat: lat,
      current_lng: lng,
      is_outside_zone: outside,
      last_ping: new Date().toISOString(),
    };

    LocalStore.upsertPlayer(updated);
  };

  const toggleLocationSharing = (enabled: boolean) => {
    if (!myPlayer) return;
    const updated = { ...myPlayer, location_shared: enabled };
    LocalStore.upsertPlayer(updated);
  };

  // 8. Capture Scanning Engine
  const submitCaptureScan = async (
    qrToken: string
  ): Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }> => {
    if (!activeGame || !myPlayer) {
      return { success: false, message: 'No active game session' };
    }

    if (myPlayer.team !== 'hunters') {
      return { success: false, message: 'Only active Hunters can capture Runners' };
    }

    if (!huntersReleased) {
      return { success: false, message: 'Runners are still on Head-Start! Hunters cannot capture yet!' };
    }

    // Find runner with this token
    const runner = players.find((p) => p.qr_token === qrToken.trim());
    if (!runner) {
      return { success: false, message: 'Invalid QR Code. Does not match any player in this game.' };
    }

    if (runner.game_id !== activeGame.id) {
      return { success: false, message: 'QR Code belongs to a different game session.' };
    }

    if (runner.team !== 'runners') {
      return { success: false, message: 'Player is not currently on the Runner team.' };
    }

    if (runner.is_captured) {
      return { success: false, message: `${runner.display_name} has already been captured!` };
    }

    // Check mode
    const mode = activeGame.settings.capture_verification;

    if (mode === 'instant') {
      executeCapture(myPlayer, runner);
      return { success: true, message: `CAPTURE SUCCESSFUL! ${runner.display_name} has been captured!` };
    }

    // Create capture request
    const req: CaptureRequest = {
      id: 'req_' + Math.random().toString(36).substring(2, 9),
      game_id: activeGame.id,
      hunter_player_id: myPlayer.id,
      hunter_name: myPlayer.display_name,
      runner_player_id: runner.id,
      runner_name: runner.display_name,
      verification_mode: mode,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    LocalStore.upsertCaptureRequest(req);
    setCaptureRequests((prev) => [req, ...prev]);

    if (mode === 'runner_confirmation') {
      addNotification(
        'CAPTURE REQUEST SENT',
        `Awaiting confirmation from ${runner.display_name}`,
        'info'
      );
      return {
        success: true,
        message: `Capture request dispatched to ${runner.display_name}. Waiting for their confirmation!`,
        requiresConfirmation: true,
      };
    } else {
      addNotification(
        'HOST APPROVAL REQUIRED',
        `Capture request sent to Game Host for review.`,
        'info'
      );
      return {
        success: true,
        message: 'Capture submitted to Host for review.',
        requiresConfirmation: true,
      };
    }
  };

  const respondToCaptureRequest = (requestId: string, approve: boolean) => {
    const req = captureRequests.find((r) => r.id === requestId);
    if (!req || !activeGame) return;

    if (approve) {
      const hunter = players.find((p) => p.id === req.hunter_player_id);
      const runner = players.find((p) => p.id === req.runner_player_id);
      if (hunter && runner) {
        executeCapture(hunter, runner);
      }
      const updatedReq = { ...req, status: 'approved' as const };
      LocalStore.upsertCaptureRequest(updatedReq);
    } else {
      const updatedReq = { ...req, status: 'rejected' as const };
      LocalStore.upsertCaptureRequest(updatedReq);
      addNotification('CAPTURE DISPUTED', `Capture request was rejected.`, 'warning');
    }
  };

  const executeCapture = (hunter: GamePlayer, runner: GamePlayer) => {
    if (!activeGame) return;

    sounds.playCaptureSound();

    const record: CaptureRecord = {
      id: 'cap_' + Math.random().toString(36).substring(2, 9),
      game_id: activeGame.id,
      hunter_id: hunter.profile_id,
      hunter_name: hunter.display_name,
      runner_id: runner.profile_id,
      runner_name: runner.display_name,
      capture_time: new Date().toISOString(),
      capture_rule_applied: activeGame.settings.capture_rule,
      points_awarded: 250,
      lat: runner.current_lat,
      lng: runner.current_lng,
    };

    LocalStore.addCapture(record);

    // Apply capture rule
    const rule = activeGame.settings.capture_rule;
    if (rule === 'team_switch') {
      // Runner becomes a Hunter!
      const updatedRunner: GamePlayer = {
        ...runner,
        team: 'hunters',
        role: 'hunter',
        is_captured: true,
        captured_at: new Date().toISOString(),
        captured_by_id: hunter.profile_id,
        captured_by_name: hunter.display_name,
      };
      LocalStore.upsertPlayer(updatedRunner);
      addNotification('TEAM SWITCH!', `${runner.display_name} was captured and turned into a HUNTER!`, 'capture');
    } else if (rule === 'waiting_area') {
      const updatedRunner: GamePlayer = {
        ...runner,
        is_captured: true,
        is_active: false,
        captured_at: new Date().toISOString(),
        captured_by_id: hunter.profile_id,
        captured_by_name: hunter.display_name,
      };
      LocalStore.upsertPlayer(updatedRunner);
      addNotification('DETAINED', `${runner.display_name} is in the Waiting Area!`, 'capture');
    } else {
      // Elimination
      const updatedRunner: GamePlayer = {
        ...runner,
        is_captured: true,
        is_active: false,
        captured_at: new Date().toISOString(),
        captured_by_id: hunter.profile_id,
        captured_by_name: hunter.display_name,
      };
      LocalStore.upsertPlayer(updatedRunner);
      addNotification('ELIMINATED!', `${runner.display_name} has been ELIMINATED!`, 'capture');
    }

    // Check if any runners left
    const updatedPlayers = LocalStore.getPlayers(activeGame.id);
    const remainingRunners = updatedPlayers.filter((p) => p.team === 'runners' && !p.is_captured);
    if (remainingRunners.length === 0) {
      endGame('hunters');
    }
  };

  return (
    <GameContext.Provider
      value={{
        activeGame,
        players,
        myPlayer,
        captureRequests,
        captures,
        notifications,
        isHost,
        isCoHost,
        currentRole,
        currentTeam,
        elapsedSeconds,
        remainingSeconds,
        headStartRemaining,
        huntersReleased,
        isOutsideSafeZone,
        outsideSecondsRemaining,
        currentZoneRadius,
        currentZonePolygon,
        isZoneShrinkingNow,
        zoneNotice,
        nextShrinkCountdown,
        createNewGame,
        joinGameWithCode,
        leaveGame,
        assignTeam,
        assignRole,
        autoBalanceTeams,
        togglePlayerReady,
        startGameCountdown,
        emergencyPauseGame,
        resumeGame,
        endGame,
        updateZoneBoundary,
        updateZoneStages,
        updatePlayerLocation,
        toggleLocationSharing,
        submitCaptureScan,
        respondToCaptureRequest,
        dismissNotification,
        addNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};
