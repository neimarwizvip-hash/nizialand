import React from 'react';

// Ícones próprios do NISIALAND (Fase 0): traço 2 px, cantos redondos, duas cores (tinta + preenchimento).
// Uso: <Icone nome="lupa" className="w-6 h-6" />. Cor do traço = currentColor; o preenchimento usa `cor`.

export type NomeIcone =
  | 'lupa' | 'relogio' | 'estrela' | 'moeda' | 'carta' | 'medalha' | 'som' | 'som-mudo' | 'musica'
  | 'mapa' | 'escudo' | 'cadeado' | 'check' | 'x' | 'seta' | 'jogar' | 'sair' | 'trofeu' | 'escola'
  | 'livro' | 'orelha' | 'balao' | 'pessoas' | 'bussola' | 'cadeira' | 'corrente' | 'calendario'
  | 'tijolo' | 'chapeu' | 'controle' | 'tela-cheia' | 'dica' | 'fogo' | 'olho' | 'casa' | 'professor'
  | 'bandeira' | 'coroa' | 'chave' | 'termo' | 'paleta' | 'coracao';

interface Props extends React.SVGProps<SVGSVGElement> {
  nome: NomeIcone;
  cor?: string; // preenchimento (padrão: amarelo-sol)
  titulo?: string;
}

const SOL = '#FFD23F';

