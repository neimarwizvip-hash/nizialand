/**
 * Quiz & Flashcards Interativos - Comparative Adjectives
 * E. M. Nísia Vivea Fernandes • Duque de Caxias
 * Professor Neimar Oliveira • Turma 804
 */

// ============================================================================
// DATASET: As 10 Questões Baseadas Fielmente na Folha de Atividade
// ============================================================================
const QUIZ_QUESTIONS = [
  // --- ATIVIDADE 1: Estudantes e Idades ---
  {
    id: 1,
    activity: 1,
    activityTitle: "Activity 1 – Question 1",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Mateus is <span class=\"q-blank\">_______</span> Carlos.",
    spokenText: "Mateus is blank Carlos.",
    contextHint: "Mateus (14 years old) vs Carlos (13 years old)",
    targetStudent1: "mateus",
    targetStudent2: "carlos",
    hint: "Mateus tem 14 anos e Carlos tem 13 anos. Para dizer que alguém é 'mais velho que', usamos o adjetivo curto 'old' + sufixo '-er' + 'than' = 'older than'.",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "the oldest", isCorrect: false }
    ],
    explanation: "Mateus tem 14 anos e Carlos tem 13 anos. Como 14 > 13, Mateus é mais velho que Carlos: 'older than'."
  },
  {
    id: 2,
    activity: 1,
    activityTitle: "Activity 1 – Question 2",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Juliana is <span class=\"q-blank\">_______</span> Sofia.",
    spokenText: "Juliana is blank Sofia.",
    contextHint: "Juliana (12 years old) vs Sofia (12 years old)",
    targetStudent1: "juliana",
    targetStudent2: "sofia",
    hint: "Juliana e Sofia têm ambas 12 anos. Quando duas pessoas têm a mesma idade, usamos o comparativo de igualdade: 'as + adjetivo + as' -> 'as old as' (tão velha quanto).",
    optionsSheet: [
      { text: "as old as", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "as old as", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "younger than", isCorrect: false },
      { letter: "D", text: "the same as", isCorrect: false }
    ],
    explanation: "Juliana (12 anos) e Sofia (12 anos) têm a mesma idade. O comparativo de igualdade usa a estrutura: as + old + as (tão velha quanto)."
  },
  {
    id: 3,
    activity: 1,
    activityTitle: "Activity 1 – Question 3",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Gabriel is <span class=\"q-blank\">_______</span> Rafael.",
    spokenText: "Gabriel is blank Rafael.",
    contextHint: "Gabriel (11 years old) vs Rafael (12 years old)",
    targetStudent1: "gabriel",
    targetStudent2: "rafael",
    hint: "Gabriel tem 11 anos e Rafael tem 12 anos. 11 é menor que 12. O comparativo de superioridade com 'young' (novo) é 'young' + '-er' + 'than' = 'younger than'.",
    optionsSheet: [
      { text: "younger than", isCorrect: true },
      { text: "as old as", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "younger than", isCorrect: true },
      { letter: "B", text: "as old as", isCorrect: false },
      { letter: "C", text: "older than", isCorrect: false },
      { letter: "D", text: "as young as", isCorrect: false }
    ],
    explanation: "Gabriel tem 11 anos e Rafael tem 12 anos. Como 11 < 12, Gabriel é mais novo que Rafael: 'younger than'."
  },
  {
    id: 4,
    activity: 1,
    activityTitle: "Activity 1 – Question 4",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Beatriz is <span class=\"q-blank\">_______</span> Larissa.",
    spokenText: "Beatriz is blank Larissa.",
    contextHint: "Beatriz (14 years old) vs Larissa (13 years old)",
    targetStudent1: "beatriz",
    targetStudent2: "larissa",
    hint: "Beatriz tem 14 anos e Larissa tem 13 anos. 14 é maior que 13. Portanto Beatriz é mais velha: 'old' + '-er' + 'than' = 'older than'.",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "more old than", isCorrect: false }
    ],
    explanation: "Beatriz tem 14 anos e Larissa tem 13 anos. Sendo 14 > 13, Beatriz é mais velha que Larissa: 'older than'."
  },
  {
    id: 5,
    activity: 1,
    activityTitle: "Activity 1 – Question 5",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Rafael is <span class=\"q-blank\">_______</span> Juliana.",
    spokenText: "Rafael is blank Juliana.",
    contextHint: "Rafael (12 years old) vs Juliana (12 years old)",
    targetStudent1: "rafael",
    targetStudent2: "juliana",
    hint: "Rafael e Juliana têm exatamente 12 anos cada. Igualdade de idade: 'as old as'!",
    optionsSheet: [
      { text: "as old as", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "as old as", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "younger than", isCorrect: false },
      { letter: "D", text: "as older than", isCorrect: false }
    ],
    explanation: "Rafael (12 anos) e Juliana (12 anos) possuem exatamente a mesma idade. Portanto, usamos o comparativo de igualdade: 'as old as'."
  },

  // --- ATIVIDADE 2: Leitura do Texto e Glossário ---
  {
    id: 6,
    activity: 2,
    activityTitle: "Activity 2 – Question 1",
    instruction: "Read the text and answer:",
    sentence: "Who is older, Alice or Bruno?",
    spokenText: "Who is older, Alice or Bruno?",
    contextHint: "Texto: Alice (13 years old) • Bruno (14 years old)",
    hint: "Confira no texto: 'I am 13 years old and Bruno is 14 years old.' Quem tem o número maior?",
    optionsSheet: [
      { text: "Bruno", isCorrect: true },
      { text: "Alice", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "Bruno is older (14 years old)", isCorrect: true },
      { letter: "B", text: "Alice is older (13 years old)", isCorrect: false },
      { letter: "C", text: "They are the same age", isCorrect: false },
      { letter: "D", text: "Paula is the oldest student", isCorrect: false }
    ],
    explanation: "No texto, Alice diz: 'I am 13 years old and Bruno is 14 years old'. Portanto, Bruno (14) é o mais velho entre eles."
  },
  {
    id: 7,
    activity: 2,
    activityTitle: "Activity 2 – Question 2",
    instruction: "Leia o texto e responda:",
    sentence: "Quem é mais novo: Paula ou Marcos?",
    spokenText: "Who is younger, Paula or Marcos?",
    contextHint: "Texto: Paula (40 years old) • Marcos (38 years old)",
    hint: "Texto: Paula tem 40 anos e Marcos tem 38 anos. 'Younger' significa mais novo (menor idade).",
    optionsSheet: [
      { text: "Marcos", isCorrect: true },
      { text: "Paula", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "Marcos (38 anos)", isCorrect: true },
      { letter: "B", text: "Paula (40 anos)", isCorrect: false },
      { letter: "C", text: "Alice (13 anos)", isCorrect: false },
      { letter: "D", text: "Ambos têm a mesma idade", isCorrect: false }
    ],
    explanation: "O texto afirma: 'My mother is Paula. She is 40 years old. My father is Marcos. He is 38 years old.' Marcos (38) é mais novo que Paula (40)."
  },
  {
    id: 8,
    activity: 2,
    activityTitle: "Activity 2 – Question 3",
    instruction: "Read the text and choose the correct comparative:",
    sentence: "Alice is <span class=\"q-blank\">_______</span> Bruno.",
    spokenText: "Alice is blank Bruno.",
    contextHint: "Texto: Alice (13) vs Bruno (14)",
    hint: "Alice tem 13 anos e Bruno tem 14. Alice é mais nova que Bruno. Mais nova = 'younger than'.",
    optionsSheet: [
      { text: "younger than", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "younger than", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "more young than", isCorrect: false }
    ],
    explanation: "Alice tem 13 anos e Bruno tem 14 anos. Sendo mais nova, a frase correta é: 'Alice is younger than Bruno'."
  },
  {
    id: 9,
    activity: 2,
    activityTitle: "Activity 2 – Question 4",
    instruction: "Read the text and choose the correct comparative:",
    sentence: "Paula is <span class=\"q-blank\">_______</span> Marcos.",
    spokenText: "Paula is blank Marcos.",
    contextHint: "Texto: Paula (40) vs Marcos (38)",
    hint: "Paula (40) tem mais idade que Marcos (38). Mais velha que = 'older than'.",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "the older", isCorrect: false }
    ],
    explanation: "Paula tem 40 anos e Marcos tem 38 anos. Logo, Paula é mais velha que Marcos: 'Paula is older than Marcos'."
  },
  {
    id: 10,
    activity: 2,
    activityTitle: "Activity 2 – Question 5",
    instruction: "Read the text and complete the sentence:",
    sentence: "Alice and Bruno are <span class=\"q-blank\">_______</span>.",
    spokenText: "Alice and Bruno are blank.",
    contextHint: "Texto: 'We study at the same school and we have been friends since kindergarten.'",
    hint: "Procure a frase exata no início do texto: 'we have been friends since kindergarten'!",
    optionsSheet: [
      { text: "friends since kindergarten", isCorrect: true },
      { text: "students from different schools", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "friends since kindergarten", isCorrect: true },
      { letter: "B", text: "students from different schools", isCorrect: false },
      { letter: "C", text: "brother and sister", isCorrect: false },
      { letter: "D", text: "cousins from another city", isCorrect: false }
    ],
    explanation: "Conforme o próprio texto: 'we have been friends since kindergarten' (somos amigos desde o jardim de infância)."
  }
];

