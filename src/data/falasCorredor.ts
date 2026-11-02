// Falas do narrador nos corredores 3D dos Níveis 3 e 4 (gravadas com a voz do narrador; ver scripts/vozes).
export const PORTAS_N3 = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Revisão'];
// Nível 4 (área externa e quadra): os pontos da missão ao ar livre.
export const PORTAS_N4 = ['Portão', 'Horta', 'Arquibancada', 'Mural externo', 'Quadra', 'Pátio coberto'] as const;

export type EstadoPorta = 'locked' | 'open' | 'done';
export const falaDaPorta = (rotulo: string, nome: string, estado: EstadoPorta) =>
  estado === 'locked' ? `${rotulo}, ${nome}: trancada. Termine a sala anterior.`
    : estado === 'done' ? `${rotulo}, ${nome}: concluída. Aperte Enter para jogar de novo.`
      : `${rotulo}, ${nome}. Aperte Enter para entrar.`;

export const AVISOS_CORREDOR = {
  acabamento: 'Parte do acabamento não carregou. O corredor continua funcionando.',
  sombras: 'Desliguei as sombras para manter o movimento fluido. Para religar, abra a Ajuda com a tecla H.',
  economicoAuto: 'Mudei para o modo econômico para manter o movimento fluido. Para voltar, use o botão de qualidade ou a tecla Q.',
  alta: 'Qualidade alta: texturas detalhadas, sombras suaves e cantos sombreados.',
  economico: 'Modo econômico: menos dados, menos bateria e movimento mais leve.',
  contrasteOn: 'Alto contraste ligado.',
  contrasteOff: 'Alto contraste desligado.',
  calmoOn: 'Modo calmo ligado.',
  calmoOff: 'Modo calmo desligado.',
} as const;
