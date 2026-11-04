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

// ---------------------------------------------------------------- dados (respostas lógicas)
// Toda pergunta mostra dois cartões com dados reais ou plausíveis. A resposta certa precisa ser
// gramaticalmente certa E verdadeira para os dados: "The mouse is bigger than the elephant" é errada.

interface Adj {
  adj: string;
  sinal: 1 | -1; // 1 = quem tem MAIS do valor; -1 = quem tem MENOS (small, slow, cold...)
  comp?: string; // forma curta (bigger); sem comp = adjetivo longo (more/less)
  erro?: string; // erro comum de grafia (biger)
  irregular?: string[]; // erros típicos dos irregulares (gooder, more good...)
}
interface Escala {
  itens: Array<[string, number]> | (() => Array<[string, number]>);
  mostrar: (n: number) => string;
  adjs: Adj[];
  geravel?: boolean; // valores sorteados: dá para ter valores iguais (igualdade)
  faixa?: [number, number];
}

const PESSOAS = ['Ana', 'Bia', 'Leo', 'Tom', 'Duda', 'Caio', 'Malu', 'Davi', 'Lara', 'Enzo', 'Sofia', 'Theo', 'Nina', 'Rafa', 'Julia', 'Pedro', 'Maya', 'Gabriel'];
const COISAS = ['the backpack', 'the phone', 'the guitar', 'the skateboard', 'the speaker', 'the camera', 'the watch', 'the headphones'];
const curto = (adj: string, sinal: 1 | -1, comp: string, erro: string): Adj => ({ adj, sinal, comp, erro });
const longo = (adj: string, sinal: 1 | -1 = 1): Adj => ({ adj, sinal });
const mil = (n: number) => n.toLocaleString('pt-BR');

