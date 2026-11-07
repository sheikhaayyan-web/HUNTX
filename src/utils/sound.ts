// ==============================================================================
// HUNTX PROCEDURAL ESPORTS SOUND & HAPTICS ENGINE (Web Audio API)
// ==============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public vibrate(pattern: number | number[] = 100) {
    if (!this.hapticsEnabled) return;
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptics errors if permission denied
      }
    }
  }

  /**
   * Outside Zone Alarm: Fast dual-tone pulsing emergency buzzer
   */
  public playZoneWarningSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([200, 100, 200, 100, 300]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15); // A4
    osc.frequency.setValueAtTime(880, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Countdown Tick: Crisp gaming click
   */
  public playCountdownTick(isFinal: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate(isFinal ? 150 : 50);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = isFinal ? 1200 : 750;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.3 : 0.08));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.3 : 0.08));
  }

  /**
   * Game Start: Esports Horn / Power-up Sweep
   */
  public playGameStartSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([100, 50, 100, 50, 400]);

    const now = ctx.currentTime;

    // Sub bass drop
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(150, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.8);
    bassGain.gain.setValueAtTime(0.5, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.8);

    // High synth blast
    const horn = ctx.createOscillator();
    const hornGain = ctx.createGain();
    horn.type = 'sawtooth';
    horn.frequency.setValueAtTime(440, now + 0.1);
    horn.frequency.exponentialRampToValueAtTime(880, now + 0.6);
    hornGain.gain.setValueAtTime(0.3, now + 0.1);
    hornGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    horn.connect(hornGain);
    hornGain.connect(ctx.destination);
    horn.start(now + 0.1);
    horn.stop(now + 0.8);
  }

  /**
   * Capture Confirmed: Satisfying metallic hit + score bell
   */
  public playCaptureSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([80, 40, 120]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Victory Fanfare: Celebratory major chord sweep
   */
  public playVictorySound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([100, 100, 100, 100, 500]);

    const notes = [440, 554.37, 659.25, 880]; // A major
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + 1.2);
    });
  }

  /**
   * UI Click / Tap
   */
  public playTapSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate(25);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const sounds = new SoundEngine();
