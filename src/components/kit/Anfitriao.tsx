import React from 'react';

// Anfitrião do nível: personagem oficial em pé + balão de HQ.
// Fase 0: uma imagem por personagem (a pose muda só o balão). Fase 1 acrescenta as poses apresenta/aprova/consola.
export type NomeAnfitriao = 'marcio' | 'leia' | 'vania' | 'rosana' | 'mane' | 'ze';
export type Pose = 'apresenta' | 'aprova' | 'consola';

export const ANFITRIOES: Record<NomeAnfitriao, { nome: string; cargo: string; src: string }> = {
  marcio: { nome: 'Diretor Márcio', cargo: 'Direção', src: '/assets/diretor_marcio_hd.png' },
  leia: { nome: 'Orientadora Leia', cargo: 'Orientação Educacional', src: '/assets/orientadora_leia.png' },
  vania: { nome: 'Coordenadora Vânia', cargo: 'Coordenação', src: '/assets/coordenadora_vania.png' },
  rosana: { nome: 'Professora Rosana', cargo: 'Professora', src: '/assets/rosana.png' },
  mane: { nome: 'Mané Zoeira', cargo: 'Colega', src: '/assets/mane_zoeira.png' },
  ze: { nome: 'Zé Cartinha', cargo: 'Distração', src: '/assets/ze_cartinha.png' },
};

export const BalaoFala: React.FC<{ texto: string; traducao?: string; lado?: 'esq' | 'dir'; className?: string }> = ({ texto, traducao, lado = 'esq', className = '' }) => (
  <div className={`kit-balao kit-balao--${lado} animate-balao-in max-w-xs ${className}`} role="note">
    <p className="text-base short:text-sm leading-snug">{texto}</p>
    {traducao && <p className="mt-1 text-sm short:text-xs text-nisia-tinta-suave font-medium leading-snug">{traducao}</p>}
  </div>
);

interface AnfitriaoProps {
  nome: NomeAnfitriao;
  pose?: Pose;
  fala?: string;
  traducao?: string;
  lado?: 'esq' | 'dir'; // em que lado da tela o personagem fica
  altura?: string; // classe Tailwind da altura da imagem
  className?: string;
}

export const Anfitriao: React.FC<AnfitriaoProps> = ({ nome, fala, traducao, lado = 'esq', altura = 'h-56 short:h-36', className = '' }) => {
  const a = ANFITRIOES[nome];
  return (
    <figure className={`relative flex flex-col ${lado === 'esq' ? 'items-start' : 'items-end'} gap-2 ${className}`}>
      {fala && <BalaoFala texto={fala} traducao={traducao} lado={lado} className="mb-3" />}
      <img
        src={a.src}
        alt={a.nome}
        draggable={false}
        className={`${altura} w-auto object-contain object-bottom select-none drop-shadow-[0_10px_12px_rgba(12,42,102,0.45)]`}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      <figcaption className="sr-only">{a.nome}, {a.cargo}</figcaption>
    </figure>
  );
};
