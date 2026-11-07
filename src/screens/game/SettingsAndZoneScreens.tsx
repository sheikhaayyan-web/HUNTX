// ==============================================================================
// SCREENS 11, 12, 13, 14, 15: SETTINGS, MODES, ZONE DRAFTING & STAGE MANAGER
// Interactive Boundary Customization, Shrinking Timelines & Esports Presets
// ==============================================================================

import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Crosshair,
  MapPin,
  Layers,
  Plus,
  Trash2,
  Save,
  Check,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Radio,
  Eye,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { HuntMap } from '../../components/map/HuntMap';
import {
  CaptureVerificationMode,
  CaptureRuleType,
  OutsidePenaltyType,
  CustomGameModePreset,
  ZoneBoundary,
  ZoneStage,
  LatLng,
} from '../../types/huntx';
import { LocalStore } from '../../services/supabase';

// ------------------------------------------------------------------------------
// SCREEN 11: GAME SETTINGS SCREEN
// ------------------------------------------------------------------------------
export const GameSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeGame, isHost } = useGame();
  const [verification, setVerification] = useState<CaptureVerificationMode>(
    activeGame?.settings.capture_verification || 'runner_confirmation'
  );
  const [rule, setRule] = useState<CaptureRuleType>(
    activeGame?.settings.capture_rule || 'elimination'
  );
  const [hunterPenalty, setHunterPenalty] = useState<OutsidePenaltyType>(
    activeGame?.settings.hunter_penalty || 'freeze_60s'
  );
  const [runnerPenalty, setRunnerPenalty] = useState<OutsidePenaltyType>(
    activeGame?.settings.runner_penalty || 'elimination'
  );
  const [countdownSec, setCountdownSec] = useState<number>(
    activeGame?.settings.outside_countdown_seconds || 30
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!activeGame) return;
    activeGame.settings = {
      ...activeGame.settings,
      capture_verification: verification,
      capture_rule: rule,
      hunter_penalty: hunterPenalty,
      runner_penalty: runnerPenalty,
      outside_countdown_seconds: countdownSec,
    };
    LocalStore.upsertGame(activeGame);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            MATCH <span className="text-huntx-accent">RULES & SETTINGS</span>
          </h2>
          <p className="text-xs text-huntx-muted">Configure capture mechanics & penalties</p>
        </div>
      </div>

      {/* Capture Verification Mode */}
      <div className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border space-y-2">
        <label className="text-xs font-bold uppercase text-white flex items-center space-x-1.5">
          <Crosshair className="w-4 h-4 text-huntx-accent" />
          <span>Capture Verification Protocol</span>
        </label>
        <div className="space-y-2 pt-1">
          {[
            {
              id: 'runner_confirmation',
              title: 'Mode B — Runner Confirmation',
              desc: 'Runner receives prompt on phone to confirm they were tagged.',
            },
            {
              id: 'host_approval',
              title: 'Mode C — Host Approval',
              desc: 'Host reviews capture requests before official confirmation.',
            },
            {
              id: 'instant',
              title: 'Mode Instant — Optical Tag',
              desc: 'Immediate capture as soon as Hunter scans valid QR code.',
            },
          ].map((item) => (
            <button
              key={item.id}
              disabled={!isHost}
              onClick={() => setVerification(item.id as CaptureVerificationMode)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                verification === item.id
                  ? 'bg-huntx-accent/15 border-huntx-accent text-white'
                  : 'bg-huntx-bg border-huntx-border text-huntx-muted'
              }`}
            >
              <div className="font-bold text-xs text-white">{item.title}</div>
              <div className="text-[10px] text-huntx-muted mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Capture Outcome Rule */}
      <div className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border space-y-2">
        <label className="text-xs font-bold uppercase text-white flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-huntx-runner" />
          <span>Capture Outcome Rule</span>
        </label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { id: 'elimination', title: 'Elimination', desc: 'Leaves active match' },
            { id: 'team_switch', title: 'Team Switch', desc: 'Turns into Hunter' },
            { id: 'waiting_area', title: 'Waiting Area', desc: 'Held until released' },
            { id: 'custom', title: 'Custom Rule', desc: 'Host referee defined' },
          ].map((r) => (
            <button
              key={r.id}
              disabled={!isHost}
              onClick={() => setRule(r.id as CaptureRuleType)}
              className={`p-3 rounded-xl border text-left transition-all ${
                rule === r.id
                  ? 'bg-huntx-accent/15 border-huntx-accent text-white'
                  : 'bg-huntx-bg border-huntx-border text-huntx-muted'
              }`}
            >
              <div className="font-bold text-xs text-white">{r.title}</div>
              <div className="text-[10px] text-huntx-muted mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Outside Zone Penalty Settings */}
      <div className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border space-y-3">
        <label className="text-xs font-bold uppercase text-white flex items-center space-x-1.5">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Outside Safe Zone Penalties</span>
        </label>

        <div>
          <span className="text-[11px] text-huntx-muted block mb-1">
            Return Grace Period: <strong className="text-white">{countdownSec}s</strong>
          </span>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            disabled={!isHost}
            value={countdownSec}
            onChange={(e) => setCountdownSec(Number(e.target.value))}
            className="w-full accent-huntx-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-bold text-huntx-muted uppercase block mb-1">
              Hunter Penalty
            </label>
            <select
              value={hunterPenalty}
              disabled={!isHost}
              onChange={(e) => setHunterPenalty(e.target.value as OutsidePenaltyType)}
              className="w-full bg-huntx-bg border border-huntx-border rounded-xl px-2.5 py-2 text-xs text-white"
            >
              <option value="freeze_60s">60s Freeze</option>
              <option value="penalty_point">Penalty Point</option>
              <option value="elimination">Elimination</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-huntx-muted uppercase block mb-1">
              Runner Penalty
            </label>
            <select
              value={runnerPenalty}
              disabled={!isHost}
              onChange={(e) => setRunnerPenalty(e.target.value as OutsidePenaltyType)}
              className="w-full bg-huntx-bg border border-huntx-border rounded-xl px-2.5 py-2 text-xs text-white"
            >
              <option value="elimination">Elimination</option>
              <option value="freeze_60s">60s Freeze</option>
              <option value="penalty_point">Penalty Point</option>
            </select>
          </div>
        </div>
      </div>

      {isHost && (
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange flex items-center justify-center space-x-1.5 transition-all"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'SETTINGS UPDATED!' : 'APPLY MATCH RULES'}</span>
        </button>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 12: GAME MODE SELECTION & SCREEN 13: CUSTOM MODE BUILDER
// ------------------------------------------------------------------------------
export const GameModeSelectScreen: React.FC<{
  onBack: () => void;
  onOpenCustomBuilder: () => void;
}> = ({ onBack, onOpenCustomBuilder }) => {
  const presets = LocalStore.getCustomPresets();

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
            GAME <span className="text-huntx-accent">MODES & PRESETS</span>
          </h2>
          <p className="text-xs text-huntx-muted">Competitive presets & custom mode manager</p>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          onClick={onOpenCustomBuilder}
          className="px-3.5 py-2 rounded-xl bg-huntx-accent text-black font-bold text-xs flex items-center space-x-1 shadow-glow-orange"
        >
          <Plus className="w-4 h-4" />
          <span>Build Custom Mode</span>
        </button>
      </div>

      <div className="space-y-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border hover:border-huntx-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-base font-black text-white">{preset.title}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-huntx-bg text-huntx-accent border border-huntx-border font-bold">
                {preset.game_duration_min} MIN
              </span>
            </div>
            <p className="text-xs text-huntx-muted mb-3">{preset.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-huntx-muted pt-2 border-t border-huntx-border/60">
              <div>
                Head-start: <strong className="text-white">{preset.head_start_sec}s</strong>
              </div>
              <div>
                Stages: <strong className="text-white">{preset.num_shrink_stages}</strong>
              </div>
              <div>
                Rule: <strong className="text-white">{preset.capture_rule}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CustomModeBuilderScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMin, setDurationMin] = useState(25);
  const [headStartSec, setHeadStartSec] = useState(45);
  const [stages, setStages] = useState(3);
  const [rule, setRule] = useState<CaptureRuleType>('elimination');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPreset: CustomGameModePreset = {
      id: 'preset_' + Math.random().toString(36).substring(2, 9),
      creator_id: currentUser?.id || 'host',
      title: title.trim(),
      description: description.trim() || 'Custom created esports match configuration.',
      game_duration_min: durationMin,
      head_start_sec: headStartSec,
      capture_verification: 'runner_confirmation',
      capture_rule: rule,
      outside_countdown_sec: 25,
      hunter_penalty: 'freeze_60s',
      runner_penalty: 'elimination',
      zone_type: 'circle',
      num_shrink_stages: stages,
    };

    LocalStore.saveCustomPreset(newPreset);
    setSaved(true);
    setTimeout(() => {
      onBack();
    }, 1200);
  };

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
            CUSTOM <span className="text-huntx-accent">MODE BUILDER</span>
          </h2>
          <p className="text-xs text-huntx-muted">Craft and persist your own game rules</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-huntx-muted uppercase block mb-1">Preset Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midnight Manhunt"
            required
            className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-huntx-accent"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-huntx-muted uppercase block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tactical objectives and team balance guidelines..."
            rows={2}
            className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-huntx-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-huntx-muted uppercase block mb-1">Match Time (Min)</label>
            <input
              type="number"
              min={10}
              max={120}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-huntx-muted uppercase block mb-1">Head-Start (Sec)</label>
            <input
              type="number"
              min={15}
              max={300}
              value={headStartSec}
              onChange={(e) => setHeadStartSec(Number(e.target.value))}
              className="w-full bg-huntx-surface border border-huntx-border rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange flex items-center justify-center space-x-1.5"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'PRESET SAVED!' : 'SAVE CUSTOM PRESET'}</span>
        </button>
      </form>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 14: ZONE SELECTION MAP (Circle vs Polygon)
// ------------------------------------------------------------------------------
export const ZoneSelectionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeGame, updateZoneBoundary, isHost } = useGame();
  const currentZone = activeGame?.zone;

  const [zoneType, setZoneType] = useState<'circle' | 'polygon'>(
    currentZone?.zone_type || 'circle'
  );
  const [radiusMeters, setRadiusMeters] = useState<number>(
    currentZone?.initial_radius_meters || 600
  );
  const [center, setCenter] = useState<LatLng>(
    currentZone?.center || { lat: 40.785091, lng: -73.968285 }
  );
  const [polygonCoords, setPolygonCoords] = useState<LatLng[]>(
    currentZone?.initial_polygon || [
      { lat: center.lat + 0.005, lng: center.lng - 0.005 },
      { lat: center.lat + 0.005, lng: center.lng + 0.005 },
      { lat: center.lat - 0.005, lng: center.lng + 0.005 },
      { lat: center.lat - 0.005, lng: center.lng - 0.005 },
    ]
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!activeGame) return;
    const newZone: ZoneBoundary = {
      id: 'zone_' + activeGame.id,
      game_id: activeGame.id,
      zone_type: zoneType,
      center: center,
      initial_radius_meters: radiusMeters,
      current_radius_meters: radiusMeters,
      initial_polygon: polygonCoords,
      current_polygon: polygonCoords,
    };
    updateZoneBoundary(newZone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMapClick = (coords: LatLng) => {
    if (zoneType === 'circle') {
      setCenter(coords);
    } else {
      setPolygonCoords((prev) => [...prev, coords]);
    }
  };

  const clearPolygon = () => {
    setPolygonCoords([]);
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-4 pb-28 max-w-lg mx-auto space-y-3">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-black tracking-wider text-white">
            PLAYING ZONE <span className="text-huntx-accent">BOUNDARY</span>
          </h2>
          <p className="text-xs text-huntx-muted">Click map to adjust center or polygon vertices</p>
        </div>
      </div>

      {/* Zone Type Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setZoneType('circle')}
          className={`py-2 rounded-xl border text-xs font-bold transition-all ${
            zoneType === 'circle'
              ? 'bg-huntx-accent/20 border-huntx-accent text-white shadow-glow-orange'
              : 'bg-huntx-surface border-huntx-border text-huntx-muted'
          }`}
        >
          Circular Safe Zone
        </button>
        <button
          onClick={() => setZoneType('polygon')}
          className={`py-2 rounded-xl border text-xs font-bold transition-all ${
            zoneType === 'polygon'
              ? 'bg-huntx-accent/20 border-huntx-accent text-white shadow-glow-orange'
              : 'bg-huntx-surface border-huntx-border text-huntx-muted'
          }`}
        >
          Custom Polygon Shape
        </button>
      </div>

      {/* Map Display */}
      <div className="h-[360px] w-full">
        <HuntMap
          center={center}
          zoom={15}
          zone={{
            id: 'draft',
            game_id: 'draft',
            zone_type: zoneType,
            center: center,
            initial_radius_meters: radiusMeters,
            current_radius_meters: radiusMeters,
            initial_polygon: polygonCoords,
          }}
          currentRadiusMeters={radiusMeters}
          currentPolygon={polygonCoords}
          isHostEditMode={true}
          onZoneCenterChange={handleMapClick}
        />
      </div>

      {/* Controls */}
      {zoneType === 'circle' ? (
        <div className="p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border">
          <div className="flex justify-between text-xs font-bold text-huntx-muted mb-1">
            <span>Radius:</span>
            <span className="text-white font-mono">{radiusMeters} Meters</span>
          </div>
          <input
            type="range"
            min={200}
            max={2500}
            step={50}
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="w-full accent-huntx-accent"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-huntx-surface border border-huntx-border text-xs text-huntx-muted">
          <span>Vertices Placed: <strong className="text-white">{polygonCoords.length} points</strong></span>
          <button
            onClick={clearPolygon}
            className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-400 hover:text-white border border-red-800 text-[11px] font-bold"
          >
            Clear Vertices
          </button>
        </div>
      )}

      {isHost && (
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange flex items-center justify-center space-x-1.5"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'ZONE SAVED TO MATCH!' : 'CONFIRM PLAYING ZONE'}</span>
        </button>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 15: ZONE STAGE MANAGER (Dynamic Shrinking Timeline)
// ------------------------------------------------------------------------------
export const ZoneStageManagerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { activeGame, updateZoneStages, isHost } = useGame();
  const stages = activeGame?.stages || [];
  const [stageList, setStageList] = useState<ZoneStage[]>(stages);
  const [saved, setSaved] = useState(false);

  const addStage = () => {
    const nextNum = stageList.length + 1;
    const lastOffset = stageList.length > 0 ? stageList[stageList.length - 1].start_offset_seconds : 0;
    const newStage: ZoneStage = {
      id: 'stg_' + Math.random().toString(36).substring(2, 7),
      stage_number: nextNum,
      start_offset_seconds: lastOffset + 300,
      shrink_duration_seconds: 60,
      target_radius_ratio: Math.max(0.2, 0.8 - nextNum * 0.15),
    };
    setStageList([...stageList, newStage]);
  };

  const removeStage = (id: string) => {
    setStageList(stageList.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    updateZoneStages(stageList);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            ZONE <span className="text-huntx-accent">SHRINK STAGES</span>
          </h2>
          <p className="text-xs text-huntx-muted">Configure timeline & inward contraction stages</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-huntx-muted uppercase">
          Configured Stages ({stageList.length})
        </span>
        {isHost && (
          <button
            onClick={addStage}
            className="px-3 py-1.5 bg-huntx-accent hover:bg-huntx-accentHover text-black font-bold text-xs rounded-xl flex items-center space-x-1 shadow-glow-orange"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shrink Stage</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {stageList.map((stg) => (
          <div
            key={stg.id}
            className="p-4 rounded-2xl bg-huntx-surface border border-huntx-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-huntx-accent/20 text-huntx-accent border border-huntx-accent/30 uppercase">
                Stage {stg.stage_number}
              </span>
              {isHost && (
                <button
                  onClick={() => removeStage(stg.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-huntx-bg p-2 rounded-xl border border-huntx-border/60">
                <span className="text-[10px] text-huntx-muted block">Trigger Time</span>
                <span className="font-bold text-white">{Math.round(stg.start_offset_seconds / 60)}m ({stg.start_offset_seconds}s)</span>
              </div>
              <div className="bg-huntx-bg p-2 rounded-xl border border-huntx-border/60">
                <span className="text-[10px] text-huntx-muted block">Duration</span>
                <span className="font-bold text-white">{stg.shrink_duration_seconds}s</span>
              </div>
              <div className="bg-huntx-bg p-2 rounded-xl border border-huntx-border/60">
                <span className="text-[10px] text-huntx-muted block">Contract To</span>
                <span className="font-bold text-huntx-accent">{Math.round(stg.target_radius_ratio * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isHost && (
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange flex items-center justify-center space-x-1.5"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'STAGES SYNCHRONIZED!' : 'SAVE SHRINKING STAGES'}</span>
        </button>
      )}
    </div>
  );
};