// Student database for interactive comparator
const STUDENTS_DB = {
  mateus:  { name: "Mateus",  age: 14 },
  juliana: { name: "Juliana", age: 12 },
  carlos:  { name: "Carlos",  age: 13 },
  gabriel: { name: "Gabriel", age: 11 },
  rafael:  { name: "Rafael",  age: 12 },
  beatriz: { name: "Beatriz", age: 14 },
  larissa: { name: "Larissa", age: 13 },
  sofia:   { name: "Sofia",   age: 12 }
};

// ============================================================================
// APP STATE
// ============================================================================
const state = {
  currentQuestionIndex: 0,
  mode: "interactive",     // 'interactive' (1 questão por tela) | 'full'
  optionsFormat: "sheet",  // 'sheet' (original da folha) | 'quad' (4 alternativas)
  soundEnabled: true,
  musicEnabled: false,
  userAnswers: {},         // { questionId: selectedIndex }
  scoreXP: 150,
  combo: 1,
  hitsCount: 0,
  lifelines5050Count: 2,
  speedBonus: 50,
  speedInterval: null,
  playerName: "Player 804",
  playerAvatar: "assets/avatar_mateus.jpg",
  achievements: {
    first_step: false,
    combo_3: false,
    sound_listener: false,
    memory_expert: false,
    comparative_master: false,
    champion_804: false
  }
};

// ============================================================================
// AUDIO SYNTHESIZER & BGM (Web Audio API - Sem dependências externas)
// ============================================================================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.bgmOsc = null;
    this.bgmGain = null;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playCorrect() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Two ascending melodic chimes (D5 -> A5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playWrong() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playFanfare() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + index * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch (e) {
      console.warn("Audio fanfare error:", e);
    }
  }

  playTick() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("Audio tick error:", e);
    }
  }

  playFlip() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio flip error:", e);
    }
  }

  playSwoosh() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn("Audio swoosh error:", e);
    }
  }

  playGameOver() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [392.00, 369.99, 349.23, 311.13]; // G4, F#4, F4, D#4
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + index * 0.16;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {
      console.warn("Audio game over error:", e);
    }
  }

  // --- RETRO CHIPTUNE BGM LOOP ---
  startBGM() {
    this.init();
    if (!this.ctx) return;
    if (this.bgmInterval) return;

    // Cheerful, gentle 8-bit pentatonic melody
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
      261.63, 392.00, 523.25, 783.99, 523.25, 392.00
    ];
    let noteIdx = 0;

    this.bgmInterval = setInterval(() => {
      if (!state.musicEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melody[noteIdx % melody.length], now);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
        noteIdx++;
      } catch (e) {
        console.warn("BGM loop error:", e);
      }
    }, 280);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const sfx = new SoundEffects();

// ============================================================================
// CONFETTI BURST (Canvas Particles)
// ============================================================================
class ConfettiCannon {
  constructor() {
    this.canvas = document.getElementById("confetti-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#fbbf24"];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        life: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!this.animId) {
      this.animate();
    }
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vr;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.animId = null;
    }
  }
}

const confetti = new ConfettiCannon();

// ============================================================================
// TEXT TO SPEECH (Web Speech API)
// ============================================================================
function speakEnglish(text) {
  if (!('speechSynthesis' in window)) {
    console.warn("Web Speech API não suportada neste navegador.");
    return;
  }

  unlockAchievement("sound_listener");

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/blank/g, '________');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en_US")) || voices.find(v => v.lang.startsWith("en"));
  if (usVoice) utterance.voice = usVoice;

  window.speechSynthesis.speak(utterance);
}

// ============================================================================
// FLOATING XP TOASTS & GAMIFICATION
// ============================================================================
function spawnFloatingXP(text, x, y) {
  const layer = document.getElementById("floating-points-layer");
  if (!layer) return;

  const pill = document.createElement("div");
  pill.className = "floating-xp-pill";
  pill.innerHTML = `⭐ ${text}`;
  pill.style.left = `${x || window.innerWidth / 2 - 60}px`;
  pill.style.top = `${y || window.innerHeight / 2 - 30}px`;

  layer.appendChild(pill);
  setTimeout(() => pill.remove(), 1400);
}

function addXP(amount) {
  state.scoreXP += amount;
  document.getElementById("hud-score-pts").textContent = state.scoreXP;

  // Level progression
  const levelBadge = document.getElementById("player-level-badge");
  const xpFill = document.getElementById("xp-bar-fill");
  const xpText = document.getElementById("xp-text-display");

  let level = 1;
  let levelTitle = "Detective";
  let targetXP = 500;

  if (state.scoreXP >= 1500) {
    level = 4;
    levelTitle = "Grammar Legend";
    targetXP = 2500;
  } else if (state.scoreXP >= 1000) {
    level = 3;
    levelTitle = "Comparative Master";
    targetXP = 1500;
    unlockAchievement("champion_804");
  } else if (state.scoreXP >= 500) {
    level = 2;
    levelTitle = "Language Sleuth";
    targetXP = 1000;
  }

  levelBadge.textContent = `⭐ Nível ${level}: ${levelTitle}`;
  const pct = Math.min(100, (state.scoreXP / targetXP) * 100);
  xpFill.style.width = `${pct}%`;
  xpText.textContent = `${state.scoreXP} / ${targetXP} XP`;
}

function updateComboDisplay() {
  const valEl = document.getElementById("hud-combo-val");
  const boxEl = document.getElementById("combo-meter-box");

  valEl.textContent = `x${state.combo}`;
  if (state.combo >= 3) {
    boxEl.style.borderColor = "#ef4444";
    unlockAchievement("combo_3");
  } else {
    boxEl.style.borderColor = "#fde68a";
  }
}

