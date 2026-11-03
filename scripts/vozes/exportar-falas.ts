// Lista todas as falas que o jogo diz em voz e grava public/assets/vozes/manifesto.json.
// Depois o gerar_vozes.py (Phonon, no computador) cria um mp3 por fala que ainda não existe.
// Uso: npm run vozes
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROTEIRO, FALAS_TELAS, SLOGAN_ORIENTACAO } from '../../src/data/falasAnfitrioes';
import { PROVISIONAL_STORIES } from '../../src/data/provisionalStories';
import { FALA_EDILEIA, FALA_MARCIO } from '../../src/data/falasHq';
import { ELENCO, type Personagem } from '../../src/data/elenco';
import { chaveFala, limparNome, normalizarTexto, type IdiomaFala } from '../../src/services/vozesArquivo';
import { atividadesComRodada, itensDaRodada } from '../../src/data/rodadasFases';
import { LEVEL5_CONTENT } from '../../src/data/level5Content';
import { LEVEL0 } from '../../src/content/level0';
import { LEVEL1 } from '../../src/content/level1';
import { LEVEL2 } from '../../src/data/level2Content';
import { LEVEL3 } from '../../src/content/level3';
import { LEVEL4 } from '../../src/content/level4';
import { LEVEL5 } from '../../src/content/level5';
import { LEVEL6 } from '../../src/content/level6';
import { LEVEL7 } from '../../src/content/level7';
import { LEVEL8 } from '../../src/content/level8';
import type { Level } from '../../src/core/types';
import { LUGARES, ETAPAS, FALAS_INTERVALO } from '../../src/data/frasesIntervalo';
import { INTERVALOS } from '../../src/features/intervalo/intervalos';
import { falasDaMissaoMural } from '../../src/data/missaoMural';
import { AVISOS_CORREDOR, PORTAS_N3, PORTAS_N4, falaDaPorta } from '../../src/data/falasCorredor';
import { ZE_LINES } from '../../src/features/quiz/zeRules';
import { ZE_TRAP, ZE_SWAP, ZE_SHUFFLE } from '../../src/features/level1/level1Rules';
import { LEVEL2_ZE_LINES, LEVEL2_CONTENT } from '../../src/data/level2Content';
import { LEVEL3_ZE_LINES } from '../../src/data/level3Content';
import { MANE_CORRIDOR_LINES, MANE_ROOM_START, MANE_ROOM_TIP, MANE_SIMPLE_LINE } from '../../src/data/level3Mane';
import { LEVEL4_DISTRACTIONS, MANE_PADRAO, ZE_PADRAO } from '../../src/content/level4';
import { textoFalado } from '../../src/services/speech';
import { BUILT_IN_QUESTIONS } from '../../src/data/questionBank';
import { QUIZ_QUESTIONS } from '../../src/data/quizQuestions';
import { getFlashcardSet, SCHOOL_GRADES } from '../../src/data/level0Content';
import { COMIC_PANELS, LEVEL0_QUESTIONS } from '../../src/data/historiaNivel0';
import { LEVEL1_CONTENT, SPEAKER_VOZ } from '../../src/data/level1Content';
import { LEVEL3_CONTENT } from '../../src/data/level3Content';
import { level4QuestionPool } from '../../src/features/level4/level4QuestionPool';
import { dadosDoJogo } from '../../src/data/jogosFases';

interface Item { chave: string; idioma: IdiomaFala; voz: string; personagem: Personagem; texto: string; origem: string; niveis: number[] }
const itens = new Map<string, Item>();

// Em que níveis cada fala é usada (carregamento por fase: o pacote do nível leva as vozes dele).
let NIVEIS_ATUAIS: number[] = [0];
const nos = (niveis: number[], fazer: () => void) => { const antes = NIVEIS_ATUAIS; NIVEIS_ATUAIS = niveis; fazer(); NIVEIS_ATUAIS = antes; };

function add(personagem: Personagem, idioma: IdiomaFala, textoBruto: string, origem: string) {
  if (!textoBruto?.trim()) return;
  const texto = limparNome(textoBruto.replace(/\{nome\}/g, 'estudante'), ['estudante']);
  const voz = idioma === 'en-US' ? ELENCO[personagem].en : ELENCO[personagem].pt;
  const chave = chaveFala(idioma, voz, texto);
  const atual = itens.get(chave);
  if (!atual) itens.set(chave, { chave, idioma, voz, personagem, texto: normalizarTexto(texto), origem, niveis: [...NIVEIS_ATUAIS] });
  else atual.niveis = [...new Set([...atual.niveis, ...NIVEIS_ATUAIS])].sort((a, b) => a - b);
}

