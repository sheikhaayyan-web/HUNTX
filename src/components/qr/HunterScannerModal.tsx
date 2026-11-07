// ==============================================================================
// HUNTX HUNTER QR SCANNER & CAPTURE TERMINAL
// Camera-based optical scanner + manual token entry + local test simulator
// ==============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, Crosshair, Zap, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../utils/sound';

interface HunterScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HunterScannerModal: React.FC<HunterScannerModalProps> = ({ isOpen, onClose }) => {
  const { players, submitCaptureScan, huntersReleased, headStartRemaining } = useGame();
  const [manualCode, setManualCode] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'huntx-qr-reader-target';

  // Active uncaptured runners for simulation / target selection
  const activeRunners = players.filter((p) => p.team === 'runners' && !p.is_captured);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // Try starting camera if available
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const scanner = new Html5Qrcode(qrRegionId);
        scannerRef.current = scanner;

        // Prefer back camera on mobile
        const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleCodeScanned(decodedText);
          },
          () => {
            // Scanning in progress
          }
        );
        setCameraActive(true);
      } else {
        setCameraError('No camera detected on this device. Use manual code or quick selector below.');
      }
    } catch (err: unknown) {
      console.warn('Camera initiation failed or denied:', err);
      setCameraError('Camera access unavailable or denied. Use manual code or test runner target.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {}).finally(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
        setCameraActive(false);
      });
    }
  };

  const handleCodeScanned = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    sounds.playTapSound();

    const res = await submitCaptureScan(token);
    setScanStatus(res.message);

    if (res.success) {
      sounds.playCaptureSound();
      setTimeout(() => {
        setIsProcessing(false);
        setScanStatus(null);
        onClose();
      }, 1800);
    } else {
      sounds.playZoneWarningSound();
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeScanned(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-huntx-card border border-huntx-border rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-huntx-border">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-6 h-6 text-huntx-hunter animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <h3 className="text-lg font-black text-white tracking-wider">HUNTER SCANNER</h3>
              <p className="text-[11px] text-huntx-muted">Scan Runner QR Code to register capture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-huntx-surfaceLight text-huntx-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Head-Start Warning Notice */}
        {!huntersReleased && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center space-x-3 text-xs text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold">HEAD-START ACTIVE: </span>
              Hunters are restrained for another <span className="font-mono font-bold text-white">{headStartRemaining}s</span> before captures are enabled!
            </div>
          </div>
        )}

        {/* Optical Camera Viewport */}
        <div className="relative my-4 rounded-2xl overflow-hidden bg-black border-2 border-huntx-border min-h-[260px] flex items-center justify-center">
          <div id={qrRegionId} className="w-full h-full" />

          {/* Laser scanning beam overlay when camera active */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
              <div className="w-56 h-56 border-2 border-huntx-hunter/60 rounded-xl relative">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-huntx-hunter shadow-[0_0_12px_#EF4444] animate-pulse" />
              </div>
            </div>
          )}

          {!cameraActive && cameraError && (
            <div className="p-4 text-center text-xs text-huntx-muted flex flex-col items-center">
              <Camera className="w-10 h-10 text-huntx-border mb-2" />
              <p>{cameraError}</p>
            </div>
          )}

          {scanStatus && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-20">
              <CheckCircle className="w-12 h-12 text-huntx-runner mb-2 animate-bounce" />
              <p className="text-sm font-bold text-white">{scanStatus}</p>
            </div>
          )}
        </div>

        {/* Manual Token Entry Form */}
        <form onSubmit={handleManualSubmit} className="mt-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-huntx-muted block mb-1">
            Manual Runner Token Entry
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste or type HUNTX token..."
              disabled={isProcessing}
              className="flex-1 bg-huntx-surface border border-huntx-border rounded-xl px-3 py-2 text-xs text-white placeholder-huntx-muted focus:outline-none focus:border-huntx-accent"
            />
            <button
              type="submit"
              disabled={isProcessing || !manualCode.trim()}
              className="px-4 py-2 bg-huntx-accent hover:bg-huntx-accentHover disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center space-x-1"
            >
              <Zap className="w-4 h-4" />
              <span>Capture</span>
            </button>
          </div>
        </form>

        {/* Quick Testing Simulation Target Selection (Developer & Pair Testing) */}
        <div className="mt-5 pt-4 border-t border-huntx-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-huntx-muted">
              Active Targets In Range ({activeRunners.length})
            </span>
            <span className="text-[10px] text-huntx-accent font-semibold">One-Click Test Scan</span>
          </div>

          {activeRunners.length === 0 ? (
            <p className="text-xs text-huntx-muted text-center py-2 bg-huntx-surface/50 rounded-xl">
              No active Runners remaining to capture.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {activeRunners.map((runner) => (
                <div
                  key={runner.id}
                  className="flex items-center justify-between bg-huntx-surface/70 hover:bg-huntx-surface border border-huntx-border/60 rounded-xl px-3 py-2 transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-huntx-runner animate-ping" />
                    <div>
                      <p className="text-xs font-bold text-white">{runner.display_name}</p>
                      <p className="text-[9px] text-huntx-muted font-mono">{runner.qr_token.slice(-12)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCodeScanned(runner.qr_token)}
                    disabled={isProcessing || !huntersReleased}
                    className="text-[11px] px-2.5 py-1 bg-huntx-hunter/20 hover:bg-huntx-hunter border border-huntx-hunter/40 hover:text-white text-huntx-hunter font-bold rounded-lg transition-colors disabled:opacity-40"
                  >
                    Tag Runner
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
