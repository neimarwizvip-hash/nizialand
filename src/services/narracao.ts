// Narração das HQs e balões: fala uma sequência de trechos (pt-BR e en-US), cada um com a voz do personagem.
// Regra do projeto: nada de música por baixo de narração — a trilha do jogo é segurada enquanto alguém fala.
import { audioService } from './audio';

export type Idioma = 'pt-BR' | 'en-US';
export interface Trecho { texto: string; idioma?: Idioma; pitch?: number; rate?: number }

// Vozes dos personagens das histórias (Web Speech: tom e velocidade).
export const VOZES = {
  narrador: { pitch: 1.0, rate: 0.95 },
  marcio: { pitch: 0.85, rate: 1.0 },
  leia: { pitch: 1.1, rate: 0.98 },
  edilene: { pitch: 1.1, rate: 0.98 },
  vania: { pitch: 1.05, rate: 1.05 },
  rosana: { pitch: 1.15, rate: 1.0 },
  mane: { pitch: 1.35, rate: 1.15 },
  ze: { pitch: 1.4, rate: 1.1 },
  colega: { pitch: 1.25, rate: 1.0 },
} as const;
export type NomeVoz = keyof typeof VOZES;

export const narracaoDisponivel = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

function escolherVoz(idioma: Idioma): SpeechSynthesisVoice | undefined {
  const vozes = window.speechSynthesis.getVoices();
  const alvo = idioma.toLowerCase();
  return vozes.find(v => v.lang.replace('_', '-').toLowerCase() === alvo) ?? vozes.find(v => v.lang.toLowerCase().startsWith(alvo.slice(0, 2)));
}

/**
 * Fala os trechos em sequência. Devolve uma função que interrompe.
 * `onFim(true)` quando terminou de falar tudo; `onFim(false)` quando foi interrompida ou não há voz.
 */
export function narrar(trechos: Trecho[], onFim?: (completa: boolean) => void): () => void {
  const lista = trechos.filter(t => t.texto.trim());
  if (!narracaoDisponivel() || !audioService.isSoundOn() || lista.length === 0) {
    // Sem voz: avisa no próximo ciclo para o chamador manter o ritmo pelo relógio.
    const id = window.setTimeout(() => onFim?.(false), 0);
    return () => window.clearTimeout(id);
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  audioService.holdMusicForStory();
  let ativo = true;
  let i = 0;
  const encerrar = (completa: boolean) => {
    if (!ativo) return;
    ativo = false;
    audioService.releaseMusicForStory();
    onFim?.(completa);
  };
  const proximo = () => {
    if (!ativo) return;
    if (i >= lista.length) { encerrar(true); return; }
    const t = lista[i++];
    const u = new SpeechSynthesisUtterance(t.texto);
    u.lang = t.idioma ?? 'pt-BR';
    u.pitch = t.pitch ?? 1;
    u.rate = u.lang === 'en-US' ? Math.min(t.rate ?? 1, 0.95) : t.rate ?? 1;
    const voz = escolherVoz(u.lang as Idioma);
    if (voz) u.voice = voz;
    u.onend = proximo;
    u.onerror = proximo;
    synth.speak(u);
  };
  proximo();
  return () => { if (!ativo) return; synth.cancel(); encerrar(false); };
}

// Tempo mínimo de leitura de um texto (protege aparelhos sem voz instalada, em que a fala "termina" na hora).
export const tempoDeLeitura = (texto: string) => Math.min(6000, Math.max(2500, texto.length * 55));

// Monta os trechos de uma fala bilíngue com a voz do personagem.
export function trechosDaFala(voz: NomeVoz, pt: string, en?: string): Trecho[] {
  const v = VOZES[voz];
  return [{ texto: pt, idioma: 'pt-BR', ...v }, ...(en ? [{ texto: en, idioma: 'en-US' as Idioma, ...v }] : [])];
}