// Falas dos anfitriões por nível: {proxima} vira cada atividade do nível; {missao}, o título da missão.
const NIVEIS: Level[] = [LEVEL0, LEVEL1, LEVEL2, LEVEL3, LEVEL4, LEVEL5, LEVEL6, LEVEL7, LEVEL8];
const porNumero = new Map(NIVEIS.map(l => [l.number, l]));
for (const [num, roteiro] of Object.entries(ROTEIRO)) {
  const nivel = porNumero.get(Number(num));
  const proximas = [...(nivel?.mission.activities.map(a => a.name) ?? []), 'a próxima atividade'];
  const missoes = nivel ? [...new Set([nivel.title, nivel.mission.title])] : [''];
  for (const [momento, falas] of Object.entries(roteiro.falas)) {
    for (const f of falas ?? []) {
      for (const lado of [['pt-BR', f.pt], ['en-US', f.en]] as const) {
        const [idioma, base] = lado;
        const comMissao = base.includes('{missao}') ? missoes.map(m => base.replace(/\{missao\}/g, m)) : [base];
        for (const t of comMissao) {
          const variantes = t.includes('{proxima}') ? proximas.map(p => t.replace(/\{proxima\}/g, p)) : [t];
          for (const v of variantes) nos([Number(num)], () => add(roteiro.anfitriao, idioma, v, `roteiro ${num} ${momento}`));
        }
      }
    }
  }
}

// Falas das telas (cadastro, orientação, ranking…)
for (const [tela, def] of Object.entries(FALAS_TELAS)) {
  for (const f of def.falas) { add(def.anfitriao, 'pt-BR', f.pt, `tela ${tela}`); add(def.anfitriao, 'en-US', f.en, `tela ${tela}`); }
}

// HQs
for (const [id, hist] of Object.entries(PROVISIONAL_STORIES)) {
  const n = Number(id.match(/\d+/)?.[0] ?? 0);
  nos([n], () => { for (const p of hist.panels) { add(p.voz, 'pt-BR', p.text, `hq ${id}`); if (p.en) add(p.voz, 'en-US', p.en, `hq ${id}`); } });
}
nos([1], () => { add('leia', 'pt-BR', FALA_EDILEIA, 'hq reuniao'); add('marcio', 'pt-BR', FALA_MARCIO, 'hq reuniao'); });

// Frases de escuta das rodadas (Níveis 5 a 8), em inglês
const SERIES = ['6', '7', '8', '9'] as const;
for (const id of atividadesComRodada()) {
  for (const s of SERIES) {
    const primeiras = id.startsWith('nivel5-') ? ((LEVEL5_CONTENT[s] as unknown as Record<string, unknown>)[id.replace('nivel5-', '')] as never[]) ?? [] : [];
    for (const it of itensDaRodada(id, s, primeiras)) if (it.ouvir) nos([Number(id.match(/nivel(\d+)/)?.[1] ?? 0)], () => add('professora', 'en-US', it.ouvir!, `rodada ${id}`));
  }
}

// Comandos fixos dos jogos de intervalo
nos([2, 3, 4, 5, 6], () => {
  for (const f of ['Jump!', 'Duck!', 'Approved!', 'Failed!', ...LUGARES.map(l => l.frase), ...Object.values(ETAPAS)]) add('professora', 'en-US', f, 'intervalo');
  for (const f of FALAS_INTERVALO) add(f.personagem, 'en-US', f.texto, 'intervalo');
});
nos([0], () => add('leia', 'en-US', SLOGAN_ORIENTACAO, 'lema'));
// Ditado do Diretor Márcio (Nível 2): todas as séries
nos([2], () => { for (const g of Object.values(LEVEL2_CONTENT)) for (const d of g.dictation) add('marcio', 'en-US', d.word, 'ditado'); });
// Narrador dos corredores 3D (Níveis 3 e 4): portas em cada estado e avisos
for (const [portas, nivel] of [[PORTAS_N3, LEVEL3], [PORTAS_N4, LEVEL4]] as const) nos([nivel.number], () => nivel.mission.activities.forEach((a, i) => { for (const e of ['locked', 'open', 'done'] as const) add('narrador', 'pt-BR', falaDaPorta(portas[i], a.name, e), 'corredor'); }));
nos([3, 4], () => { for (const f of Object.values(AVISOS_CORREDOR)) add('narrador', 'pt-BR', f, 'corredor'); });
// Camada 2.0: missão do mural (Nível 3)
nos([3], () => { for (const f of falasDaMissaoMural()) add(f.personagem, f.idioma, f.texto, 'missao mural'); });
// Convites de intervalo (Mané)
for (const i of INTERVALOS) nos([i.nivel], () => add('mane', 'pt-BR', i.chamada, `convite ${i.id}`));
// Zé Cartinha: falas fixas dos Níveis 0 a 4
nos([0], () => { for (const f of ZE_LINES) add('ze', 'pt-BR', f, 'ze'); });
nos([1], () => { for (const f of [ZE_TRAP, ZE_SWAP, ZE_SHUFFLE, ...ZE_LINES]) add('ze', 'pt-BR', f, 'ze'); });
nos([2], () => { for (const f of Object.values(LEVEL2_ZE_LINES).flat()) add('ze', 'pt-BR', f, 'ze'); });
nos([3], () => { for (const f of [...LEVEL3_ZE_LINES, 'Hahaha! Pegou minha carta!']) add('ze', 'pt-BR', f, 'ze'); });
nos([4], () => { for (const f of [ZE_PADRAO, ...Object.values(LEVEL4_DISTRACTIONS).map(d => d.ze)]) add('ze', 'pt-BR', f, 'ze'); });
// Mané Zoeira: Níveis 3 e 4
nos([3], () => {
  for (const l of [...MANE_CORRIDOR_LINES, MANE_SIMPLE_LINE]) { add('mane', 'pt-BR', l.pt, 'mane'); add('mane', 'en-US', l.en, 'mane'); }
  for (const f of [...MANE_ROOM_START, ...MANE_ROOM_TIP]) add('mane', 'pt-BR', f, 'mane');
});
nos([4], () => { for (const f of [MANE_PADRAO, ...Object.values(LEVEL4_DISTRACTIONS).map(d => d.mane)]) add('mane', 'pt-BR', f, 'mane'); });

