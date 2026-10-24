import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Calendar, GraduationCap, Shield, ArrowRight, KeyRound, AlertCircle, Compass,
  ChevronLeft, ChevronRight, Lock, Palette, Check,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TeamId, isGuestPlayer } from '../../types';
import { audioService, soundEffects } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { AVATAR_CATALOG, PlayerAvatar, SkinTone } from '../../components/ui/PlayerAvatar';
import { AvatarFigure } from '../../components/ui/AvatarFigure';
import { GameControls, LevelBadge } from '../../components/ui/GameControls';
import { FullscreenButton } from '../../components/ui/FullscreenButton';
import { nameModerationService } from '../../services/nameModeration';
import { AVAILABLE_CLASSES } from '../../data/mockData';
import { GRADE_LABELS, SCHOOL_GRADES, SchoolGrade } from '../../data/level0Content';

// Visitante escolhe entre os 4 heróis iniciais.
const GUEST_AVATARS = AVATAR_CATALOG.filter(a => a.category === 'hero' && a.unlockLevel === 0).slice(0, 4);

// Jogador novo começa na Patente 0.
const NEW_PLAYER_LEVEL = 0;
const AVATARS_PER_PAGE = 8;
const AVATAR_PAGES = Math.ceil(AVATAR_CATALOG.length / AVATARS_PER_PAGE);

const SKIN_TONES: { id: SkinTone; label: string; color: string }[] = [
  { id: 'light', label: 'Claro', color: '#fcd34d' },
  { id: 'warm', label: 'Dourado', color: '#f59e0b' },
  { id: 'medium', label: 'Moreno', color: '#b45309' },
  { id: 'dark', label: 'Negro', color: '#78350f' },
];

const AGE_OPTIONS = [10, 11, 12, 13, 14, 15];

const labelClass = 'block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5';
const fieldClass =
  'w-full px-3 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-bold text-sm bg-white transition-all';