function resetSpeedTimer() {
  if (state.speedInterval) {
    clearInterval(state.speedInterval);
  }
  state.speedBonus = 100;
  const speedEl = document.getElementById("speed-bonus-live");
  if (speedEl) speedEl.textContent = `+${state.speedBonus} XP`;

  state.speedInterval = setInterval(() => {
    if (state.speedBonus > 20) {
      state.speedBonus -= 5;
      if (speedEl) speedEl.textContent = `+${state.speedBonus} XP`;
    } else {
      clearInterval(state.speedInterval);
    }
  }, 1000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderQuiz();
  renderAvatarSelectionModal();
  renderLeaderboard();
  renderAchievements();
  resetSpeedTimer();
});

function setupEventListeners() {
  // Mode toggles
  document.getElementById("btn-mode-interactive").addEventListener("click", () => switchMode("interactive"));
  document.getElementById("btn-mode-full").addEventListener("click", () => switchMode("full"));
  document.getElementById("btn-mode-print").addEventListener("click", () => window.print());

  // Options format toggle
  document.getElementById("btn-options-sheet").addEventListener("click", () => switchOptionsFormat("sheet"));
  document.getElementById("btn-options-quad").addEventListener("click", () => switchOptionsFormat("quad"));

  // Audio toggles
  document.getElementById("btn-toggle-sound").addEventListener("click", toggleSound);
  document.getElementById("btn-toggle-music").addEventListener("click", toggleMusic);

  // Stepper buttons
  document.getElementById("btn-prev-question").addEventListener("click", prevQuestion);
  document.getElementById("btn-next-question").addEventListener("click", nextQuestion);
  document.getElementById("btn-speak-question").addEventListener("click", speakCurrentQuestion);
  document.getElementById("btn-finish-quiz").addEventListener("click", finishQuiz);
  document.getElementById("btn-submit-full").addEventListener("click", finishQuiz);

  // Stage navigation
  document.getElementById("nav-btn-stage1").addEventListener("click", () => switchStage("stage1"));
  document.getElementById("nav-btn-stage2").addEventListener("click", () => switchStage("stage2"));
  const btnAdvanceStage2 = document.getElementById("btn-advance-to-stage2");
  if (btnAdvanceStage2) {
    btnAdvanceStage2.addEventListener("click", () => {
      document.getElementById("results-modal").classList.add("hidden");
      switchStage("stage2");
    });
  }
  const btnReturnQuiz = document.getElementById("btn-fc-return-quiz");
  if (btnReturnQuiz) {
    btnReturnQuiz.addEventListener("click", () => switchStage("stage1"));
  }

  // Modals: Quick references
  setupModal("btn-open-gallery-modal", "gallery-modal", ["btn-close-gallery-modal", "btn-close-gallery-modal-2"]);
  setupModal("btn-open-reading-modal", "reading-modal", ["btn-close-reading-modal", "btn-close-reading-modal-2"]);
  setupModal("btn-open-comparator-modal", "comparator-modal", ["btn-close-comparator-modal", "btn-close-comparator-modal-2"]);
  setupModal("btn-open-comparator-full", "comparator-modal", ["btn-close-comparator-modal", "btn-close-comparator-modal-2"]);
  setupModal("btn-view-original", "original-sheet-modal", ["btn-close-sheet-modal", "btn-close-sheet-modal-2"]);
  setupModal("btn-open-leaderboard", "leaderboard-modal", ["btn-close-leaderboard-modal", "btn-close-leaderboard-modal-2"]);
  setupModal("btn-open-achievements", "achievements-modal", ["btn-close-achievements-modal", "btn-close-achievements-modal-2"]);
  setupModal("powerup-hint", "hint-modal", ["btn-close-hint-modal", "btn-close-hint-modal-2"]);
  setupModal("btn-change-avatar", "avatar-modal", ["btn-close-avatar-modal", "btn-close-avatar-modal-2"]);
  setupModal("player-profile-click", "avatar-modal", ["btn-close-avatar-modal", "btn-close-avatar-modal-2"]);

  // Results modal close
  const btnCloseRes = document.getElementById("btn-close-results-modal");
  if (btnCloseRes) {
    btnCloseRes.addEventListener("click", () => {
      document.getElementById("results-modal").classList.add("hidden");
    });
  }
  document.getElementById("btn-retry-quiz").addEventListener("click", resetQuiz);
  document.getElementById("btn-print-results").addEventListener("click", () => {
    document.getElementById("results-modal").classList.add("hidden");
    window.print();
  });

  // Power-up 50/50
  document.getElementById("powerup-5050").addEventListener("click", use5050Powerup);

  // Comparator selectors
  document.getElementById("cmp-student-1").addEventListener("change", updateComparatorResult);
  document.getElementById("cmp-student-2").addEventListener("change", updateComparatorResult);
  updateComparatorResult();

  // Speech buttons in modals
  const btnSpeakModal = document.getElementById("btn-speak-text-modal");
  if (btnSpeakModal) {
    btnSpeakModal.addEventListener("click", () => {
      const text = "Hello! I'm Alice and this is my friend Bruno. We study at the same school and we have been friends since kindergarten. I am 13 years old and Bruno is 14 years old. My mother is Paula. She is 40 years old. My father is Marcos. He is 38 years old.";
      speakEnglish(text);
    });
  }

  const btnSpeakFull = document.getElementById("btn-speak-text-full");
  if (btnSpeakFull) {
    btnSpeakFull.addEventListener("click", () => {
      const text = "Hello! I'm Alice and this is my friend Bruno. We study at the same school and we have been friends since kindergarten. I am 13 years old and Bruno is 14 years old. My mother is Paula. She is 40 years old. My father is Marcos. He is 38 years old.";
      speakEnglish(text);
    });
  }

  // Flashcards Stage 2 Controls
  document.getElementById("btn-fc-skip-timer").addEventListener("click", skipMemorizeTimer);
  document.getElementById("btn-fc-peek").addEventListener("click", peekFlashcards);
  document.getElementById("btn-fc-shuffle").addEventListener("click", shuffleAndResetBoard);
  document.getElementById("btn-fc-next-challenge").addEventListener("click", nextFlashcardChallenge);
  document.getElementById("btn-fc-reset-all").addEventListener("click", resetFlashcardsGame);
  document.getElementById("btn-speak-challenge").addEventListener("click", speakCurrentChallenge);

  // Student name input save
  const nameInput = document.getElementById("student-name-input");
  nameInput.addEventListener("change", (e) => {
    state.playerName = e.target.value.trim() || "Player 804";
    renderLeaderboard();
  });
}

