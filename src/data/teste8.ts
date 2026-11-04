// TESTE DO 8º ANO — Comparativos de igualdade, superioridade e inferioridade (PROVISÓRIO: revisão do professor).
// Cada acesso dura 15 minutos e sorteia frases, nomes, adjetivos e opções novas: a estrutura da pergunta é a mesma,
// o conteúdo muda. O aluno avança de fase acertando; ao fim do tempo o acesso trava e o resultado vai para a planilha.
// Funções puras (testadas em tests/teste8.test.ts). A tela fica em src/features/teste8/Teste8Screen.tsx.

// ---------------------------------------------------------------- configuração
/** Janela do teste (horário de Brasília). Fora dela, a tela avisa e não deixa começar. */
export const TESTE8_INICIO = '2026-11-04T17:00:00-03:00';
export const TESTE8_FIM = '2026-11-11T23:59:59-03:00';
/** Duração de cada acesso. */
export const TESTE8_DURACAO_MS = 15 * 60 * 1000;
/** Acertos para passar de fase. */
export const ACERTOS_POR_FASE = 5;
/** Prefixo do id da atividade na planilha: um resultado por aluno por dia (teste8-2026-11-04). */
export const PREFIXO_TESTE8 = 'teste8-';
/**
 * Turma 805, como aparece na chamada de 04/11/2026. "…" = nome cortado na tela do diário (vale o começo).
 * Para entrar, o cadastro no jogo precisa ter PRIMEIRO NOME + UM SOBRENOME desta lista (tolerância de grafia:
 * Isabela/Isabella, Kaiki/Kayky). Lista vazia = todos os alunos do 8º ano.
 */
export const TESTE8_ALUNOS: string[] = [
  'Alexsandro Hilario da Sil…', 'Alison Ronaldo Augusto…', 'Amanda dos Santos Gonz…', 'Clarissa Vitoria dos Sant…',
  'Eduarda Barros de Souza', 'Felippe Rafael da Silva So…', 'Isabella Cristina Ramos D…', 'Julhy Beatriz dos Santos…',
  'Kauan Silvestre Celiano…', 'Kayky Pereira dos Santos', 'Lorrany Barros Oliveira', 'Maria Vitoria da Silva Ne…',
  'Nicolas Leony dos Sant…', 'Nicoly do Nascimento Fe…', 'Pedro Henrique Assis de…', 'Rafael Gomes de Souza',
  'Ryan Gabriel Lopes de Al…', 'Samuel Gomes de Carval…', 'Thalya Proença Gomes T…', 'Lucas da Costa Cardoso',
  'Isaque da Costa de Almei…', 'Pedro Gabriel Freitas da…', 'Ana Julia Cabral Ferreira', 'Jamilly Alves Ferreira',
  'Ester Teixeira Mello', 'Bruna Mazza Amaro Rosa',
];

export const FASES = [
  { numero: 1, titulo: 'Superioridade', sub: 'adjetivos curtos: taller than', pontos: 10 },
  { numero: 2, titulo: 'Superioridade', sub: 'adjetivos longos e irregulares: more… than, better than', pontos: 20 },
  { numero: 3, titulo: 'Igualdade', sub: 'as… as / not as… as', pontos: 30 },
  { numero: 4, titulo: 'Inferioridade', sub: 'less… than / not as… as', pontos: 40 },
  { numero: 5, titulo: 'Desafio dos dados', sub: 'compare os cartões e escolha', pontos: 50 },
  { numero: 6, titulo: 'Fase bônus', sub: 'tudo misturado, pontos em dobro', pontos: 60 },
] as const;

