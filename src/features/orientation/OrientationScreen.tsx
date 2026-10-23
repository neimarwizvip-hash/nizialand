import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Users,
  Gamepad2,
  GraduationCap,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, audioService } from '../../services/audio';
import { speechService } from '../../services/speech';

interface RuleGroup {
  id: 'convivencia' | 'jogo' | 'aprendizagem';
  titleEn: string;
  titlePt: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGrad: string;
  rules: { title: string; desc: string; enDesc?: string }[];
}

const RULE_GROUPS: RuleGroup[] = [
  {
    id: 'convivencia',
    titleEn: 'Community & Respect',
    titlePt: '1. Regras de Convivência',
    icon: '🤝',
    color: 'text-amber-600',
    borderColor: 'border-amber-500',
    bgGrad: 'from-amber-100 to-sky-50',
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
    icon: '🎮',
    color: 'text-cyan-600',
    borderColor: 'border-cyan-500',
    bgGrad: 'from-blue-100 to-sky-50',
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
    icon: '📚',
    color: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    bgGrad: 'from-emerald-100 to-sky-50',
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

export const OrientationScreen: React.FC = () => {
  const navigate = useNavigate();

  // Sem trilha de fundo na reunião narrada
  useEffect(() => {
    audioService.holdMusicForStory();
    return () => audioService.releaseMusicForStory();
  }, []);

  // Active Tab: 'convivencia' | 'jogo' | 'aprendizagem' | 'quiz' | 'terms'
  const [activeTab, setActiveTab] = useState<'convivencia' | 'jogo' | 'aprendizagem' | 'quiz' | 'terms'>('convivencia');

  // Formative Quiz State
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);

  // Terms Agreement
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

  return (
    <div className="relative min-h-screen game-sky text-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Background: School Auditorium Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/nisialand_auditorium_bg.jpg"
          alt="Auditório da Escola Nísia Vilela Fernandes"
          className="w-full h-full object-cover filter brightness-[0.75] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-50 via-white/60 to-sky-50/70"></div>
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 px-3.5 py-1.5 rounded-2xl font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-game-emerald flex items-center gap-1.5">
            <span>🏛️</span> <span>REUNIÃO EDUCATIVA NO AUDITÓRIO</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-heading font-bold text-slate-500 hover:text-slate-900 px-3 py-1 bg-sky-50/80 rounded-lg border border-sky-200"
        >
          Voltar ao Início
        </button>
      </header>

      {/* Main Body */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 my-auto py-4">
        {/* Presenter Card: Orientadora Edileia ("Leia") */}
        <div className="game-panel !border-emerald-300 !shadow-[0_6px_0_0_#34d399] p-4 sm:p-6 mb-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Avatar Cutout / Turnaround */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 border-emerald-400 shadow-glow-emerald bg-white/95 p-1 flex items-center justify-center">
              <img
                src="/assets/nisialand_institutional_characters.jpg"
                alt="Orientadora Edileia (Leia)"
                className="w-full h-full object-cover object-right"
              />
            </div>
            <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-heading font-black text-[10px] uppercase shadow">
              Orientadora
            </div>
          </div>

          {/* Slogan and Introduction */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                  Edileia "Leia" • Orientação Educacional
                </h1>
                <p className="text-xs text-emerald-700 font-medium">
                  Escola Municipal Nísia Vilela Fernandes
                </p>
              </div>

              <button
                onClick={handleSpeakSlogan}
                className="self-center sm:self-auto px-3 py-1.5 bg-emerald-100 border border-emerald-500/60 hover:bg-emerald-100 text-emerald-700 text-xs font-heading font-bold rounded-xl flex items-center gap-1.5 transition-all"
                title="Ouvir slogan em inglês"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Ouvir Lema</span>
              </button>
            </div>

            {/* Slogan Callout */}
            <div className="mt-2 bg-gradient-to-r from-emerald-100 via-white/40 to-cyan-100 border-2 border-emerald-400/60 rounded-2xl px-4 py-2 flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <div className="text-xs sm:text-sm font-heading font-black text-emerald-700 tracking-wider">
                  "{slogan}"
                </div>
                <div className="text-[11px] text-slate-600">
                  "LEIA! Conheça as regras, aprenda e vá mais longe!"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector Navigation */}
        <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('convivencia')}
            className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'convivencia'
                ? 'bg-amber-500 text-slate-950 shadow-game-gold scale-105'
                : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100'
            }`}
          >
            <span>🤝</span> <span>1. Convivência</span>
          </button>

          <button
            onClick={() => setActiveTab('jogo')}
            className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'jogo'
                ? 'bg-cyan-500 text-slate-950 shadow-game-blue scale-105'
                : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100'
            }`}
          >
            <span>🎮</span> <span>2. Jogo &amp; Fair Play</span>
          </button>

          <button
            onClick={() => setActiveTab('aprendizagem')}
            className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'aprendizagem'
                ? 'bg-emerald-500 text-slate-950 shadow-game-emerald scale-105'
                : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100'
            }`}
          >
            <span>📚</span> <span>3. Aprendizagem</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'quiz'
                ? 'bg-purple-500 text-white shadow-game-purple scale-105'
                : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100'
            }`}
          >
            <span>❓</span> <span>Perguntas Rápidas</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow-game-gold scale-105 font-black'
                : 'bg-sky-50/80 text-amber-700 hover:bg-sky-100'
            }`}
          >
            <span>📜</span> <span>Termo &amp; Cadastro</span>
          </button>
        </div>

        {/* Tab Content Cards */}
        <div className="game-panel p-5 sm:p-6 animate-fadeIn">
          {/* TAB 1, 2, 3: RULE GROUPS */}
          {(activeTab === 'convivencia' || activeTab === 'jogo' || activeTab === 'aprendizagem') && (
            <div>
              {(() => {
                const grp = RULE_GROUPS.find(g => g.id === activeTab)!;
                return (
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{grp.icon}</span>
                        <div>
                          <h2 className={`font-heading font-black text-lg ${grp.color}`}>
                            {grp.titlePt}
                          </h2>
                          <p className="text-xs text-slate-500 font-heading uppercase">
                            {grp.titleEn}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const next =
                            activeTab === 'convivencia'
                              ? 'jogo'
                              : activeTab === 'jogo'
                              ? 'aprendizagem'
                              : 'quiz';
                          setActiveTab(next);
                        }}
                        className="text-xs font-heading font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200"
                      >
                        <span>Próximo Grupo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {grp.rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="bg-white border-2 border-sky-200 hover:border-sky-300 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_0_0_#bae6fd] transition-all hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-sky-50 text-slate-700 font-heading font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h3 className="font-heading font-bold text-sm text-slate-900">
                                {rule.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                              {rule.desc}
                            </p>
                          </div>

                          {rule.enDesc && (
                            <div className="pt-2 border-t border-sky-200 flex items-start gap-1.5 text-[11px] text-cyan-700/90 italic">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0 mt-0.5" />
                              <span>{rule.enDesc}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: FORMATIVE QUESTIONS */}
          {activeTab === 'quiz' && (
            <div>
              <div className="pb-3 mb-4 border-b border-sky-200">
                <h2 className="font-heading font-black text-lg text-purple-700 flex items-center gap-2">
                  <span>❓</span> PERGUNTAS FORMATIVAS DA ORIENTADORA LEIA
                </h2>
                <p className="text-xs text-slate-500">
                  Teste rápido para fixar os princípios antes de ingressar no jogo!
                </p>
              </div>

              <div className="space-y-6">
                {/* Question 1 */}
                <div className="bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] rounded-2xl p-4">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-2">
                    1. O que expressa o slogan da Orientadora: <em className="text-amber-700">"LEIA! Know the rules, learn and go further!"</em>?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { text: "Conhecer as regras e ler ajuda a aprender e ir mais longe!", correct: true },
                      { text: "Apenas correr o mais rápido possível no pátio", correct: false }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectQ1(i)}
                        className={`p-3 rounded-xl border text-left font-medium transition-all ${
                          q1Answer === i
                            ? opt.correct
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                              : 'bg-red-100 border-red-500 text-red-800'
                            : 'bg-white/95 border-sky-200 hover:border-sky-400 text-slate-600'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] rounded-2xl p-4">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-2">
                    2. Como deve ser a relação entre o <span className="text-blue-600">BLUE TEAM</span> e o <span className="text-purple-600">PURPLE TEAM</span>?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { text: "Uma rivalidade hostil com ofensas", correct: false },
                      { text: "Uma competição esportiva saudável com respeito e amizade!", correct: true }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectQ2(i)}
                        className={`p-3 rounded-xl border text-left font-medium transition-all ${
                          q2Answer === i
                            ? opt.correct
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                              : 'bg-red-100 border-red-500 text-red-800'
                            : 'bg-white/95 border-sky-200 hover:border-sky-400 text-slate-600'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => setActiveTab('terms')}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-heading font-black text-xs uppercase rounded-xl border-2 border-purple-900 shadow-[0_4px_0_0_#3b0764] active:translate-y-1 active:shadow-[0_1px_0_0_#3b0764] transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Ir para o Termo de Compromisso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TERMS AND TRANSITION TO REGISTRATION */}
          {activeTab === 'terms' && (
            <div className="text-center max-w-xl mx-auto">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h2 className="font-heading font-black text-xl text-slate-900 mb-2">
                TERMO DE CIÊNCIA E COMPROMISSO
              </h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Você concluiu a Orientação Educativa da Escola Municipal Nísia Vilela Fernandes com sucesso. Para registrar sua pontuação e defender sua turma no ranking, confirme seu compromisso:
              </p>

              {/* Agreement Box */}
              <label className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 shadow-[0_4px_0_0_#f59e0b] rounded-2xl p-4 text-left cursor-pointer mb-6 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                />
                <div className="text-xs text-slate-700">
                  <strong className="text-amber-700 block font-heading mb-0.5">
                    Declaração do Estudante:
                  </strong>
                  "Li e compreendi as regras do Nisialand. Comprometo-me a respeitar meus colegas, jogar com honestidade, não usar ofensas e dar o meu melhor para aprender Língua Inglesa!"
                </div>
              </label>

              {/* Action Button */}
              <button
                onClick={handleFinishOrientation}
                disabled={!agreedToTerms}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-heading font-black text-base uppercase tracking-wider rounded-full border-[3px] border-amber-600 shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] hover:from-amber-300 hover:to-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
              >
                <span>CRIAR MEU CADASTRO OFICIAL (ESCOLHER AVATAR)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-3 text-xs text-slate-500 border-t border-sky-200 bg-white/80 backdrop-blur-sm">
        Escola Municipal Nísia Vilela Fernandes • Orientadora Edileia "Leia" • Duque de Caxias
      </footer>
    </div>
  );
};
