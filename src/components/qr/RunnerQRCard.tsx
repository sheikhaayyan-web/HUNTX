// ==============================================================================
// HUNTX RUNNER QR CODE DISPLAY COMPONENT
// Renders dynamic tamper-evident QR code with high-contrast esports badge
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

interface RunnerQRCardProps {
  token: string;
  playerName: string;
  gameCode: string;
  isCaptured: boolean;
  captureRule: string;
}

export const RunnerQRCard: React.FC<RunnerQRCardProps> = ({
  token,
  playerName,
  gameCode,
  isCaptured,
  captureRule,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current || !token) return;

    QRCode.toCanvas(
      canvasRef.current,
      token,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (err) console.error('Failed to generate QR code', err);
      }
    );
  }, [token]);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-center bg-huntx-surface border-2 border-huntx-border rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-auto text-center overflow-hidden">
      {/* Background Accent Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-huntx-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-huntx-runner/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header status */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-huntx-runner" />
          <span className="text-xs uppercase font-bold tracking-widest text-huntx-muted">
            RUNNER PASS
          </span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-huntx-surfaceLight text-huntx-accent border border-huntx-border">
          ROOM: {gameCode}
        </span>
      </div>

      {/* QR Canvas Box */}
      <div className="relative p-3 bg-white rounded-2xl shadow-inner my-2">
        <canvas ref={canvasRef} className="rounded-lg" />

        {isCaptured && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
            <span className="text-huntx-hunter text-2xl font-black tracking-widest mb-1">
              CAPTURED
            </span>
            <span className="text-xs text-huntx-muted">
              Rule Applied: {captureRule.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Runner Name & Instructions */}
      <div className="mt-3 w-full">
        <h3 className="text-xl font-bold text-white tracking-wide">{playerName}</h3>
        <p className="text-xs text-huntx-muted mt-1 flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-huntx-accent" />
          <span>Present this QR Code to Hunter upon tag</span>
        </p>
      </div>

      {/* Digital Token Code & Fallback */}
      <div className="mt-4 pt-3 border-t border-huntx-border/60 w-full flex flex-col items-center">
        <span className="text-[10px] text-huntx-muted font-mono tracking-wider break-all">
          TOKEN: {token.slice(-14)}
        </span>
        <button
          onClick={copyToken}
          className="mt-2 text-xs text-huntx-accent hover:underline font-semibold"
        >
          {copied ? 'Copied to Clipboard!' : 'Copy Backup Token'}
        </button>
      </div>

      {/* Anti-fraud notice */}
      <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-huntx-muted/80 bg-huntx-bg/50 px-3 py-1.5 rounded-lg border border-huntx-border/40">
        <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
        <span>Max screen brightness recommended outdoors</span>
      </div>
    </div>
  );
};
