// ==============================================================================
// HUNTX TOP NAVIGATION HEADER
// Esports Status Pill, Emergency Pause Controller, Notifications & Profile
// ==============================================================================

import React, { useState } from 'react';
import { Shield, Bell, AlertOctagon, Play, LogOut, Radio } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  activeScreen: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
}) => {
  const { activeGame, isHost, emergencyPauseGame, resumeGame, notifications } = useGame();
  const { currentUser, isGuest } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full bg-huntx-bg/95 backdrop-blur-md border-b border-huntx-border px-4 py-3 flex items-center justify-between">
      {/* Brand & Room Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 cursor-pointer">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-huntx-surface border border-huntx-border">
            <Radio className="w-4 h-4 text-huntx-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-widest text-white leading-none">
              HUNT<span className="text-huntx-accent">X</span>
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-huntx-muted font-bold block">
              OUTDOOR ESPORTS
            </span>
          </div>
        </div>

        {/* Live Match Room Badge */}
        {activeGame && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-huntx-surface border border-huntx-border text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                activeGame.status === 'active'
                  ? 'bg-huntx-runner animate-ping'
                  : activeGame.status === 'paused'
                  ? 'bg-red-500'
                  : 'bg-huntx-accent'
              }`}
            />
            <span className="font-mono font-bold text-white tracking-wider">
              {activeGame.room_code}
            </span>
            <span className="text-huntx-muted text-[10px] uppercase font-semibold">
              • {activeGame.status}
            </span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        {/* Host Emergency Pause Button */}
        {isHost && activeGame && (activeGame.status === 'active' || activeGame.status === 'paused') && (
          <button
            onClick={activeGame.is_emergency_paused ? resumeGame : emergencyPauseGame}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all ${
              activeGame.is_emergency_paused
                ? 'bg-huntx-runner/20 border-huntx-runner text-huntx-runner hover:bg-huntx-runner/30'
                : 'bg-red-950/40 border-red-700 text-red-400 hover:bg-red-900/60'
            }`}
          >
            {activeGame.is_emergency_paused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Resume</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Emergency Pause</span>
              </>
            )}
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-huntx-surface border border-huntx-border hover:bg-huntx-surfaceLight text-huntx-muted hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-huntx-accent text-black font-black text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar / Guest Badge */}
        {currentUser && (
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 p-1.5 rounded-xl bg-huntx-surface border border-huntx-border hover:border-huntx-accent transition-all"
          >
            <img
              src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=huntx'}
              alt={currentUser.display_name}
              className="w-6 h-6 rounded-lg object-cover"
            />
            <span className="text-xs font-bold text-white max-w-[80px] truncate hidden md:inline">
              {currentUser.display_name}
            </span>
            {isGuest && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 font-bold border border-amber-800">
                GUEST
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
