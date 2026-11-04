// Acesso do dia ao Teste do 8º ano: guardado neste aparelho (para retomar se a página fechar) e enviado à planilha.
import { storageService } from '../../services/storage';
import { idAtividadeDoDia, TESTE8_DURACAO_MS } from '../../data/teste8';

export interface AcessoTeste8 {
  atividade: string; // teste8-AAAA-MM-DD
  inicio: number;
  fim?: number; // preenchido quando o tempo acaba
  pontos: number;
  acertos: number;
  erros: number;
  fase: number; // fase em que está
  acertosNaFase: number;
  sequencia: number;
}

const chave = (alunoId: string, atividade: string) => `nisialand_${atividade}_${alunoId}`;

export function lerAcesso(alunoId: string, agora = Date.now()): AcessoTeste8 | null {
  try {
    const raw = localStorage.getItem(chave(alunoId, idAtividadeDoDia(agora)));
    return raw ? (JSON.parse(raw) as AcessoTeste8) : null;
  } catch {
    return null;
  }
}

export function gravarAcesso(alunoId: string, a: AcessoTeste8): void {
  try { localStorage.setItem(chave(alunoId, a.atividade), JSON.stringify(a)); } catch { /* sem armazenamento: segue na memória */ }
}

export function novoAcesso(agora = Date.now()): AcessoTeste8 {
  return { atividade: idAtividadeDoDia(agora), inicio: agora, pontos: 0, acertos: 0, erros: 0, fase: 1, acertosNaFase: 0, sequencia: 0 };
}

export const tempoRestante = (a: AcessoTeste8, agora = Date.now()) => Math.max(0, a.inicio + TESTE8_DURACAO_MS - agora);
export const acabou = (a: AcessoTeste8, agora = Date.now()) => !!a.fim || tempoRestante(a, agora) <= 0;

/** Manda o resultado do acesso para a planilha (a planilha guarda o melhor de cada dia; enviar de novo só atualiza). */
export function enviarAcesso(alunoId: string, a: AcessoTeste8): void {
  const estrelas = a.fase >= 6 ? 3 : a.fase >= 4 ? 2 : a.fase >= 2 ? 1 : 0;
  storageService.enviarResultado(alunoId, a.atividade, a.pontos, a.acertos, estrelas, {
    tipo: 'teste8-comparativos',
    fase: a.fase,
    erros: a.erros,
    inicio: new Date(a.inicio).toISOString(),
    fim: a.fim ? new Date(a.fim).toISOString() : null,
  });
}