const ESCALAS: Escala[] = [
  // pessoas (valores sorteados)
  { geravel: true, faixa: [145, 185], itens: () => PESSOAS.map(p => [p, 0] as [string, number]), mostrar: n => `${(n / 100).toFixed(2).replace('.', ',')} m`,
    adjs: [curto('tall', 1, 'taller', 'taler'), curto('short', -1, 'shorter', 'shortter')] },
  { geravel: true, faixa: [11, 16], itens: () => PESSOAS.map(p => [p, 0] as [string, number]), mostrar: n => `${n} years old`,
    adjs: [curto('old', 1, 'older', 'oldder'), curto('young', -1, 'younger', 'youngger')] },
  { geravel: true, faixa: [40, 900], itens: () => COISAS.map(c => [c, 0] as [string, number]), mostrar: n => `R$ ${mil(n)}`,
    adjs: [longo('expensive'), curto('cheap', -1, 'cheaper', 'cheapper')] },
  // animais
  { itens: [['the elephant', 6000], ['the horse', 500], ['the lion', 190], ['the dog', 30], ['the cat', 4], ['the rabbit', 2], ['the mouse', 0.03]], mostrar: n => `${mil(n)} kg`,
    adjs: [curto('heavy', 1, 'heavier', 'heavyer'), curto('big', 1, 'bigger', 'biger'), curto('light', -1, 'lighter', 'lightter'), curto('small', -1, 'smaller', 'smallier')] },
  { itens: [['the cheetah', 110], ['the lion', 80], ['the horse', 70], ['the rabbit', 56], ['the cat', 48], ['the dog', 45], ['the mouse', 13], ['the turtle', 1]], mostrar: n => `${n} km/h`,
    adjs: [curto('fast', 1, 'faster', 'fastter'), curto('slow', -1, 'slower', 'slowwer')] },
  { itens: [['the lion', 9], ['the elephant', 7], ['the cheetah', 6], ['the horse', 3], ['the dog', 2], ['the cat', 1], ['the rabbit', 0]], mostrar: n => `perigo ${n}/10`,
    adjs: [longo('dangerous'), curto('safe', -1, 'safer', 'safeer')] },
  // transportes
  { itens: [['the plane', 900], ['the train', 300], ['the car', 120], ['the motorcycle', 110], ['the bus', 80], ['the boat', 40], ['the bike', 20]], mostrar: n => `${n} km/h`,
    adjs: [curto('fast', 1, 'faster', 'fastter'), curto('slow', -1, 'slower', 'slowwer')] },
  { itens: [['the plane', 100000000], ['the train', 30000000], ['the bus', 800000], ['the boat', 500000], ['the car', 80000], ['the motorcycle', 15000], ['the bike', 1000]], mostrar: n => `R$ ${mil(n)}`,
    adjs: [longo('expensive'), curto('cheap', -1, 'cheaper', 'cheapper')] },
  { itens: [['the motorcycle', 9], ['the bike', 6], ['the car', 5], ['the bus', 3], ['the train', 2], ['the plane', 1]], mostrar: n => `risco ${n}/10`,
    adjs: [longo('dangerous'), curto('safe', -1, 'safer', 'safeer')] },
  // comida
  { itens: [['the soup', 70], ['the pizza', 60], ['the burger', 50], ['the sandwich', 25], ['the cake', 22], ['the salad', 15], ['the juice', 8], ['the ice cream', -5]], mostrar: n => `${n} °C`,
    adjs: [curto('hot', 1, 'hotter', 'hoter'), curto('cold', -1, 'colder', 'coldder')] },
  { itens: [['the salad', 10], ['the juice', 8], ['the soup', 7], ['the sandwich', 5], ['the pizza', 3], ['the burger', 2], ['the cake', 1]], mostrar: n => `saúde ${n}/10`,
    adjs: [curto('healthy', 1, 'healthier', 'healthyer')] },
  { itens: [['the cake', 10], ['the ice cream', 9], ['the juice', 6], ['the sandwich', 2], ['the pizza', 1], ['the salad', 0]], mostrar: n => `açúcar ${n}/10`,
    adjs: [curto('sweet', 1, 'sweeter', 'sweetter')] },
  // cidades
  { itens: [['São Paulo', 11.5], ['Rio', 6.2], ['Salvador', 2.4], ['Belo Horizonte', 2.3], ['Curitiba', 1.8], ['Duque de Caxias', 0.8]], mostrar: n => `${mil(n)} milhões de pessoas`,
    adjs: [curto('big', 1, 'bigger', 'biger'), curto('small', -1, 'smaller', 'smallier'), longo('crowded')] },
  { itens: [['Salvador', 26], ['Duque de Caxias', 25], ['Rio', 24], ['Belo Horizonte', 21], ['São Paulo', 19], ['Curitiba', 17]], mostrar: n => `média ${n} °C`,
    adjs: [curto('hot', 1, 'hotter', 'hoter'), curto('cold', -1, 'colder', 'coldder')] },
  // filmes, livros, jogos
  { itens: [['the series', 600], ['the book', 360], ['the movie', 120], ['the cartoon', 20], ['the song', 3]], mostrar: n => (n >= 60 ? `${n / 60} h` : `${n} min`),
    adjs: [curto('long', 1, 'longer', 'longger'), curto('short', -1, 'shorter', 'shortter')] },
  { itens: [['the video game', 250], ['the book', 60], ['the movie ticket', 30], ['the comic', 20]], mostrar: n => `R$ ${n}`,
    adjs: [longo('expensive'), curto('cheap', -1, 'cheaper', 'cheapper')] },
  // irregulares: avaliação de lugares (estrelas)
  { itens: [['the pizzeria', 5], ['the bakery', 4], ['the snack bar', 3], ['the cafeteria', 2], ['the food truck', 1]], mostrar: n => '★'.repeat(n) + '☆'.repeat(5 - n),
    adjs: [{ adj: 'good', sinal: 1, comp: 'better', irregular: ['gooder', 'more good', 'best', 'more better'] }, { adj: 'bad', sinal: -1, comp: 'worse', irregular: ['badder', 'more bad', 'worst', 'more worse'] }] },
];

// ---------------------------------------------------------------- perguntas
export interface Cartao { nome: string; valor: string }
export type Pergunta =
  | { tipo: 'escolha'; fase: number; cartoes: [Cartao, Cartao]; frase: string; dica: string; opcoes: string[]; certa: string; regra: string }
  | { tipo: 'certoErrado'; fase: number; cartoes: [Cartao, Cartao]; frase: string; certo: boolean; correcao: string; regra: string }
  | { tipo: 'montar'; fase: number; cartoes: [Cartao, Cartao]; dica: string; palavras: string[]; resposta: string[]; regra: string };