// ---- Frases em inglês das atividades (botões "ouvir" e falas lidas em voz alta: speechService) ----
const ouvir = (p: Personagem, t: string, origem: string) => add(p, 'en-US', textoFalado(t), origem);
// Nível 0: quiz (banco de questões e 8º ano), flashcards e a história de abertura
nos([0], () => {
  for (const q of BUILT_IN_QUESTIONS) ouvir('professora', q.prompt, 'nivel0 quiz');
  for (const q of QUIZ_QUESTIONS) ouvir('professora', q.sentence, 'nivel0 quiz');
  for (const g of SCHOOL_GRADES) for (const c of getFlashcardSet(g).challenges) ouvir('professora', c.questionEn, 'nivel0 flashcards');
  for (const p of COMIC_PANELS) ouvir(p.voz, p.speechEn, 'nivel0 historia');
  for (const q of LEVEL0_QUESTIONS) ouvir('professora', q.promptEn, 'nivel0 historia');
});
// Nível 1: escuta (também volta na revisão do Nível 3) e diálogo com a voz de quem fala
for (const g of SCHOOL_GRADES) {
  nos([1, 3], () => { for (const it of LEVEL1_CONTENT[g].listen) ouvir('professora', it.audio, 'nivel1 escuta'); });
  nos([1], () => { for (const t of LEVEL1_CONTENT[g].dialogue) ouvir(SPEAKER_VOZ[t.speaker], t.line, 'nivel1 dialogo'); });
}
// Nível 3: arrume a sala, quem fala com educação, memória e labirinto
nos([3], () => {
  for (const g of SCHOOL_GRADES) {
    const c = LEVEL3_CONTENT[g];
    for (const it of c.arrange.place) ouvir('professora', it.instruction, 'nivel3 arrume');
    for (const it of c.who) ouvir('professora', it.text, 'nivel3 quem');
    for (const it of c.memory) ouvir('professora', it.en, 'nivel3 memoria');
    for (const w of c.maze.words) ouvir('professora', w, 'nivel3 labirinto');
  }
});
// Nível 4: siga as direções
nos([4], () => { for (const g of SCHOOL_GRADES) for (const q of level4QuestionPool('nivel4-direcoes', g)) ouvir('professora', q.prompt, 'nivel4 direcoes'); });
// Níveis 5 a 8: jogos (pares, memória, frase, ordem, sala e perguntas faladas)
for (const nivel of [LEVEL5, LEVEL6, LEVEL7, LEVEL8]) nos([nivel.number], () => {
  for (const a of nivel.mission.activities) for (const g of SCHOOL_GRADES) {
    const d = dadosDoJogo(a.id, g);
    const o = `jogo ${a.id}`;
    if (d.tipo === 'pares' && d.falarEsquerda) d.fases.flat().forEach(p => ouvir('professora', p[0], o));
    if (d.tipo === 'memoria') d.fases.flat().forEach(p => ouvir('professora', p[0], o));
    if (d.tipo === 'frase') d.fases.flat().forEach(f => ouvir('professora', f, o));
    if (d.tipo === 'ordem' && d.falar) d.fases.flat().forEach(sq => sq.passos.forEach(x => ouvir('professora', x, o)));
    if (d.tipo === 'sala') d.fases.flat().forEach(x => ouvir('professora', x.instrucao, o));
    if (d.tipo === 'chuva' || d.tipo === 'travessia' || d.tipo === 'corrida') d.fases.flat().forEach(it => { if (it.ouvir) ouvir('professora', it.ouvir, o); });
  }
});

const lista = [...itens.values()].sort((a, b) => a.origem.localeCompare(b.origem) || a.chave.localeCompare(b.chave));
const pasta = join(process.cwd(), 'public', 'assets', 'vozes');
mkdirSync(pasta, { recursive: true });
writeFileSync(join(pasta, 'manifesto.json'), JSON.stringify(lista, null, 1) + '\n', 'utf8');
const porIdioma = lista.reduce<Record<string, number>>((m, i) => ({ ...m, [i.idioma]: (m[i.idioma] ?? 0) + 1 }), {});
console.log(`manifesto: ${lista.length} falas`, porIdioma);
