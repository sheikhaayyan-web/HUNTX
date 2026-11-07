// ==============================================================================
// SCREEN 1: SPLASH SCREEN & SCREEN 2: WELCOME SCREEN
// Aggressive competitive esports visual introduction
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Crosshair, Shield, Play, Users, UserCheck } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface SplashProps {
  onFinishSplash: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onFinishSplash }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sounds.playTapSound();
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onFinishSplash, 300);
          return 100;
        }
        return p + 20;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-huntx-bg flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Background Esports Radar Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#303030_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute w-96 h-96 rounded-full bg-huntx-accent/15 blur-3xl pointer-events-none" />

      {/* Main Logo & Badge */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-huntx-surface border-2 border-huntx-accent shadow-glow-orange mb-6">
          <Crosshair className="w-14 h-14 text-huntx-accent animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 border border-white/20 rounded-3xl" />
        </div>

        <h1 className="text-6xl sm:text-7xl font-display font-black tracking-widest text-white leading-none">
          HUNT<span className="text-huntx-accent">X</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold tracking-widest text-huntx-muted uppercase">
          THE ULTIMATE OUTDOOR HUNT
        </p>

        {/* Loading Bar */}
        <div className="mt-12 w-64">
          <div className="flex justify-between text-[11px] text-huntx-muted uppercase font-mono mb-1.5">
            <span>CALIBRATING SENSORS</span>
            <span className="text-huntx-accent font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-huntx-surface border border-huntx-border rounded-full overflow-hidden">
            <div
              className="h-full bg-huntx-accent transition-all duration-300 shadow-glow-orange"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface WelcomeProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

export const WelcomeScreen: React.FC<WelcomeProps> = ({ onLogin, onRegister, onGuest }) => {
  return (
    <div className="relative min-h-screen bg-huntx-bg flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Background esports flair */}
      <div className="absolute -top-12 -right-12 w-60 h-60 bg-huntx-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-12 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-10 flex flex-col items-center text-center z-10">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-huntx-surface border border-huntx-border mb-4">
          <span className="w-2 h-2 rounded-full bg-huntx-accent animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-huntx-muted">
            REAL-WORLD MULTIPLAYER
          </span>
        </div>

        <h1 className="text-5xl font-display font-black tracking-widest text-white">
          HUNT<span className="text-huntx-accent">X</span>
        </h1>
        <p className="mt-2 text-sm text-huntx-muted max-w-xs">
          Compete in high-stakes tactical outdoor chases. Track shrinking game zones, scan runner QR codes, and outmaneuver opposing squads.
        </p>
      </div>

      {/* Esports Feature Highlights */}
      <div className="my-8 space-y-3 z-10">
        <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-huntx-surface/80 border border-huntx-border backdrop-blur-sm">
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-huntx-hunter">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Hunters Team</h4>
            <p className="text-xs text-huntx-muted">Pursue targets, scan Runner QR codes, and trap runners.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-huntx-surface/80 border border-huntx-border backdrop-blur-sm">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-huntx-runner">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Runners Team</h4>
            <p className="text-xs text-huntx-muted">Evade capture, stay inside shrinking boundaries, and survive the clock.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pb-8 space-y-3 z-10">
        <button
          onClick={onRegister}
          className="w-full py-4 rounded-2xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-glow-orange transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Create Account & Host</span>
        </button>

        <button
          onClick={onLogin}
          className="w-full py-3.5 rounded-2xl bg-huntx-surface hover:bg-huntx-surfaceLight border border-huntx-border text-white font-bold text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <UserCheck className="w-4 h-4 text-huntx-accent" />
          <span>Login with Email</span>
        </button>

        <button
          onClick={onGuest}
          className="w-full py-3 rounded-2xl border border-dashed border-huntx-border hover:border-huntx-accent/50 text-huntx-muted hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>Quick Join as Guest Player</span>
        </button>
      </div>
    </div>
  );
};