function setupModal(triggerBtnId, modalId, closeBtnIds) {
  const trigger = document.getElementById(triggerBtnId);
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (trigger) {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      if (modalId === "hint-modal") {
        updateHintModalContent();
      }
    });
  }

  closeBtnIds.forEach(cId => {
    const cBtn = document.getElementById(cId);
    if (cBtn) {
      cBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
  });

  // Click outside card to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

// ============================================================================
// MODE & OPTION SWITCHERS
// ============================================================================
function switchMode(newMode) {
  state.mode = newMode;
  document.getElementById("btn-mode-interactive").classList.toggle("active", newMode === "interactive");
  document.getElementById("btn-mode-full").classList.toggle("active", newMode === "full");

  const quizSection = document.getElementById("quiz-section");
  const stepperHeader = document.getElementById("stepper-header");
  const stepperActions = document.getElementById("stepper-actions");
  const fullSheetActions = document.getElementById("full-sheet-actions");
  const fullRefWrapper = document.getElementById("full-sheet-reference-wrapper");

  if (newMode === "interactive") {
    document.body.classList.add("mode-one-question");
    quizSection.classList.add("interactive-mode");
    stepperHeader.classList.remove("hidden");
    stepperActions.classList.remove("hidden");
    fullSheetActions.classList.add("hidden");
    fullRefWrapper.classList.add("hidden");
  } else {
    document.body.classList.remove("mode-one-question");
    quizSection.classList.remove("interactive-mode");
    stepperHeader.classList.add("hidden");
    stepperActions.classList.add("hidden");
    fullSheetActions.classList.remove("hidden");
    fullRefWrapper.classList.remove("hidden");
  }

  updateQuestionVisibility();
}

function switchOptionsFormat(format) {
  if (state.optionsFormat === format) return;
  state.optionsFormat = format;
  document.getElementById("btn-options-sheet").classList.toggle("active", format === "sheet");
  document.getElementById("btn-options-quad").classList.toggle("active", format === "quad");
  renderQuiz();
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  document.getElementById("sound-icon").textContent = state.soundEnabled ? "🔊" : "🔇";
}

function toggleMusic() {
  state.musicEnabled = !state.musicEnabled;
  const statusEl = document.getElementById("music-status-text");
  if (state.musicEnabled) {
    statusEl.textContent = "BGM ON";
    sfx.startBGM();
  } else {
    statusEl.textContent = "BGM OFF";
    sfx.stopBGM();
  }
}

// ============================================================================
// RENDER QUESTIONS (1 QUESTÃO POR TELA NO QUIZ DINÂMICO)
// ============================================================================
function renderQuiz() {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  QUIZ_QUESTIONS.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = `question-card ${index === state.currentQuestionIndex ? 'active-question' : ''}`;
    card.id = `q-card-${q.id}`;
    card.setAttribute("data-q-id", q.id);

    // Contextual Spotlight depending on Activity
    let spotlightHtml = '';
    if (q.activity === 1 && q.targetStudent1 && q.targetStudent2) {
      spotlightHtml = `
        <div class="q-duel-spotlight" title="Duelo comparativo entre os dois estudantes">
          <div class="q-duel-card">
            <img src="assets/card_${q.targetStudent1}.jpg" alt="${q.targetStudent1}" class="q-duel-img" />
          </div>
          <div class="q-duel-vs">VS</div>
          <div class="q-duel-card">
            <img src="assets/card_${q.targetStudent2}.jpg" alt="${q.targetStudent2}" class="q-duel-img" />
          </div>
        </div>
      `;
    } else if (q.id === 6 || q.id === 8 || q.id === 10) {
      spotlightHtml = `
        <div class="q-reading-spotlight">
          <img src="assets/alice_and_bruno.jpg" alt="Alice e Bruno" class="q-reading-thumb" />
          <div class="q-reading-snippet">
            <strong>Texto de Referência:</strong><br>
            <em>"I am 13 years old and Bruno is 14 years old. We study at the same school and we have been friends since kindergarten."</em>
          </div>
        </div>
      `;
    } else if (q.id === 7 || q.id === 9) {
      spotlightHtml = `
        <div class="q-reading-spotlight">
          <img src="assets/alice_and_bruno.jpg" alt="Família" class="q-reading-thumb" />
          <div class="q-reading-snippet">
            <strong>Família da Alice:</strong><br>
            • Mãe: <strong>Paula (40 years old)</strong><br>
            • Pai: <strong>Marcos (38 years old)</strong>
          </div>
        </div>
      `;
    }

    const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;

    let optionsHtml = `<div class="options-list" id="options-list-${q.id}" role="radiogroup">`;
    options.forEach((opt, optIdx) => {
      const isChecked = state.userAnswers[q.id] === optIdx;
      const letter = opt.letter || (optIdx === 0 ? "A" : "B");

      optionsHtml += `
        <div class="option-item ${isChecked ? 'selected' : ''}" id="opt-${q.id}-${optIdx}" onclick="handleOptionSelect(${q.id}, ${optIdx})">
          <div class="option-letter-badge">${letter}</div>
          <span class="option-label-text">${opt.text}</span>
          <input type="radio" name="q_${q.id}" class="option-radio" value="${optIdx}" ${isChecked ? 'checked' : ''} />
        </div>
      `;
    });
    optionsHtml += `</div>`;

    card.innerHTML = `
      <div class="q-header-box">
        <div class="q-instruction-line">${q.activityTitle} • ${q.instruction}</div>
        ${spotlightHtml}
        <div class="q-sentence-container">
          <div class="q-sentence-text" id="sentence-display-${q.id}">${q.sentence}</div>
          <button type="button" class="btn-speak-inline" onclick="speakEnglish('${q.spokenText}')" title="Ouvir em inglês">
            🔊 Ouvir
          </button>
        </div>
      </div>
      ${optionsHtml}
      <div class="q-feedback" id="feedback-${q.id}"></div>
    `;

    container.appendChild(card);
  });

  renderNavDots();
  updateQuestionVisibility();
  updateStepperHUD();
}

function renderNavDots() {
  const dotsContainer = document.getElementById("question-nav-dots");
  dotsContainer.innerHTML = "";

  QUIZ_QUESTIONS.forEach((q, idx) => {
    const dot = document.createElement("button");
    dot.className = `nav-dot ${idx === state.currentQuestionIndex ? 'current' : ''}`;
    dot.type = "button";
    dot.textContent = q.id;
    dot.title = `Ir diretamente para a questão ${q.id}`;

    if (state.userAnswers[q.id] !== undefined) {
      const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;
      const isCorrect = options[state.userAnswers[q.id]]?.isCorrect;
      dot.classList.add(isCorrect ? "answered-correct" : "answered-wrong");
    }

    dot.addEventListener("click", () => goToQuestion(idx));
    dotsContainer.appendChild(dot);
  });
}

// ============================================================================
// QUESTION NAVIGATION (1 QUESTÃO POR TELA)
// ============================================================================
function goToQuestion(index) {
  if (index < 0 || index >= QUIZ_QUESTIONS.length) return;
  state.currentQuestionIndex = index;
  resetSpeedTimer();
  updateQuestionVisibility();
  updateStepperHUD();
}

