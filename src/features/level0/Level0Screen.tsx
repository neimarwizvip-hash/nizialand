import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Languages,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, audioService } from '../../services/audio';
import { speechService } from '../../services/speech';

interface ComicPanel {
  id: number;
  speaker: string;
  speakerRole: string;
  speakerBadgeColor: string;
  avatarImg: string;
  bgImg: string;
  speechEn: string;
  speechPt: string;
  reaction: string;
  instruction: string;
}

const COMIC_PANELS: ComicPanel[] = [
  {
    id: 1,
    speaker: "Estudante",
    speakerRole: "Aluno Explorador",
    speakerBadgeColor: "from-blue-600 to-cyan-600",
    avatarImg: "/assets/student_boy_hoodie.png",
    bgImg: "/assets/nisialand_school_facade_clean.jpg",
    speechEn: "Look at this school! It looks like a normal day at Nísia Vilela, but something feels magical here...",
    speechPt: "Olhe esta escola! Parece um dia comum na Nísia Vilela, mas tem algo mágico acontecendo por aqui...",
    reaction: "📱 O estudante está filmando o pátio com seu celular!",
    instruction: "Observe o início do dia escolar na fachada da escola."
  },
  {
    id: 2,
    speaker: "Estudante",
    speakerRole: "Aluna Exploradora",
    speakerBadgeColor: "from-pink-600 to-rose-500",
    avatarImg: "/assets/student_girl_ponytail.png",
    bgImg: "/assets/nisialand_school_facade_clean.jpg",
    speechEn: "Good morning! Hurry up, the bell is ringing! Today we have English class!",
    speechPt: "Bom dia! Corre, o sinal está tocando! Hoje tem aula de inglês!",
    reaction: "🔔 A colega chega correndo e chama o amigo para entrar.",
    instruction: "Ouça como se diz 'bom dia' e 'aula de inglês'."
  },
  {
    id: 3,
    speaker: "Estudante",
    speakerRole: "Aluna Exploradora",
    speakerBadgeColor: "from-violet-600 to-fuchsia-500",
    avatarImg: "/assets/student_girl_curly.png",
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Hi, friends! Wait for me! Please, put your phone in your bag before the principal sees it!",
    speechPt: "Oi, amigos! Me esperem! Por favor, guarde o celular na mochila antes que o diretor veja!",
    reaction: "🎒 Outra colega alcança o grupo no corredor e dá um conselho.",
    instruction: "Repare nas palavras 'please', 'phone' e 'bag'."
  },
  {
    id: 4,
    speaker: "Diretor Márcio",
    speakerRole: "Principal / Direção",
    speakerBadgeColor: "from-amber-600 to-amber-700",
    avatarImg: "/assets/diretor_marcio.png",
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Attention, students! In this school, we learn and play together. No cell phones in the hallway! Let's go to class!",
    speechPt: "Atenção, estudantes! Nesta escola, aprendemos e nos divertimos juntos. Nada de celular no corredor! Vamos para a sala!",
    reaction: "📢 O Diretor Márcio avisa a regra da escola com firmeza e carinho!",
    instruction: "Ouça com atenção a regra escolar em inglês."
  },
  {
    id: 5,
    speaker: "A Turma",
    speakerRole: "Todos Juntos",
    speakerBadgeColor: "from-emerald-600 to-teal-500",
    avatarImg: "/assets/nisialand_inclusive_students.png",
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Yes, Mr. Márcio! We are all different, and we learn together!",
    speechPt: "Sim, Diretor Márcio! Somos todos diferentes, e aprendemos juntos!",
    reaction: "🤝 A turma inteira responde junta ao diretor.",
    instruction: "'Together' quer dizer 'juntos'. Guarde essa palavra!"
  },
  {
    id: 6,
    speaker: "Estudante",
    speakerRole: "Aluno Explorador",
    speakerBadgeColor: "from-blue-600 to-cyan-600",
    avatarImg: "/assets/student_boy_tshirt.png",
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Oops! Mr. Márcio caught me! I need to put this phone away and get to class right now! Run!",
    speechPt: "Ops! O Diretor Márcio me viu! Preciso guardar esse celular e ir voando para a sala! Correee!",
    reaction: "🏃💨 O estudante guarda o celular e dispara pelo corredor em direção à aula!",
    instruction: "Prepare-se para o mini-desafio no corredor da escola!"
  }
];