type Forma = 'sup' | 'igual' | 'naoIgual' | 'menos';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const MOLDES = ['{A} is ___ {B}.', 'Look at the data: {A} is ___ {B}.', 'According to the cards, {A} is ___ {B}.', 'So, {A} is ___ {B}.'];

function texto(forma: Forma, a: Adj): string {
  if (forma === 'sup') return a.comp ? `${a.comp} than` : `more ${a.adj} than`;
  if (forma === 'igual') return `as ${a.adj} as`;
  if (forma === 'naoIgual') return `not as ${a.adj} as`;
  return `less ${a.adj} than`;
}
/** Erros de forma (gramática). */
function errosDeForma(forma: Forma, a: Adj): string[] {
  const c = a.comp ?? `more ${a.adj}`;
  if (forma === 'sup') {
    if (a.irregular) return a.irregular.map(e => `${e} than`);
    if (a.comp) return [`more ${a.comp} than`, `${a.erro} than`, `more ${a.adj} than`, `${a.comp} that`, `the ${a.comp.replace(/er$/, 'est')}`];
    return [`${a.adj}er than`, `most ${a.adj} than`, `more ${a.adj}er than`, `more ${a.adj} that`];
  }
  if (forma === 'igual') return [`as ${c} as`, `as ${a.adj} than`, `so ${a.adj} than`, `${c} as`];
  if (forma === 'naoIgual') return [`not as ${c} as`, `not as ${a.adj} than`, `not ${a.adj} as`, `less ${c} than`];
  return [`less ${a.adj}er than`, `fewer ${a.adj} than`, `less ${a.adj} as`, `more less ${a.adj} than`];
}
const REGRA: Record<Forma, string> = {
  sup: 'Superioridade: adjetivo curto + -er than; longo: more + adjetivo + than (good → better, bad → worse).',
  igual: 'Valores iguais → igualdade: as + adjetivo + as.',
  naoIgual: 'O primeiro tem menos → not as + adjetivo + as.',
  menos: 'O primeiro tem menos → inferioridade: less + adjetivo + than (com adjetivo longo).',
};

interface Montagem { forma: Forma; a: Adj; A: string; B: string; cartoes: [Cartao, Cartao]; certa: string; logica: string; frase: string }

/** Sorteia uma comparação verdadeira para a forma pedida. */
function comparar(r: Sorteio, forma: Forma, soLongo = false): Montagem {
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const opcoesEscala = ESCALAS.filter(e => (forma !== 'igual' || e.geravel));
    const e = um(r, opcoesEscala);
    const adjsOk = e.adjs.filter(a =>
      forma === 'menos' ? !a.comp && a.sinal === 1
      : forma === 'sup' && soLongo ? (!a.comp || !!a.irregular)
      : forma === 'sup' ? !!a.comp && !a.irregular
      : a.sinal === 1 || forma === 'naoIgual');
    if (!adjsOk.length) continue;
    const a = um(r, adjsOk);
    let itens = typeof e.itens === 'function' ? e.itens() : e.itens;
    let [x, y] = dois(r, itens);
    if (e.geravel) {
      const base = e.faixa ?? [1, 100];
      const vx = base[0] + Math.floor(r() * (base[1] - base[0]));
      const dif = 1 + Math.floor(r() * (base[1] - base[0] > 10 ? 15 : 3));
      const vy = forma === 'igual' ? vx : vx + (r() < 0.5 ? dif : -dif);
      x = [x[0], vx]; y = [y[0], Math.min(base[1] + 2, Math.max(base[0] - 1, vy))];
      itens = [x, y];
    }
    if (forma !== 'igual' && x[1] === y[1]) continue;
    // quem vem primeiro: superioridade → quem tem mais do adjetivo; menos/naoIgual → quem tem menos
    const maisDoAdj = (p: [string, number], q: [string, number]) => (p[1] - q[1]) * a.sinal > 0;
    let A = x, B = y;
    if (forma === 'sup' && !maisDoAdj(A, B)) [A, B] = [B, A];
    if ((forma === 'menos' || forma === 'naoIgual') && maisDoAdj(A, B)) [A, B] = [B, A];
    const certa = texto(forma, a);
    // erro de lógica: a forma "oposta", certa na gramática mas falsa para os dados
    const logica = forma === 'sup' ? (a.comp ? `not as ${a.adj} as` : `less ${a.adj} than`) : forma === 'igual' ? texto('sup', a) : texto('sup', a);
    const frase = cap(um(r, MOLDES).replace('{A}', A[0]).replace('{B}', B[0]));
    const cartoes: [Cartao, Cartao] = [{ nome: cap(A[0]), valor: e.mostrar(A[1]) }, { nome: cap(B[0]), valor: e.mostrar(B[1]) }];
    // os cartões aparecem em ordem sorteada (a ordem não entrega a resposta)
    if (r() < 0.5) cartoes.reverse();
    return { forma, a, A: A[0], B: B[0], cartoes, certa, logica, frase };
  }
  throw new Error('sem comparação possível');
}

