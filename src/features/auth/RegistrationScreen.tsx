import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { TeamId, isGuestPlayer } from '../../types';
import { audioService, soundEffects } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { AVATAR_CATALOG, PlayerAvatar, SkinTone } from '../../components/ui/PlayerAvatar';
import { AvatarFigure } from '../../components/ui/AvatarFigure';
import { nameModerationService } from '../../services/nameModeration';
import { AVAILABLE_CLASSES } from '../../data/mockData';
import { GRADE_LABELS, SCHOOL_GRADES, SchoolGrade } from '../../data/level0Content';
import { Anfitriao, BotaoJogo, Cenario, Ficha, Hud, Icone, Painel, Titulo } from '../../components/kit';
import { FALAS_TELAS, falaDaTela } from '../../data/falasAnfitrioes';

// Cadastro (ficha de matrícula): a Leia recebe o aluno na secretaria da escola.
// Três modos: novo jogador, código de quem já tem cadastro e visitante (fora do ranking). Lógica igual à anterior.

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

type Modo = 'new' | 'code' | 'guest';
const TELA_DO_MODO = { new: 'cadastro', code: 'codigo', guest: 'visitante' } as const;

const rotulo = 'flex items-center gap-1.5 font-display text-xs short:text-[11px] uppercase tracking-wider text-nisia-azul-700 mb-1';
const campo = 'w-full px-3 py-2 short:py-1.5 rounded-xl border-2 border-nisia-papel-linha bg-white text-nisia-tinta font-body font-semibold text-sm outline-none focus:border-nisia-azul-500 focus:ring-2 focus:ring-nisia-azul-100 transition-colors';

const CaixaErro: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="px-3 py-2 rounded-xl bg-red-50 border-2 border-nisia-erro text-nisia-erro text-xs font-semibold flex items-center gap-2 animate-balao-in">
    <Icone nome="x" className="w-4 h-4 shrink-0" cor="#E5484D" />
    <span>{message}</span>
  </div>
);

