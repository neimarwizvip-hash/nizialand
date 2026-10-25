import type { Activity, Level, Mission } from '../core/types';
const R=(id:string)=>`/nivel6/consequencias?atividade=nivel6-${id}`;
const a=(id:string,mechanic:Activity['mechanic'],name:string,phrase:string,color:Activity['color']):Activity=>({id:`nivel6-${id}`,mechanic,name,phrase,path:R(id),color});
export const LEVEL6_ACTIVITIES=[a('causa','quiz','Causa e efeito','Ligue a ação ao resultado.','blue'),a('final','order','Reescreva o final','Escolha um final responsável.','purple'),a('linha','explore','Linha do tempo','Organize o que aconteceu.','green'),a('entrevista','dialogue','Entrevista com um colega','Pergunte e responda com respeito.','orange'),a('tetris','order','Tetris de palavras','Encaixe a frase correta.','yellow'),a('malentendido','dialogue','Conserte o mal-entendido','Escolha uma resposta clara.','pink'),a('revisao','quiz','Revisão das consequências','Revise os Níveis 0 a 5.','purple')];
export const LEVEL6_MISSION:Mission={id:'nivel6-missao6',number:6,title:'Consequências',activities:LEVEL6_ACTIVITIES,sequential:true};
export const LEVEL6:Level={id:'nivel6',number:6,title:'Consequências',story:'nivel6',mode:'2D',mission:LEVEL6_MISSION};