function formaDaFase(r: Sorteio, fase: number): { forma: Forma; soLongo: boolean } {
  if (fase === 1) return { forma: 'sup', soLongo: false };
  if (fase === 2) return { forma: 'sup', soLongo: true };
  if (fase === 3) return { forma: r() < 0.6 ? 'igual' : 'naoIgual', soLongo: false };
  if (fase === 4) return { forma: r() < 0.65 ? 'menos' : 'naoIgual', soLongo: false };
  return formaDaFase(r, um(r, [1, 2, 3, 4]));
}

function opcoesCom(r: Sorteio, certa: string, logica: string, erradas: string[]): string[] {
  const forma = embaralhar(r, [...new Set(erradas.filter(e => e !== certa && e !== logica))]).slice(0, 2);
  return embaralhar(r, [certa, logica, ...forma]);
}

function perguntaEscolha(r: Sorteio, fase: number): Pergunta {
  const { forma, soLongo } = formaDaFase(r, fase);
  const m = comparar(r, forma, soLongo);
  return { tipo: 'escolha', fase, cartoes: m.cartoes, frase: m.frase, dica: m.a.adj, opcoes: opcoesCom(r, m.certa, m.logica, errosDeForma(forma, m.a)), certa: m.certa, regra: REGRA[forma] };
}

function perguntaCertoErrado(r: Sorteio, fase: number): Pergunta {
  const { forma, soLongo } = formaDaFase(r, fase);
  const m = comparar(r, forma, soLongo);
  const certo = r() < 0.5;
  const usada = certo ? m.certa : r() < 0.5 ? m.logica : um(r, errosDeForma(forma, m.a));
  const regra = !certo && usada === m.logica ? `A gramática está certa, mas os dados dizem o contrário. ${REGRA[forma]}` : REGRA[forma];
  return { tipo: 'certoErrado', fase, cartoes: m.cartoes, frase: m.frase.replace('___', usada), certo, correcao: m.frase.replace('___', m.certa), regra };
}

function perguntaMontar(r: Sorteio, fase: number): Pergunta {
  const { forma, soLongo } = formaDaFase(r, fase);
  const m = comparar(r, forma, soLongo);
  const resposta = `${cap(m.A)} is ${m.certa} ${m.B}`.split(' ');
  const extra = um(r, ['more', 'that', 'most', 'as', 'less', 'than', 'the'].filter(w => !resposta.includes(w)));
  return { tipo: 'montar', fase, cartoes: m.cartoes, dica: m.a.adj, palavras: embaralhar(r, [...resposta, extra]), resposta, regra: REGRA[forma] };
}

/** Uma pergunta nova para a fase (o formato varia: escolher, certo ou errado, montar a frase). */
export function gerarPergunta(fase: number, r: Sorteio = Math.random): Pergunta {
  const f = Math.max(1, Math.min(fase, 6));
  const formatos: Array<(r: Sorteio, f: number) => Pergunta> =
    f <= 2 ? [perguntaEscolha, perguntaEscolha, perguntaCertoErrado, perguntaMontar]
    : [perguntaEscolha, perguntaCertoErrado, perguntaMontar];
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
  if (p.tipo === 'escolha') return resposta === p.certa;
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