export const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithCode, startGuest, currentPlayer } = useGame();
  const guestPlaying = isGuestPlayer(currentPlayer) ? currentPlayer : null;

  const [mode, setMode] = useState<Modo>('new');

  // Novo jogador (um visitante que vem se cadastrar já chega com nome e avatar)
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

  // Código de jogador
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Visitante
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

  const fala = useMemo(() => falaDaTela(TELA_DO_MODO[mode]), [mode]);
  const anfitriao = FALAS_TELAS[TELA_DO_MODO[mode]].anfitriao;

  const switchMode = (next: Modo) => {
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
      setErrorMsg('Não foi possível salvar o cadastro. Verifique o armazenamento do navegador.');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    const trimmedCode = accessCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCodeError('Digite o seu código de jogador (ex.: NSL-804-A79).');
      audioService.playWrong();
      return;
    }

    const success = await loginWithCode(trimmedCode);
    if (success) {
      audioService.playChime();
      navigate('/missions');
    } else {
      audioService.playWrong();
      setCodeError('Código não encontrado. Confira ou faça um novo cadastro.');
    }
  };

  // Abas dos três modos (ficha de matrícula, código, visitante)
  const Aba: React.FC<{ modo: Modo; icone: 'termo' | 'chave' | 'bussola'; children: React.ReactNode; oculto?: boolean }> = ({ modo, icone, children, oculto }) => {
    if (oculto) return null;
    const ativo = mode === modo;
    return (
      <button
        type="button"
        role="tab"
        aria-selected={ativo}
        onClick={() => switchMode(modo)}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 short:px-2 short:py-1 rounded-t-xl border-2 border-b-0 font-display text-sm short:text-xs uppercase tracking-wide transition-colors ${
          ativo ? 'bg-nisia-papel border-nisia-madeira-escura text-nisia-azul-700 translate-y-[2px]' : 'bg-nisia-papel-escuro border-nisia-papel-linha text-nisia-tinta-suave hover:bg-nisia-papel'
        }`}
      >
        <Icone nome={icone} className="w-4 h-4" cor={ativo ? '#FFD23F' : '#F3E4BE'} />
        <span className={ativo ? '' : 'hidden sm:inline'}>{children}</span>
      </button>
    );
  };

  const Equipe: React.FC<{ id: TeamId }> = ({ id }) => {
    const ativo = team === id;
    const azul = id === 'blue';
    return (
      <button
        type="button"
        role="radio"
        aria-checked={ativo}
        onClick={() => handleSelectTeam(id)}
        className={`flex items-center justify-center gap-1.5 py-2 short:py-1.5 rounded-xl border-2 font-display text-sm short:text-xs uppercase tracking-wide transition-all ${
          ativo
            ? azul ? 'bg-nisia-azul-500 border-nisia-azul-900 text-white shadow-[0_3px_0_0_#0C2A66]' : 'bg-nisia-roxo-500 border-nisia-roxo-700 text-white shadow-[0_3px_0_0_#5325A8]'
            : azul ? 'bg-white border-nisia-azul-200 text-nisia-azul-700 hover:border-nisia-azul-400' : 'bg-white border-nisia-roxo-100 text-nisia-roxo-700 hover:border-nisia-roxo-400'
        }`}
      >
        <Icone nome="escudo" className="w-4 h-4" cor={ativo ? '#FFFFFF' : azul ? '#1F5FD0' : '#7B3FE4'} />
        {azul ? 'Equipe Azul' : 'Equipe Roxa'}
      </button>
    );
  };

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      <Cenario nome="escola" escurecer={0.35} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} mostrarMoedas={false} mostrarMapa={false} mostrarPlacar={false} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-3 md:py-5 short:py-1 grid grid-cols-1 xl:grid-cols-[13rem_1fr] gap-3 items-start">
          {/* Anfitriã da secretaria (só com espaço ao lado) */}
          <aside className="hidden xl:flex short:hidden flex-col items-start self-end">
            <Anfitriao nome={anfitriao} fala={fala.pt} traducao={fala.en} altura="h-72" />
          </aside>
          <div className="flex flex-col gap-3 short:gap-1 min-w-0">
          <div className="flex items-end justify-between gap-3 px-1 short:hidden">
            <Titulo nivel={1} className="text-4xl sm:text-5xl leading-none">Secretaria</Titulo>
            <Ficha cor="papel" className="short:hidden">Escola Municipal Nísia Vilela Fernandes</Ficha>
          </div>

          <div className="grid gap-3 short:gap-2 lg:grid-cols-[1.1fr_1fr] short:grid-cols-[1fr_1fr] items-start">
            {/* Ficha de matrícula */}
            <section aria-label="Cadastro" className="flex flex-col">
              <div role="tablist" aria-label="Forma de entrar" className="flex items-end gap-1 pl-3">
                <Aba modo="new" icone="termo">Novo jogador</Aba>
                <Aba modo="code" icone="chave">Já tenho código</Aba>
                <Aba modo="guest" icone="bussola" oculto={!!guestPlaying}>Visitante</Aba>
              </div>
              <Painel tipo="papel" liso className="p-4 sm:p-5 short:p-2.5 rounded-tl-none">
                {mode === 'new' && (
                  <form onSubmit={handleNewPlayerSubmit} className="flex flex-col gap-3 short:gap-1.5">
                    <p className="text-sm short:hidden text-nisia-tinta-suave font-semibold">Ficha de matrícula do jogador. Capriche: o nome aparece no ranking.</p>
                    {guestPlaying && (
                      <div className="px-3 py-2 rounded-xl bg-nisia-verde-100 border-2 border-nisia-verde-400 text-nisia-verde-700 text-xs font-semibold">
                        Você está jogando como visitante. Ao fazer o cadastro definitivo, seus pontos e missões vão junto.
                      </div>
                    )}
                    {errorMsg && <CaixaErro message={errorMsg} />}

                    <div>
                      <label htmlFor="reg-name" className={rotulo}><Icone nome="professor" className="w-4 h-4" cor="#A9CDFF" /> Nome ou apelido <span className="normal-case tracking-normal text-nisia-tinta-suave font-body">(your name)</span></label>
                      <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamado?" required maxLength={30} className={`${campo} placeholder:text-nisia-tinta-suave/60`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="reg-age" className={rotulo}><Icone nome="calendario" className="w-4 h-4" /> Idade <span className="normal-case tracking-normal text-nisia-tinta-suave font-body">(age)</span></label>
                        <select id="reg-age" value={age} onChange={(e) => setAge(Number(e.target.value))} className={`${campo} cursor-pointer`}>
                          {AGE_OPTIONS.map(n => <option key={n} value={n}>{n} anos</option>)}
                          <option value={16}>16 anos ou mais</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="reg-class" className={rotulo}><Icone nome="livro" className="w-4 h-4" /> Turma <span className="normal-case tracking-normal text-nisia-tinta-suave font-body">(class)</span></label>
                        <select id="reg-class" value={className} onChange={(e) => setClassName(e.target.value)} className={`${campo} cursor-pointer`}>
                          {AVAILABLE_CLASSES.map(c => <option key={c} value={c}>Turma {c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className={rotulo}><Icone nome="escudo" className="w-4 h-4" cor="#A9CDFF" /> Equipe <span className="normal-case tracking-normal text-nisia-tinta-suave font-body">(team)</span></span>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Equipe">
                        <Equipe id="blue" />
                        <Equipe id="purple" />
                      </div>
                    </div>

                    <BotaoJogo type="submit" cor="sol" className="w-full mt-1 short:min-h-[38px] short:text-sm">
                      Continuar <Icone nome="seta" className="w-5 h-5" />
                    </BotaoJogo>
                    <p className="text-[11px] text-nisia-tinta-suave text-center short:hidden">Protegido para menores • sem e-mail</p>
                  </form>
                )}

                {mode === 'guest' && (
                  <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3 short:gap-1.5">
                    {guestError && <CaixaErro message={guestError} />}
                    <p className="text-sm short:text-xs text-nisia-tinta-suave font-semibold">Jogue sem código. Visitantes não aparecem no ranking; se gostar, faça o cadastro e seus pontos vão junto.</p>

                    <div>
                      <label htmlFor="guest-name" className={rotulo}><Icone nome="professor" className="w-4 h-4" cor="#A9CDFF" /> Apelido</label>
                      <input id="guest-name" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Como quer ser chamado?" required maxLength={30} className={`${campo} placeholder:text-nisia-tinta-suave/60`} />
                    </div>

                    <div>
                      <span className={rotulo}><Icone nome="livro" className="w-4 h-4" /> Série</span>
                      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Série">
                        {SCHOOL_GRADES.map(g => (
                          <button
                            key={g}
                            type="button"
                            role="radio"
                            aria-checked={guestGrade === g}
                            onClick={() => { audioService.playClick(); setGuestGrade(g); }}
                            className={`py-2 short:py-1.5 rounded-xl border-2 font-display text-xs transition-all ${guestGrade === g ? 'bg-nisia-verde-500 border-nisia-verde-700 text-white shadow-[0_3px_0_0_#22703A]' : 'bg-white border-nisia-papel-linha text-nisia-tinta hover:border-nisia-verde-400'}`}
                          >
                            {GRADE_LABELS[g]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className={rotulo}><Icone nome="estrela" className="w-4 h-4" /> Escolha seu herói</span>
                      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Herói">
                        {GUEST_AVATARS.map(a => (
                          <button
                            key={a.id}
                            type="button"
                            role="radio"
                            aria-checked={guestAvatar === a.id}
                            onClick={() => { audioService.playClick(); setGuestAvatar(a.id); }}
                            className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${guestAvatar === a.id ? 'bg-nisia-verde-100 border-nisia-verde-500 ring-2 ring-nisia-verde-400/60' : 'bg-white border-nisia-papel-linha hover:border-nisia-verde-400 opacity-80'}`}
                          >
                            <PlayerAvatar avatarId={a.id} size="md" alt={a.name} />
                            <span className="text-[10px] font-semibold text-nisia-tinta text-center leading-tight short:hidden">{a.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <BotaoJogo type="submit" cor="verde" className="w-full short:min-h-[38px] short:text-sm">
                      Jogar como visitante <Icone nome="seta" className="w-5 h-5" />
                    </BotaoJogo>
                  </form>
                )}

                {mode === 'code' && (
                  <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3 short:gap-1.5">
                    {codeError && <CaixaErro message={codeError} />}
                    <p className="text-sm short:text-xs text-nisia-tinta-suave font-semibold">
                      Digite o seu código de jogador (ex.: <strong className="font-mono text-nisia-roxo-700">NSL-804-A79</strong>) para recuperar pontos, missões e equipe.
                    </p>
                    <div>
                      <label htmlFor="player-code" className={rotulo}><Icone nome="chave" className="w-4 h-4" /> Código de jogador</label>
                      <input
                        id="player-code"
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        placeholder="NSL-804-..."
                        required
                        autoComplete="off"
                        className={`${campo} !border-nisia-roxo-400 focus:!border-nisia-roxo-700 font-mono !text-lg tracking-widest uppercase text-center text-nisia-roxo-700`}
                      />
                    </div>
                    <BotaoJogo type="submit" cor="roxo" className="w-full short:min-h-[38px] short:text-sm">
                      Entrar no meu jogo <Icone nome="seta" className="w-5 h-5" />
                    </BotaoJogo>
                  </form>
                )}

                <div className="mt-3 short:mt-1.5 pt-2 border-t-2 border-dashed border-nisia-papel-linha flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { audioService.playClick(); navigate('/'); }} className="font-display text-nisia-azul-700 hover:underline uppercase tracking-wide">← Início</button>
                  <button type="button" onClick={() => { audioService.playClick(); navigate('/orientation'); }} className="font-display text-nisia-tinta-suave hover:underline uppercase tracking-wide short:hidden">Rever as regras</button>
                </div>
              </Painel>
            </section>

            {/* Vitrine do avatar */}
            <Painel tipo="papel" fita as="section" aria-label="Avatar" className="p-4 sm:p-5 pt-6 short:p-2.5 short:pt-4 flex flex-col">
              {mode === 'guest' ? (
                <>
                  <h2 className="font-display text-xl short:text-base text-nisia-azul-700 text-center uppercase tracking-wide">Seu herói</h2>
                  <div className="flex-1 min-h-[12rem] h-56 sm:h-72 short:h-[9.5rem] short:min-h-0 mt-2 rounded-2xl bg-gradient-to-b from-nisia-azul-100 to-nisia-verde-100 border-2 border-nisia-papel-linha p-3">
                    <AvatarFigure avatarId={guestAvatar} />
                  </div>
                  <p className="mt-2 text-center font-display text-nisia-tinta">{AVATAR_CATALOG.find(a => a.id === guestAvatar)?.name}</p>
                </>
              ) : mode === 'code' ? (
                <>
                  <h2 className="font-display text-xl short:text-base text-nisia-azul-700 text-center uppercase tracking-wide">Bem-vindo de volta!</h2>
                  <div className="flex-1 min-h-[12rem] h-56 sm:h-72 short:h-[9.5rem] short:min-h-0 mt-2 rounded-2xl bg-gradient-to-b from-nisia-azul-100 to-nisia-roxo-100 border-2 border-nisia-papel-linha p-3 flex items-center justify-center gap-2">
                    <div className="h-full w-1/2"><AvatarFigure avatarId="hero-boy-hoodie" /></div>
                    <div className="h-full w-1/2"><AvatarFigure avatarId="hero-girl-curl" /></div>
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold text-nisia-tinta-suave">Seu avatar, seus pontos e suas missões voltam com o código.</p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl text-nisia-azul-700 text-center uppercase tracking-wide short:sr-only">Escolha seu avatar</h2>

                  <div className="relative mt-2 h-48 sm:h-64 short:h-[7.5rem] rounded-2xl bg-gradient-to-b from-nisia-azul-100 to-nisia-sol-100 border-2 border-nisia-papel-linha p-3 short:p-1.5">
                    <AvatarFigure avatarId={shownAvatar.id} skinTone={shownAvatar.allowsSkinTone ? skinTone : 'light'} className={shownLocked ? 'opacity-60 grayscale-[40%]' : ''} />
                    {shownLocked && (
                      <div className="absolute inset-x-0 bottom-2 flex justify-center">
                        <Ficha cor="papel" className="!bg-nisia-tinta !text-white !border-nisia-tinta"><Icone nome="cadeado" className="w-3.5 h-3.5" cor="#F3E4BE" /> Desbloqueia na Patente {shownAvatar.unlockLevel}</Ficha>
                      </div>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
                    <span className="font-display text-nisia-tinta">{shownAvatar.name}</span>
                    {shownLocked ? (
                      <button type="button" onClick={() => { soundEffects.buttonClick(); setPreviewId(null); }} className="text-[11px] font-semibold text-nisia-azul-700 hover:underline">Voltar ao meu avatar</button>
                    ) : (
                      <Ficha cor="verde" className="!py-0"><Icone nome="check" className="w-3.5 h-3.5" cor="#DDF5D9" /> Escolhido</Ficha>
                    )}
                  </div>

                  {shownAvatar.allowsSkinTone && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                      <span className="text-[11px] font-display uppercase tracking-wide text-nisia-laranja-700 inline-flex items-center gap-1 short:sr-only"><Icone nome="paleta" className="w-4 h-4" /> Tom de pele</span>
                      {SKIN_TONES.map(tone => (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => { soundEffects.buttonClick(); setSkinTone(tone.id); }}
                          title={`Tom de pele ${tone.label}`}
                          aria-pressed={skinTone === tone.id}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-display border-2 flex items-center gap-1 transition-all ${skinTone === tone.id ? 'bg-nisia-sol-400 text-nisia-tinta border-nisia-sol-700 scale-105' : 'bg-white border-nisia-papel-linha text-nisia-tinta-suave hover:border-nisia-azul-400'}`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block" style={{ backgroundColor: tone.color }} />
                          <span className="short:sr-only">{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Grade paginada */}
                  <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
                    <button type="button" onClick={() => goToPage(avatarPage - 1)} aria-label="Avatares anteriores" className="kit-btn kit-btn--papel kit-btn--sm !min-w-0 !px-2 shrink-0">
                      <Icone nome="seta" className="w-4 h-4 rotate-180" />
                    </button>
                    <div className="flex-1 grid grid-cols-4 short:grid-cols-8 gap-1.5 sm:gap-2 short:gap-1">
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
                              isSelected ? 'bg-nisia-sol-100 border-nisia-sol-700 ring-2 ring-nisia-sol-400' : isPreview ? 'bg-nisia-papel-escuro border-nisia-tinta-suave' : 'bg-white border-nisia-papel-linha hover:border-nisia-azul-400'
                            }`}
                          >
                            <PlayerAvatar avatarId={avatar.id} skinTone={avatar.allowsSkinTone ? skinTone : 'light'} size="lg" alt={avatar.name} className={`short:!w-9 short:!h-9 ${locked ? 'opacity-50 grayscale' : ''}`} />
                            {locked && (
                              <span className="absolute bottom-0.5 inset-x-0.5 flex items-center justify-center gap-0.5 rounded-md bg-nisia-tinta/85 text-white text-[9px] font-display py-0.5">
                                <Icone nome="cadeado" className="w-2.5 h-2.5" cor="#F3E4BE" /> <span className="short:hidden">PAT {avatar.unlockLevel}</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => goToPage(avatarPage + 1)} aria-label="Próximos avatares" className="kit-btn kit-btn--papel kit-btn--sm !min-w-0 !px-2 shrink-0">
                      <Icone nome="seta" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    {Array.from({ length: AVATAR_PAGES }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goToPage(i)}
                        aria-label={`Página ${i + 1} de avatares`}
                        aria-current={i === avatarPage}
                        className={`h-2.5 rounded-full border border-nisia-tinta/30 transition-all ${i === avatarPage ? 'w-6 bg-nisia-sol-500' : 'w-2.5 bg-nisia-papel-escuro hover:bg-nisia-papel-linha'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </Painel>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};
