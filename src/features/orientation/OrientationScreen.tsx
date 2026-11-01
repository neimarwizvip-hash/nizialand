import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { soundEffects, audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { Anfitriao, BotaoJogo, Cenario, Ficha, Hud, Icone, Painel, Titulo } from '../../components/kit';
import type { NomeIcone } from '../../components/kit';
import { falaDaTela } from '../../data/falasAnfitrioes';

// Reunião educativa no auditório: a orientadora Leia apresenta as regras da escola em três grupos,
// faz duas perguntas rápidas e recolhe o termo de compromisso antes do cadastro. Lógica igual à anterior.

interface RuleGroup {
  id: 'convivencia' | 'jogo' | 'aprendizagem';
  titleEn: string;
  titlePt: string;
  icone: NomeIcone;
  cor: 'sol' | 'azul' | 'verde';
  rules: { title: string; desc: string; enDesc?: string }[];
}

const RULE_GROUPS: RuleGroup[] = [
  {
    id: 'convivencia',
    titleEn: 'Community & Respect',
    titlePt: '1. Regras de Convivência',
    icone: 'pessoas',
    cor: 'sol',
    rules: [
      {
        title: 'Respeito Mútuo entre Equipes',
        desc: 'A disputa entre BLUE TEAM e PURPLE TEAM é saudável e esportiva. Celebre as conquistas dos seus colegas!',
        enDesc: 'Respect your classmates. Blue and Purple teams play with true sportsmanship!'
      },
      {
        title: 'Nomes de Jogadores Adequados',
        desc: 'Crie um nome criativo e amigável. Não são permitidos termos ofensivos, trocadilhos impróprios ou desrespeito.',
        enDesc: 'Always choose friendly, respectful player names.'
      },
      {
        title: 'Inclusão e Empatia',
        desc: 'Nossa escola é diversa e acolhedora. Todos têm lugar e vez no Nisialand!',
        enDesc: 'Everyone belongs in Nisialand. Celebrate diversity and kindness!'
      }
    ]
  },
  {
    id: 'jogo',
    titleEn: 'Fair Play & Game Rules',
    titlePt: '2. Regras do Jogo e Fair Play',
    icone: 'controle',
    cor: 'azul',
    rules: [
      {
        title: 'Quiz de Comparativos (2 Tentativas)',
        desc: 'Cada questão vale até 100 pontos na 1ª tentativa e 50 pontos na 2ª tentativa. Preste atenção no enunciado!',
        enDesc: '100 points on 1st attempt, 50 points on 2nd attempt. Think carefully!'
      },
      {
        title: 'Desafio Flashcard (3 Corações)',
        desc: 'Memorize a idade dos 8 estudantes em 30 segundos. Você tem 3 corações para encontrar as cartas corretas.',
        enDesc: 'Memorize in 30 seconds! You have 3 hearts to find the right student cards.'
      },
      {
        title: 'Jogabilidade Honesta',
        desc: 'Jogue por conta própria sem trapaças. O maior prêmio é o seu conhecimento e ajudar sua turma a subir no ranking!',
        enDesc: 'Play honestly. Your real progress is the greatest victory!'
      }
    ]
  },
  {
    id: 'aprendizagem',
    titleEn: 'Learning & Growth',
    titlePt: '3. Regras de Aprendizagem',
    icone: 'livro',
    cor: 'verde',
    rules: [
      {
        title: 'Ouvir e Praticar a Pronúncia',
        desc: 'Clique nos botões de áudio para ouvir a voz nativa em inglês. Repita as frases em voz alta!',
        enDesc: 'Click the Listen button to hear native pronunciation. Practice speaking aloud!'
      },
      {
        title: 'Errar Faz Parte do Aprendizado',
        desc: 'Não tenha medo de errar. Cada tentativa traz uma explicação pedagógica para você aprender e avançar.',
        enDesc: 'Mistakes are proof that you are trying and learning!'
      },
      {
        title: 'O Inglês como Janela para o Mundo',
        desc: 'Cada palavra nova abre portas para novas músicas, jogos, viagens e oportunidades no seu futuro!',
        enDesc: 'English opens doors to the whole world!'
      }
    ]
  }
];

type Aba = 'convivencia' | 'jogo' | 'aprendizagem' | 'quiz' | 'terms';
const ABAS: { id: Aba; rotulo: string; curto: string; icone: NomeIcone }[] = [
  { id: 'convivencia', rotulo: '1. Convivência', curto: '1', icone: 'pessoas' },
  { id: 'jogo', rotulo: '2. Jogo e fair play', curto: '2', icone: 'controle' },
  { id: 'aprendizagem', rotulo: '3. Aprendizagem', curto: '3', icone: 'livro' },
  { id: 'quiz', rotulo: 'Perguntas rápidas', curto: '?', icone: 'dica' },
  { id: 'terms', rotulo: 'Termo e cadastro', curto: 'OK', icone: 'termo' },
];

const Percevejo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rounded-full bg-nisia-erro border-2 border-nisia-tinta shadow-[0_2px_0_0_rgba(26,42,74,0.4)] ${className}`} aria-hidden="true" />
);

export const OrientationScreen: React.FC = () => {
  const navigate = useNavigate();

  // Sem trilha de fundo na reunião narrada
  useEffect(() => {
    audioService.holdMusicForStory();
    return () => audioService.releaseMusicForStory();
  }, []);

  const [activeTab, setActiveTab] = useState<Aba>('convivencia');

  // Perguntas formativas
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);

  // Termo de compromisso
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const slogan = "LEIA! Know the rules, learn and go further!";

  const handleSpeakSlogan = () => {
    speechService.speak(slogan, 'en-US');
  };

  const handleSelectQ1 = (index: number) => {
    setQ1Answer(index);
    if (index === 0) {
      soundEffects.correct();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } else {
      soundEffects.incorrect();
    }
  };

  const handleSelectQ2 = (index: number) => {
    setQ2Answer(index);
    if (index === 1) {
      soundEffects.correct();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } else {
      soundEffects.incorrect();
    }
  };

  const handleFinishOrientation = () => {
    if (!agreedToTerms) return;
    soundEffects.fanfare();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    navigate('/register');
  };

  const mudarAba = (aba: Aba) => { audioService.playClick(); setActiveTab(aba); };

  // A Leia fala conforme a parte da reunião (regras, perguntas, termo)
  const momento = activeTab === 'quiz' ? 'orientacaoQuiz' : activeTab === 'terms' ? 'orientacaoTermo' : 'orientacao';
  const fala = useMemo(() => falaDaTela(momento), [momento]);

  const grupo = RULE_GROUPS.find(g => g.id === activeTab);
  const proximaAba: Aba = activeTab === 'convivencia' ? 'jogo' : activeTab === 'jogo' ? 'aprendizagem' : 'quiz';

  const Opcao: React.FC<{ texto: string; escolhida: boolean; certa: boolean; onClick: () => void }> = ({ texto, escolhida, certa, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={escolhida}
      className={`kit-papel kit-papel--liso px-3 py-2.5 short:py-1.5 rounded-xl border-2 text-left text-sm short:text-xs font-semibold transition-all flex items-start gap-2 ${
        escolhida ? (certa ? '!border-nisia-verde-500 !bg-nisia-verde-100 text-nisia-verde-700' : '!border-nisia-erro !bg-red-50 text-nisia-erro') : 'border-nisia-papel-linha hover:border-nisia-azul-400 text-nisia-tinta hover:-translate-y-0.5'
      }`}
    >
      {escolhida && <Icone nome={certa ? 'check' : 'x'} className="w-5 h-5 shrink-0" cor={certa ? '#DDF5D9' : '#E5484D'} />}
      <span>{texto}</span>
    </button>
  );

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      <Cenario nome="auditorio" escurecer={0.3} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} mostrarMoedas={false} mostrarMapa={false} mostrarPlacar={false} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 md:py-5 short:py-1 grid grid-cols-1 md:grid-cols-[15rem_1fr] short:grid-cols-1 gap-3 short:gap-2 items-start">
          {/* Leia no palco */}
          <aside className="hidden md:flex short:hidden flex-col items-start self-end">
            <Anfitriao nome="leia" fala={fala.pt} traducao={fala.en} altura="h-64 short:h-32" />
          </aside>

          <section aria-label="Reunião educativa" className="flex flex-col gap-2 short:gap-1 min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1 short:hidden">
              <Titulo nivel={1} className="text-3xl sm:text-4xl leading-none">Reunião no auditório</Titulo>
              <Ficha cor="papel" className="short:hidden">Orientação Educacional · Leia</Ficha>
            </div>

            {/* Balão da Leia no celular em pé (sem a figura) */}
            <div className="md:hidden short:hidden kit-balao kit-balao--esq text-sm" role="note">{fala.pt}</div>

            <Painel tipo="mural" as="div" className="p-3 sm:p-4 short:p-2 flex flex-col gap-3 short:gap-1.5">
              {/* Abas */}
              <div role="tablist" aria-label="Partes da reunião" className="flex flex-wrap gap-1.5 short:gap-1">
                {ABAS.map(a => {
                  const ativa = activeTab === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="tab"
                      aria-selected={ativa}
                      onClick={() => mudarAba(a.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 short:px-2 short:py-1 rounded-full border-2 font-display text-sm short:text-xs uppercase tracking-wide transition-all ${
                        ativa ? 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta shadow-[0_3px_0_0_#B36E00]' : 'bg-nisia-papel border-nisia-papel-linha text-nisia-tinta-suave hover:bg-nisia-sol-100'
                      }`}
                    >
                      <Icone nome={a.icone} className="w-4 h-4" cor={ativa ? '#1A2A4A' : '#FFD23F'} />
                      <span className="hidden sm:inline short:hidden">{a.rotulo}</span>
                      <span className="sm:hidden short:inline">{a.curto}</span>
                    </button>
                  );
                })}
              </div>

              {/* Lema pregado no mural */}
              <Painel tipo="papel" liso className="px-3 py-2 short:py-1 flex flex-wrap items-center justify-between gap-2 rotate-[-0.6deg]">
                <Percevejo />
                <p className="min-w-0 leading-tight">
                  <span className="font-display text-base short:text-sm text-nisia-azul-700">“{slogan}”</span>
                  <span className="block text-xs text-nisia-tinta-suave font-semibold short:hidden">“LEIA! Conheça as regras, aprenda e vá mais longe!”</span>
                </p>
                <button type="button" onClick={handleSpeakSlogan} className="kit-btn kit-btn--azul kit-btn--sm shrink-0" title="Ouvir o lema em inglês" aria-label="Ouvir o lema em inglês">
                  <Icone nome="som" className="w-4 h-4" /> <span className="short:hidden">Ouvir lema</span>
                </button>
              </Painel>

              {/* Regras do grupo escolhido */}
              {grupo && (
                <div className="flex flex-col gap-2 short:gap-1">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icone nome={grupo.icone} className="w-7 h-7 short:w-5 short:h-5 text-nisia-papel shrink-0" />
                      <div className="leading-tight min-w-0">
                        <h2 className="font-display text-lg short:text-sm text-nisia-papel truncate">{grupo.titlePt}</h2>
                        <p className="text-[11px] uppercase tracking-wider text-nisia-papel-escuro font-semibold short:hidden">{grupo.titleEn}</p>
                      </div>
                    </div>
                    <BotaoJogo cor="papel" tamanho="sm" onClick={() => mudarAba(proximaAba)}>
                      Próximo <Icone nome="seta" className="w-4 h-4" />
                    </BotaoJogo>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2 pt-2">
                    {grupo.rules.map((rule, idx) => (
                      <Painel key={idx} tipo="papel" liso as="article" className={`p-3 short:p-2 flex flex-col gap-1.5 short:gap-1 ${idx % 2 ? 'rotate-[0.7deg]' : 'rotate-[-0.5deg]'}`}>
                        <Percevejo />
                        <div className="flex items-center gap-2">
                          <span className={`kit-ficha kit-ficha--${grupo.cor} !px-2`}>{idx + 1}</span>
                          <h3 className="font-display text-sm short:text-xs leading-tight text-nisia-azul-700">{rule.title}</h3>
                        </div>
                        <p className="text-xs short:text-[11px] text-nisia-tinta leading-snug short:line-clamp-3">{rule.desc}</p>
                        {rule.enDesc && (
                          <p className="mt-auto pt-1.5 border-t-2 border-dashed border-nisia-papel-linha text-[11px] italic text-nisia-laranja-700 font-semibold leading-snug short:hidden">{rule.enDesc}</p>
                        )}
                      </Painel>
                    ))}
                  </div>
                </div>
              )}

              {/* Perguntas rápidas */}
              {activeTab === 'quiz' && (
                <div className="flex flex-col gap-2 short:gap-1">
                  <h2 className="font-display text-lg short:text-sm text-nisia-papel px-1">Perguntas rápidas da orientadora</h2>
                  <Painel tipo="papel" className="p-3 short:p-2 flex flex-col gap-2 short:gap-1">
                    <h3 className="font-display text-sm short:text-xs text-nisia-tinta">1. O que expressa o lema <em className="text-nisia-laranja-700">“{slogan}”</em>?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 short:gap-1">
                      {[
                        { text: 'Conhecer as regras e ler ajuda a aprender e ir mais longe!', correct: true },
                        { text: 'Apenas correr o mais rápido possível no pátio', correct: false }
                      ].map((opt, i) => <Opcao key={i} texto={opt.text} escolhida={q1Answer === i} certa={opt.correct} onClick={() => handleSelectQ1(i)} />)}
                    </div>
                  </Painel>
                  <Painel tipo="papel" className="p-3 short:p-2 flex flex-col gap-2 short:gap-1">
                    <h3 className="font-display text-sm short:text-xs text-nisia-tinta">2. Como deve ser a relação entre a <span className="text-nisia-azul-500">Equipe Azul</span> e a <span className="text-nisia-roxo-500">Equipe Roxa</span>?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 short:gap-1">
                      {[
                        { text: 'Uma rivalidade hostil com ofensas', correct: false },
                        { text: 'Uma competição esportiva saudável com respeito e amizade!', correct: true }
                      ].map((opt, i) => <Opcao key={i} texto={opt.text} escolhida={q2Answer === i} certa={opt.correct} onClick={() => handleSelectQ2(i)} />)}
                    </div>
                  </Painel>
                  <div className="flex justify-end">
                    <BotaoJogo cor="roxo" tamanho="sm" onClick={() => mudarAba('terms')}>
                      Ir para o termo de compromisso <Icone nome="seta" className="w-4 h-4" />
                    </BotaoJogo>
                  </div>
                </div>
              )}

              {/* Termo de compromisso */}
              {activeTab === 'terms' && (
                <Painel tipo="papel" fita className="p-4 pt-6 short:p-3 short:pt-4 max-w-2xl mx-auto w-full flex flex-col gap-3 short:gap-1.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Icone nome="termo" className="w-9 h-9 short:w-6 short:h-6 text-nisia-tinta" />
                    <h2 className="font-display text-xl short:text-base text-nisia-azul-700 uppercase tracking-wide">Termo de ciência e compromisso</h2>
                  </div>
                  <p className="text-sm short:text-xs text-nisia-tinta-suave font-semibold leading-snug short:hidden">
                    Você concluiu a orientação educativa da Escola Municipal Nísia Vilela Fernandes. Para registrar sua pontuação e defender sua turma no ranking, confirme seu compromisso:
                  </p>
                  <label className={`flex items-start gap-3 text-left rounded-2xl border-2 p-3 short:p-2 cursor-pointer transition-colors ${agreedToTerms ? 'bg-nisia-verde-100 border-nisia-verde-500' : 'bg-nisia-sol-100 border-nisia-sol-500 hover:border-nisia-sol-700'}`}>
                    <input type="checkbox" checked={agreedToTerms} onChange={e => { audioService.playClick(); setAgreedToTerms(e.target.checked); }} className="mt-0.5 w-6 h-6 short:w-5 short:h-5 accent-nisia-verde-500 cursor-pointer shrink-0" />
                    <span className="text-sm short:text-xs text-nisia-tinta leading-snug">
                      <strong className="block font-display text-nisia-laranja-700 uppercase tracking-wide text-xs mb-0.5">Declaração do estudante</strong>
                      “Li e compreendi as regras do Nisialand. Comprometo-me a respeitar meus colegas, jogar com honestidade, não usar ofensas e dar o meu melhor para aprender Língua Inglesa!”
                    </span>
                  </label>
                  <BotaoJogo cor="sol" tamanho="lg" onClick={handleFinishOrientation} disabled={!agreedToTerms} className="w-full sm:w-auto mx-auto short:min-h-[40px] short:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
                    Criar meu cadastro oficial <Icone nome="seta" className="w-5 h-5" />
                  </BotaoJogo>
                </Painel>
              )}
            </Painel>

            <div className="flex justify-between items-center px-1 text-xs text-nisia-papel short:hidden">
              <span className="font-semibold drop-shadow">Escola Municipal Nísia Vilela Fernandes • Duque de Caxias</span>
              <button type="button" onClick={() => { audioService.playClick(); navigate('/'); }} className="font-display uppercase tracking-wide hover:underline">← Início</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