function nextQuestion() {
  if (state.currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
    goToQuestion(state.currentQuestionIndex + 1);
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (state.currentQuestionIndex > 0) {
    goToQuestion(state.currentQuestionIndex - 1);
  }
}

function updateQuestionVisibility() {
  const cards = document.querySelectorAll(".question-card");
  cards.forEach((card, idx) => {
    if (state.mode === "interactive") {
      card.classList.toggle("active-question", idx === state.currentQuestionIndex);
    } else {
      card.classList.add("active-question");
    }
  });

  document.getElementById("btn-prev-question").disabled = state.currentQuestionIndex === 0;

  const isLast = state.currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  const nextBtn = document.getElementById("btn-next-question");
  const finishBtn = document.getElementById("btn-finish-quiz");

  if (isLast) {
    nextBtn.classList.add("hidden");
    finishBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    finishBtn.classList.add("hidden");
  }
}

function updateStepperHUD() {
  const currentQ = state.currentQuestionIndex + 1;
  document.getElementById("current-q-index").textContent = currentQ;
  document.getElementById("step-activity-tag").textContent = `Atividade ${QUIZ_QUESTIONS[state.currentQuestionIndex].activity}`;

  const pct = (currentQ / QUIZ_QUESTIONS.length) * 100;
  document.getElementById("progress-fill").style.width = `${pct}%`;

  const dots = document.querySelectorAll(".nav-dot");
  dots.forEach((dot, idx) => {
    dot.classList.toggle("current", idx === state.currentQuestionIndex);
  });
}

function speakCurrentQuestion() {
  const q = QUIZ_QUESTIONS[state.currentQuestionIndex];
  speakEnglish(q.spokenText);
}

// ============================================================================
// ANSWER SELECTION & GRADING
// ============================================================================
function handleOptionSelect(questionId, selectedIdx) {
  state.userAnswers[questionId] = selectedIdx;

  const card = document.getElementById(`q-card-${questionId}`);
  const q = QUIZ_QUESTIONS.find(item => item.id === questionId);
  const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;
  const selectedOption = options[selectedIdx];
  const isCorrect = selectedOption.isCorrect;

  unlockAchievement("first_step");

  // Visual selection
  const optionEls = card.querySelectorAll(".option-item");
  optionEls.forEach((el, idx) => {
    el.classList.toggle("selected", idx === selectedIdx);
  });

  // Update sentence with blank
  const sentenceDisplay = document.getElementById(`sentence-display-${questionId}`);
  if (sentenceDisplay) {
    const chosenText = selectedOption.letter ? selectedOption.text.replace(/^[A-D]\)\s*/, '') : selectedOption.text;
    const styledBlank = isCorrect
      ? `<strong style="color: #059669; text-decoration: underline;">${chosenText}</strong>`
      : `<strong style="color: #dc2626; text-decoration: line-through;">${chosenText}</strong>`;
    sentenceDisplay.innerHTML = q.sentence.replace('<span class="q-blank">_______</span>', styledBlank);
  }

  // Feedback box
  const feedbackEl = document.getElementById(`feedback-${questionId}`);
  feedbackEl.className = `q-feedback show ${isCorrect ? 'correct' : 'wrong'}`;

  if (isCorrect) {
    sfx.playCorrect();
    state.combo++;
    updateComboDisplay();

    const xpEarned = 100 * state.combo + state.speedBonus;
    addXP(xpEarned);
    spawnFloatingXP(`+${xpEarned} XP! 🔥 x${state.combo}`);

    state.hitsCount = Object.keys(state.userAnswers).filter(id => {
      const qItem = QUIZ_QUESTIONS.find(item => item.id === Number(id));
      const opts = state.optionsFormat === "quad" ? qItem.optionsQuad : qItem.optionsSheet;
      return opts[state.userAnswers[id]]?.isCorrect;
    }).length;
    document.getElementById("hud-hits-count").textContent = `${state.hitsCount} / 10`;

    feedbackEl.innerHTML = `
      <div class="feedback-title">✅ Resposta Exata! (+${xpEarned} XP)</div>
      <p>${q.explanation}</p>
    `;
    confetti.burst(35);
  } else {
    sfx.playWrong();
    state.combo = 1;
    updateComboDisplay();

    feedbackEl.innerHTML = `
      <div class="feedback-title">❌ Quase lá! Veja a explicação:</div>
      <p>${q.explanation}</p>
    `;
  }

  renderNavDots();
}

// ============================================================================
// POWER-UPS (50/50 & HINT)
// ============================================================================
function use5050Powerup() {
  if (state.lifelines5050Count <= 0) return;

  const q = QUIZ_QUESTIONS[state.currentQuestionIndex];
  const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;

  // Find incorrect options
  const wrongIndices = [];
  options.forEach((opt, idx) => {
    if (!opt.isCorrect) wrongIndices.push(idx);
  });

  if (wrongIndices.length <= 1) {
    alert("Esta questão já possui apenas duas alternativas!");
    return;
  }

  // Shuffle and pick 2 to eliminate
  wrongIndices.sort(() => Math.random() - 0.5);
  const toEliminate = wrongIndices.slice(0, 2);

  toEliminate.forEach(idx => {
    const optEl = document.getElementById(`opt-${q.id}-${idx}`);
    if (optEl) {
      optEl.classList.add("faded-5050");
    }
  });

  sfx.playSwoosh();
  state.lifelines5050Count--;
  document.getElementById("count-5050").textContent = state.lifelines5050Count;
  if (state.lifelines5050Count <= 0) {
    document.getElementById("powerup-5050").disabled = true;
  }
}

function updateHintModalContent() {
  const q = QUIZ_QUESTIONS[state.currentQuestionIndex];
  const contentEl = document.getElementById("hint-modal-content");
  if (!contentEl) return;

  contentEl.innerHTML = `
    <h3>Questão ${q.id}: ${q.activityTitle}</h3>
    <div class="hint-rule-box">
      <strong>Regra do Comparativo:</strong><br>
      ${q.hint}
    </div>
    <p>💡 <em>Contexto: ${q.contextHint}</em></p>
  `;
}

