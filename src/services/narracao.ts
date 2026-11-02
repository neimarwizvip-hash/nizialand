// Narração das HQs e balões: fala uma sequência de trechos (pt-BR e en-US), cada um com a voz do personagem.
// Primeiro tenta a fala GRAVADA (mp3 gerado no computador com o Phonon, sempre a mesma voz do personagem);
// só se o arquivo não existir usa a voz do navegador.
// Regra do projeto: nada de música por baixo de narração — a trilha do jogo é segurada enquanto alguém fala.
import { audioService } from './audio';
import { ELENCO, type Personagem } from '../data/elenco';
import { PASTA_VOZES, chaveFala, limparNome } from './vozesArquivo';

export type Idioma = 'pt-BR' | 'en-US';
export interface Trecho { texto: string; idioma?: Idioma; pitch?: number; rate?: number; personagem?: NomeVoz }

// Tom e velocidade de cada personagem quando a fala cai na voz do navegador (sem arquivo gravado).
export const VOZES: Record<Personagem, { pitch: number; rate: number }> = {
  narrador: { pitch: 1.0, rate: 0.95 },
  marcio: { pitch: 0.85, rate: 1.0 },
  leia: { pitch: 1.1, rate: 0.98 },
  vania: { pitch: 1.05, rate: 1.05 },
  rosana: { pitch: 1.15, rate: 1.0 },
  mane: { pitch: 1.35, rate: 1.15 },
  ze: { pitch: 1.4, rate: 1.1 },
  colega: { pitch: 1.25, rate: 1.0 },
  colegaM: { pitch: 1.1, rate: 1.0 },
  professora: { pitch: 1.05, rate: 0.95 },
};
export type NomeVoz = Personagem;

const vozDoNavegador = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
export const narracaoDisponivel = () => vozDoNavegador() || (typeof window !== 'undefined' && typeof Audio !== 'undefined');

// ---------- Falas gravadas ----------
let indice: Promise<Set<string>> | null = null;
function carregarIndice(): Promise<Set<string>> {
  if (!indice) {
    indice = (typeof fetch === 'undefined'
      ? Promise.resolve([] as string[])
      : fetch(PASTA_VOZES + 'indice.json').then(r => (r.ok ? r.json() : [])).catch(() => []))
      .then((lista: unknown) => new Set(Array.isArray(lista) ? (lista as string[]) : []));
  }
  return indice;
}
const nomeDoAluno = (): string | undefined => {
  try {
    const p = JSON.parse(localStorage.getItem('nisialand_current_player') || 'null');
    return p?.displayName || p?.name || undefined;
  } catch { return undefined; }
};
async function arquivoDaFala(t: Trecho): Promise<string | null> {
  if (!t.personagem || typeof Audio === 'undefined') return null;
  const idioma = t.idioma ?? 'pt-BR';
  const elenco = ELENCO[t.personagem];
  if (!elenco) return null;
  const voz = idioma === 'en-US' ? elenco.en : elenco.pt;
  const texto = limparNome(t.texto, [nomeDoAluno(), 'estudante']);
  const chave = chaveFala(idioma, voz, texto);
  return (await carregarIndice()).has(chave) ? `${PASTA_VOZES}${chave}.mp3` : null;
}

function escolherVoz(idioma: Idioma): SpeechSynthesisVoice | undefined {
  const vozes = window.speechSynthesis.getVoices();
  const alvo = idioma.toLowerCase();
  return vozes.find(v => v.lang.replace('_', '-').toLowerCase() === alvo) ?? vozes.find(v => v.lang.toLowerCase().startsWith(alvo.slice(0, 2)));
}

/**
 * Fala os trechos em sequência. Devolve uma função que interrompe.
 * `onFim(true)` quando falou tudo; `onFim(false)` quando foi interrompida ou não havia como falar.
 */
export function narrar(trechos: Trecho[], onFim?: (completa: boolean) => void): () => void {
  const lista = trechos.filter(t => t.texto.trim());
  if (!narracaoDisponivel() || !audioService.isSoundOn() || lista.length === 0) {
    // Sem voz: avisa no próximo ciclo para o chamador manter o ritmo pelo relógio.
    const id = window.setTimeout(() => onFim?.(false), 0);
    return () => window.clearTimeout(id);
  }
  const synth = vozDoNavegador() ? window.speechSynthesis : null;
  synth?.cancel();
  audioService.holdMusicForStory();
  let ativo = true;
  let falou = false;
  let i = 0;
  let audioAtual: HTMLAudioElement | null = null;
  const encerrar = (completa: boolean) => {
    if (!ativo) return;
    ativo = false;
    audioService.releaseMusicForStory();
    onFim?.(completa && falou);
  };
  const falarNoNavegador = (t: Trecho) => {
    if (!ativo) return;
    if (!synth) { proximo(); return; }
    const u = new SpeechSynthesisUtterance(t.texto);
    const v = t.personagem ? VOZES[t.personagem] : undefined;
    u.lang = t.idioma ?? 'pt-BR';
    u.pitch = t.pitch ?? v?.pitch ?? 1;
    const rate = t.rate ?? v?.rate ?? 1;
    u.rate = u.lang === 'en-US' ? Math.min(rate, 0.95) : rate;
    const voz = escolherVoz(u.lang as Idioma);
    if (voz) u.voice = voz;
    u.onend = () => { falou = true; proximo(); };
    u.onerror = () => proximo();
    synth.speak(u);
  };
  const proximo = () => {
    if (!ativo) return;
    if (i >= lista.length) { encerrar(true); return; }
    const t = lista[i++];
    arquivoDaFala(t).then(arquivo => {
      if (!ativo) return;
      if (!arquivo) { falarNoNavegador(t); return; }
      const a = new Audio(arquivo);
      audioAtual = a;
      a.onended = () => { falou = true; audioAtual = null; proximo(); };
      a.onerror = () => { audioAtual = null; falarNoNavegador(t); };
      a.play().catch(() => { audioAtual = null; falarNoNavegador(t); });
    });
  };
  proximo();
  return () => {
    if (!ativo) return;
    if (audioAtual) { audioAtual.pause(); audioAtual = null; }
    synth?.cancel();
    encerrar(false);
  };
}

// Tempo mínimo de leitura de um texto (protege aparelhos sem voz, em que a fala "termina" na hora).
export const tempoDeLeitura = (texto: string) => Math.min(6000, Math.max(2500, texto.length * 55));

// Monta os trechos de uma fala bilíngue com a voz do personagem.
export function trechosDaFala(voz: NomeVoz, pt: string, en?: string): Trecho[] {
  return [{ texto: pt, idioma: 'pt-BR', personagem: voz }, ...(en ? [{ texto: en, idioma: 'en-US' as Idioma, personagem: voz }] : [])];
}
