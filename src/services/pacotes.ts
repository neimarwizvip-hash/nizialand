// Carregamento por fase: baixa o pacote de um nível (telas, imagens, texturas 3D e vozes) e o guarda no aparelho.
// O service worker (public/sw.js, gerado no build) é quem guarda; aqui só pedimos os arquivos e medimos o progresso.
// Sem service worker (ou no `npm run dev`), nada é feito: o jogo carrega normalmente pela rede.

export interface Pacotes { versao: string; niveis: Record<string, string[]> }
export type Progresso = { feitos: number; total: number };

let lista: Promise<Pacotes | null> | null = null;
export function carregarPacotes(): Promise<Pacotes | null> {
  if (!lista) {
    lista = (typeof fetch === 'undefined' ? Promise.resolve(null) : fetch('/pacotes.json', { cache: 'no-cache' })
      .then(r => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : null))
      .catch(() => null));
  }
  return lista;
}

const chave = (nivel: number) => `nisialand_pacote_${nivel}`;
export function nivelGuardado(nivel: number, versao: string): boolean {
  try { return localStorage.getItem(chave(nivel)) === versao; } catch { return false; }
}
const marcar = (nivel: number, versao: string) => { try { localStorage.setItem(chave(nivel), versao); } catch { /* segue */ } };

const emAndamento = new Map<number, Promise<boolean>>();
/** Baixa o pacote do nível (4 arquivos por vez). Devolve true quando tudo ficou guardado. */
export function baixarNivel(nivel: number, aoProgredir?: (p: Progresso) => void): Promise<boolean> {
  const atual = emAndamento.get(nivel);
  if (atual) return atual;
  const tarefa = (async () => {
    const pac = await carregarPacotes();
    const urls = pac?.niveis[String(nivel)];
    if (!pac || !urls?.length || !('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
    if (nivelGuardado(nivel, pac.versao)) { aoProgredir?.({ feitos: urls.length, total: urls.length }); return true; }
    let feitos = 0, falhas = 0, i = 0;
    const proximo = async (): Promise<void> => {
      while (i < urls.length) {
        const u = urls[i++];
        try { const r = await fetch(u); if (!r.ok) falhas++; else await r.arrayBuffer(); } catch { falhas++; }
        feitos++; aoProgredir?.({ feitos, total: urls.length });
      }
    };
    await Promise.all([proximo(), proximo(), proximo(), proximo()]);
    if (!falhas) marcar(nivel, pac.versao);
    return !falhas;
  })().finally(() => emAndamento.delete(nivel));
  emAndamento.set(nivel, tarefa);
  return tarefa;
}

/** Registra o service worker (só na versão publicada). */
export function registrarGuardaNoAparelho() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
}
