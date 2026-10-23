// Web Audio API Synthesizer & BGM Service for NISIALAND
// Features Cleyton Kauffman's CC0 'Superhero' Adventure Theme with Chiptune Fallback

// Trilhas por momento do jogo:
// apresentacao = abertura/menu (superhero_intro -> superhero_violin_loop)
// mapa = mapa do Nível 0, cadastro e ranking
// desafio = quiz, flashcards e Treino livre
// vitoria = telas de resultado (toca uma vez e volta para a trilha do mapa)
export type MusicTrack = 'apresentacao' | 'mapa' | 'desafio' | 'vitoria';

const MUSIC_PREF_KEY = 'nisialand_music_on';
const CROSSFADE_MS = 800;
const DUCK_FACTOR = 0.5;

// Música ligada por padrão; respeita a escolha salva do aluno.
function readMusicPref(): boolean {
  try {
    return localStorage.getItem(MUSIC_PREF_KEY) !== '0';
  } catch {
    return true;
  }
}

class AudioController {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmInterval: number | null = null;
  private isSoundMuted: boolean = false;
  private isMusicMuted: boolean = !readMusicPref();
  private currentTrack: MusicTrack | null = null;
  private introDone: boolean = false;
  private fades = new Map<HTMLAudioElement, number>();
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
    // O navegador só libera o áudio depois de um toque; a cada interação, se a trilha
    // deveria estar tocando e ficou parada pelo bloqueio, ela começa.
    const unlock = () => {
      this.initCtx();
      if (this.shouldPlayMusic() && this.bgmAudio && this.bgmAudio.paused) {
        this.applyTrack();
      }
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  public setSoundMuted(muted: boolean) {
    this.isSoundMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    try {
      localStorage.setItem(MUSIC_PREF_KEY, muted ? '0' : '1');
    } catch {
      // ignora
    }
    this.applyTrack();
  }

  public setBgmVolume(vol: number) {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) {
      this.fadeTo(this.bgmAudio, this.effectiveVolume(), 200);
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
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.fadeTo(this.bgmAudio, this.effectiveVolume(), 300);
    }
  }

