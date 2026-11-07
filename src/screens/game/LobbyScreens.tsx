// ==============================================================================
// SCREENS 9 & 10: GAME LOBBY & TEAM MANAGEMENT SCREENS
// Real-time Player Roster, Ready Toggles, Auto-Balancing, & Countdown Synchronizer
// ==============================================================================

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Play,
  Shuffle,
  Shield,
  Crosshair,
  Eye,
  Crown,
  Sliders,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  UserX,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { GameTeam, GameRole } from '../../types/huntx';

// ------------------------------------------------------------------------------
// SCREEN 9: GAME LOBBY
// ------------------------------------------------------------------------------
interface LobbyScreenProps {
  onNavigate: (screen: string) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onNavigate }) => {
  const {
    activeGame,
    players,
    myPlayer,
    isHost,
    isCoHost,
    togglePlayerReady,
    startGameCountdown,
    autoBalanceTeams,
    leaveGame,
  } = useGame();
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!activeGame) {
    return (
      <div className="min-h-screen bg-huntx-bg p-6 flex flex-col items-center justify-center text-center">
        <p className="text-huntx-muted mb-4">No active game lobby joined.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-huntx-accent text-black font-bold rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(activeGame.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hunters = players.filter((p) => p.team === 'hunters');
  const runners = players.filter((p) => p.team === 'runners');
  const spectators = players.filter((p) => p.team === 'spectators');
  const allReady = players.every((p) => p.is_ready || p.team === 'spectators');

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      {/* Lobby Header */}
      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-huntx-muted px-2.5 py-1 rounded-full bg-huntx-bg border border-huntx-border">
            MATCH LOBBY • {activeGame.game_mode.toUpperCase()}
          </span>
          <button
            onClick={leaveGame}
            className="text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            Leave Lobby
          </button>
        </div>

        <h2 className="text-xl font-black text-white">{activeGame.name}</h2>

        {/* Room Code Share Card */}
        <div className="mt-3 p-3 rounded-2xl bg-huntx-bg border border-huntx-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-huntx-muted block">
              ROOM INVITATION CODE
            </span>
            <span className="font-mono text-2xl font-black text-huntx-accent tracking-widest">
              {activeGame.room_code}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={copyRoomCode}
              className="px-3 py-2 rounded-xl bg-huntx-surface hover:bg-huntx-surfaceLight border border-huntx-border text-xs font-bold text-white flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-huntx-runner" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Game Specs Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-huntx-muted pt-3 border-t border-huntx-border/70">
          <span>
            Host: <strong className="text-white">{activeGame.host_name}</strong>
          </span>
          <span>
            Duration: <strong className="text-white">{Math.round(activeGame.game_duration / 60)}m</strong>
          </span>
          <span>
            Players: <strong className="text-white">{players.length}/{activeGame.max_players}</strong>
          </span>
        </div>
      </div>

      {/* Countdown overlay banner if countdown started */}
      {activeGame.status === 'countdown' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-amber-950/80 border-2 border-huntx-accent shadow-glow-orange text-center animate-pulse">
          <span className="text-xs font-bold uppercase tracking-widest text-huntx-accent">
            INITIALIZING GAME COMMENCEMENT
          </span>
          <div className="text-4xl font-display font-black text-white my-1">STARTING NOW</div>
          <p className="text-xs text-huntx-muted">Runners prepare for head-start release!</p>
        </div>
      )}

      {/* Team Rosters Tabs */}
      <div className="space-y-3">
        {/* Hunters Team */}
        <div className="p-4 rounded-2xl bg-huntx-surface/80 border border-huntx-hunter/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-huntx-hunter" />
              <h3 className="text-sm font-black text-white tracking-wider uppercase">
                HUNTERS SQUAD ({hunters.length})
              </h3>
            </div>
            <span className="text-[10px] text-huntx-muted">Tag & scan runners</span>
          </div>

          <div className="space-y-1.5">
            {hunters.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-huntx-bg/60 border border-huntx-border/60 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-huntx-hunter" />
                  <span className="font-bold text-white">{p.display_name}</span>
                  {p.role === 'host' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                  {p.id === myPlayer?.id && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-huntx-surfaceLight text-huntx-accent rounded font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${p.is_ready ? 'text-huntx-runner' : 'text-huntx-muted'}`}>
                  {p.is_ready ? 'READY' : 'NOT READY'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Runners Team */}
        <div className="p-4 rounded-2xl bg-huntx-surface/80 border border-huntx-runner/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-huntx-runner" />
              <h3 className="text-sm font-black text-white tracking-wider uppercase">
                RUNNERS SQUAD ({runners.length})
              </h3>
            </div>
            <span className="text-[10px] text-huntx-muted">Survive the shrinking zone</span>
          </div>

          <div className="space-y-1.5">
            {runners.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-huntx-bg/60 border border-huntx-border/60 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-huntx-runner" />
                  <span className="font-bold text-white">{p.display_name}</span>
                  {p.role === 'host' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                  {p.id === myPlayer?.id && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-huntx-surfaceLight text-huntx-accent rounded font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${p.is_ready ? 'text-huntx-runner' : 'text-huntx-muted'}`}>
                  {p.is_ready ? 'READY' : 'NOT READY'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spectators */}
        {spectators.length > 0 && (
          <div className="p-3 rounded-2xl bg-huntx-surface/50 border border-huntx-border">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <div className="flex items-center space-x-2 text-huntx-muted font-bold">
                <Eye className="w-4 h-4" />
                <span>SPECTATORS ({spectators.length})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {spectators.map((s) => (
                <span
                  key={s.id}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-huntx-bg border border-huntx-border text-huntx-muted"
                >
                  {s.display_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="pt-2 space-y-2">
        {/* Ready toggle for player */}
        <button
          onClick={togglePlayerReady}
          className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border transition-all ${
            myPlayer?.is_ready
              ? 'bg-huntx-runner/20 border-huntx-runner text-huntx-runner'
              : 'bg-huntx-surface border-huntx-border text-white hover:border-huntx-accent'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{myPlayer?.is_ready ? 'YOU ARE READY (CLICK TO UNREADY)' : 'MARK AS READY'}</span>
        </button>

        {/* Host Control Actions */}
        {isHost && (
          <div className="space-y-2 pt-2 border-t border-huntx-border">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={autoBalanceTeams}
                className="py-2.5 px-3 rounded-xl bg-huntx-surface hover:bg-huntx-surfaceLight border border-huntx-border text-xs font-bold text-white flex items-center justify-center space-x-1.5"
              >
                <Shuffle className="w-4 h-4 text-huntx-accent" />
                <span>Auto-Balance</span>
              </button>

              <button
                onClick={() => onNavigate('team_management')}
                className="py-2.5 px-3 rounded-xl bg-huntx-surface hover:bg-huntx-surfaceLight border border-huntx-border text-xs font-bold text-white flex items-center justify-center space-x-1.5"
              >
                <Users className="w-4 h-4 text-huntx-accent" />
                <span>Manage Teams</span>
              </button>
            </div>

            <button
              onClick={startGameCountdown}
              disabled={activeGame.status === 'countdown' || hunters.length === 0 || runners.length === 0}
              className="w-full py-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider shadow-glow-orange flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>COMMENCE MATCH COUNTDOWN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 10: TEAM MANAGEMENT SCREEN
// ------------------------------------------------------------------------------
interface TeamManagementScreenProps {
  onBack: () => void;
}

export const TeamManagementScreen: React.FC<TeamManagementScreenProps> = ({ onBack }) => {
  const { players, assignTeam, assignRole, autoBalanceTeams } = useGame();

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            TEAM <span className="text-huntx-accent">ASSIGNMENTS</span>
          </h2>
          <p className="text-xs text-huntx-muted">Move players between Hunters, Runners, & Spectators</p>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={autoBalanceTeams}
          className="px-3 py-1.5 rounded-xl bg-huntx-accent text-black font-bold text-xs flex items-center space-x-1 shadow-glow-orange"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Auto-Balance Squads</span>
        </button>
      </div>

      <div className="space-y-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="p-3 rounded-2xl bg-huntx-surface border border-huntx-border flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white">{p.display_name}</span>
                {p.role === 'host' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                {p.role === 'co-host' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-huntx-accent/20 text-huntx-accent font-bold">
                    CO-HOST
                  </span>
                )}
              </div>
              <span className="text-[10px] text-huntx-muted uppercase font-mono">
                CURRENT: {p.team} • {p.role}
              </span>
            </div>

            {/* Team Change Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => assignTeam(p.id, 'hunters')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  p.team === 'hunters'
                    ? 'bg-huntx-hunter text-white'
                    : 'bg-huntx-bg text-huntx-muted hover:text-white'
                }`}
              >
                Hunter
              </button>

              <button
                onClick={() => assignTeam(p.id, 'runners')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  p.team === 'runners'
                    ? 'bg-huntx-runner text-black'
                    : 'bg-huntx-bg text-huntx-muted hover:text-white'
                }`}
              >
                Runner
              </button>

              <button
                onClick={() => assignTeam(p.id, 'spectators')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  p.team === 'spectators'
                    ? 'bg-purple-600 text-white'
                    : 'bg-huntx-bg text-huntx-muted hover:text-white'
                }`}
              >
                Spec
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