// ============================================================================
// FINISH QUIZ & RESULTS MODAL
// ============================================================================
function finishQuiz() {
  let correctCount = 0;
  QUIZ_QUESTIONS.forEach(q => {
    const userChoice = state.userAnswers[q.id];
    if (userChoice !== undefined) {
      const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;
      if (options[userChoice]?.isCorrect) correctCount++;
    }
  });

  document.getElementById("final-score-val").textContent = correctCount;
  const pct = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
  document.getElementById("accuracy-pill").textContent = `${pct}% de Aproveitamento`;

  const greetingEl = document.getElementById("score-greeting");
  const feedbackEl = document.getElementById("score-feedback");

  if (correctCount === 10) {
    greetingEl.textContent = "Sensacional! Gabarito Perfeito! 🌟";
    feedbackEl.textContent = "Você acertou todas as 10 questões de Comparative Adjectives com maestria!";
    sfx.playFanfare();
    confetti.burst(120);
    unlockAchievement("comparative_master");
  } else if (correctCount >= 7) {
    greetingEl.textContent = "Parabéns! Excelente Desempenho! 👏";
    feedbackEl.textContent = "Você compreendeu muito bem as regras de older than, younger than e as old as.";
    sfx.playFanfare();
    confetti.burst(70);
  } else {
    greetingEl.textContent = "Bom esforço! Vale a pena revisar! 📖";
    feedbackEl.textContent = "Reveja as regras gramaticais e tente novamente para conquistar os 10 acertos!";
  }

  // Populate detailed review
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  QUIZ_QUESTIONS.forEach(q => {
    const userChoice = state.userAnswers[q.id];
    const options = state.optionsFormat === "quad" ? q.optionsQuad : q.optionsSheet;
    const isAnswered = userChoice !== undefined;
    const isCorrect = isAnswered && options[userChoice]?.isCorrect;

    const item = document.createElement("div");
    item.className = `review-item ${isCorrect ? 'is-correct' : 'is-wrong'}`;

    const chosenText = isAnswered ? options[userChoice].text : "Não respondida";
    const correctOption = options.find(o => o.isCorrect);

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <strong>Questão ${q.id} (${q.activityTitle})</strong>
        <span>${isCorrect ? '✅ Correto' : '❌ Incorreto'}</span>
      </div>
      <div><strong>Sua resposta:</strong> ${chosenText}</div>
      ${!isCorrect ? `<div><strong>Resposta correta:</strong> <span style="color:#059669; font-weight:700;">${correctOption.text}</span></div>` : ''}
      <div style="font-size:0.82rem; color:#64748b; margin-top:4px;">${q.explanation}</div>
    `;
    reviewList.appendChild(item);
  });

  document.getElementById("results-modal").classList.remove("hidden");
}

function resetQuiz() {
  state.userAnswers = {};
  state.currentQuestionIndex = 0;
  state.combo = 1;
  state.hitsCount = 0;
  state.lifelines5050Count = 2;
  document.getElementById("count-5050").textContent = 2;
  document.getElementById("powerup-5050").disabled = false;
  document.getElementById("hud-hits-count").textContent = "0 / 10";
  updateComboDisplay();
  document.getElementById("results-modal").classList.add("hidden");
  renderQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// COMPARATOR DRAWER LOGIC
// ============================================================================
function updateComparatorResult() {
  const id1 = document.getElementById("cmp-student-1").value;
  const id2 = document.getElementById("cmp-student-2").value;
  const st1 = STUDENTS_DB[id1];
  const st2 = STUDENTS_DB[id2];
  const resBox = document.getElementById("cmp-result");

  if (!st1 || !st2 || !resBox) return;

  if (st1.age === st2.age) {
    resBox.innerHTML = `
      <strong>${st1.name} (${st1.age})</strong> is <span style="color:#4f46e5; text-decoration: underline;">as old as</span> <strong>${st2.name} (${st2.age})</strong>.<br>
      <small style="color:#64748b;">(Comparativo de Igualdade: ambos têm a mesma idade)</small>
    `;
  } else if (st1.age > st2.age) {
    resBox.innerHTML = `
      <strong>${st1.name} (${st1.age})</strong> is <span style="color:#059669; text-decoration: underline;">older than</span> <strong>${st2.name} (${st2.age})</strong>.<br>
      <small style="color:#64748b;">(Superioridade: ${st1.name} é mais velho(a) que ${st2.name})</small>
    `;
  } else {
    resBox.innerHTML = `
      <strong>${st1.name} (${st1.age})</strong> is <span style="color:#d97706; text-decoration: underline;">younger than</span> <strong>${st2.name} (${st2.age})</strong>.<br>
      <small style="color:#64748b;">(Superioridade: ${st1.name} é mais novo(a) que ${st2.name})</small>
    `;
  }
}

// ============================================================================
// ETAPA 2: FLASHCARDS DE MEMÓRIA (TELA ESTÁTICA INTERATIVA)
// ============================================================================
const FC_STUDENTS_LIST = [
  { id: "juliana", name: "Juliana", age: 12, img: "assets/card_juliana.jpg" },
  { id: "mateus",  name: "Mateus",  age: 14, img: "assets/card_mateus.jpg" },
  { id: "carlos",  name: "Carlos",  age: 13, img: "assets/card_carlos.jpg" },
  { id: "gabriel", name: "Gabriel", age: 11, img: "assets/card_gabriel.jpg" },
  { id: "rafael",  name: "Rafael",  age: 12, img: "assets/card_rafael.jpg" },
  { id: "beatriz", name: "Beatriz", age: 14, img: "assets/card_beatriz.jpg" },
  { id: "larissa", name: "Larissa", age: 13, img: "assets/card_larissa.jpg" },
  { id: "sofia",   name: "Sofia",   age: 12, img: "assets/card_sofia.jpg" }
];

const FC_CHALLENGES_POOL = [
  {
    targetName: "Mateus",
    targetAge: 14,
    compType: "younger",
    compText: "younger than",
    questionEn: "Mateus is 14 years old. Who is younger than Mateus?",
    questionPt: "Mateus tem 14 anos. Quem é mais novo(a) que Mateus?",
    validate: (card) => card.age < 14
  },
  {
    targetName: "Gabriel",
    targetAge: 11,
    compType: "older",
    compText: "older than",
    questionEn: "Gabriel is 11 years old. Who is older than Gabriel?",
    questionPt: "Gabriel tem 11 anos. Quem é mais velho(a) que Gabriel?",
    validate: (card) => card.age > 11
  },
  {
    targetName: "Sofia",
    targetAge: 12,
    compType: "same",
    compText: "as old as",
    questionEn: "Sofia is 12 years old. Who is as old as Sofia?",
    questionPt: "Sofia tem 12 anos. Quem tem a mesma idade que Sofia?",
    validate: (card) => card.age === 12 && card.id !== "sofia"
  },
  {
    targetName: "Larissa",
    targetAge: 13,
    compType: "older",
    compText: "older than",
    questionEn: "Larissa is 13 years old. Who is older than Larissa?",
    questionPt: "Larissa tem 13 anos. Quem é mais velho(a) que Larissa?",
    validate: (card) => card.age > 13
  },
  {
    targetName: "Beatriz",
    targetAge: 14,
    compType: "younger",
    compText: "younger than",
    questionEn: "Beatriz is 14 years old. Who is younger than Beatriz?",
    questionPt: "Beatriz tem 14 anos. Quem é mais novo(a) que Beatriz?",
    validate: (card) => card.age < 14
  },
  {
    targetName: "Carlos",
    targetAge: 13,
    compType: "same",
    compText: "as old as",
    questionEn: "Carlos is 13 years old. Who is as old as Carlos?",
    questionPt: "Carlos tem 13 anos. Quem tem a mesma idade que Carlos?",
    validate: (card) => card.age === 13 && card.id !== "carlos"
  },
  {
    targetName: "Rafael",
    targetAge: 12,
    compType: "same",
    compText: "as old as",
    questionEn: "Rafael is 12 years old. Who is as old as Rafael?",
    questionPt: "Rafael tem 12 anos. Quem tem a mesma idade que Rafael?",
    validate: (card) => card.age === 12 && card.id !== "rafael"
  },
  {
    targetName: "Bruno",
    targetAge: 14,
    compType: "younger",
    compText: "younger than",
    questionEn: "Bruno is 14 years old. Who is younger than Bruno?",
    questionPt: "Bruno tem 14 anos. Quem é mais novo(a) que Bruno?",
    validate: (card) => card.age < 14
  }
];

const fcState = {
  isInitialized: false,
  phase: "memorizing", // 'memorizing' | 'challenging' | 'round_complete'
  timer: 30,
  timerInterval: null,
  round: 1,
  totalRounds: 5,
  lives: 3,
  score: 0,
  currentChallenge: null,
  cards: [],
  isProcessing: false,
  isPeeking: false
};

function switchStage(stageId) {
  const tabStage1 = document.getElementById("nav-btn-stage1");
  const tabStage2 = document.getElementById("nav-btn-stage2");
  const secStage1 = document.getElementById("stage-1-container");
  const secStage2 = document.getElementById("stage-2-container");

  if (stageId === "stage1") {
    tabStage1.classList.add("active");
    tabStage2.classList.remove("active");
    secStage1.classList.remove("hidden");
    secStage1.classList.add("active");
    secStage2.classList.add("hidden");
    secStage2.classList.remove("active");
  } else {
    tabStage2.classList.add("active");
    tabStage1.classList.remove("active");
    secStage2.classList.remove("hidden");
    secStage2.classList.add("active");
    secStage1.classList.add("hidden");
    secStage1.classList.remove("active");

    if (!fcState.isInitialized) {
      initFlashcardsGame();
    }
  }
}

function initFlashcardsGame() {
  fcState.isInitialized = true;
  fcState.round = 1;
  fcState.score = 0;
  fcState.lives = 3;
  document.getElementById("fc-score-display").textContent = "0 pts";
  document.getElementById("fc-round-display").textContent = `1 / ${fcState.totalRounds}`;
  startNewMemorizeRound();
}

function startNewMemorizeRound() {
  if (fcState.timerInterval) {
    clearInterval(fcState.timerInterval);
    fcState.timerInterval = null;
  }

  fcState.phase = "memorizing";
  fcState.timer = 30;
  fcState.lives = 3;
  fcState.isProcessing = false;
  fcState.isPeeking = false;

  updateHeartsDisplay();
  document.getElementById("fc-round-display").textContent = `${fcState.round} / ${fcState.totalRounds}`;

  const timerPanel = document.getElementById("fc-timer-panel");
  const challengeBanner = document.getElementById("fc-challenge-banner");
  const liveAlert = document.getElementById("fc-live-alert");
  const nextBtn = document.getElementById("btn-fc-next-challenge");

  timerPanel.classList.remove("hidden");
  challengeBanner.classList.add("hidden");
  liveAlert.classList.add("hidden");
  nextBtn.classList.add("hidden");

  document.getElementById("fc-cards-status-text").textContent = "⏳ Fase de Memorização";

  // Shuffle and render cards FACE-UP
  shuffleCards();
  renderFlashcardsBoard(true);

  startMemorizeCountdown();
}

function startMemorizeCountdown() {
  const countdownNum = document.getElementById("fc-countdown-num");
  const secondsLive = document.getElementById("fc-seconds-live");
  const progressFill = document.getElementById("fc-progress-fill");
  const timerCircle = document.getElementById("fc-timer-circle");

  timerCircle.classList.remove("warning");
  countdownNum.textContent = fcState.timer;
  secondsLive.textContent = `${fcState.timer}s`;
  progressFill.style.width = "100%";

  fcState.timerInterval = setInterval(() => {
    fcState.timer--;
    countdownNum.textContent = fcState.timer;
    secondsLive.textContent = `${fcState.timer}s`;

    const pct = Math.max(0, (fcState.timer / 30) * 100);
    progressFill.style.width = `${pct}%`;

    if (fcState.timer <= 5 && fcState.timer > 0) {
      timerCircle.classList.add("warning");
      sfx.playTick();
    }

    if (fcState.timer <= 0) {
      clearInterval(fcState.timerInterval);
      fcState.timerInterval = null;
      startFlashcardsChallenge();
    }
  }, 1000);
}

function skipMemorizeTimer() {
  if (fcState.phase !== "memorizing") return;
  if (fcState.timerInterval) {
    clearInterval(fcState.timerInterval);
    fcState.timerInterval = null;
  }
  startFlashcardsChallenge();
}

function startFlashcardsChallenge() {
  fcState.phase = "challenging";
  sfx.playFlip();

  document.getElementById("fc-timer-panel").classList.add("hidden");
  const challengeBanner = document.getElementById("fc-challenge-banner");
  challengeBanner.classList.remove("hidden");

  document.getElementById("fc-cards-status-text").textContent = "🎯 Desafio Ativo (Clique no Cartão)";

  // Flip all cards FACE-DOWN (mystery back)
  const cardInners = document.querySelectorAll(".fc-card-inner");
  cardInners.forEach(card => card.classList.remove("flipped"));

  pickChallengeForRound();

  const alertEl = document.getElementById("fc-live-alert");
  alertEl.className = "fc-feedback-alert hidden";
  alertEl.textContent = "";

  setTimeout(() => {
    speakCurrentChallenge();
  }, 500);
}

function pickChallengeForRound() {
  const challengeIdx = (fcState.round - 1) % FC_CHALLENGES_POOL.length;
  fcState.currentChallenge = FC_CHALLENGES_POOL[challengeIdx];

  document.getElementById("fc-question-text").textContent = `"${fcState.currentChallenge.questionEn}"`;
  document.getElementById("fc-question-subtext").textContent = `💡 (${fcState.currentChallenge.questionPt})`;
  document.getElementById("fc-chances-left-text").textContent = `${fcState.lives} chances`;
}

function speakCurrentChallenge() {
  if (fcState.currentChallenge) {
    speakEnglish(fcState.currentChallenge.questionEn);
  }
}

function shuffleCards() {
  const cloned = [...FC_STUDENTS_LIST];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  fcState.cards = cloned.map((student, idx) => ({
    ...student,
    cardIndex: idx,
    isRevealed: false
  }));
}

function renderFlashcardsBoard(isFaceUp = true) {
  const grid = document.getElementById("fc-grid-3d");
  grid.innerHTML = "";

  fcState.cards.forEach((student, idx) => {
    const cardContainer = document.createElement("div");
    cardContainer.className = "fc-card-3d";
    cardContainer.id = `fc-card-container-${idx}`;

    cardContainer.innerHTML = `
      <div class="fc-card-inner ${isFaceUp ? 'flipped' : ''}" id="fc-card-inner-${idx}" onclick="handleFlashcardClick(${idx})">
        <!-- Front: Real Student Photo from Sheet -->
        <div class="fc-card-face fc-card-front">
          <img src="${student.img}" alt="${student.name} - ${student.age} years old" />
        </div>
        <!-- Back: Mystery School Card Back -->
        <div class="fc-card-face fc-card-back">
          <div class="card-back-icon">❓</div>
          <div class="card-back-school">E. M. NÍSIA VIVEA</div>
          <div class="card-back-number">#${idx + 1}</div>
        </div>
      </div>
    `;

    grid.appendChild(cardContainer);
  });
}

function handleFlashcardClick(index) {
  if (fcState.phase !== "challenging" || fcState.isProcessing || fcState.isPeeking) return;

  const student = fcState.cards[index];
  if (student.isRevealed) return;

  fcState.isProcessing = true;
  student.isRevealed = true;

  const cardInner = document.getElementById(`fc-card-inner-${index}`);
  cardInner.classList.add("flipped");
  sfx.playFlip();

  const isCorrect = fcState.currentChallenge.validate(student);
  const alertEl = document.getElementById("fc-live-alert");

  if (isCorrect) {
    sfx.playCorrect();
    confetti.burst(60);
    cardInner.classList.add("correct-hit");

    const pointsEarned = fcState.lives * 100;
    fcState.score += pointsEarned;
    document.getElementById("fc-score-display").textContent = `${fcState.score} pts`;
    addXP(pointsEarned);
    spawnFloatingXP(`+${pointsEarned} XP!`);

    if (fcState.lives === 3) {
      unlockAchievement("memory_expert");
    }

    alertEl.className = "fc-feedback-alert correct";
    alertEl.innerHTML = `
      🎉 <strong>PARABÉNS! RESPOSTA EXATA!</strong><br>
      ${student.name} (${student.age} anos) atende ao desafio:
      <em>"${student.name} is ${fcState.currentChallenge.compText} ${fcState.currentChallenge.targetName}."</em>
      (+${pointsEarned} XP)
    `;
    alertEl.classList.remove("hidden");

    fcState.phase = "round_complete";
    document.getElementById("btn-fc-next-challenge").classList.remove("hidden");
    fcState.isProcessing = false;

  } else {
    sfx.playWrong();
    cardInner.classList.add("wrong-hit");
    fcState.lives--;
    updateHeartsDisplay();
    document.getElementById("fc-chances-left-text").textContent = `${fcState.lives} chances`;

    alertEl.className = "fc-feedback-alert wrong";
    alertEl.innerHTML = `
      ❌ <strong>NÃO FOI DESSA VEZ!</strong><br>
      ${student.name} tem ${student.age} anos e não atende à pergunta. Restam <strong>${fcState.lives} chance(s)</strong>!
    `;
    alertEl.classList.remove("hidden");

    if (fcState.lives > 0) {
      setTimeout(() => {
        cardInner.classList.remove("flipped", "wrong-hit");
        student.isRevealed = false;
        fcState.isProcessing = false;
      }, 1800);
    } else {
      sfx.playGameOver();
      alertEl.innerHTML = `
        💔 <strong>SUAS 3 CHANCES ACABARAM NESTA RODADA!</strong><br>
        Todos os cartões foram revelados para você conferir as idades e memorizar.
      `;
      revealAllCards();
      fcState.phase = "round_complete";
      document.getElementById("btn-fc-next-challenge").classList.remove("hidden");
      fcState.isProcessing = false;
    }
  }
}

function updateHeartsDisplay() {
  const heartsEl = document.getElementById("fc-lives-display");
  if (fcState.lives === 3) heartsEl.innerHTML = "❤️❤️❤️";
  else if (fcState.lives === 2) heartsEl.innerHTML = "❤️❤️🖤";
  else if (fcState.lives === 1) heartsEl.innerHTML = "❤️🖤🖤";
  else heartsEl.innerHTML = "🖤🖤🖤";
}

function revealAllCards() {
  const cardInners = document.querySelectorAll(".fc-card-inner");
  cardInners.forEach(card => card.classList.add("flipped"));
  fcState.cards.forEach(c => c.isRevealed = true);
  document.getElementById("fc-cards-status-text").textContent = "Todos os Cartões Revelados";
}

function peekFlashcards() {
  if (fcState.phase !== "challenging" || fcState.isPeeking || fcState.isProcessing) return;
  fcState.isPeeking = true;
  sfx.playFlip();

  const peekBtn = document.getElementById("btn-fc-peek");
  peekBtn.textContent = "👁️ Espiando... (4s)";
  peekBtn.disabled = true;

  const cardInners = document.querySelectorAll(".fc-card-inner");
  cardInners.forEach(card => card.classList.add("flipped"));

  setTimeout(() => {
    fcState.cards.forEach((student, idx) => {
      const card = document.getElementById(`fc-card-inner-${idx}`);
      if (!student.isRevealed && card) {
        card.classList.remove("flipped");
      }
    });
    peekBtn.textContent = "👁️ Espiar (4s)";
    peekBtn.disabled = false;
    fcState.isPeeking = false;
    sfx.playFlip();
  }, 4000);
}

function nextFlashcardChallenge() {
  if (fcState.round < fcState.totalRounds) {
    fcState.round++;
    startNewMemorizeRound();
  } else {
    sfx.playFanfare();
    confetti.burst(140);
    const alertEl = document.getElementById("fc-live-alert");
    alertEl.className = "fc-feedback-alert correct";
    alertEl.innerHTML = `
      🏆 <strong>PARABÉNS! VOCÊ COMPLETOU AS ${fcState.totalRounds} RODADAS DO DESAFIO!</strong><br>
      Sua pontuação final de memória: <strong>${fcState.score} pontos</strong>!<br>
      Excelente domínio dos Comparative Adjectives e memória visual!
    `;
    document.getElementById("btn-fc-next-challenge").classList.add("hidden");
  }
}

function shuffleAndResetBoard() {
  if (fcState.timerInterval) {
    clearInterval(fcState.timerInterval);
    fcState.timerInterval = null;
  }
  startNewMemorizeRound();
}

function resetFlashcardsGame() {
  initFlashcardsGame();
}

// ============================================================================
// MODALS LOGIC: AVATARS, LEADERBOARD, ACHIEVEMENTS
// ============================================================================
function renderAvatarSelectionModal() {
  const grid = document.getElementById("avatar-selection-grid");
  if (!grid) return;
  grid.innerHTML = "";

  FC_STUDENTS_LIST.forEach(st => {
    const item = document.createElement("div");
    item.className = `avatar-choice-item ${state.playerAvatar === `assets/avatar_${st.id}.jpg` ? 'active' : ''}`;
    item.innerHTML = `
      <img src="assets/avatar_${st.id}.jpg" alt="${st.name}" class="avatar-choice-img" />
      <span class="avatar-choice-name">${st.name}</span>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".avatar-choice-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      state.playerAvatar = `assets/avatar_${st.id}.jpg`;
      document.getElementById("player-avatar-img").src = state.playerAvatar;
    });

    grid.appendChild(item);
  });
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  const mockLeaderboard = [
    { rank: 1, name: "Mateus", avatar: "assets/avatar_mateus.jpg", pts: 2150 },
    { rank: 2, name: "Juliana", avatar: "assets/avatar_juliana.jpg", pts: 1850 },
    { rank: 3, name: state.playerName, avatar: state.playerAvatar, pts: state.scoreXP, isPlayer: true },
    { rank: 4, name: "Carlos", avatar: "assets/avatar_carlos.jpg", pts: 1400 },
    { rank: 5, name: "Beatriz", avatar: "assets/avatar_beatriz.jpg", pts: 1250 },
    { rank: 6, name: "Gabriel", avatar: "assets/avatar_gabriel.jpg", pts: 950 }
  ];

  // Re-sort with player's dynamic score
  mockLeaderboard.sort((a, b) => b.pts - a.pts);
  mockLeaderboard.forEach((item, idx) => item.rank = idx + 1);

  list.innerHTML = "";
  mockLeaderboard.forEach(item => {
    const row = document.createElement("div");
    row.className = `lb-row ${item.isPlayer ? 'player-highlight' : ''}`;
    row.innerHTML = `
      <div class="lb-left">
        <span class="lb-rank">${item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}</span>
        <img src="${item.avatar}" alt="${item.name}" class="lb-avatar" />
        <span class="lb-name">${item.name} ${item.isPlayer ? '<strong>(Você)</strong>' : ''}</span>
      </div>
      <div class="lb-pts">${item.pts} XP</div>
    `;
    list.appendChild(row);
  });
}

