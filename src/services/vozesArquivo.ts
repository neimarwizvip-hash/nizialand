// Falas gravadas (arquivos mp3 gerados no computador com o Phonon). Funções puras, usadas pelo jogo e pelo script
// que gera os áudios (scripts/vozes/exportar-falas.ts): os dois lados calculam a mesma chave para a mesma fala.

export const PASTA_VOZES = '/assets/vozes/';
export type IdiomaFala = 'pt-BR' | 'en-US';

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Espaços e pontuação normalizados (a chave não muda por um espaço a mais). */
export const normalizarTexto = (t: string) => t.normalize('NFC').replace(/\s+/g, ' ').replace(/\s+([,.!?:;])/g, '$1').trim();

/**
 * Tira o nome do aluno da fala falada (o balão continua mostrando o nome).
 * "Olá, Ana! Eu sou…" → "Olá! Eu sou…"; "Ana, venha" → "Venha"; "Mandou bem, Ana." → "Mandou bem."
 */
export function limparNome(texto: string, nomes: Array<string | undefined | null>): string {
  let t = texto;
  for (const bruto of nomes) {
    const n = bruto?.trim();
    if (!n) continue;
    const e = escapar(n);
    t = t.replace(new RegExp(`,\\s*${e}(?=\\s*[!?.:;,]|\\s*$)`, 'g'), '');
    t = t.replace(new RegExp(`(^|[.!?]\\s+)${e},\\s*(\\S)`, 'g'), (_m, p: string, c: string) => p + c.toUpperCase());
    t = t.replace(new RegExp(`\\s+${e}(?=[\\s!?.,:;]|$)`, 'g'), '');
  }
  return normalizarTexto(t);
}

/** Chave da fala: FNV-1a (32 bits) de "idioma|voz|texto". O arquivo é `<chave>.mp3`. */
export function chaveFala(idioma: IdiomaFala, voz: string, texto: string): string {
  const bytes = new TextEncoder().encode(`${idioma}|${voz}|${normalizarTexto(texto)}`);
  let h = 0x811c9dc5;
  for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
