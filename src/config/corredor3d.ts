// Corredor 3D dos Níveis 3 e 4 (padrão Rota Piloto: patamares Alta e Econômico, texturas fotográficas
// PBR, céu que ilumina, sombras). Liberado para os alunos pelo professor em 01/11/2026.
// Com false, os níveis abrem no quadro de cartazes e o botão do 3D não aparece.
// Por aparelho: localStorage "nisialand_corredor3d" = "0" desliga e "1" liga (a vistoria tem o botão).
export const CORREDOR_3D_PADRAO = true;
export const CHAVE_CORREDOR_3D = 'nisialand_corredor3d';

function lerLiberacao(): boolean {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_CORREDOR_3D) : null;
    if (v === '1') return true;
    if (v === '0') return false;
  } catch { /* sem armazenamento: vale o padrão */ }
  return CORREDOR_3D_PADRAO;
}

export const CORREDOR_3D_LIBERADO = lerLiberacao();
