import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, GraduationCap, Shield, ArrowRight, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TeamId } from '../../types';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';

export const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithCode, currentPlayer } = useGame();

  const [mode, setMode] = useState<'new' | 'code'>('new');
  
  // New player form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(13);
  const [className, setClassName] = useState<string>('804');
  const [team, setTeam] = useState<TeamId>('blue');
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

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your full or first name (at least 2 letters).');
      audioService.playWrong();
      return;
    }

    try {
      audioService.playChime();
      fireConfetti();
      await register({
        name: trimmedName,
        age,
        className,
        team
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
      setCodeError('Please enter your Player Code (e.g. NZL-804-A79).');
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
      className="min-h-screen w-full relative flex items-center justify-center p-3 md:p-6 bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{ backgroundImage: `url('/assets/nizialand_registration_bg.jpg')` }}
    >
      {/* Dark gradient overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

      {/* Main Registration Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-blue-400 p-5 md:p-8 animate-in fade-in zoom-in-95 duration-300 my-auto">
        
        {/* Card Header (Matches Image 3) */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white text-white">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-wider uppercase font-bungee">
                REGISTRATION
              </h1>
              <p className="text-xs md:text-sm font-semibold text-blue-600">
                Escola Municipal Nísia Vilela Fernandes
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>PLAYER ACCESS</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => { audioService.playClick(); setMode('new'); }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
              mode === 'new'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            I'M A NEW PLAYER
          </button>
          <button
            type="button"
            onClick={() => { audioService.playClick(); setMode('code'); }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
              mode === 'code'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            I HAVE A CODE
          </button>
        </div>

        {/* --- FORM 1: NEW PLAYER REGISTRATION --- */}
        {mode === 'new' ? (
          <form onSubmit={handleNewPlayerSubmit} className="space-y-4 md:space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Player's Name */}
            <div>
              <label className="block text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                PLAYER'S NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name here..."
                required
                maxLength={30}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-slate-800 font-bold placeholder-slate-400 text-base md:text-lg transition-all"
              />
            </div>

            {/* Age & Class Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  AGE
                </label>
                <select
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-slate-800 font-bold text-base md:text-lg bg-white transition-all cursor-pointer"
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
                <label className="block text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  CLASS
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-slate-800 font-bold text-base md:text-lg bg-white transition-all cursor-pointer"
                >
                  <option value="804">Turma 804 (Official)</option>
                  <option value="801">Turma 801</option>
                  <option value="802">Turma 802</option>
                  <option value="803">Turma 803</option>
                </select>
              </div>
            </div>

            {/* Team Selection Cards (Exact look of Image 3) */}
            <div>
              <label className="block text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-2 text-center">
                CHOOSE YOUR TEAM
              </label>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* BLUE TEAM */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('blue')}
                  className={`group relative p-3 md:p-4 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                    team === 'blue'
                      ? 'bg-blue-50 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-102 ring-4 ring-blue-300/50'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 opacity-80'
                  }`}
                >
                  <div className="relative mb-2">
                    <img
                      src="/assets/avatar_mateus.jpg"
                      alt="Blue Team Student"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-3 border-blue-500 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-lg shadow">
                      <Shield className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <span className="font-bungee text-sm md:text-base text-blue-700 tracking-wide">
                    BLUE TEAM
                  </span>
                  <span className="text-[11px] font-semibold text-blue-500">
                    Smart & United
                  </span>
                  {team === 'blue' && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                  )}
                </button>

                {/* PURPLE TEAM */}
                <button
                  type="button"
                  onClick={() => handleSelectTeam('purple')}
                  className={`group relative p-3 md:p-4 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                    team === 'purple'
                      ? 'bg-purple-50 border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-102 ring-4 ring-purple-300/50'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 opacity-80'
                  }`}
                >
                  <div className="relative mb-2">
                    <img
                      src="/assets/avatar_juliana.jpg"
                      alt="Purple Team Student"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-3 border-purple-500 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1 rounded-lg shadow">
                      <Shield className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <span className="font-bungee text-sm md:text-base text-purple-700 tracking-wide">
                    PURPLE TEAM
                  </span>
                  <span className="text-[11px] font-semibold text-purple-500">
                    Brave & Bright
                  </span>
                  {team === 'purple' && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-600 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Big Green Arcade Continue Button */}
            <button
              type="submit"
              className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 hover:from-green-300 hover:to-emerald-500 text-white font-bungee text-lg md:text-xl tracking-wider shadow-[0_8px_0_#065f46,0_15px_25px_rgba(16,185,129,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#065f46] border-2 border-emerald-300 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </form>
        ) : (
          /* --- FORM 2: LOGIN WITH EXISTING PLAYER CODE --- */
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            {codeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm">
              <p className="font-semibold mb-1">Returning student?</p>
              <p className="text-xs text-slate-500">
                Type your Player Code (e.g. <strong className="text-blue-600 font-mono">NZL-804-A79</strong>) to retrieve your scores, mission progress, and team points.
              </p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                ENTER YOUR PLAYER CODE
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="NZL-804-..."
                required
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none text-purple-900 font-mono font-black placeholder-slate-400 text-xl tracking-widest uppercase transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-purple-500 via-indigo-600 to-purple-700 hover:from-purple-400 hover:to-indigo-500 text-white font-bungee text-lg md:text-xl tracking-wider shadow-[0_8px_0_#3b0764,0_15px_25px_rgba(147,51,234,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#3b0764] border-2 border-purple-300 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>ACCESS MY GAME</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </form>
        )}

        {/* Footer info note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Protected for minors • No email needed</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-700 font-bold hover:underline"
          >
            ← Back to Start
          </button>
        </div>
      </div>
    </div>
  );
};
