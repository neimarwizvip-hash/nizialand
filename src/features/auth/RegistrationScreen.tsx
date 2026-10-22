import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, GraduationCap, Shield, ArrowRight, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TeamId } from '../../types';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { AvatarSelector } from '../../components/ui/AvatarSelector';
import { SkinTone } from '../../components/ui/PlayerAvatar';
import { nameModerationService } from '../../services/nameModeration';

export const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithCode } = useGame();

  const [mode, setMode] = useState<'new' | 'code'>('new');
  
  // New player form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(13);
  const [className, setClassName] = useState<string>('804');
  const [team, setTeam] = useState<TeamId>('blue');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('hero-boy-hoodie');
  const [skinTone, setSkinTone] = useState<SkinTone>('light');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Existing player code state
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

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

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-3 sm:p-4 bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{ backgroundImage: `url('/assets/nisialand_registration_bg.jpg')` }}
    >
      {/* Dark gradient overlay for high contrast and readability */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />

      {/* Main Registration Card: Scaled down (max-w-lg), high-contrast & compact */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-3 border-amber-400 p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300 my-4">
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md border-2 border-white text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase font-bungee leading-none">
                REGISTRATION
              </h1>
              <p className="text-[11px] font-bold text-blue-700 mt-0.5">
                Escola Municipal Nísia Vilela Fernandes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>ACCESS</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3.5 border border-slate-200">
          <button
            type="button"
            onClick={() => { audioService.playClick(); setMode('new'); }}
            className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              mode === 'new'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            NEW PLAYER
          </button>
          <button
            type="button"
            onClick={() => { audioService.playClick(); setMode('code'); }}
            className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              mode === 'code'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            HAVE A CODE
          </button>
        </div>

        {/* --- FORM 1: NEW PLAYER REGISTRATION --- */}
        {mode === 'new' ? (
          <form onSubmit={handleNewPlayerSubmit} className="space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Player's Name */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                PLAYER'S NAME (NOME OU APELIDO)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name here..."
                required
                maxLength={30}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-bold placeholder-slate-400 text-sm transition-all"
              />
            </div>

            {/* Age & Class Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  AGE
                </label>
                <select
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-bold text-xs sm:text-sm bg-white transition-all cursor-pointer"
                >
                  <option value={10}>10 years old</option>
                  <option value={11}>11 years old</option>
                  <option value={12}>12 years old</option>
                  <option value={13}>13 years old</option>
                  <option value={14}>14 years old</option>
                  <option value={15}>15 years old</option>
                  <option value={16}>16+ years old</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  CLASS
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-bold text-xs sm:text-sm bg-white transition-all cursor-pointer"
                >
                  <option value="804">Turma 804 (Official)</option>
                  <option value="801">Turma 801</option>
                  <option value="802">Turma 802</option>
                  <option value="803">Turma 803</option>
                </select>
              </div>
            </div>

            {/* Avatar Selector Component */}
            <div>
              <AvatarSelector
                selectedAvatarId={selectedAvatar}
                onSelectAvatar={setSelectedAvatar}
                selectedSkinTone={skinTone}
                onSelectSkinTone={setSkinTone}
                playerLevel={0}
              />
            </div>

            {/* Team Selection Cards */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                CHOOSE YOUR TEAM
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {/* BLUE TEAM */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('blue')}
                  className={`group relative p-2 rounded-xl border-3 transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                    team === 'blue'
                      ? 'bg-blue-50 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-2 ring-blue-400 scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 opacity-75'
                  }`}
                >
                  <div className="relative mb-1">
                    <img
                      src="/assets/avatar_mateus.jpg"
                      alt="Blue Team Student"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 shadow group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded shadow">
                      <Shield className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <span className="font-bungee text-xs text-blue-700 tracking-wide">
                    BLUE TEAM
                  </span>
                  <span className="text-[10px] font-semibold text-blue-500">
                    Smart &amp; United
                  </span>
                </button>

                {/* PURPLE TEAM */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('purple')}
                  className={`group relative p-2 rounded-xl border-3 transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                    team === 'purple'
                      ? 'bg-purple-50 border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] ring-2 ring-purple-400 scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 opacity-75'
                  }`}
                >
                  <div className="relative mb-1">
                    <img
                      src="/assets/avatar_juliana.jpg"
                      alt="Purple Team Student"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-purple-500 shadow group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-0.5 rounded shadow">
                      <Shield className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <span className="font-bungee text-xs text-purple-700 tracking-wide">
                    PURPLE TEAM
                  </span>
                  <span className="text-[10px] font-semibold text-purple-500">
                    Brave &amp; Bright
                  </span>
                </button>
              </div>
            </div>

            {/* Big Green Arcade Continue Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 hover:from-green-300 hover:to-emerald-500 text-white font-bungee text-base sm:text-lg tracking-wider shadow-[0_4px_0_#065f46,0_10px_20px_rgba(16,185,129,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#065f46] border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>CONTINUE TO MISSIONS</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </form>
        ) : (
          /* --- FORM 2: LOGIN WITH EXISTING PLAYER CODE --- */
          <form onSubmit={handleCodeSubmit} className="space-y-3.5">
            {codeError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs">
              <p className="font-bold mb-0.5 text-slate-900">Returning student?</p>
              <p className="text-[11px] text-slate-500">
                Type your Player Code (e.g. <strong className="text-blue-600 font-mono">NSL-804-A79</strong>) to retrieve your scores, mission progress, and team points.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                ENTER YOUR PLAYER CODE
              </label>
              <input
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
      </div>
    </div>
  );
};
