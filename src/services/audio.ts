// Web Audio API Synthesizer & BGM Service for NISIALAND
// Features Cleyton Kauffman's CC0 'Superhero' Adventure Theme with Chiptune Fallback

export type BGMTrack = 'loop' | 'intro' | 'violin' | 'violin_loop';

class AudioController {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmInterval: number | null = null;
  private isSoundMuted: boolean = false;
  private isMusicMuted: boolean = true; // BGM off by default until student or game turns it on
  private currentTrack: BGMTrack = 'loop';
  private targetVolume: number = 0.35;
  private sfxVolume: number = 0.3;
  private isDucked: boolean = false;
  private autoplayUnlockAttached: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachAutoplayUnlock();
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private attachAutoplayUnlock() {
    if (this.autoplayUnlockAttached) return;
    this.autoplayUnlockAttached = true;
    const unlock = () => {
      this.initCtx();
      if (!this.isMusicMuted && this.bgmAudio && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  public setSoundMuted(muted: boolean) {
    this.isSoundMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM(this.currentTrack);
    }
  }

  public setBgmVolume(vol: number) {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isDucked ? this.targetVolume * 0.2 : this.targetVolume;
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public isSoundOn(): boolean {
    return !this.isSoundMuted;
  }

  public isMusicOn(): boolean {
    return !this.isMusicMuted;
  }

  /**
   * Ducks the BGM volume during concentration moments (reading dialogues, solving questions)
   */
  public duckVolume(duck: boolean) {
    this.isDucked = duck;
    if (this.bgmAudio) {
      const effective = duck ? this.targetVolume * 0.2 : this.targetVolume;
      this.bgmAudio.volume = Math.max(0, effective);
    }
  }

  // --- SOUND EFFECTS ---

  public playCorrect() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Ascending major chime (D5 -> A5)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(this.sfxVolume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }

  public playChime() {
    this.playCorrect();
  }

  public playPowerup() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public playWrong() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft buzzer (A3 -> G#3)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(190, now + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  public playFanfare() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + index * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(this.sfxVolume * 0.7, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // Audio fallback
    }
  }

  public playFlip() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
      gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback
    }
  }

  public playTick() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playClick() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback
    }
  }

  // --- OFFICIAL BGM (Cleyton Kauffman - Superhero Theme) ---

  private getAudioSource(track: BGMTrack): string {
    // Check if can play OGG or fallback to MP3
    const testAudio = typeof Audio !== 'undefined' ? new Audio() : null;
    const canPlayOgg = testAudio && testAudio.canPlayType('audio/ogg; codecs="vorbis"');

    const ext = canPlayOgg ? 'ogg' : 'mp3';
    switch (track) {
      case 'intro':
        return `/assets/audio/superhero_intro.${ext}`;
      case 'violin':
        return `/assets/audio/superhero_violin.ogg`;
      case 'violin_loop':
        return `/assets/audio/superhero_violin_loop.ogg`;
      case 'loop':
      default:
        return `/assets/audio/superhero_loop.${ext}`;
    }
  }

  public startBGM(track: BGMTrack = 'loop') {
    this.currentTrack = track;
    if (this.isMusicMuted) return;

    if (typeof window === 'undefined') return;

    const src = this.getAudioSource(track);
    const effectiveVol = this.isDucked ? this.targetVolume * 0.2 : this.targetVolume;

    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio();
        this.bgmAudio.preload = 'auto';
      }

      // If already playing the same source, adjust volume and ensure playing
      if (this.bgmAudio.src.endsWith(src) && !this.bgmAudio.paused) {
        this.bgmAudio.volume = effectiveVol;
        return;
      }

      this.bgmAudio.src = src;
      this.bgmAudio.loop = track === 'loop' || track === 'violin_loop';
      this.bgmAudio.volume = effectiveVol;

      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] Autoplay blocked, will start on next interaction or fallback to synth:', err);
          // If audio file fails, fallback to retro chiptune synth
          this.startChiptuneFallback();
        });
      }
    } catch (err) {
      console.warn('[Audio] HTML5 Audio error, using synthesizer fallback:', err);
      this.startChiptuneFallback();
    }
  }

  public stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.stopChiptuneFallback();
  }

  // --- RETRO CHIPTUNE SYNTHESIZER FALLBACK ---
  private startChiptuneFallback() {
    if (this.isMusicMuted) return;
    this.initCtx();
    if (!this.ctx || this.bgmInterval) return;

    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
      261.63, 392.00, 523.25, 783.99, 523.25, 392.00
    ];
    let noteIdx = 0;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMusicMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melody[noteIdx % melody.length], now);
        const gainLevel = this.isDucked ? 0.01 : 0.04;
        gain.gain.setValueAtTime(gainLevel, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
        noteIdx++;
      } catch {
        // Fallback
      }
    }, 280);
  }

  private stopChiptuneFallback() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audioService = new AudioController();

export const soundEffects = {
  correct: () => audioService.playCorrect(),
  incorrect: () => audioService.playWrong(),
  cardFlip: () => audioService.playFlip(),
  buttonClick: () => audioService.playClick(),
  fanfare: () => audioService.playFanfare(),
  levelUp: () => audioService.playPowerup()
};