const ACHIEVEMENTS_DATA = [
  { id: "first_step", title: "Primeiro Passo", icon: "🌱", desc: "Respondeu à sua primeira questão no Quiz!" },
  { id: "combo_3", title: "Combo Flamejante", icon: "🔥", desc: "Alcançou um Combo x3 de acertos consecutivos!" },
  { id: "sound_listener", title: "Ouvido Atento", icon: "🎧", desc: "Escutou a pronúncia nativa de uma pergunta em inglês!" },
  { id: "memory_expert", title: "Memória de Elefante", icon: "🧠", desc: "Acertou um desafio de Flashcard de 1ª tentativa!" },
  { id: "comparative_master", title: "Mestre dos Comparativos", icon: "👑", desc: "Gabaritou o Quiz com nota 10/10!" },
  { id: "champion_804", title: "Campeão da Turma 804", icon: "🏆", desc: "Alcançou mais de 1000 pontos de XP no jogo!" }
];

function unlockAchievement(id) {
  if (state.achievements[id]) return;
  state.achievements[id] = true;

  const ach = ACHIEVEMENTS_DATA.find(a => a.id === id);
  if (ach) {
    spawnFloatingXP(`Conquista: ${ach.title}! 🎖️`);
    sfx.playFanfare();
  }

  // Count unlocked
  const unlockedCount = Object.values(state.achievements).filter(Boolean).length;
  const countEl = document.getElementById("achievements-unlocked-count");
  if (countEl) countEl.textContent = `${unlockedCount}/6`;

  renderAchievements();
}

function renderAchievements() {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = "";

  ACHIEVEMENTS_DATA.forEach(ach => {
    const isUnlocked = state.achievements[ach.id];
    const card = document.createElement("div");
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="ach-icon">${isUnlocked ? ach.icon : '🔒'}</div>
      <div class="ach-info">
        <h4>${ach.title} ${isUnlocked ? '✅' : ''}</h4>
        <p>${ach.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}
