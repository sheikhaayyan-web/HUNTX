// ==============================================================================
// SCREENS 6, 7, 8: HOME DASHBOARD, CREATE GAME & JOIN GAME SCREENS
// Esports Hub, Room Code Generation, & Outdoor Safety Protocols
// ==============================================================================

import React, { useState } from 'react';
import {
  Radio,
  Users,
  Trophy,
  Shield,
  Crosshair,
  MapPin,
  AlertTriangle,
  Play,
  Clock,
  Sliders,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { GameModeType } from '../../types/huntx';

// ------------------------------------------------------------------------------
// SCREEN 6: HOME DASHBOARD
// ------------------------------------------------------------------------------
interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { currentUser, isGuest, canHost } = useAuth();
  const { activeGame } = useGame();

  const winRate =
    currentUser && currentUser.games_played > 0
      ? Math.round((currentUser.games_won / currentUser.games_played) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-24 max-w-lg mx-auto space-y-5">
      {/* Active Game Re-enter Banner (if currently in a game) */}
      {activeGame && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-huntx-surface to-huntx-surfaceLight border-2 border-huntx-accent shadow-glow-orange flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-huntx-accent animate-ping" />
              <span className="text-xs font-black uppercase text-huntx-accent tracking-wider">
                ACTIVE MATCH IN PROGRESS
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">{activeGame.name}</h3>
            <p className="text-xs text-huntx-muted font-mono">ROOM: {activeGame.room_code}</p>
          </div>
          <button
            onClick={() => onNavigate(activeGame.status === 'lobby' ? 'lobby' : 'active_dashboard')}
            className="px-4 py-2.5 bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center space-x-1"
          >
            <span>Return</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Esports Player Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-huntx-surface border border-huntx-border shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-huntx-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=huntx'}
              alt="avatar"
              className="w-12 h-12 rounded-2xl border-2 border-huntx-border object-cover"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-lg font-black text-white">{currentUser?.display_name}</h2>
                {isGuest && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/60 border border-amber-800 text-amber-400 font-bold rounded">
                    GUEST
                  </span>
                )}
              </div>
              <p className="text-xs text-huntx-muted font-mono">@{currentUser?.username}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-huntx-muted tracking-wider block">
              STATUS
            </span>
            <span className="text-xs font-bold text-huntx-runner flex items-center space-x-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-huntx-runner inline-block" />
              <span>READY</span>
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-huntx-border/70 text-center">
          <div className="bg-huntx-bg/60 p-2 rounded-xl border border-huntx-border/40">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Matches</span>
            <span className="text-sm font-black text-white">{currentUser?.games_played || 0}</span>
          </div>
          <div className="bg-huntx-bg/60 p-2 rounded-xl border border-huntx-border/40">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Win Rate</span>
            <span className="text-sm font-black text-huntx-accent">{winRate}%</span>
          </div>
          <div className="bg-huntx-bg/60 p-2 rounded-xl border border-huntx-border/40">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Captures</span>
            <span className="text-sm font-black text-huntx-hunter">{currentUser?.total_captures || 0}</span>
          </div>
          <div className="bg-huntx-bg/60 p-2 rounded-xl border border-huntx-border/40">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Escapes</span>
            <span className="text-sm font-black text-huntx-runner">{currentUser?.total_escapes || 0}</span>
          </div>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Host Game Card */}
        <button
          onClick={() => onNavigate('create_game')}
          className="relative group p-5 rounded-3xl bg-gradient-to-br from-huntx-surface to-[#1F1810] border border-huntx-accent/40 hover:border-huntx-accent transition-all text-left flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="p-3 rounded-2xl bg-huntx-accent/20 text-huntx-accent border border-huntx-accent/30 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            {!canHost && (
              <span className="p-1 rounded-full bg-huntx-surfaceLight text-huntx-muted">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-huntx-accent transition-colors">
              HOST A HUNT
            </h3>
            <p className="text-xs text-huntx-muted mt-1 leading-snug">
              Configure zone boundaries, shrinking stages, & team rules.
            </p>
          </div>
        </button>

        {/* Join Game Card */}
        <button
          onClick={() => onNavigate('join_game')}
          className="relative group p-5 rounded-3xl bg-huntx-surface hover:bg-huntx-surfaceLight border border-huntx-border hover:border-white/30 transition-all text-left flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="p-3 rounded-2xl bg-huntx-surfaceLight text-white border border-huntx-border group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <Sparkles className="w-4 h-4 text-huntx-muted" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">JOIN ROOM</h3>
            <p className="text-xs text-huntx-muted mt-1 leading-snug">
              Enter 6-letter room code or join via invite link.
            </p>
          </div>
        </button>
      </div>

      {/* Secondary Feature Shortcuts */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigate('mode_select')}
          className="p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border hover:bg-huntx-surfaceLight text-center transition-colors"
        >
          <Sliders className="w-5 h-5 text-huntx-accent mx-auto mb-1.5" />
          <span className="text-xs font-bold text-white block">Game Modes</span>
          <span className="text-[10px] text-huntx-muted">Custom presets</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border hover:bg-huntx-surfaceLight text-center transition-colors"
        >
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-white block">Leaderboards</span>
          <span className="text-[10px] text-huntx-muted">Top Hunters</span>
        </button>

        <button
          onClick={() => onNavigate('game_history')}
          className="p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border hover:bg-huntx-surfaceLight text-center transition-colors"
        >
          <Clock className="w-5 h-5 text-huntx-runner mx-auto mb-1.5" />
          <span className="text-xs font-bold text-white block">History</span>
          <span className="text-[10px] text-huntx-muted">Match logs</span>
        </button>
      </div>

      {/* Safety & Fair-Play Outdoor Protocol Card */}
      <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-800/60 text-xs text-amber-200/90 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white uppercase tracking-wider block">
            OUTDOOR SAFETY PROTOCOL
          </span>
          <p className="text-[11px] leading-relaxed text-amber-200/80">
            Never cross busy roads, climb fences, or trespass onto private property. Physical contact is strictly forbidden—captures must be performed by optical QR scan.
          </p>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 7: CREATE GAME SCREEN
// ------------------------------------------------------------------------------
interface CreateGameScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onSelectZone: () => void;
}

export const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ onBack, onSuccess, onSelectZone }) => {
  const { createNewGame } = useGame();
  const { canHost } = useAuth();
  const [gameName, setGameName] = useState('Central Park Showdown');
  const [mode, setMode] = useState<GameModeType>('classic');
  const [durationMin, setDurationMin] = useState(30);
  const [headStartSec, setHeadStartSec] = useState(60);
  const [maxPlayers, setMaxPlayers] = useState(24);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canHost) {
      setErrorMsg('Only registered accounts can host games. Please upgrade or login.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await createNewGame(gameName, mode);
      setLoading(false);
      onSuccess();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Game creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            HOST A <span className="text-huntx-accent">NEW HUNT</span>
          </h2>
          <p className="text-xs text-huntx-muted">Configure room parameters and launch lobby</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-xs uppercase font-bold text-huntx-muted block mb-1.5">Game Room Title</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-huntx-accent"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-huntx-muted block mb-1.5">Select Game Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'classic', label: 'Classic Hunt', desc: 'Standard Hunter vs Runner chase' },
              { id: 'survival', label: 'Survival', desc: 'Runners hold out until timer' },
              { id: 'mission', label: 'Mission Mode', desc: 'Objectives in safe zone' },
              { id: 'custom', label: 'Custom Esports', desc: 'Custom rules & shrink stages' },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMode(m.id as GameModeType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? 'bg-huntx-accent/15 border-huntx-accent text-white shadow-glow-orange'
                    : 'bg-huntx-surface border-huntx-border text-huntx-muted hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-white">{m.label}</div>
                <div className="text-[10px] text-huntx-muted mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timers & Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">
              Duration (Minutes)
            </label>
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-huntx-accent"
            >
              <option value={15}>15 Minutes (Blitz)</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes (Extended)</option>
              <option value={60}>60 Minutes (Marathon)</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">
              Runner Head-Start
            </label>
            <select
              value={headStartSec}
              onChange={(e) => setHeadStartSec(Number(e.target.value))}
              className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-huntx-accent"
            >
              <option value={30}>30 Seconds</option>
              <option value={60}>60 Seconds</option>
              <option value={120}>2 Minutes</option>
              <option value={180}>3 Minutes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">
            Max Player Limit: <span className="text-white font-mono">{maxPlayers} Players</span>
          </label>
          <input
            type="range"
            min={4}
            max={50}
            step={2}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full accent-huntx-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{loading ? 'CREATING LOBBY...' : 'GENERATE ROOM CODE & LOBBY'}</span>
        </button>
      </form>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 8: JOIN GAME SCREEN
// ------------------------------------------------------------------------------
interface JoinGameScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ onBack, onSuccess }) => {
  const { joinGameWithCode } = useGame();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter a 6-character room code');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await joinGameWithCode(code.trim());
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Failed to join game');
    }
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-24 max-w-lg mx-auto flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
          >
            <Users className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-black tracking-wider text-white">
              JOIN <span className="text-huntx-accent">MATCH</span>
            </h2>
            <p className="text-xs text-huntx-muted">Enter the 6-character Host room code</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-2 text-center">
              Room Code (Letters & Numbers)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              placeholder="e.g. HX889Z"
              required
              autoFocus
              className="w-full text-center font-mono text-3xl tracking-widest font-black uppercase bg-huntx-surface border-2 border-huntx-border rounded-2xl py-4 text-white focus:outline-none focus:border-huntx-accent placeholder-huntx-muted/40 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length < 3}
            className="w-full py-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange transition-all disabled:opacity-50"
          >
            {loading ? 'CONNECTING TO ROOM...' : 'ENTER LOBBY'}
          </button>
        </form>

        {/* Quick Demo helper for easy testing */}
        <div className="mt-8 p-4 rounded-2xl bg-huntx-surface border border-huntx-border text-xs text-huntx-muted">
          <p className="font-bold text-white mb-1">Testing Tip:</p>
          <p>
            You can create a room in another window or host one first, then copy the 6-letter room code here to join as Hunter or Runner in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};