const yellowButton =
  'w-full py-3 px-4 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:brightness-105 text-slate-950 font-heading font-black text-lg tracking-wider border-2 border-amber-600 shadow-[0_5px_0_0_#b45309] active:translate-y-1 active:shadow-[0_1px_0_0_#b45309] flex items-center justify-center gap-2 transition-all cursor-pointer';

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithCode, startGuest, currentPlayer } = useGame();
  const guestPlaying = isGuestPlayer(currentPlayer) ? currentPlayer : null;

  const [mode, setMode] = useState<'new' | 'code' | 'guest'>('new');

  // New player form state (um visitante que vem se cadastrar já chega com nome e avatar)
  const [name, setName] = useState(guestPlaying?.name ?? '');
  const [age, setAge] = useState<number>(13);
  const [className, setClassName] = useState<string>(AVAILABLE_CLASSES[0] ?? '601');
  const [team, setTeam] = useState<TeamId>('blue');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(guestPlaying?.avatar ?? 'hero-boy-hoodie');
  const [skinTone, setSkinTone] = useState<SkinTone>('light');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Vitrine de avatares: avatar bloqueado pode ser visto, mas não escolhido.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [avatarPage, setAvatarPage] = useState<number>(() => {
    const idx = AVATAR_CATALOG.findIndex(a => a.id === (guestPlaying?.avatar ?? 'hero-boy-hoodie'));
    return idx >= 0 ? Math.floor(idx / AVATARS_PER_PAGE) : 0;
  });

  // Existing player code state
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Visitor state
  const [guestName, setGuestName] = useState('');
  const [guestGrade, setGuestGrade] = useState<SchoolGrade | null>(null);
  const [guestAvatar, setGuestAvatar] = useState<string>(GUEST_AVATARS[0]?.id ?? 'hero-boy-hoodie');
  const [guestError, setGuestError] = useState<string | null>(null);

  const shownAvatar =
    AVATAR_CATALOG.find(a => a.id === (previewId ?? selectedAvatar)) ||
    AVATAR_CATALOG.find(a => a.id === selectedAvatar) ||
    AVATAR_CATALOG[0];
  const shownLocked = (shownAvatar.unlockLevel || 0) > NEW_PLAYER_LEVEL;
  const pageAvatars = AVATAR_CATALOG.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE);

  const switchMode = (next: 'new' | 'code' | 'guest') => {
    audioService.playClick();
    setMode(next);
  };

  const handleAvatarClick = (avatarId: string, locked: boolean) => {
    soundEffects.cardFlip();
    if (locked) {
      setPreviewId(avatarId);
      return;
    }
    setPreviewId(null);
    setSelectedAvatar(avatarId);
  };

  const goToPage = (page: number) => {
    soundEffects.buttonClick();
    setAvatarPage((page + AVATAR_PAGES) % AVATAR_PAGES);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError(null);

    const valResult = nameModerationService.validate(guestName);
    if (!valResult.isValid) {
      setGuestError(valResult.errorMessage || 'Por favor, digite um apelido válido.');
      audioService.playWrong();
      return;
    }
    if (!guestGrade) {
      setGuestError('Escolha a sua série para começar.');
      audioService.playWrong();
      return;
    }

    audioService.playChime();
    startGuest({ name: valResult.sanitizedName, grade: guestGrade, avatar: guestAvatar });
    navigate('/missions');
  };

  const handleSelectTeam = (chosenTeam: TeamId) => {
    audioService.playClick();
    setTeam(chosenTeam);
  };

  const handleNewPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate with moderation service
    const valResult = nameModerationService.validate(name);
    if (!valResult.isValid) {
      setErrorMsg(valResult.errorMessage || 'Por favor, digite um nome válido.');
      audioService.playWrong();
      return;
    }

    try {
      audioService.playChime();
      fireConfetti();
      await register({
        name: valResult.sanitizedName,
        age,
        className,
        team,
        avatar: selectedAvatar,
        skinTone
      });
      navigate('/missions');
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not register player. Please check your browser storage.');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    const trimmedCode = accessCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCodeError('Please enter your Player Code (e.g. NSL-804-A79).');
      audioService.playWrong();
      return;
    }

    const success = await loginWithCode(trimmedCode);
    if (success) {
      audioService.playChime();
      navigate('/missions');
    } else {
      audioService.playWrong();
      setCodeError('Player Code not found. Please check or register as a new player.');
    }
  };

  const backToRegistration = (
    <button
      type="button"
      onClick={() => switchMode('new')}
      className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
    >
      ← Voltar ao cadastro
    </button>
  );

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-white overflow-x-hidden">
      {/* Formas suaves no fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-72 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      {/* Topo: logo à esquerda, nível e tela cheia à direita */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-6 pt-3 sm:pt-4">
        <Link to="/" className="group" aria-label="NISIALAND — início">
          <span className="inline-block bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-heading font-black text-xl sm:text-2xl px-3 py-1 rounded-xl border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] group-hover:-translate-y-0.5 transition-transform">
            NISIALAND
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LevelBadge label="Level" level={0} />
          <FullscreenButton />
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        {/* --- PAINEL ESQUERDO: formulário --- */}
        <section className="game-panel p-4 sm:p-6 animate-rise-in flex flex-col">
          <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3 mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md border-2 border-white text-white flex-shrink-0">
              {mode === 'code' ? <KeyRound className="w-5 h-5" /> : mode === 'guest' ? <Compass className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl game-title tracking-wider uppercase leading-none">REGISTRATION</h1>
              <p className="text-[11px] font-bold text-blue-700 mt-0.5">Escola Municipal Nísia Vilela Fernandes</p>
            </div>
          </div>

          {mode === 'new' ? (
            /* --- FORM 1: NEW PLAYER REGISTRATION --- */
            <form onSubmit={handleNewPlayerSubmit} className="space-y-3 flex-1 flex flex-col">
              <p className="text-sm font-bold text-slate-600">
                Create your player and start your adventure in <span className="text-amber-600">NISIALAND</span>!
              </p>

              {guestPlaying && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  Você está jogando como visitante. Ao fazer seu cadastro definitivo, seus pontos e missões vão junto.
                </div>
              )}
              {errorMsg && <ErrorBox message={errorMsg} />}

              <div>
                <label htmlFor="reg-name" className={labelClass}>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  YOUR NAME (NOME OU APELIDO)
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name here..."
                  required
                  maxLength={30}
                  className={`${fieldClass} placeholder-slate-400`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reg-age" className={labelClass}>
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    AGE
                  </label>
                  <select id="reg-age" value={age} onChange={(e) => setAge(Number(e.target.value))} className={`${fieldClass} cursor-pointer`}>
                    {AGE_OPTIONS.map(n => (
                      <option key={n} value={n}>{n} years old</option>
                    ))}
                    <option value={16}>16+ years old</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-class" className={labelClass}>
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    CLASS
                  </label>
                  <select id="reg-class" value={className} onChange={(e) => setClassName(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {AVAILABLE_CLASSES.map(c => (
                      <option key={c} value={c}>Turma {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipe: escolha compacta */}
              <div>
                <span className={labelClass}>
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  TEAM
                </span>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Equipe">
                  {(['blue', 'purple'] as TeamId[]).map(t => {
                    const active = team === t;
                    const isBlue = t === 'blue';
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleSelectTeam(t)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 font-heading font-black text-xs sm:text-sm transition-all ${
                          active
                            ? isBlue
                              ? 'bg-blue-600 border-blue-800 text-white shadow-[0_3px_0_0_#1e3a8a]'
                              : 'bg-purple-600 border-purple-800 text-white shadow-[0_3px_0_0_#581c87]'
                            : isBlue
                              ? 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
                              : 'bg-white border-purple-200 text-purple-700 hover:border-purple-400'
                        }`}
                      >
                        <Shield className={`w-4 h-4 ${active ? 'fill-white' : ''}`} />
                        {isBlue ? 'Equipe Azul' : 'Equipe Roxa'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1" />

              <button type="submit" className={yellowButton}>
                <span>CONTINUE</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
                {!guestPlaying && (
                  <button
                    type="button"
                    onClick={() => switchMode('guest')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Experimentar como visitante
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => switchMode('code')}
                  className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Já tenho código
                </button>
              </div>
            </form>
          ) : mode === 'guest' ? (
            /* --- FORM 3: VISITOR (sem código, fora do ranking) --- */
            <form onSubmit={handleGuestSubmit} className="space-y-3">
              {guestError && <ErrorBox message={guestError} />}

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-700 text-xs">
                <p className="font-bold mb-0.5 text-slate-900">Experimentar como visitante</p>
                <p className="text-[11px] text-slate-500">
                  Jogue sem código. Visitantes não aparecem no ranking. Se gostar, faça o cadastro definitivo e seus pontos vão junto.
                </p>
              </div>

              <div>
                <label htmlFor="guest-name" className={labelClass}>
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  APELIDO
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  required
                  maxLength={30}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-900 font-bold placeholder-slate-400 text-sm transition-all"
                />
              </div>

              <div>
                <span className={labelClass}>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  SÉRIE
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SCHOOL_GRADES.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { audioService.playClick(); setGuestGrade(g); }}
                      className={`py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                        guestGrade === g
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {GRADE_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">ESCOLHA SEU HERÓI</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {GUEST_AVATARS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { audioService.playClick(); setGuestAvatar(a.id); }}
                      className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                        guestAvatar === a.id
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-300'
                          : 'bg-white border-slate-200 hover:border-emerald-300 opacity-80'
                      }`}
                    >
                      <PlayerAvatar avatarId={a.id} size="md" alt={a.name} />
                      <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 hover:from-green-300 hover:to-emerald-500 text-white font-bungee text-base sm:text-lg tracking-wider shadow-[0_4px_0_#065f46,0_10px_20px_rgba(16,185,129,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#065f46] border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>JOGAR COMO VISITANTE</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
              <div className="text-center">{backToRegistration}</div>
            </form>
          ) : (
            /* --- FORM 2: LOGIN WITH EXISTING PLAYER CODE --- */
            <form onSubmit={handleCodeSubmit} className="space-y-3.5">
              {codeError && <ErrorBox message={codeError} />}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs">
                <p className="font-bold mb-0.5 text-slate-900">Returning student?</p>
                <p className="text-[11px] text-slate-500">
                  Type your Player Code (e.g. <strong className="text-blue-600 font-mono">NSL-804-A79</strong>) to retrieve your scores, mission progress, and team points.
                </p>
              </div>

              <div>
                <label htmlFor="player-code" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  ENTER YOUR PLAYER CODE
                </label>
                <input
                  id="player-code"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="NSL-804-..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none text-purple-900 font-mono font-black placeholder-slate-400 text-lg tracking-widest uppercase transition-all text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-purple-500 via-indigo-600 to-purple-700 hover:from-purple-400 hover:to-indigo-500 text-white font-bungee text-base sm:text-lg tracking-wider shadow-[0_4px_0_#3b0764,0_10px_20px_rgba(147,51,234,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#3b0764] border-2 border-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>ACCESS MY GAME</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                {backToRegistration}
                {!guestPlaying && (
                  <button
                    type="button"
                    onClick={() => switchMode('guest')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Experimentar como visitante
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer info note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Protected for minors • No email</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              ← Back to Start
            </button>
          </div>
        </section>

        {/* --- PAINEL DIREITO: avatar --- */}
        <section className="game-panel p-4 sm:p-6 animate-rise-in flex flex-col" aria-label="Avatar">
          {mode === 'guest' ? (
            <>
              <h2 className="text-lg sm:text-xl game-title tracking-wider uppercase text-center">SEU HERÓI</h2>
              <div className="flex-1 min-h-[14rem] h-60 sm:h-80 lg:h-auto mt-3 rounded-2xl bg-gradient-to-b from-sky-50 to-emerald-50 border-2 border-sky-100 p-3">
                <AvatarFigure avatarId={guestAvatar} />
              </div>
              <p className="mt-2 text-center font-heading font-black text-slate-800">
                {AVATAR_CATALOG.find(a => a.id === guestAvatar)?.name}
              </p>
            </>
          ) : mode === 'code' ? (
            <>
              <h2 className="text-lg sm:text-xl game-title tracking-wider uppercase text-center">WELCOME BACK!</h2>
              <div className="flex-1 min-h-[14rem] h-60 sm:h-80 lg:h-auto mt-3 rounded-2xl bg-gradient-to-b from-sky-50 to-purple-50 border-2 border-sky-100 p-3 flex items-center justify-center gap-2">
                <div className="h-full w-1/2"><AvatarFigure avatarId="hero-boy-hoodie" /></div>
                <div className="h-full w-1/2"><AvatarFigure avatarId="hero-girl-curl" /></div>
              </div>
              <p className="mt-2 text-center text-xs font-bold text-slate-500">Seu avatar, seus pontos e suas missões voltam com o código.</p>
            </>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl game-title tracking-wider uppercase text-center">CHOOSE YOUR AVATAR</h2>

              {/* Avatar em destaque, corpo inteiro */}
              <div className="relative mt-3 h-56 sm:h-72 rounded-2xl bg-gradient-to-b from-sky-50 to-amber-50 border-2 border-sky-100 p-3">
                <AvatarFigure
                  avatarId={shownAvatar.id}
                  skinTone={shownAvatar.allowsSkinTone ? skinTone : 'light'}
                  className={shownLocked ? 'opacity-60 grayscale-[40%]' : ''}
                />
                {shownLocked && (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 text-white text-xs font-heading font-black">
                      <Lock className="w-3.5 h-3.5" />
                      Desbloqueia na Patente {shownAvatar.unlockLevel}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="font-heading font-black text-slate-800">{shownAvatar.name}</span>
                {shownLocked ? (
                  <button
                    type="button"
                    onClick={() => { soundEffects.buttonClick(); setPreviewId(null); }}
                    className="text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    Voltar ao meu avatar
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Escolhido
                  </span>
                )}
              </div>

              {/* Tom de pele (só nos avatares que já tinham) */}
              {shownAvatar.allowsSkinTone && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] font-heading font-bold text-amber-600 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Tom de pele:
                  </span>
                  {SKIN_TONES.map(tone => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => { soundEffects.buttonClick(); setSkinTone(tone.id); }}
                      title={`Tom de pele ${tone.label}`}
                      aria-pressed={skinTone === tone.id}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-bold border flex items-center gap-1 transition-all ${
                        skinTone === tone.id
                          ? 'bg-amber-400 text-slate-950 border-amber-500 scale-105'
                          : 'bg-white border-sky-200 text-slate-600 hover:border-sky-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block" style={{ backgroundColor: tone.color }} />
                      {tone.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Grade paginada */}
              <div className="mt-3 flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(avatarPage - 1)}
                  aria-label="Avatares anteriores"
                  className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-sky-300 text-blue-700 flex items-center justify-center shadow-[0_3px_0_0_#7dd3fc] hover:bg-sky-50 active:translate-y-0.5 active:shadow-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 grid grid-cols-4 gap-1.5 sm:gap-2">
                  {pageAvatars.map(avatar => {
                    const locked = (avatar.unlockLevel || 0) > NEW_PLAYER_LEVEL;
                    const isSelected = selectedAvatar === avatar.id;
                    const isPreview = previewId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleAvatarClick(avatar.id, locked)}
                        title={locked ? `${avatar.name} — Desbloqueia na Patente ${avatar.unlockLevel}` : avatar.name}
                        aria-pressed={isSelected}
                        className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300'
                            : isPreview
                              ? 'bg-slate-50 border-slate-500'
                              : 'bg-white border-sky-100 hover:border-sky-300'
                        }`}
                      >
                        <PlayerAvatar
                          avatarId={avatar.id}
                          skinTone={avatar.allowsSkinTone ? skinTone : 'light'}
                          size="lg"
                          alt={avatar.name}
                          className={locked ? 'opacity-50 grayscale' : ''}
                        />
                        {locked && (
                          <span className="absolute bottom-0.5 inset-x-0.5 flex items-center justify-center gap-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black py-0.5">
                            <Lock className="w-2.5 h-2.5" /> PAT {avatar.unlockLevel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(avatarPage + 1)}
                  aria-label="Próximos avatares"
                  className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-sky-300 text-blue-700 flex items-center justify-center shadow-[0_3px_0_0_#7dd3fc] hover:bg-sky-50 active:translate-y-0.5 active:shadow-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {Array.from({ length: AVATAR_PAGES }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToPage(i)}
                    aria-label={`Página ${i + 1} de avatares`}
                    aria-current={i === avatarPage}
                    className={`h-2.5 rounded-full transition-all ${i === avatarPage ? 'w-6 bg-amber-500' : 'w-2.5 bg-sky-200 hover:bg-sky-300'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Barra inferior */}
      <footer className="relative z-10 flex justify-center px-4 pb-4">
        <GameControls />
      </footer>
    </div>
  );
};
