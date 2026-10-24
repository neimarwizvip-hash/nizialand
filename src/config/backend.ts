// Endereço da planilha (Google Apps Script) que guarda alunos, resultados e ranking.
// É o único lugar do código com essa URL.
export const PLANILHA_URL =
  'https://script.google.com/macros/s/AKfycbw4jIwoLMEjS4qavv8zhgLAschO3SQDAqjhiJ-x2WuFXEMTgZIj1muXm9zc48892obFeg/exec';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

// Nos testes automáticos a planilha fica desligada (nada sai para a internet);
// os testes do cliente ligam com um endereço falso.
export const backendConfig = {
  planilhaUrl: metaEnv.MODE === 'test' ? '' : PLANILHA_URL,
  timeoutMs: 15000,
};
