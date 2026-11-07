// ==============================================================================
// SCREENS 22, 23, 24, 25, 26, 27, 28: RESULTS, STATS, LEADERBOARDS & SETTINGS
// Match End Fanfare, Confetti Celebration, Player History, & Esports Profiling
// ==============================================================================

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Shield,
  Crosshair,
  Clock,
  ArrowLeft,
  User,
  LogOut,
  Sliders,
  Volume2,
  VolumeX,
  Vibrate,
  Layers,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../utils/sound';
import { LocalStore } from '../../services/supabase';

// ------------------------------------------------------------------------------
// SCREEN 25: GAME RESULTS SCREEN (Match End Victory Celebration)
// ------------------------------------------------------------------------------
export const ResultsScreen: React.FC<{ onReturnHome: () => void }> = ({ onReturnHome }) => {
  const { activeGame, players, captures, elapsedSeconds } = useGame();
  const winningTeam = activeGame?.winning_team || 'hunters';

  useEffect(() => {
    sounds.playVictorySound();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: winningTeam === 'hunters' ? ['#EF4444', '#FF8A00', '#FFFFFF'] : ['#10B981', '#34D399', '#FFFFFF'],
    });
  }, [winningTeam]);

  const hunters = players.filter((p) => p.team === 'hunters');
  const runners = players.filter((p) => p.team === 'runners');
  const remainingRunners = runners.filter((p) => !p.is_captured);

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto flex flex-col justify-between text-center">
      <div className="pt-6">
        {/* Victory Trophy */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-huntx-surface border-2 border-huntx-accent shadow-glow-orange flex items-center justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-huntx-muted">
          MATCH CONCLUDED
        </span>
        <h2 className="text-4xl font-display font-black tracking-wider text-white mt-1">
          {winningTeam === 'hunters' ? (
            <span className="text-huntx-hunter">HUNTERS VICTORY</span>
          ) : winningTeam === 'runners' ? (
            <span className="text-huntx-runner">RUNNERS SURVIVED</span>
          ) : (
            <span className="text-huntx-accent">MATCH DRAW</span>
          )}
        </h2>
        <p className="text-xs text-huntx-muted mt-1">{activeGame?.name}</p>

        {/* High-Level Match Statistics Card */}
        <div className="mt-6 p-5 rounded-3xl bg-huntx-surface border border-huntx-border grid grid-cols-2 gap-3 text-left">
          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Match Duration</span>
            <span className="text-lg font-black text-white font-mono">
              {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
            </span>
          </div>

          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Total Captures</span>
            <span className="text-lg font-black text-huntx-hunter">{captures.length} Tagged</span>
          </div>

          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Squad Size</span>
            <span className="text-lg font-black text-white">
              {hunters.length}H / {runners.length}R
            </span>
          </div>

          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Runners Escaped</span>
            <span className="text-lg font-black text-huntx-runner">{remainingRunners.length} Alive</span>
          </div>
        </div>

        {/* Captures Log Feed */}
        <div className="mt-5 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-huntx-muted mb-2">
            Match Capture Highlights
          </h4>
          {captures.length === 0 ? (
            <p className="text-xs text-huntx-muted italic p-3 bg-huntx-surface rounded-xl">
              No runners were captured during this match.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {captures.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-huntx-surface border border-huntx-border/60 text-xs"
                >
                  <div className="flex items-center space-x-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-huntx-hunter" />
                    <span className="font-bold text-white">{c.hunter_name}</span>
                    <span className="text-huntx-muted">tagged</span>
                    <span className="font-bold text-huntx-runner">{c.runner_name}</span>
                  </div>
                  <span className="text-huntx-accent font-mono font-bold">+{c.points_awarded} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onReturnHome}
        className="w-full py-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange mt-6 transition-all"
      >
        RETURN TO ESPORTS LOBBY
      </button>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 23: LIVE LEADERBOARD
// ------------------------------------------------------------------------------
export const LeaderboardScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { players, captures } = useGame();

  // Compute live scores
  const scoreRows = players.map((p) => {
    const isHunter = p.team === 'hunters';
    const myCaptures = captures.filter((c) => c.hunter_id === p.profile_id).length;
    const points = isHunter ? myCaptures * 250 : p.is_captured ? 200 : 750;
    return {
      player: p,
      points,
      capturesCount: myCaptures,
    };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            LIVE <span className="text-huntx-accent">LEADERBOARD</span>
          </h2>
          <p className="text-xs text-huntx-muted">Real-time match scoring & player rankings</p>
        </div>
      </div>

      <div className="space-y-2">
        {scoreRows.map((row, idx) => (
          <div
            key={row.player.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border"
          >
            <div className="flex items-center space-x-3">
              <span
                className={`font-mono text-sm font-black w-6 text-center ${
                  idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-huntx-muted'
                }`}
              >
                #{idx + 1}
              </span>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white">{row.player.display_name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      row.player.team === 'hunters'
                        ? 'bg-red-950/60 text-red-400 border border-red-800'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {row.player.team}
                  </span>
                </div>
                <span className="text-[10px] text-huntx-muted">
                  {row.player.team === 'hunters' ? `${row.capturesCount} tags` : row.player.is_captured ? 'Captured' : 'Active Runner'}
                </span>
              </div>
            </div>

            <div className="font-mono text-sm font-black text-huntx-accent">
              {row.points} PTS
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 24: SPECTATOR SCREEN
// ------------------------------------------------------------------------------
export const SpectatorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeGame, players, captures, elapsedSeconds, zoneNotice } = useGame();

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            SPECTATOR <span className="text-purple-400">FEED</span>
          </h2>
          <p className="text-xs text-huntx-muted">Broadcast statistics without compromising runner locations</p>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>BROADCAST MODE ACTIVE</span>
        </div>
        <h3 className="text-lg font-black text-white">{activeGame?.name}</h3>
        <p className="text-xs text-huntx-muted mt-1 font-mono">
          Zone Status: <strong className="text-white">{zoneNotice}</strong>
        </p>
      </div>

      {/* Live Timeline */}
      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-huntx-muted mb-3">
          Broadcast Timeline
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {captures.map((c) => (
            <div key={c.id} className="text-xs flex items-center justify-between text-huntx-muted p-2 rounded-xl bg-huntx-bg">
              <span>
                Hunter <strong className="text-huntx-hunter">{c.hunter_name}</strong> captured <strong className="text-huntx-runner">{c.runner_name}</strong>
              </span>
              <span className="font-mono text-[10px] text-huntx-accent">+{c.points_awarded}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 26: GAME HISTORY SCREEN
// ------------------------------------------------------------------------------
export const GameHistoryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const history = LocalStore.getHistory(currentUser?.id || '');

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            MATCH <span className="text-huntx-accent">HISTORY</span>
          </h2>
          <p className="text-xs text-huntx-muted">Past competitive hunts & saved statistics</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-xs text-huntx-muted bg-huntx-surface rounded-3xl border border-huntx-border">
          No matches recorded yet. Complete a hunt to build your permanent record!
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-sm text-white">{h.game_name}</h4>
                <div className="flex items-center space-x-2 text-[10px] text-huntx-muted mt-0.5">
                  <span>{h.date}</span>
                  <span>•</span>
                  <span className="uppercase font-bold text-huntx-accent">{h.role}</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold ${
                    h.won ? 'text-huntx-runner' : 'text-huntx-hunter'
                  }`}
                >
                  {h.won ? 'VICTORY' : 'DEFEAT'}
                </span>
                <span className="text-xs font-mono font-bold text-huntx-accent block">
                  {h.final_score} PTS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 27: USER PROFILE SCREEN
// ------------------------------------------------------------------------------
export const ProfileScreen: React.FC<{
  onBack: () => void;
  onOpenSettings: () => void;
}> = ({ onBack, onOpenSettings }) => {
  const { currentUser, isGuest, logout } = useAuth();

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-black tracking-wider text-white">
              OPERATOR <span className="text-huntx-accent">PROFILE</span>
            </h2>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-huntx-surface border border-huntx-border text-center flex flex-col items-center">
        <img
          src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=huntx'}
          alt="profile"
          className="w-20 h-20 rounded-3xl border-2 border-huntx-accent object-cover mb-3"
        />
        <h3 className="text-xl font-black text-white">{currentUser?.display_name}</h3>
        <p className="text-xs text-huntx-muted font-mono">@{currentUser?.username}</p>

        {isGuest && (
          <div className="mt-3 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 font-bold text-xs">
            TEMPORARY GUEST PASS (EXPIRES 24H)
          </div>
        )}
      </div>

      {/* Lifetime Stats */}
      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-huntx-muted mb-3">
          Lifetime Combat Statistics
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Total Matches</span>
            <span className="text-base font-black text-white">{currentUser?.games_played || 0}</span>
          </div>
          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Victories</span>
            <span className="text-base font-black text-huntx-accent">{currentUser?.games_won || 0}</span>
          </div>
          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Captures</span>
            <span className="text-base font-black text-huntx-hunter">{currentUser?.total_captures || 0}</span>
          </div>
          <div className="bg-huntx-bg p-3 rounded-2xl border border-huntx-border/60">
            <span className="text-[10px] text-huntx-muted uppercase font-bold block">Escapes</span>
            <span className="text-base font-black text-huntx-runner">{currentUser?.total_escapes || 0}</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-xl border border-red-800/80 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>SIGN OUT OF TERMINAL</span>
      </button>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 28: APP SETTINGS SCREEN
// ------------------------------------------------------------------------------
export const AppSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [soundOn, setSoundOn] = useState(sounds.isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState(sounds.isHapticsEnabled());

  const toggleSound = () => {
    sounds.setSoundEnabled(!soundOn);
    setSoundOn(!soundOn);
  };

  const toggleHaptics = () => {
    sounds.setHapticsEnabled(!hapticsOn);
    setHapticsOn(!hapticsOn);
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            APP <span className="text-huntx-accent">SETTINGS</span>
          </h2>
          <p className="text-xs text-huntx-muted">Sound synthesizers, haptics, and map calibration</p>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border space-y-4">
        {/* Audio FX */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {soundOn ? <Volume2 className="w-5 h-5 text-huntx-accent" /> : <VolumeX className="w-5 h-5 text-huntx-muted" />}
            <div>
              <h4 className="text-sm font-bold text-white">Audio Synthesizer FX</h4>
              <p className="text-[11px] text-huntx-muted">Outside-zone alarms, countdown ticks, and horn</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              soundOn ? 'bg-huntx-accent' : 'bg-huntx-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                soundOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between pt-3 border-t border-huntx-border/60">
          <div className="flex items-center space-x-3">
            <Vibrate className="w-5 h-5 text-huntx-runner" />
            <div>
              <h4 className="text-sm font-bold text-white">Device Vibration Feedback</h4>
              <p className="text-[11px] text-huntx-muted">Tactile feedback during QR scans and zone warnings</p>
            </div>
          </div>
          <button
            onClick={toggleHaptics}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              hapticsOn ? 'bg-huntx-runner' : 'bg-huntx-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                hapticsOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Safety Info */}
      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border text-xs text-huntx-muted space-y-2">
        <h4 className="font-bold text-white">HUNTX Engine v1.0.0 (Production)</h4>
        <p>Cross-platform real-time outdoor multiplayer game system with Supabase PostgreSQL & Web Audio API integration.</p>
      </div>
    </div>
  );
};
