// ==============================================================================
// HUNTX CAPTURE CONFIRMATION & HOST APPROVAL MODAL (Mode B & Mode C)
// Real-time verification dialogue with audible alert and dispute handling
// ==============================================================================

import React, { useEffect } from 'react';
import { AlertTriangle, Check, X, ShieldAlert, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../utils/sound';

export const CaptureConfirmationModal: React.FC = () => {
  const { captureRequests, respondToCaptureRequest, myPlayer, isHost } = useGame();
  const { currentUser } = useAuth();

  // Find pending requests relevant to me:
  // If Mode B (Runner Confirmation): show to the tagged Runner
  // If Mode C (Host Approval): show to the Host
  const pendingForMe = captureRequests.find((req) => {
    if (req.status !== 'pending') return false;
    if (req.verification_mode === 'runner_confirmation' && req.runner_player_id === myPlayer?.id) {
      return true;
    }
    if (req.verification_mode === 'host_approval' && isHost) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (pendingForMe) {
      sounds.playZoneWarningSound();
    }
  }, [pendingForMe?.id]);

  if (!pendingForMe) return null;

  const isRunnerMode = pendingForMe.verification_mode === 'runner_confirmation';

  return (
    <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-huntx-card border-2 border-huntx-accent rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center animate-pulse-zone">
        <div className="p-4 bg-huntx-accent/10 rounded-full mb-3">
          {isRunnerMode ? (
            <ShieldAlert className="w-12 h-12 text-huntx-accent" />
          ) : (
            <Award className="w-12 h-12 text-huntx-accent" />
          )}
        </div>

        <h3 className="text-xl font-black text-white tracking-wider">
          {isRunnerMode ? 'YOU WERE TAGGED!' : 'HOST APPROVAL REQUIRED'}
        </h3>

        <p className="text-sm text-huntx-muted mt-2">
          {isRunnerMode ? (
            <>
              Hunter <span className="font-bold text-huntx-hunter">{pendingForMe.hunter_name}</span> has scanned your QR pass! Do you confirm this capture?
            </>
          ) : (
            <>
              Hunter <span className="font-bold text-huntx-hunter">{pendingForMe.hunter_name}</span> claims capture on Runner <span className="font-bold text-huntx-runner">{pendingForMe.runner_name}</span>.
            </>
          )}
        </p>

        <div className="mt-6 flex items-center space-x-3 w-full">
          <button
            onClick={() => respondToCaptureRequest(pendingForMe.id, false)}
            className="flex-1 py-3 px-4 rounded-xl border border-huntx-border hover:bg-huntx-surfaceLight text-huntx-muted hover:text-white font-bold text-sm flex items-center justify-center space-x-1.5 transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
            <span>Dispute / Reject</span>
          </button>
          <button
            onClick={() => respondToCaptureRequest(pendingForMe.id, true)}
            className="flex-1 py-3 px-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm flex items-center justify-center space-x-1.5 shadow-glow-orange transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Capture</span>
          </button>
        </div>

        <p className="text-[10px] text-huntx-darkMuted mt-4 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-huntx-accent" />
          <span>Fair play sportsmanship policy enforced</span>
        </p>
      </div>
    </div>
  );
};
