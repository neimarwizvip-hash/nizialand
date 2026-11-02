import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../../services/audio';
import { Icone } from './Icones';
import { narrar, trechosDaFala } from '../../services/narracao';

// Anfitrião do nível: personagem oficial em pé + balão de HQ que FALA (pt-BR e, em seguida, a frase em inglês).
// Fase 0/1: uma imagem por personagem (a pose muda só o balão). As falas vêm de src/data/falasAnfitrioes.ts (PROVISÓRIO).
export type NomeAnfitriao = 'marcio' | 'leia' | 'vania' | 'rosana' | 'mane' | 'ze';
export type Pose = 'apresenta' | 'aprova' | 'consola';

export const ANFITRIOES: Record<NomeAnfitriao, { nome: string; cargo: string; src: string; pitch: number; rate: number }> = {
  marcio: { nome: 'Diretor Márcio', cargo: 'Direção', src: '/assets/diretor_marcio_hd.png', pitch: 0.85, rate: 1.0 },
  leia: { nome: 'Orientadora Edileia', cargo: 'Orientação Educacional', src: '/assets/orientadora_leia.png', pitch: 1.1, rate: 0.98 },
  vania: { nome: 'Coordenadora Vânia', cargo: 'Coordenação', src: '/assets/coordenadora_vania.png', pitch: 1.05, rate: 1.05 },
  rosana: { nome: 'Professora Rosana', cargo: 'Professora', src: '/assets/rosana.png', pitch: 1.15, rate: 1.0 },
  mane: { nome: 'Mané Zoeira', cargo: 'Colega', src: '/assets/mane_zoeira.png', pitch: 1.35, rate: 1.15 },
  ze: { nome: 'Zé Cartinha', cargo: 'Distração', src: '/assets/ze_cartinha.png', pitch: 1.4, rate: 1.1 },
};

// Fala em voz: português e depois inglês, sem música por cima (regra do projeto). Devolve função para parar.
export function falarBalao(texto: string, traducao: string | undefined, voz: { pitch: number; rate: number }, onFim?: () => void, personagem?: NomeAnfitriao): () => void {
  // Com personagem: fala gravada dele (mesma voz o jogo inteiro); sem arquivo, voz do navegador.
  if (personagem) return narrar(trechosDaFala(personagem, texto, traducao), () => onFim?.());
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onFim?.(); return () => undefined; }
  const synth = window.speechSynthesis;
  synth.cancel();
  audioService.duckVolume(true);
  let terminou = false;
  const fim = () => { if (terminou) return; terminou = true; audioService.duckVolume(false); onFim?.(); };
  const vozes = synth.getVoices();
  const escolher = (lang: string) => vozes.find(v => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) ?? vozes.find(v => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  const pt = new SpeechSynthesisUtterance(texto);
  pt.lang = 'pt-BR'; pt.pitch = voz.pitch; pt.rate = voz.rate;
  const vpt = escolher('pt-BR'); if (vpt) pt.voice = vpt;
  if (traducao) {
    const en = new SpeechSynthesisUtterance(traducao);
    en.lang = 'en-US'; en.pitch = voz.pitch; en.rate = Math.min(voz.rate, 1.0);
    const ven = escolher('en-US'); if (ven) en.voice = ven;
    en.onend = fim; en.onerror = fim;
    pt.onend = () => synth.speak(en); pt.onerror = () => synth.speak(en);
  } else {
    pt.onend = fim; pt.onerror = fim;
  }
  synth.speak(pt);
  return () => { synth.cancel(); fim(); };
}

interface BalaoProps {
  texto: string;
  traducao?: string;
  lado?: 'esq' | 'dir';
  className?: string;
  voz?: { pitch: number; rate: number };
  falar?: boolean; // fala sozinho ao aparecer (se o som estiver ligado)
  personagem?: NomeAnfitriao; // quem fala: usa a voz gravada desse personagem
}

export const BalaoFala: React.FC<BalaoProps> = ({ texto, traducao, lado = 'esq', className = '', voz = { pitch: 1, rate: 1 }, falar = true, personagem }) => {
  const [falando, setFalando] = useState(false);
  const parar = useRef<() => void>(() => undefined);
  const tocar = () => {
    parar.current();
    setFalando(true);
    parar.current = falarBalao(texto, traducao, voz, () => setFalando(false), personagem);
  };
  useEffect(() => {
    if (falar && audioService.isSoundOn()) tocar();
    return () => parar.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, traducao]);
  return (
    <div className={`kit-balao kit-balao--${lado} animate-balao-in max-w-xs ${className}`} role="note">
      <div className="flex items-start gap-2">
        <div className="min-w-0">
          <p className="text-base short:text-sm leading-snug">{texto}</p>
          {traducao && <p className="mt-1 text-sm short:text-xs text-nisia-tinta-suave font-medium leading-snug">{traducao}</p>}
        </div>
        <button
          type="button"
          onClick={tocar}
          title="Ouvir de novo"
          aria-label="Ouvir a fala de novo"
          className={`shrink-0 w-8 h-8 rounded-full border-2 border-nisia-tinta flex items-center justify-center ${falando ? 'bg-nisia-sol-400 animate-pulse' : 'bg-nisia-papel hover:bg-nisia-sol-100'}`}
        >
          <Icone nome="som" className="w-4 h-4" cor={falando ? '#0C2A66' : '#FFD23F'} />
        </button>
      </div>
    </div>
  );
};

interface AnfitriaoProps {
  nome: NomeAnfitriao;
  pose?: Pose;
  fala?: string;
  traducao?: string;
  lado?: 'esq' | 'dir'; // em que lado da tela o personagem fica
  altura?: string; // classe Tailwind da altura da imagem
  className?: string;
  falar?: boolean;
}

export const Anfitriao: React.FC<AnfitriaoProps> = ({ nome, fala, traducao, lado = 'esq', altura = 'h-56 short:h-36', className = '', falar = true }) => {
  const a = ANFITRIOES[nome];
  return (
    <figure className={`relative flex flex-col ${lado === 'esq' ? 'items-start' : 'items-end'} gap-2 ${className}`}>
      {fala && <BalaoFala texto={fala} traducao={traducao} lado={lado} className="mb-3" voz={{ pitch: a.pitch, rate: a.rate }} falar={falar} personagem={nome} />}
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