interface Level0Question {
  id: number;
  promptEn: string;
  promptPt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

const LEVEL0_QUESTIONS: Level0Question[] = [
  {
    id: 1,
    promptEn: "What did Principal Márcio say about cell phones in the hallway?",
    promptPt: "O que o Diretor Márcio falou sobre celulares no corredor?",
    options: [
      { text: "No cell phones in the hallway!", isCorrect: true },
      { text: "Take more selfies now!", isCorrect: false },
      { text: "Play music out loud!", isCorrect: false },
      { text: "Leave your phone on the floor", isCorrect: false }
    ],
    explanation: "Principal Márcio clearly said: 'No cell phones in the hallway! Let's go to class!'"
  },
  {
    id: 2,
    promptEn: "How do we say 'prestar atenção' or 'vamos para a aula' in English?",
    promptPt: "Como se diz 'atenção' e 'vamos para a sala'?",
    options: [
      { text: "Attention! Let's go to class!", isCorrect: true },
      { text: "Good night! Let's sleep!", isCorrect: false },
      { text: "Run outside the school!", isCorrect: false },
      { text: "Never listen to teachers", isCorrect: false }
    ],
    explanation: "'Attention' significa atenção, e 'Let's go to class' é o convite para irmos à aula!"
  },
  {
    id: 3,
    promptEn: "Complete the school rule: In Nisialand, we learn and play ______!",
    promptPt: "Complete o lema da escola: No Nisialand, aprendemos e brincamos ______!",
    options: [
      { text: "together (juntos)", isCorrect: true },
      { text: "alone (sozinhos)", isCorrect: false },
      { text: "angrily (com raiva)", isCorrect: false },
      { text: "in silence forever", isCorrect: false }
    ],
    explanation: "'Together' significa 'juntos'! O trabalho em equipe e o respeito mútuo são fundamentais no Nisialand."
  }
];

export const Level0Screen: React.FC = () => {
  const navigate = useNavigate();

  // Current Step of Level 0: 'comic' | 'chase' | 'quiz' | 'complete'
  const [stage, setStage] = useState<'comic' | 'chase' | 'quiz' | 'complete'>('comic');

  // Comic State
  const [comicIndex, setComicIndex] = useState<number>(0);
  const [showPtTranslation, setShowPtTranslation] = useState<boolean>(false);

  // Chase Minigame State
  const [chaseScore, setChaseScore] = useState<number>(0);
  const [chaseJump, setChaseJump] = useState<boolean>(false);
  const [obstaclePassed, setObstaclePassed] = useState<boolean>(false);
  const [chaseSeconds, setChaseSeconds] = useState<number>(10);

  // Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Sem trilha de fundo durante a história: só a narração em inglês
  useEffect(() => {
    audioService.holdMusicForStory();
    return () => audioService.releaseMusicForStory();
  }, []);

  // Speak Comic Speech on change
  useEffect(() => {
    if (stage === 'comic') {
      const current = COMIC_PANELS[comicIndex];
      speechService.speak(current.speechEn, 'en-US');
    }
  }, [comicIndex, stage]);

  // Chase countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'chase' && chaseSeconds > 0) {
      timer = setTimeout(() => {
        setChaseSeconds(prev => prev - 1);
        setChaseScore(prev => prev + 15);
      }, 1000);
    } else if (stage === 'chase' && chaseSeconds === 0) {
      soundEffects.levelUp();
      setStage('quiz');
    }
    return () => clearTimeout(timer);
  }, [stage, chaseSeconds]);

  // Trigger jump in chase
  const handleJump = () => {
    if (chaseJump) return;
    soundEffects.cardFlip();
    setChaseJump(true);
    setChaseScore(prev => prev + 50);
    setTimeout(() => {
      setChaseJump(false);
      setObstaclePassed(true);
      setTimeout(() => setObstaclePassed(false), 800);
    }, 600);
  };

  const handleNextComic = () => {
    soundEffects.buttonClick();
    if (comicIndex < COMIC_PANELS.length - 1) {
      setComicIndex(prev => prev + 1);
      setShowPtTranslation(false);
    } else {
      setStage('chase');
    }
  };

  const handlePrevComic = () => {
    soundEffects.buttonClick();
    if (comicIndex > 0) {
      setComicIndex(prev => prev - 1);
      setShowPtTranslation(false);
    }
  };

  const handleSkipComic = () => {
    soundEffects.buttonClick();
    setStage('quiz');
  };

  const handleSpeakSpeech = (text: string) => {
    speechService.speak(text, 'en-US');
  };

  // Quiz Answer Handler
  const handleSelectQuizOption = (optIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIndex);

    const question = LEVEL0_QUESTIONS[quizQuestionIndex];
    const isCorrect = question.options[optIndex].isCorrect;

    if (isCorrect) {
      soundEffects.correct();
      setQuizFeedback('correct');
      setQuizScore(prev => prev + 100);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      soundEffects.incorrect();
      setQuizFeedback('incorrect');
    }
  };

  const handleNextQuizQuestion = () => {
    soundEffects.buttonClick();
    setSelectedOption(null);
    setQuizFeedback(null);

    if (quizQuestionIndex < LEVEL0_QUESTIONS.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
    } else {
      soundEffects.fanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setStage('complete');
    }
  };

  const currentComic = COMIC_PANELS[comicIndex];
  const currentQ = LEVEL0_QUESTIONS[quizQuestionIndex];

  return (
    <div className="relative min-h-screen game-sky text-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            stage === 'comic'
              ? currentComic.bgImg
              : stage === 'chase'
              ? "/assets/nisialand_hallway_bg.jpg"
              : stage === 'quiz'
              ? "/assets/nisialand_hallway_bg.jpg"
              : "/assets/nisialand_school_facade_clean.jpg"
          }
          alt="NISIALAND Background"
          className="w-full h-full object-cover filter brightness-[0.85] transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-50 via-white/40 to-sky-50/70"></div>
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-2xl font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-game-gold flex items-center gap-1.5">
            <span>⭐</span> <span>NÍVEL 0: INTRODUÇÃO</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white/90 border border-sky-200 px-3 py-1 rounded-xl text-xs font-bold text-slate-600">
            <span>Modo Visitante</span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full transition-all ${
              stage === 'comic' ? 'bg-amber-400 ring-4 ring-amber-400/30' : 'bg-emerald-400'
            }`}
            title="Ato 1: História em Quadrinhos"
          />
          <span
            className={`w-3 h-3 rounded-full transition-all ${
              stage === 'chase'
                ? 'bg-amber-400 ring-4 ring-amber-400/30'
                : stage === 'quiz' || stage === 'complete'
                ? 'bg-emerald-400'
                : 'bg-sky-100'
            }`}
            title="Ato 2: Perseguição no Corredor"
          />
          <span
            className={`w-3 h-3 rounded-full transition-all ${
              stage === 'quiz'
                ? 'bg-amber-400 ring-4 ring-amber-400/30'
                : stage === 'complete'
                ? 'bg-emerald-400'
                : 'bg-sky-100'
            }`}
            title="Ato 3: Mini-Desafio de Regras"
          />
          <span
            className={`w-3 h-3 rounded-full transition-all ${
              stage === 'complete' ? 'bg-emerald-400 ring-4 ring-emerald-400/30' : 'bg-sky-100'
            }`}
            title="Ato 4: Conclusão"
          />

          <button
            onClick={() => navigate('/')}
            className="ml-4 text-xs font-heading font-bold text-slate-500 hover:text-slate-900 px-3 py-1 bg-sky-50/80 rounded-lg border border-sky-200"
          >
            Sair
          </button>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 my-auto py-6">
        {/* ========================================================= */}
        {/* ATO 1: HQ ANIMADA INTERATIVA (COMIC STRIP) */}
        {/* ========================================================= */}
        {stage === 'comic' && (
          <div className="bg-white/90 border-4 border-amber-500 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md animate-fadeIn">
            {/* Comic Header Info */}
            <div className="flex justify-between items-center pb-4 border-b border-sky-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-amber-700">
                    ATO 1: O ENCONTRO NO PÁTIO
                  </h2>
                  <p className="text-xs text-slate-500">
                    Painel {comicIndex + 1} de {COMIC_PANELS.length} • {currentComic.reaction}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSkipComic}
                className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1 font-heading uppercase px-3 py-1.5 rounded-lg bg-sky-50/80 border border-sky-200 hover:border-amber-500/50"
              >
                <span>Pular HQ</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Comic Frame Body */}
            <div className="my-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Speaker Character Spotlight */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="relative group">
                  <div className={`${currentComic.id === 5 ? 'w-64 h-44 sm:w-72 sm:h-52' : 'w-36 h-48 sm:w-44 sm:h-56'} rounded-2xl overflow-hidden border-4 border-amber-400/80 shadow-glow-gold bg-white/95 flex items-center justify-center p-2`}>
                    <img
                      src={currentComic.avatarImg}
                      alt={currentComic.speaker}
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                  <div className="absolute -bottom-3 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-heading font-black text-xs shadow-md">
                    {currentComic.speaker}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                    {currentComic.speakerRole}
                  </span>
                </div>
              </div>

              {/* Comic Speech Bubble */}
              <div className="md:col-span-8 flex flex-col justify-center">
                <div className="relative bg-white/95 border-3 border-cyan-400 rounded-3xl p-6 shadow-game-blue text-left">
                  {/* Comic Speech Pointer Tail */}
                  <div className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[14px] border-r-cyan-400"></div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-heading font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🗣️</span> DIÁLOGO EM INGLÊS:
                    </span>
                    <button
                      onClick={() => handleSpeakSpeech(currentComic.speechEn)}
                      className="p-2 bg-cyan-100/80 hover:bg-cyan-100 text-cyan-700 rounded-xl transition-all border border-cyan-600 flex items-center gap-1.5 text-xs font-bold"
                      title="Ouvir pronúncia em inglês"
                    >
                      <Volume2 className="w-4 h-4 text-cyan-700" />
                      <span>Ouvir</span>
                    </button>
                  </div>

                  {/* Speech English Text */}
                  <p className="text-lg sm:text-xl font-heading font-bold text-slate-900 leading-relaxed mb-4">
                    "{currentComic.speechEn}"
                  </p>

                  {/* Translation Toggle & Text */}
                  <div className="pt-3 border-t border-sky-200">
                    <button
                      onClick={() => setShowPtTranslation(!showPtTranslation)}
                      className="text-xs font-heading font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 mb-2"
                    >
                      <Languages className="w-4 h-4" />
                      <span>{showPtTranslation ? "Ocultar Tradução" : "Ver Tradução em Português"}</span>
                    </button>

                    {showPtTranslation && (
                      <p className="text-sm font-sans text-slate-600 bg-white/90 p-3 rounded-xl border border-sky-200 animate-fadeIn">
                        "{currentComic.speechPt}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 italic">
                  💡 {currentComic.instruction}
                </div>
              </div>
            </div>

            {/* Comic Navigation Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-sky-200">
              <button
                onClick={handlePrevComic}
                disabled={comicIndex === 0}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm font-heading font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={handleNextComic}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-game-gold transform active:scale-95 transition-all"
              >
                <span>{comicIndex < COMIC_PANELS.length - 1 ? "Próximo Painel" : "Iniciar Perseguição!"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ATO 2: A PERSEGUIÇÃO NO CORREDOR (THE HALLWAY CHASE) */}
        {/* ========================================================= */}
        {stage === 'chase' && (
          <div className="bg-white/95 border-4 border-cyan-400 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md animate-fadeIn text-center">
            <div className="flex justify-between items-center pb-3 border-b border-sky-200 mb-4">
              <div className="text-left">
                <h2 className="font-heading font-black text-lg sm:text-xl text-cyan-700 flex items-center gap-2">
                  🏃💨 ATO 2: THE HALLWAY CHASE!
                </h2>
                <p className="text-xs text-slate-500">
                  Desvie dos obstáculos no corredor e chegue à sala a tempo!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 text-xs font-mono font-bold text-amber-700">
                  ⏱️ {chaseSeconds}s restantes
                </div>
                <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-heading font-black text-xs">
                  🪙 +{chaseScore} PTS
                </div>
              </div>
            </div>

            {/* Chase Animation Arena */}
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-blue-100 to-sky-50 rounded-2xl overflow-hidden border-2 border-cyan-500/50 flex flex-col justify-between p-4 my-4">
              {/* Hallway Backdrop with Speed Lines */}
              <img
                src="/assets/nisialand_hallway_bg.jpg"
                alt="Corredor da Escola"
                className="absolute inset-0 w-full h-full object-cover filter brightness-75"
              />
              
              {/* Warning Sign */}
              <div className="relative z-10 mx-auto bg-amber-500/90 text-slate-950 px-4 py-1 rounded-full text-xs font-heading font-black flex items-center gap-1.5 shadow-md">
                <ShieldAlert className="w-4 h-4" />
                <span>NO CELL PHONES! GET TO CLASS!</span>
              </div>

              {/* Running Track with Characters & Obstacles */}
              <div className="relative z-10 w-full h-36 flex items-end justify-between px-6 pb-2">
                {/* Pursuing Principal Márcio (Left Side) */}
                <div className="flex flex-col items-center transform transition-transform animate-bounce">
                  <div className="w-20 h-28 sm:w-24 sm:h-32 bg-white/90 border-2 border-amber-400 rounded-xl overflow-hidden shadow-lg p-1">
                    <img
                      src="/assets/diretor_marcio.png"
                      alt="Diretor Márcio"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-heading font-black text-amber-700 mt-1 bg-white/90 px-2 py-0.5 rounded">
                    Diretor Márcio
                  </span>
                </div>

                {/* Animated Obstacle (Backpack / Cone) */}
                <div className="text-3xl sm:text-4xl animate-pulse">
                  {obstaclePassed ? "✨ NICE JUMP! ✨" : "🎒 ⚠️"}
                </div>

                {/* Running Student (Right Side) */}
                <div
                  className={`flex flex-col items-center transition-all duration-300 ${
                    chaseJump ? '-translate-y-16 scale-110' : 'translate-y-0'
                  }`}
                >
                  <div className="w-20 h-28 sm:w-24 sm:h-32 bg-white/90 border-2 border-cyan-400 rounded-xl overflow-hidden shadow-game-blue p-1">
                    <img
                      src="/assets/student_boy_tshirt.png"
                      alt="Estudante Correndo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-heading font-black text-cyan-700 mt-1 bg-white/90 px-2 py-0.5 rounded">
                    Você (Aluno)
                  </span>
                </div>
              </div>

              {/* Bottom Instruction */}
              <div className="relative z-10 flex justify-center">
                <button
                  onClick={handleJump}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-heading font-black text-base uppercase rounded-full border-2 border-white shadow-game-blue transform active:scale-95 transition-all"
                >
                  🦘 PULAR OBSTÁCULO! (JUMP!)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              💡 Pressione o botão <strong>PULAR</strong> para desviar da mochila no corredor e ganhar pontos extras!
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* ATO 3: MINI-DESAFIO DE LÍNGUA INGLESA & REGRAS */}
        {/* ========================================================= */}
        {stage === 'quiz' && (
          <div className="bg-white/95 border-4 border-amber-500 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-sky-200">
              <div>
                <span className="text-xs font-heading font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> ATO 3: DESAFIO PEDAGÓGICO DE INGLÊS
                </span>
                <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900">
                  Pergunta {quizQuestionIndex + 1} de {LEVEL0_QUESTIONS.length}
                </h2>
              </div>

              <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-2xl font-heading font-black text-xs shadow-game-gold">
                🪙 {quizScore} PTS
              </div>
            </div>

            {/* Question Text */}
            <div className="my-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Question in English:</span>
                <button
                  onClick={() => speechService.speak(currentQ.promptEn, 'en-US')}
                  className="p-1.5 bg-sky-50 text-cyan-700 rounded-lg hover:bg-sky-100 flex items-center gap-1 text-xs font-bold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              <h3 className="text-xl sm:text-2xl font-heading font-black text-amber-700 mb-2">
                {currentQ.promptEn}
              </h3>
              <p className="text-sm text-slate-500 italic">
                Tradução: {currentQ.promptPt}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                let btnStyles = "bg-sky-50/90 border-sky-200 hover:border-amber-400 text-slate-900";
                if (selectedOption !== null) {
                  if (option.isCorrect) {
                    btnStyles = "bg-emerald-100/80 border-emerald-500 text-emerald-800 shadow-glow-emerald";
                  } else if (isSelected && !option.isCorrect) {
                    btnStyles = "bg-red-100/80 border-red-500 text-red-800";
                  } else {
                    btnStyles = "opacity-40 border-sky-200";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizOption(idx)}
                    disabled={selectedOption !== null}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-heading font-bold text-left transition-all text-sm sm:text-base ${btnStyles}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-white/95 border border-sky-300 flex items-center justify-center text-amber-600 font-black flex-shrink-0">
                      {letter}
                    </span>
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback and Continue */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-white/90 border-2 border-sky-200 animate-fadeIn flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    {quizFeedback === 'correct' ? (
                      <span className="text-emerald-600 font-heading font-black text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> EXCELLENT! Resposta Correta (+100 PTS)
                      </span>
                    ) : (
                      <span className="text-amber-600 font-heading font-black text-sm">
                        Quase lá! Veja a explicação:
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {currentQ.explanation}
                  </p>
                </div>

                <button
                  onClick={handleNextQuizQuestion}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-heading font-black rounded-full uppercase tracking-wider text-xs sm:text-sm shadow-game-gold hover:from-amber-300 hover:to-amber-400 transform active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ATO 4: LEVEL 0 COMPLETE & READY FOR ORIENTATION */}
        {/* ========================================================= */}
        {stage === 'complete' && (
          <div className="bg-white/95 border-4 border-emerald-500 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md animate-fadeIn text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-4xl sm:text-5xl shadow-glow-gold border-4 border-white animate-bounce">
              🏆
            </div>

            <div className="inline-block bg-emerald-100/80 border border-emerald-500 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-heading font-black uppercase mb-3">
              ★ LEVEL 0 COMPLETED! ★
            </div>

            <h2 className="text-2xl sm:text-4xl font-heading font-black text-slate-900 mb-3">
              PARABÉNS, EXPLORADOR!
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
              Você aprendeu as primeiras regras escolares com o <strong className="text-amber-600">Diretor Márcio</strong> e concluiu a introdução do Nisialand com sucesso!
            </p>

            {/* Score Summary Box */}
            <div className="bg-white/90 border-2 border-sky-200 rounded-2xl p-4 mb-8 flex justify-around items-center">
              <div>
                <span className="text-xs text-slate-500 block font-heading">Pontos de Abertura</span>
                <span className="text-2xl sm:text-3xl font-heading font-black text-amber-600">
                  +{quizScore + chaseScore} PTS
                </span>
              </div>
              <div className="h-10 w-px bg-sky-50"></div>
              <div>
                <span className="text-xs text-slate-500 block font-heading">Próximo Passo</span>
                <span className="text-sm sm:text-base font-heading font-black text-cyan-700">
                  Reunião Educativa
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => navigate('/orientation')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 text-slate-950 font-heading font-black text-base uppercase tracking-wider rounded-full border-2 border-white shadow-lg hover:from-emerald-400 hover:to-cyan-300 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>CONTINUAR PARA A REUNIÃO EDUCATIVA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-3.5 bg-sky-50/80 hover:bg-sky-100 text-slate-600 font-heading font-bold text-xs uppercase rounded-full border border-sky-200 transition-all"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-500 border-t border-sky-200 bg-white/80 backdrop-blur-sm">
        Escola Municipal Nísia Vilela Fernandes • Duque de Caxias • Prof. Neimar Oliveira
      </footer>
    </div>
  );
};
