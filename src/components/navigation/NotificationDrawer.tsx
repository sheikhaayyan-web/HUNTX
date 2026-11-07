// ==============================================================================
// HUNTX NOTIFICATION CENTER & IN-APP ALERT DRAWER
// Real-time tactical logs, zone shrink warnings, & capture alerts
// ==============================================================================

import React from 'react';
import { X, Bell, AlertTriangle, ShieldCheck, Crosshair, Info, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, dismissNotification } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-huntx-card border-l border-huntx-border h-full flex flex-col p-5 shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-huntx-border">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-huntx-accent" />
            <h3 className="font-display font-black text-lg text-white tracking-wider">
              TACTICAL INTEL LOGS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-huntx-muted hover:text-white hover:bg-huntx-surfaceLight"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-huntx-muted">
              No new alerts. All systems operational.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border flex items-start justify-between space-x-3 text-xs"
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5">
                    {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {n.type === 'capture' && <Crosshair className="w-4 h-4 text-huntx-hunter" />}
                    {n.type === 'zone' && <ShieldCheck className="w-4 h-4 text-huntx-accent" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                    {n.type === 'success' && <Check className="w-4 h-4 text-huntx-runner" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-white leading-tight">{n.title}</h5>
                    <p className="text-[11px] text-huntx-muted mt-0.5 leading-snug">{n.message}</p>
                    <span className="text-[9px] text-huntx-darkMuted font-mono mt-1 block">
                      {n.created_at}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dismissNotification(n.id)}
                  className="text-huntx-darkMuted hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