  private effectiveVolume(): number {
    return this.isDucked ? this.targetVolume * DUCK_FACTOR : this.targetVolume;
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

  // Sequência de acertos: arpejo que sobe mais a cada nível de combo.
  public playCombo(level: number = 2) {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const base = 523.25 * Math.pow(2, Math.min(Math.max(level - 2, 0), 4) / 12); // sobe um semitom por nível
      [1, 1.25, 1.5, 2].forEach((ratio, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + 0.12 + index * 0.06;
        osc.type = 'square';
        osc.frequency.setValueAtTime(base * ratio, start);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // Audio fallback
    }
  }

  // --- DIRETOR DE MÚSICA (trilhas por momento, com crossfade) ---

  private canPlayOgg(): boolean {
    if (typeof Audio === 'undefined') return false;
    return !!new Audio().canPlayType('audio/ogg; codecs="vorbis"');
  }

  private trackSource(track: MusicTrack): { src: string; loop: boolean } {
    const ogg = this.canPlayOgg();
    const ext = ogg ? 'ogg' : 'mp3';
    switch (track) {
      case 'apresentacao':
        if (!this.introDone) return { src: `/assets/audio/superhero_intro.${ext}`, loop: false };
        // O loop de violino só existe em OGG; sem OGG usa o loop original.
        return { src: ogg ? '/assets/audio/superhero_violin_loop.ogg' : '/assets/audio/superhero_loop.mp3', loop: true };
      case 'mapa':
        return { src: `/assets/audio/trilha_mapa.${ext}`, loop: true };
      case 'desafio':
        return { src: `/assets/audio/trilha_desafio.${ext}`, loop: true };
      case 'vitoria':
        return { src: `/assets/audio/vitoria.${ext}`, loop: false };
    }
  }

  private shouldPlayMusic(): boolean {
    return !this.isMusicMuted && this.storyHolds === 0 && this.currentTrack !== null;
  }

  /** Troca a trilha de fundo com crossfade (~0.8 s). Repetir a trilha atual não reinicia a música. */
  public playTrack(track: MusicTrack) {
    this.currentTrack = track;
    this.applyTrack();
  }

  /** Toca a vinheta de vitória uma vez e depois volta para a trilha do mapa. */
  public playVictory() {
    if (this.isMusicMuted) {
      this.currentTrack = 'mapa';
      return;
    }
    // Cada tela de resultado toca a vinheta desde o início.
    if (this.bgmAudio?.dataset.track === 'vitoria') this.bgmAudio.dataset.src = '';
    this.playTrack('vitoria');
  }

  public getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  // Silencia a trilha enquanto um vídeo ou história narrada está na tela,
  // para a música não competir com a escuta do inglês. Ao terminar, a trilha continua de onde parou.
  private storyHolds = 0;

  public holdMusicForStory() {
    this.storyHolds++;
    this.applyTrack();
  }

  public releaseMusicForStory() {
    this.storyHolds = Math.max(0, this.storyHolds - 1);
    this.applyTrack();
  }

  private applyTrack() {
    if (typeof window === 'undefined') return;
    if (!this.shouldPlayMusic() || !this.currentTrack) {
      this.stopBGM();
      return;
    }
    const track = this.currentTrack;
    const { src, loop } = this.trackSource(track);
    const current = this.bgmAudio;

    // Mesma trilha: só garante que está tocando no volume certo (retoma depois de uma pausa).
    if (current && current.dataset.src === src) {
      this.stopChiptuneFallback();
      if (current.paused) {
        current.volume = 0;
        this.safePlay(current);
      }
      this.fadeTo(current, this.effectiveVolume(), current.volume === 0 ? 400 : 200);
      return;
    }

    try {
      const next = new Audio();
      next.preload = 'auto';
      next.src = src;
      next.loop = loop;
      next.volume = 0;
      next.dataset.src = src;
      next.dataset.track = track;
      next.addEventListener('ended', () => this.onTrackEnded(next));
      next.addEventListener('error', () => {
        if (this.bgmAudio === next) this.startChiptuneFallback();
      });

      if (current) this.fadeTo(current, 0, CROSSFADE_MS, () => current.pause());
      this.bgmAudio = next;
      this.stopChiptuneFallback();
      this.safePlay(next);
      this.fadeTo(next, this.effectiveVolume(), CROSSFADE_MS);
    } catch (err) {
      console.warn('[Audio] HTML5 Audio error, using synthesizer fallback:', err);
      this.startChiptuneFallback();
    }
  }

  private onTrackEnded(el: HTMLAudioElement) {
    if (this.bgmAudio !== el) return;
    const track = el.dataset.track;
    if (track === 'apresentacao') {
      this.introDone = true;
      this.applyTrack();
    } else if (track === 'vitoria' && this.currentTrack === 'vitoria') {
      this.currentTrack = 'mapa';
      this.applyTrack();
    }
  }

  // Bloqueio de autoplay não é erro: a trilha fica pronta e começa no próximo toque.
  private safePlay(el: HTMLAudioElement) {
    try {
      const p = el.play();
      if (p !== undefined) {
        p.catch((err: unknown) => {
          const name = (err as { name?: string } | null)?.name;
          if (name === 'NotAllowedError' || name === 'AbortError') return;
          if (this.bgmAudio === el) this.startChiptuneFallback();
        });
      }
    } catch {
      // ambiente sem mídia (testes)
    }
  }

  private fadeTo(el: HTMLAudioElement, target: number, ms: number, then?: () => void) {
    const running = this.fades.get(el);
    if (running) clearInterval(running);
    const from = el.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      el.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps)));
      if (i >= steps) {
        clearInterval(id);
        this.fades.delete(el);
        then?.();
      }
    }, 40);
    this.fades.set(el, id);
  }

  public stopBGM() {
    const el = this.bgmAudio;
    if (el && !el.paused) {
      this.fadeTo(el, 0, 250, () => {
        // Só pausa se a música continua sem dever tocar (pode ter sido retomada no meio do fade).
        if (!this.shouldPlayMusic() || this.bgmAudio !== el) el.pause();
      });
    }
    this.stopChiptuneFallback();
  }

  // --- RETRO CHIPTUNE SYNTHESIZER FALLBACK ---
  private startChiptuneFallback() {
    if (this.isMusicMuted || this.storyHolds > 0) return;
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
  levelUp: () => audioService.playPowerup(),
  combo: (level?: number) => audioService.playCombo(level)
};

