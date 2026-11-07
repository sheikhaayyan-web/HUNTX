// ==============================================================================
// SCREENS 16, 17, 18, 19, 20, 21: ACTIVE MATCH HUD, RADAR MAP & CAPTURE SCREENS
// Real-Time Match Control, Dynamic Zone Alerts, QR Scanner, & Verification Feeds
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shield,
  Crosshair,
  AlertTriangle,
  MapPin,
  QrCode,
  Map as MapIcon,
  Radio,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  AlertOctagon,
  Users,
  Compass,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { HuntMap } from '../../components/map/HuntMap';
import { RunnerQRCard } from '../../components/qr/RunnerQRCard';
import { HunterScannerModal } from '../../components/qr/HunterScannerModal';

// ------------------------------------------------------------------------------
// SCREEN 16: ACTIVE GAME DASHBOARD
// ------------------------------------------------------------------------------
export const ActiveGameDashboard: React.FC<{ onNavigate: (screen: string) => void }> = ({
  onNavigate,
}) => {
  const {
    activeGame,
    players,
    myPlayer,
    remainingSeconds,
    headStartRemaining,
    huntersReleased,
    isOutsideSafeZone,
    outsideSecondsRemaining,
    zoneNotice,
    nextShrinkCountdown,
    isZoneShrinkingNow,
    captures,
    endGame,
    isHost,
  } = useGame();
  const [scannerOpen, setScannerOpen] = useState(false);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hunters = players.filter((p) => p.team === 'hunters');
  const activeRunners = players.filter((p) => p.team === 'runners' && !p.is_captured);
  const capturedRunners = players.filter((p) => p.team === 'runners' && p.is_captured);

  const isHunter = myPlayer?.team === 'hunters';
  const isRunner = myPlayer?.team === 'runners';

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      {/* OUTSIDE ZONE CRITICAL EMERGENCY WARNING BANNER */}
      {isOutsideSafeZone && (
        <div className="p-4 rounded-3xl bg-red-600 border-2 border-white shadow-2xl text-white flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 shrink-0 text-white fill-red-800" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider leading-none">
                OUTSIDE SAFE ZONE!
              </h3>
              <p className="text-[11px] text-red-100 mt-0.5">
                Return immediately! Penalty applies in:
              </p>
            </div>
          </div>
          <div className="font-mono text-3xl font-black text-yellow-300 bg-black/40 px-3 py-1 rounded-xl">
            {outsideSecondsRemaining}s
          </div>
        </div>
      )}

      {/* Primary Match Clock & Status HUD */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-huntx-surface border border-huntx-border shadow-2xl">
        <div className="flex items-center justify-between text-xs text-huntx-muted uppercase font-bold mb-2">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-huntx-runner animate-ping" />
            <span className="text-white">MATCH IN PROGRESS</span>
          </span>
          <span className="font-mono text-huntx-accent">{activeGame?.room_code}</span>
        </div>

        {/* Big Match Timer */}
        <div className="text-center my-3">
          <div className="font-mono text-6xl font-black tracking-tight text-white drop-shadow-md">
            {formatTime(remainingSeconds)}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-huntx-muted block mt-1">
            REMAINING MATCH DURATION
          </span>
        </div>

        {/* Head-Start or Hunters Released Indicator */}
        <div className="pt-3 border-t border-huntx-border/70 flex items-center justify-between text-xs">
          <span className="text-huntx-muted">Hunter Restraint:</span>
          {huntersReleased ? (
            <span className="font-bold text-huntx-hunter flex items-center space-x-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>HUNTERS RELEASED (ACTIVE)</span>
            </span>
          ) : (
            <span className="font-bold text-huntx-runner animate-pulse">
              HEAD-START: {headStartRemaining}s remaining
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Shrinking Zone Status */}
      <div className="p-4 rounded-3xl bg-huntx-surface border border-huntx-border flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-huntx-muted block">
            DYNAMIC ZONE STATUS
          </span>
          <h4 className="text-sm font-black text-white mt-0.5">{zoneNotice}</h4>
          {nextShrinkCountdown > 0 && (
            <p className="text-[11px] text-huntx-muted font-mono">
              Next contraction: <span className="text-huntx-accent font-bold">{nextShrinkCountdown}s</span>
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('player_map')}
          className="p-3 rounded-2xl bg-huntx-surfaceLight border border-huntx-border hover:border-huntx-accent text-huntx-accent transition-all"
        >
          <Compass className="w-6 h-6" />
        </button>
      </div>

      {/* Team Ratios / Capture Scoreboard */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hunters Card */}
        <div className="p-4 rounded-2xl bg-huntx-surface border border-huntx-hunter/30">
          <div className="flex items-center space-x-2 text-huntx-hunter mb-1">
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">HUNTERS ({hunters.length})</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {captures.length}{' '}
            <span className="text-xs font-normal text-huntx-muted uppercase">Captures</span>
          </div>
        </div>

        {/* Runners Card */}
        <div className="p-4 rounded-2xl bg-huntx-surface border border-huntx-runner/30">
          <div className="flex items-center space-x-2 text-huntx-runner mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">RUNNERS</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {activeRunners.length}{' '}
            <span className="text-xs font-normal text-huntx-muted uppercase">
              / {activeRunners.length + capturedRunners.length} Alive
            </span>
          </div>
        </div>
      </div>

      {/* Tactical Center Action: QR Scanner (Hunter) or QR Pass (Runner) */}
      <div className="pt-2">
        {isHunter && (
          <button
            onClick={() => setScannerOpen(true)}
            disabled={!huntersReleased}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-huntx-accent hover:from-red-500 hover:to-huntx-accentHover disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider shadow-glow-hunter flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Crosshair className="w-5 h-5" />
            <span>LAUNCH HUNTER QR SCANNER</span>
          </button>
        )}

        {isRunner && (
          <button
            onClick={() => onNavigate('runner_qr')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-huntx-runner to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider shadow-glow-runner flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <QrCode className="w-5 h-5" />
            <span>DISPLAY MY RUNNER PASS</span>
          </button>
        )}
      </div>

      {/* Host Emergency Stop Button */}
      {isHost && (
        <div className="pt-3 border-t border-huntx-border">
          <button
            onClick={() => endGame()}
            className="w-full py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>END MATCH & COMPILE SCORES</span>
          </button>
        </div>
      )}

      {/* Scanner Modal */}
      <HunterScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 17: FULL PLAYER MAP / RADAR SCREEN
// ------------------------------------------------------------------------------
export const PlayerMapScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({
  onNavigate,
}) => {
  const {
    activeGame,
    myPlayer,
    players,
    currentZoneRadius,
    currentZonePolygon,
    isZoneShrinkingNow,
    isOutsideSafeZone,
    updatePlayerLocation,
    toggleLocationSharing,
  } = useGame();

  const [simLocation, setSimLocation] = useState<{ lat: number; lng: number }>({
    lat: activeGame?.zone?.center.lat || 40.785091,
    lng: activeGame?.zone?.center.lng || -73.968285,
  });

  // Watch GPS location if enabled
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSimLocation(coords);
        updatePlayerLocation(coords.lat, coords.lng);
      },
      (err) => {
        console.log('GPS watch error/denied:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Filter visible teammates based on privacy settings
  const visibleTeammates = players.filter((p) => {
    if (p.id === myPlayer?.id) return false;
    if (!p.location_shared) return false;
    // Team visibility
    if (activeGame?.settings.team_location_visibility === 'team_only') {
      return p.team === myPlayer?.team;
    }
    return true;
  });

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Top Floating HUD */}
      <div className="absolute top-16 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-huntx-surface/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-huntx-border flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-huntx-runner animate-ping" />
          <span className="font-bold text-white">Safe Zone Radius:</span>
          <span className="font-mono text-huntx-accent font-bold">{currentZoneRadius}m</span>
        </div>

        {/* Location Consent Toggle */}
        <button
          onClick={() => toggleLocationSharing(!myPlayer?.location_shared)}
          className={`pointer-events-auto px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${
            myPlayer?.location_shared
              ? 'bg-huntx-runner/20 border-huntx-runner text-huntx-runner'
              : 'bg-huntx-surface/90 border-huntx-border text-huntx-muted'
          }`}
        >
          {myPlayer?.location_shared ? 'GPS Sharing: ON' : 'GPS Sharing: OFF'}
        </button>
      </div>

      {/* Leaflet Radar Map */}
      <div className="h-full w-full">
        <HuntMap
          center={activeGame?.zone?.center || simLocation}
          zoom={15}
          zone={activeGame?.zone}
          currentRadiusMeters={currentZoneRadius}
          currentPolygon={currentZonePolygon}
          isShrinking={isZoneShrinkingNow}
          playerLocation={simLocation}
          teammates={visibleTeammates}
          isOutside={isOutsideSafeZone}
        />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 18: HUNTER QR SCANNER SCREEN & SCREEN 19: RUNNER QR CODE SCREEN
// ------------------------------------------------------------------------------
export const HunterScannerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return <HunterScannerModal isOpen={true} onClose={onBack} />;
};

export const RunnerQRCodeScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeGame, myPlayer } = useGame();

  if (!myPlayer || !activeGame) {
    return <div className="p-4 text-white">No active session</div>;
  }

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-black tracking-wider text-white">
              MY RUNNER <span className="text-huntx-runner">QR PASS</span>
            </h2>
            <p className="text-xs text-huntx-muted">Present to Hunter upon physical capture</p>
          </div>
        </div>

        <RunnerQRCard
          token={myPlayer.qr_token}
          playerName={myPlayer.display_name}
          gameCode={activeGame.room_code}
          isCaptured={myPlayer.is_captured}
          captureRule={activeGame.settings.capture_rule}
        />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 20: CAPTURE REQUESTS SCREEN & SCREEN 21: CAPTURE APPROVAL SCREEN
// ------------------------------------------------------------------------------
export const CaptureRequestScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { captureRequests, respondToCaptureRequest, isHost } = useGame();

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <Crosshair className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            CAPTURE <span className="text-huntx-accent">VERIFICATION FEED</span>
          </h2>
          <p className="text-xs text-huntx-muted">Active capture claims & referee approvals</p>
        </div>
      </div>

      {captureRequests.length === 0 ? (
        <div className="p-8 text-center text-xs text-huntx-muted bg-huntx-surface rounded-3xl border border-huntx-border">
          No capture requests logged yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {captureRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="font-bold text-huntx-hunter">{req.hunter_name}</span>
                  <span className="text-huntx-muted">tagged</span>
                  <span className="font-bold text-huntx-runner">{req.runner_name}</span>
                </div>
                <span className="text-[10px] text-huntx-muted font-mono">
                  {new Date(req.created_at).toLocaleTimeString()} • {req.status.toUpperCase()}
                </span>
              </div>

              {req.status === 'pending' && isHost && (
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => respondToCaptureRequest(req.id, false)}
                    className="p-1.5 rounded-lg bg-red-950/60 border border-red-800 text-red-400 hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => respondToCaptureRequest(req.id, true)}
                    className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-huntx-runner hover:text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