// ---------------------------------------------------------------- sorteio
export type Sorteio = () => number;
/** Gerador com semente (mesma semente → mesmas perguntas; usado nos testes). */
export function sorteioComSemente(semente: number): Sorteio {
  let s = semente >>> 0 || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 2 ** 32; };
}
const um = <T,>(r: Sorteio, lista: readonly T[]): T => lista[Math.floor(r() * lista.length)];
function embaralhar<T>(r: Sorteio, lista: readonly T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function dois<T>(r: Sorteio, lista: readonly T[]): [T, T] {
  const [a, b] = embaralhar(r, lista);
  return [a, b];
}

// ---------------------------------------------------------------- vocabulário
interface Curto { adj: string; comp: string; erro: string } // erro = forma errada comum ("biger", "happyer")
interface Longo { adj: string }
interface Irregular { adj: string; comp: string; erros: string[] }

const PESSOAS = ['Ana', 'Bia', 'Leo', 'Tom', 'Duda', 'Caio', 'Malu', 'Davi', 'Lara', 'Enzo', 'Sofia', 'Theo', 'Nina', 'Rafa', 'Julia', 'Pedro', 'Maya', 'Gabriel'];
const C = (adj: string, comp: string, erro: string): Curto => ({ adj, comp, erro });

// Cada grupo junta coisas que fazem sentido comparar entre si, com adjetivos que combinam com elas.
interface Grupo { itens: string[]; curtos: Curto[]; longos: Longo[]; irregulares: string[]; inferior: Longo[] }
const GRUPOS: Grupo[] = [
  { // pessoas
    itens: PESSOAS,
    curtos: [C('tall', 'taller', 'taler'), C('short', 'shorter', 'shortter'), C('old', 'older', 'oldder'), C('young', 'younger', 'youngger'), C('strong', 'stronger', 'strongger'), C('fast', 'faster', 'fastter'), C('funny', 'funnier', 'funnyer'), C('smart', 'smarter', 'smartter'), C('busy', 'busier', 'busyer'), C('happy', 'happier', 'happyer'), C('nice', 'nicer', 'niceer'), C('quiet', 'quieter', 'quietter')],
    longos: [{ adj: 'intelligent' }, { adj: 'creative' }, { adj: 'patient' }, { adj: 'organized' }, { adj: 'famous' }, { adj: 'popular' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'patient' }, { adj: 'organized' }, { adj: 'creative' }, { adj: 'popular' }],
  },
  { // meios de transporte
    itens: ['the car', 'the bike', 'the bus', 'the train', 'the plane', 'the motorcycle', 'the boat'],
    curtos: [C('fast', 'faster', 'fastter'), C('slow', 'slower', 'slowwer'), C('big', 'bigger', 'biger'), C('small', 'smaller', 'smallier'), C('cheap', 'cheaper', 'cheapper'), C('safe', 'safer', 'safeer'), C('heavy', 'heavier', 'heavyer')],
    longos: [{ adj: 'expensive' }, { adj: 'comfortable' }, { adj: 'dangerous' }, { adj: 'modern' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'expensive' }, { adj: 'comfortable' }, { adj: 'dangerous' }],
  },
  { // filmes, livros, jogos
    itens: ['the movie', 'the book', 'the game', 'the song', 'the series', 'the cartoon', 'the comic'],
    curtos: [C('long', 'longer', 'longger'), C('short', 'shorter', 'shortter'), C('funny', 'funnier', 'funnyer'), C('cheap', 'cheaper', 'cheapper'), C('new', 'newer', 'neweer'), C('old', 'older', 'oldder'), C('scary', 'scarier', 'scaryer')],
    longos: [{ adj: 'interesting' }, { adj: 'boring' }, { adj: 'exciting' }, { adj: 'popular' }, { adj: 'expensive' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'interesting' }, { adj: 'exciting' }, { adj: 'popular' }, { adj: 'expensive' }],
  },
  { // comida
    itens: ['the pizza', 'the cake', 'the salad', 'the burger', 'the soup', 'the ice cream', 'the sandwich', 'the juice'],
    curtos: [C('hot', 'hotter', 'hoter'), C('cold', 'colder', 'coldder'), C('big', 'bigger', 'biger'), C('cheap', 'cheaper', 'cheapper'), C('sweet', 'sweeter', 'sweetter'), C('tasty', 'tastier', 'tastyer'), C('salty', 'saltier', 'saltyer')],
    longos: [{ adj: 'delicious' }, { adj: 'expensive' }, { adj: 'healthy' }, { adj: 'popular' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'delicious' }, { adj: 'expensive' }, { adj: 'popular' }],
  },
  { // matérias da escola
    itens: ['Math', 'English', 'History', 'Science', 'Geography', 'Art', 'P.E.'],
    curtos: [C('easy', 'easier', 'easyer'), C('hard', 'harder', 'hardder'), C('cool', 'cooler', 'cooller')],
    longos: [{ adj: 'difficult' }, { adj: 'interesting' }, { adj: 'important' }, { adj: 'boring' }, { adj: 'popular' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'difficult' }, { adj: 'interesting' }, { adj: 'boring' }, { adj: 'popular' }],
  },
  { // animais
    itens: ['the elephant', 'the dog', 'the cat', 'the horse', 'the mouse', 'the cheetah', 'the turtle', 'the lion', 'the rabbit'],
    curtos: [C('big', 'bigger', 'biger'), C('small', 'smaller', 'smallier'), C('fast', 'faster', 'fastter'), C('slow', 'slower', 'slowwer'), C('strong', 'stronger', 'strongger'), C('heavy', 'heavier', 'heavyer'), C('cute', 'cuter', 'cuteer')],
    longos: [{ adj: 'dangerous' }, { adj: 'intelligent' }, { adj: 'beautiful' }, { adj: 'friendly' }],
    irregulares: [],
    inferior: [{ adj: 'dangerous' }, { adj: 'intelligent' }, { adj: 'beautiful' }],
  },
  { // lugares
    itens: ['Rio', 'São Paulo', 'Duque de Caxias', 'Belo Horizonte', 'Salvador', 'my street', 'the park', 'the beach'],
    curtos: [C('hot', 'hotter', 'hoter'), C('cold', 'colder', 'coldder'), C('big', 'bigger', 'biger'), C('small', 'smaller', 'smallier'), C('noisy', 'noisier', 'noisyer'), C('quiet', 'quieter', 'quietter'), C('busy', 'busier', 'busyer')],
    longos: [{ adj: 'beautiful' }, { adj: 'expensive' }, { adj: 'crowded' }, { adj: 'dangerous' }],
    irregulares: ['good', 'bad'],
    inferior: [{ adj: 'beautiful' }, { adj: 'expensive' }, { adj: 'crowded' }],
  },
];

const IRREGULARES: Record<string, Irregular> = {
  good: { adj: 'good', comp: 'better', erros: ['gooder', 'more good', 'best', 'more better'] },
  bad: { adj: 'bad', comp: 'worse', erros: ['badder', 'more bad', 'worst', 'more worse'] },
};

// Começos de frase: mesma estrutura, frases diferentes a cada vez.
const MOLDES = ['{A} is ___ {B}.', 'I think {A} is ___ {B}.', 'In my opinion, {A} is ___ {B}.', 'My friend says {A} is ___ {B}.', 'Everybody knows {A} is ___ {B}.', 'This year, {A} is ___ {B}.'];

// ---------------------------------------------------------------- perguntas
export type Pergunta =
  | { tipo: 'escolha'; fase: number; frase: string; dica: string; opcoes: string[]; certa: string; regra: string }
  | { tipo: 'certoErrado'; fase: number; frase: string; certo: boolean; correcao: string; regra: string }
  | { tipo: 'montar'; fase: number; dica: string; palavras: string[]; resposta: string[]; regra: string }
  | { tipo: 'dados'; fase: number; cartoes: [Cartao, Cartao]; frase: string; opcoes: string[]; certa: string; regra: string };
export interface Cartao { nome: string; valor: string }

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const montarFrase = (molde: string, a: string, b: string) => {
  const f = molde.replace('{A}', a).replace('{B}', b);
  return cap(f);
};

function opcoesCom(r: Sorteio, certa: string, erradas: string[]): string[] {
  const unicas = [...new Set(erradas.filter(e => e !== certa))];
  return embaralhar(r, [certa, ...embaralhar(r, unicas).slice(0, 3)]);
}

/** Forma comparativa e opções erradas típicas para cada tipo. */
function superioridade(r: Sorteio, g: Grupo, longo: boolean) {
  if (longo) {
    const usarIrregular = g.irregulares.length > 0 && r() < 0.35;
    if (usarIrregular) {
      const ir = IRREGULARES[um(r, g.irregulares)];
      return { adj: ir.adj, certa: `${ir.comp} than`, erradas: ir.erros.map(e => `${e} than`), regra: `${ir.adj} é irregular: ${ir.comp} than.` };
    }
    const { adj } = um(r, g.longos);
    return { adj, certa: `more ${adj} than`, erradas: [`${adj}er than`, `most ${adj} than`, `more ${adj}er than`, `as ${adj} than`, `the most ${adj}`], regra: `Adjetivo longo: more + adjetivo + than.` };
  }
  const c = um(r, g.curtos);
  return { adj: c.adj, certa: `${c.comp} than`, erradas: [`more ${c.comp} than`, `${c.erro} than`, `more ${c.adj} than`, `the ${c.comp.replace(/er$/, 'est')}`, `${c.comp} that`], regra: `Adjetivo curto: ${c.adj} → ${c.comp} than.` };
}

function igualdade(r: Sorteio, g: Grupo) {
  const neg = r() < 0.4;
  const c = r() < 0.6 ? um(r, g.curtos) : null;
  const adj = c ? c.adj : um(r, g.longos).adj;
  const comp = c ? c.comp : `more ${adj}`;
  if (neg) return { adj, certa: `not as ${adj} as`, erradas: [`not as ${comp} as`, `not as ${adj} than`, `not ${adj} as`, `not so ${adj} than`], regra: 'Igualdade negativa: not as + adjetivo + as (sem -er, sem more).' };
  return { adj, certa: `as ${adj} as`, erradas: [`as ${comp} as`, `as ${adj} than`, `so ${adj} than`, `${comp} as`], regra: 'Igualdade: as + adjetivo + as (o adjetivo não muda).' };
}

function inferioridade(r: Sorteio, g: Grupo) {
  if (r() < 0.3) { // forma com not as… as para adjetivo curto
    const c = um(r, g.curtos);
    return { adj: c.adj, certa: `not as ${c.adj} as`, erradas: [`less ${c.comp} than`, `not as ${c.comp} as`, `less ${c.adj} as`, `not ${c.adj} than`], regra: 'Com adjetivo curto, o inglês prefere not as + adjetivo + as.' };
  }
  const { adj } = um(r, g.inferior);
  return { adj, certa: `less ${adj} than`, erradas: [`less ${adj}er than`, `fewer ${adj} than`, `less ${adj} as`, `more less ${adj} than`, `least ${adj} than`], regra: 'Inferioridade: less + adjetivo + than (o adjetivo não muda).' };
}

function formaDaFase(r: Sorteio, fase: number, g: Grupo) {
  if (fase === 1) return superioridade(r, g, false);
  if (fase === 2) return superioridade(r, g, true);
  if (fase === 3) return igualdade(r, g);
  if (fase === 4) return inferioridade(r, g);
  const tipo = um(r, [1, 2, 3, 4]);
  return formaDaFase(r, tipo, g);
}

function perguntaEscolha(r: Sorteio, fase: number): Pergunta {
  const g = um(r, GRUPOS);
  const [a, b] = dois(r, g.itens);
  const f = formaDaFase(r, fase, g);
  return { tipo: 'escolha', fase, frase: montarFrase(um(r, MOLDES), a, b), dica: f.adj, opcoes: opcoesCom(r, f.certa, f.erradas), certa: f.certa, regra: f.regra };
}

function perguntaCertoErrado(r: Sorteio, fase: number): Pergunta {
  const g = um(r, GRUPOS);
  const [a, b] = dois(r, g.itens);
  const f = formaDaFase(r, fase, g);
  const certo = r() < 0.5;
  const usada = certo ? f.certa : um(r, f.erradas);
  const molde = um(r, MOLDES);
  return { tipo: 'certoErrado', fase, frase: montarFrase(molde, a, b).replace('___', usada), certo, correcao: montarFrase(molde, a, b).replace('___', f.certa), regra: f.regra };
}

function perguntaMontar(r: Sorteio, fase: number): Pergunta {
  const g = um(r, GRUPOS);
  const [a, b] = dois(r, g.itens);
  const f = formaDaFase(r, fase, g);
  const resposta = `${cap(a)} is ${f.certa} ${b}`.split(' ');
  // Palavras extras que pegam o erro típico (uma por vez, para não ficar impossível).
  const extra = um(r, ['more', 'that', 'most', 'as', 'less', 'than', 'the'].filter(w => !resposta.includes(w)));
  const palavras = embaralhar(r, [...resposta, extra]);
  return { tipo: 'montar', fase, dica: `${f.adj} · ${cap(a)} e ${b}`, palavras, resposta, regra: f.regra };
}

// Cartões com números: a relação (maior, igual, menor) decide a forma certa.
interface Medida { adj: string; contrario: string; longo: boolean; unidade: (n: number) => string; faixa: [number, number] }
const MEDIDAS: Array<Medida & { quem: 'pessoas' | 'coisas' }> = [
  { quem: 'pessoas', adj: 'tall', contrario: 'short', longo: false, unidade: n => `${(n / 100).toFixed(2).replace('.', ',')} m`, faixa: [145, 185] },
  { quem: 'pessoas', adj: 'old', contrario: 'young', longo: false, unidade: n => `${n} years old`, faixa: [11, 16] },
  { quem: 'coisas', adj: 'expensive', contrario: 'cheap', longo: true, unidade: n => `R$ ${n}`, faixa: [20, 300] },
  { quem: 'coisas', adj: 'heavy', contrario: 'light', longo: false, unidade: n => `${n} kg`, faixa: [1, 40] },
];
const COISAS = ['the backpack', 'the bike', 'the game', 'the phone', 'the guitar', 'the skateboard', 'the speaker', 'the camera'];

function perguntaDados(r: Sorteio, fase: number): Pergunta {
  const m = um(r, MEDIDAS);
  const [a, b] = dois(r, m.quem === 'pessoas' ? PESSOAS : COISAS);
  const va = m.faixa[0] + Math.floor(r() * (m.faixa[1] - m.faixa[0]));
  const rel = um(r, ['maior', 'igual', 'menor'] as const);
  let vb = rel === 'igual' ? va : rel === 'maior' ? va - (1 + Math.floor(r() * 8)) : va + (1 + Math.floor(r() * 8));
  if (vb < 1) vb = va + 3; // garante um número válido
  const relReal = va === vb ? 'igual' : va > vb ? 'maior' : 'menor';
  const comp = m.longo ? `more ${m.adj}` : m.adj === 'heavy' ? 'heavier' : `${m.adj}er`;
  const formas = {
    maior: `${comp} than`,
    igual: `as ${m.adj} as`,
    menor: m.longo ? `less ${m.adj} than` : `not as ${m.adj} as`,
  };
  const certa = formas[relReal];
  const erradas = [...Object.values(formas).filter(f => f !== certa), m.longo ? `${m.adj}er than` : `more ${comp} than`, `as ${comp} as`];
  const regra = relReal === 'igual' ? 'Valores iguais → as + adjetivo + as.' : relReal === 'maior' ? 'O primeiro tem mais → comparativo de superioridade.' : 'O primeiro tem menos → inferioridade (less… than / not as… as).';
  return {
    tipo: 'dados', fase,
    cartoes: [{ nome: cap(a), valor: m.unidade(va) }, { nome: cap(b), valor: m.unidade(vb) }],
    frase: `${cap(a)} is ___ ${b}.`, opcoes: opcoesCom(r, certa, erradas), certa, regra,
  };
}

/** Uma pergunta nova para a fase (o formato varia: escolher, certo ou errado, montar a frase, cartões com dados). */
export function gerarPergunta(fase: number, r: Sorteio = Math.random): Pergunta {
  const f = Math.max(1, Math.min(fase, 6));
  const formatos: Array<(r: Sorteio, f: number) => Pergunta> =
    f === 1 ? [perguntaEscolha, perguntaEscolha, perguntaCertoErrado, perguntaMontar]
    : f === 2 ? [perguntaEscolha, perguntaCertoErrado, perguntaMontar]
    : f === 3 ? [perguntaEscolha, perguntaCertoErrado, perguntaMontar]
    : f === 4 ? [perguntaEscolha, perguntaMontar, perguntaCertoErrado]
    : [perguntaDados, perguntaDados, perguntaEscolha, perguntaMontar, perguntaCertoErrado];
  return um(r, formatos)(r, f);
}

// ---------------------------------------------------------------- regras do acesso
export const pontosDaFase = (fase: number) => FASES[Math.min(fase, 6) - 1].pontos;
/** Dia do acesso no horário de Brasília (AAAA-MM-DD). */
export function diaDeBrasilia(agora: number = Date.now()): string {
  return new Date(agora - 3 * 3600 * 1000).toISOString().slice(0, 10);
}
export const idAtividadeDoDia = (agora: number = Date.now()) => `${PREFIXO_TESTE8}${diaDeBrasilia(agora)}`;
export type EstadoJanela = 'antes' | 'aberto' | 'encerrado';
export function janela(agora: number = Date.now()): EstadoJanela {
  if (agora < Date.parse(TESTE8_INICIO)) return 'antes';
  if (agora > Date.parse(TESTE8_FIM)) return 'encerrado';
  return 'aberto';
}
const semAcento = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
/** Grafia aproximada de uma palavra do nome: Isabella = Isabela, Kayky = Kaiki, Thalya = Talia, Raphael = Rafael. */
export function palavraAproximada(p: string): string {
  return p.replace(/ph/g, 'f').replace(/k/g, 'c').replace(/w/g, 'u').replace(/y/g, 'i').replace(/(?!^)h/g, '').replace(/(.)\1+/g, '$1');
}
const LIGACOES = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
/** Palavras do nome sem "da/de/dos" e com a grafia aproximada. */
export const palavrasDoNome = (nome: string) => semAcento(nome).split(' ').filter(p => p && !LIGACOES.has(p)).map(palavraAproximada);

/**
 * O aluno pode fazer o teste? Com lista: o cadastro precisa ter primeiro nome + um sobrenome de alguém da lista
 * (sobrenome cortado na lista com "…" vale pelo começo). Sem lista: qualquer aluno do 8º ano.
 */
export function alunoAutorizado(nomes: Array<string | undefined>, serie: string | null, lista: string[] = TESTE8_ALUNOS): boolean {
  if (lista.length === 0) return serie === '8';
  return nomes.some(n => !!n && alunoNaLista(n, lista));
}
export function alunoNaLista(nome: string, lista: string[] = TESTE8_ALUNOS): boolean {
  const digitado = palavrasDoNome(nome);
  if (digitado.length < 2) return false; // cadastro mínimo: nome e sobrenome
  return lista.some(item => {
    const cortado = item.trim().endsWith('…');
    const lp = palavrasDoNome(item.replace('…', ''));
    if (lp[0] !== digitado[0]) return false;
    const resto = lp.slice(1);
    const ultimo = resto.length - 1;
    return digitado.slice(1).some(p => resto.some((s, i) => p === s || (cortado && i === ultimo && p.startsWith(s))));
  });
}
/** Resposta igual à esperada (montar a frase: ordem das palavras). */
export function respostaCerta(p: Pergunta, resposta: string | boolean | string[]): boolean {
  if (p.tipo === 'escolha' || p.tipo === 'dados') return resposta === p.certa;
  if (p.tipo === 'certoErrado') return resposta === p.certo;
  return Array.isArray(resposta) && resposta.join(' ') === p.resposta.join(' ');
}

// ---------------------------------------------------------------- área do professor
export interface LinhaTeste8 { alunoId: string; acessos: number; pontos: number; melhorFase: number; ultimo: string; dias: Record<string, number> }
/**
 * Soma os acessos do teste a partir das linhas de resultado da planilha.
 * Vale o melhor resultado de cada dia (se a planilha guardar várias linhas do mesmo dia, conta uma só).
 */
export function somarTeste8(resultados: Array<Record<string, unknown>>): Map<string, LinhaTeste8> {
  const porAluno = new Map<string, LinhaTeste8>();
  for (const r of resultados) {
    const atividade = String(r.atividade ?? r.activity ?? '');
    if (!atividade.startsWith(PREFIXO_TESTE8)) continue;
    const id = String(r.jogadorId ?? r.playerId ?? r.jogador_id ?? '');
    if (!id) continue;
    const dia = atividade.slice(PREFIXO_TESTE8.length);
    const pontos = Number(r.pontos ?? r.score) || 0;
    let det: Record<string, unknown> = {};
    try { det = typeof r.detalhes === 'string' ? JSON.parse(r.detalhes) : ((r.detalhes as Record<string, unknown>) ?? {}); } catch { det = {}; }
    const fase = Number(det.fase) || 0;
    const quando = String(r.concluido_em ?? r.atualizado_em ?? det.fim ?? dia);
    const l = porAluno.get(id) ?? { alunoId: id, acessos: 0, pontos: 0, melhorFase: 0, ultimo: '', dias: {} };
    l.dias[dia] = Math.max(l.dias[dia] ?? 0, pontos);
    l.melhorFase = Math.max(l.melhorFase, fase);
    if (quando > l.ultimo) l.ultimo = quando;
    porAluno.set(id, l);
  }
  for (const l of porAluno.values()) {
    l.acessos = Object.keys(l.dias).length;
    l.pontos = Object.values(l.dias).reduce((t, v) => t + v, 0);
  }
  return porAluno;
}