const DESENHOS: Record<NomeIcone, (cor: string) => React.ReactNode> = {
  lupa: cor => (<><circle cx="10" cy="10" r="6" fill={cor} /><circle cx="10" cy="10" r="6" /><path d="M14.5 14.5 20 20" strokeWidth="3" /></>),
  relogio: cor => (<><circle cx="12" cy="13" r="8" fill={cor} /><circle cx="12" cy="13" r="8" /><path d="M12 8v5l3 2" /><path d="M9 3h6M12 3v2" /></>),
  estrela: cor => (<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z" fill={cor} strokeLinejoin="round" />),
  moeda: cor => (<><ellipse cx="12" cy="12" rx="8.5" ry="8.5" fill={cor} /><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" fill="none" strokeOpacity="0.5" /><path d="M12 8.5v7M10 10.5h3a1.5 1.5 0 010 3h-3" /></>),
  carta: cor => (<><rect x="5" y="3" width="14" height="18" rx="2.5" fill="#fff" /><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M12 9.5c1.5-2.5 5-1 3.5 2L12 15l-3.5-3.5c-1.5-3 2-4.5 3.5-2z" fill={cor === SOL ? '#E5484D' : cor} stroke="none" /></>),
  medalha: cor => (<><path d="M8 3h3l1 4 1-4h3l-2 7H10z" fill="#1F5FD0" stroke="none" /><circle cx="12" cy="15" r="6" fill={cor} /><circle cx="12" cy="15" r="6" /><path d="M12 12.2l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff" stroke="none" /></>),
  som: cor => (<><path d="M4 10v4h3l4 3.5v-11L7 10z" fill={cor} /><path d="M4 10v4h3l4 3.5v-11L7 10z" /><path d="M15 9.5a3.5 3.5 0 010 5M17.5 7a7 7 0 010 10" /></>),
  'som-mudo': cor => (<><path d="M4 10v4h3l4 3.5v-11L7 10z" fill={cor} /><path d="M4 10v4h3l4 3.5v-11L7 10z" /><path d="M15 9.5l5 5M20 9.5l-5 5" /></>),
  musica: cor => (<><circle cx="7" cy="17" r="3" fill={cor} /><circle cx="17" cy="15" r="3" fill={cor} /><circle cx="7" cy="17" r="3" /><circle cx="17" cy="15" r="3" /><path d="M10 17V6l10-2v11" /></>),
  mapa: cor => (<><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill={cor} /><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>),
  escudo: cor => (<><path d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6z" fill={cor} /><path d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6z" /></>),
  cadeado: cor => (<><rect x="5" y="10" width="14" height="10" rx="2.5" fill={cor} /><rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7a4 4 0 018 0v3" /><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" /></>),
  check: cor => (<><circle cx="12" cy="12" r="9" fill={cor === SOL ? '#3FA34D' : cor} /><circle cx="12" cy="12" r="9" /><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth="2.5" /></>),
  x: cor => (<><circle cx="12" cy="12" r="9" fill={cor === SOL ? '#E5484D' : cor} /><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" stroke="#fff" strokeWidth="2.5" /></>),
  seta: () => (<path d="M5 12h13M13 6l6 6-6 6" strokeWidth="2.5" />),
  jogar: cor => (<><path d="M7 4.5v15l12-7.5z" fill={cor} /><path d="M7 4.5v15l12-7.5z" strokeLinejoin="round" /></>),
  sair: () => (<><path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" /><path d="M14 8l4 4-4 4M9 12h9" /></>),
  trofeu: cor => (<><path d="M7 4h10v5a5 5 0 01-10 0z" fill={cor} /><path d="M7 4h10v5a5 5 0 01-10 0z" /><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3" /><path d="M12 14v3M8 20h8M10 17h4v3h-4z" fill="#C98A4B" /></>),
  escola: cor => (<><path d="M3 20V10l9-6 9 6v10z" fill={cor} /><path d="M3 20V10l9-6 9 6v10z" /><path d="M10 20v-5h4v5M7 13h2M15 13h2" /></>),
  livro: cor => (<><path d="M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v12a2 2 0 012-2h6z" fill={cor} /><path d="M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v12a2 2 0 012-2h6z" /></>),
  orelha: cor => (<><path d="M7 10a5 5 0 0110 0c0 3-2.5 4-2.5 6.5a2.5 2.5 0 01-5 0" fill={cor} /><path d="M7 10a5 5 0 0110 0c0 3-2.5 4-2.5 6.5a2.5 2.5 0 01-5 0" /><path d="M10.5 10a1.5 1.5 0 013 0c0 1.5-1.5 1.5-1.5 3" /></>),
  balao: cor => (<><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4 4v-4H6a2 2 0 01-2-2z" fill={cor} /><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4 4v-4H6a2 2 0 01-2-2z" /><path d="M8 9h8M8 12h5" /></>),
  pessoas: cor => (<><circle cx="9" cy="8" r="3" fill={cor} /><circle cx="16" cy="9" r="2.5" fill={cor} /><circle cx="9" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" /><path d="M3.5 19a5.5 5.5 0 0111 0zM14.5 19a4 4 0 017-1" /></>),
  bussola: cor => (<><circle cx="12" cy="12" r="9" fill={cor} /><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#E5484D" stroke="none" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>),
  cadeira: cor => (<><path d="M7 4h8v8H7z" fill={cor} /><path d="M7 4h8v8H7z" /><path d="M5 12h14v3H5zM6 15v5M18 15v5M9 15v5M15 15v5" /></>),
  corrente: cor => (<><rect x="3" y="9" width="9" height="6" rx="3" fill={cor} /><rect x="12" y="9" width="9" height="6" rx="3" fill={cor} /><rect x="3" y="9" width="9" height="6" rx="3" /><rect x="12" y="9" width="9" height="6" rx="3" /></>),
  calendario: cor => (<><rect x="4" y="5" width="16" height="15" rx="2.5" fill="#fff" /><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 9h16" /><path d="M8 3v4M16 3v4" /><rect x="7" y="12" width="3" height="3" fill={cor} stroke="none" /><rect x="13" y="12" width="4" height="3" fill={cor} stroke="none" /></>),
  tijolo: cor => (<><rect x="3" y="6" width="8" height="5" fill={cor} /><rect x="13" y="6" width="8" height="5" fill={cor} /><rect x="8" y="13" width="8" height="5" fill={cor} /><rect x="3" y="6" width="8" height="5" /><rect x="13" y="6" width="8" height="5" /><rect x="8" y="13" width="8" height="5" /><path d="M3 13h3v5H3zM18 13h3v5h-3z" /></>),
  chapeu: cor => (<><path d="M3 10l9-4 9 4-9 4z" fill={cor} /><path d="M3 10l9-4 9 4-9 4z" strokeLinejoin="round" /><path d="M7 12v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4M21 10v5" /></>),
  controle: cor => (<><rect x="2" y="8" width="20" height="10" rx="5" fill={cor} /><rect x="2" y="8" width="20" height="10" rx="5" /><path d="M7 11v4M5 13h4" /><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="18.5" cy="14" r="1" fill="currentColor" stroke="none" /></>),
  'tela-cheia': () => (<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />),
  dica: cor => (<><path d="M9 15a5.5 5.5 0 116 0v2H9z" fill={cor} /><path d="M9 15a5.5 5.5 0 116 0v2H9z" /><path d="M9.5 20h5" /></>),
  fogo: cor => (<><path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 01-8 0c0-1.5.5-2.5 1.5-3.5.5 1 1 1.5 1.5 1.5 0-2.5 0-4.5 1-6.5z" fill={cor === SOL ? '#F2811D' : cor} /><path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 01-8 0c0-1.5.5-2.5 1.5-3.5.5 1 1 1.5 1.5 1.5 0-2.5 0-4.5 1-6.5z" strokeLinejoin="round" /><path d="M6 20h12" /></>),
  olho: cor => (<><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="#fff" /><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="3" fill={cor === SOL ? '#1F5FD0' : cor} /></>),
  casa: cor => (<><path d="M4 11l8-7 8 7v9H4z" fill={cor} /><path d="M4 11l8-7 8 7v9H4z" strokeLinejoin="round" /><path d="M10 20v-6h4v6" /></>),
  professor: cor => (<><circle cx="12" cy="8" r="3.5" fill={cor} /><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0114 0z" fill={cor} /><path d="M5 20a7 7 0 0114 0z" /><path d="M8.5 5.5L12 4l3.5 1.5" /></>),
  bandeira: cor => (<><path d="M6 4v17" strokeWidth="2.5" /><path d="M6 4h12l-3 4.5 3 4.5H6z" fill={cor === SOL ? '#E5484D' : cor} /><path d="M6 4h12l-3 4.5 3 4.5H6z" strokeLinejoin="round" /></>),
  coroa: cor => (<><path d="M4 17l-1-9 5 4 4-7 4 7 5-4-1 9z" fill={cor} strokeLinejoin="round" /><path d="M4 17h16v3H4z" fill={cor} /><circle cx="12" cy="13" r="1.5" fill="#E5484D" stroke="none" /></>),
  chave: cor => (<><circle cx="8" cy="14" r="4.5" fill={cor} /><circle cx="8" cy="14" r="4.5" /><path d="M11.5 11L20 2.5M17 5.5l2.5 2.5M14.5 8l2.5 2.5" /></>),
  termo: cor => (<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" fill="#fff" /><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" strokeLinejoin="round" /><path d="M9 8h6M9 11.5h6M9 15h4" /><circle cx="15.5" cy="16" r="2" fill={cor} stroke="none" /></>),
  paleta: cor => (<><path d="M12 3a9 9 0 100 18c1.7 0 2-1 2-2 0-1.2-1-1.6-1-2.6 0-1 .8-1.4 2-1.4h2a4 4 0 004-4c0-4.4-4-8-9-8z" fill={cor} /><path d="M12 3a9 9 0 100 18c1.7 0 2-1 2-2 0-1.2-1-1.6-1-2.6 0-1 .8-1.4 2-1.4h2a4 4 0 004-4c0-4.4-4-8-9-8z" /><circle cx="8" cy="10" r="1.3" fill="#E5484D" stroke="none" /><circle cx="12" cy="7.5" r="1.3" fill="#1F5FD0" stroke="none" /><circle cx="16" cy="10" r="1.3" fill="#3FA34D" stroke="none" /></>),
  coracao: cor => (<path d="M12 20s-7-4.4-8.5-8.6C2.3 8 4.5 5 7.5 5c1.8 0 3.2 1 4.5 2.6C13.3 6 14.7 5 16.5 5c3 0 5.2 3 4 6.4C19 15.6 12 20 12 20z" fill={cor === SOL ? '#E5484D' : cor} strokeLinejoin="round" />),
};

export const Icone: React.FC<Props> = ({ nome, cor = SOL, titulo, className = 'w-6 h-6', ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role={titulo ? 'img' : undefined}
    aria-hidden={titulo ? undefined : true}
    {...rest}
  >
    {titulo && <title>{titulo}</title>}
    {DESENHOS[nome](cor)}
  </svg>
);

// Ícone de cada nível no mapa (0 a 10), na ordem do plano dos níveis.
export const ICONE_NIVEL: NomeIcone[] = ['controle', 'livro', 'escola', 'cadeira', 'pessoas', 'bussola', 'corrente', 'calendario', 'tijolo', 'trofeu', 'chapeu'];
