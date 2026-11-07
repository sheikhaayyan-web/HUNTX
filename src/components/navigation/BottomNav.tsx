// ==============================================================================
// HUNTX ADAPTIVE BOTTOM NAVIGATION BAR
// Role-aware and game-phase adaptive esports HUD controls
// ==============================================================================

import React from 'react';
import {
  Map,
  Activity,
  QrCode,
  Crosshair,
  Users,
  Trophy,
  Sliders,
  Radio,
  Layers,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const { activeGame, myPlayer, isHost } = useGame();

  if (!activeGame) {
    // Standard dashboard nav
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-huntx-surface/95 backdrop-blur-xl border-t border-huntx-border px-4 py-2 flex items-center justify-around max-w-lg mx-auto sm:rounded-t-2xl">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentScreen === 'home' ? 'text-huntx-accent' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => onNavigate('create_game')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentScreen === 'create_game' ? 'text-huntx-accent' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Radio className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Host</span>
        </button>

        <button
          onClick={() => onNavigate('join_game')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentScreen === 'join_game' ? 'text-huntx-accent' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Join</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentScreen === 'leaderboard' ? 'text-huntx-accent' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Ranks</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            currentScreen === 'profile' ? 'text-huntx-accent' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    );
  }

  // Inside Active Match / Lobby
  const isLobby = activeGame.status === 'lobby';
  const isHunter = myPlayer?.team === 'hunters';
  const isRunner = myPlayer?.team === 'runners';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-huntx-surface/95 backdrop-blur-xl border-t border-huntx-border px-2 py-2 flex items-center justify-around max-w-lg mx-auto sm:rounded-t-2xl shadow-2xl">
      {/* 1. MAP */}
      <button
        onClick={() => onNavigate('player_map')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentScreen === 'player_map' ? 'text-huntx-accent font-black' : 'text-huntx-muted hover:text-white'
        }`}
      >
        <Map className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Radar Map</span>
      </button>

      {/* 2. DASHBOARD / LOBBY */}
      <button
        onClick={() => onNavigate(isLobby ? 'lobby' : 'active_dashboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentScreen === 'lobby' || currentScreen === 'active_dashboard'
            ? 'text-huntx-accent font-black'
            : 'text-huntx-muted hover:text-white'
        }`}
      >
        <Activity className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">{isLobby ? 'Lobby' : 'Match HUD'}</span>
      </button>

      {/* 3. CENTER PRIMARY ACTION: SCANNER (Hunter) vs QR CODE (Runner) */}
      {!isLobby && isHunter && (
        <button
          onClick={() => onNavigate('hunter_scanner')}
          className="relative -top-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-huntx-accent text-white shadow-glow-hunter border-2 border-white/20 active:scale-95 transition-transform"
        >
          <Crosshair className="w-7 h-7" />
          <span className="text-[8px] font-black uppercase mt-0.5">SCAN</span>
        </button>
      )}

      {!isLobby && isRunner && (
        <button
          onClick={() => onNavigate('runner_qr')}
          className="relative -top-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-huntx-runner to-emerald-400 text-black shadow-glow-runner border-2 border-white/20 active:scale-95 transition-transform"
        >
          <QrCode className="w-7 h-7" />
          <span className="text-[8px] font-black uppercase mt-0.5">MY PASS</span>
        </button>
      )}

      {/* If Lobby, show Teams button */}
      {isLobby && (
        <button
          onClick={() => onNavigate('team_management')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentScreen === 'team_management'
              ? 'text-huntx-accent font-black'
              : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Teams</span>
        </button>
      )}

      {/* 4. ZONE / STAGES / HOST */}
      {isHost ? (
        <button
          onClick={() => onNavigate('zone_stages')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentScreen === 'zone_stages' ? 'text-huntx-accent font-black' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Stages</span>
        </button>
      ) : (
        <button
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentScreen === 'leaderboard' ? 'text-huntx-accent font-black' : 'text-huntx-muted hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Live Board</span>
        </button>
      )}

      {/* 5. SETTINGS */}
      <button
        onClick={() => onNavigate('game_settings')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentScreen === 'game_settings' ? 'text-huntx-accent font-black' : 'text-huntx-muted hover:text-white'
        }`}
      >
        <Sliders className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Rules</span>
      </button>
    </nav>
  );
};
