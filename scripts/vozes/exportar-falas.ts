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
import { AVISOS_CORREDOR, PORTAS_N3, PORTAS_N4, falaDaPorta } from '../../src/data/falasCorredor';
import { ZE_LINES } from '../../src/features/quiz/zeRules';
import { ZE_TRAP, ZE_SWAP, ZE_SHUFFLE } from '../../src/features/level1/level1Rules';
import { LEVEL2_ZE_LINES, LEVEL2_CONTENT } from '../../src/data/level2Content';
import { LEVEL3_ZE_LINES } from '../../src/data/level3Content';
import { MANE_CORRIDOR_LINES, MANE_ROOM_START, MANE_ROOM_TIP, MANE_SIMPLE_LINE } from '../../src/data/level3Mane';
import { LEVEL4_DISTRACTIONS, MANE_PADRAO, ZE_PADRAO } from '../../src/content/level4';

interface Item { chave: string; idioma: IdiomaFala; voz: string; personagem: Personagem; texto: string; origem: string }
const itens = new Map<string, Item>();

function add(personagem: Personagem, idioma: IdiomaFala, textoBruto: string, origem: string) {
  if (!textoBruto?.trim()) return;
  const texto = limparNome(textoBruto.replace(/\{nome\}/g, 'estudante'), ['estudante']);
  const voz = idioma === 'en-US' ? ELENCO[personagem].en : ELENCO[personagem].pt;
  const chave = chaveFala(idioma, voz, texto);
  if (!itens.has(chave)) itens.set(chave, { chave, idioma, voz, personagem, texto: normalizarTexto(texto), origem });
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
          for (const v of variantes) add(roteiro.anfitriao, idioma, v, `roteiro ${num} ${momento}`);
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
  for (const p of hist.panels) { add(p.voz, 'pt-BR', p.text, `hq ${id}`); if (p.en) add(p.voz, 'en-US', p.en, `hq ${id}`); }
}
add('leia', 'pt-BR', FALA_EDILEIA, 'hq reuniao');
add('marcio', 'pt-BR', FALA_MARCIO, 'hq reuniao');

// Frases de escuta das rodadas (Níveis 5 a 8), em inglês
const SERIES = ['6', '7', '8', '9'] as const;
for (const id of atividadesComRodada()) {
  for (const s of SERIES) {
    const primeiras = id.startsWith('nivel5-') ? ((LEVEL5_CONTENT[s] as unknown as Record<string, unknown>)[id.replace('nivel5-', '')] as never[]) ?? [] : [];
    for (const it of itensDaRodada(id, s, primeiras)) if (it.ouvir) add('professora', 'en-US', it.ouvir, `rodada ${id}`);
  }
}

// Comandos fixos dos jogos de intervalo
for (const f of ['Jump!', 'Duck!', 'Approved!', 'Failed!', ...LUGARES.map(l => l.frase), ...Object.values(ETAPAS)]) add('professora', 'en-US', f, 'intervalo');
for (const f of FALAS_INTERVALO) add(f.personagem, 'en-US', f.texto, 'intervalo');
add('leia', 'en-US', SLOGAN_ORIENTACAO, 'lema');
// Ditado do Diretor Márcio (Nível 2): todas as séries
for (const g of Object.values(LEVEL2_CONTENT)) for (const d of g.dictation) add('marcio', 'en-US', d.word, 'ditado');
// Narrador dos corredores 3D (Níveis 3 e 4): portas em cada estado e avisos
for (const [portas, nivel] of [[PORTAS_N3, LEVEL3], [PORTAS_N4, LEVEL4]] as const) nivel.mission.activities.forEach((a, i) => { for (const e of ['locked', 'open', 'done'] as const) add('narrador', 'pt-BR', falaDaPorta(portas[i], a.name, e), 'corredor'); });
for (const f of Object.values(AVISOS_CORREDOR)) add('narrador', 'pt-BR', f, 'corredor');
// Convites de intervalo (Mané)
for (const i of INTERVALOS) add('mane', 'pt-BR', i.chamada, `convite ${i.id}`);
// Zé Cartinha: falas fixas dos Níveis 0 a 4
for (const f of [...ZE_LINES, ZE_TRAP, ZE_SWAP, ZE_SHUFFLE, ...Object.values(LEVEL2_ZE_LINES).flat(), ...LEVEL3_ZE_LINES, 'Hahaha! Pegou minha carta!', ZE_PADRAO, ...Object.values(LEVEL4_DISTRACTIONS).map(d => d.ze)]) add('ze', 'pt-BR', f, 'ze');
// Mané Zoeira: Níveis 3 e 4
for (const l of [...MANE_CORRIDOR_LINES, MANE_SIMPLE_LINE]) { add('mane', 'pt-BR', l.pt, 'mane'); add('mane', 'en-US', l.en, 'mane'); }
for (const f of [...MANE_ROOM_START, ...MANE_ROOM_TIP, MANE_PADRAO, ...Object.values(LEVEL4_DISTRACTIONS).map(d => d.mane)]) add('mane', 'pt-BR', f, 'mane');

const lista = [...itens.values()].sort((a, b) => a.origem.localeCompare(b.origem) || a.chave.localeCompare(b.chave));
const pasta = join(process.cwd(), 'public', 'assets', 'vozes');
mkdirSync(pasta, { recursive: true });
writeFileSync(join(pasta, 'manifesto.json'), JSON.stringify(lista, null, 1) + '\n', 'utf8');
const porIdioma = lista.reduce<Record<string, number>>((m, i) => ({ ...m, [i.idioma]: (m[i.idioma] ?? 0) + 1 }), {});
console.log(`manifesto: ${lista.length} falas`, porIdioma);
