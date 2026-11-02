import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Espaco3D } from '../tres/Espaco3D';
import { ESPACOS, type NomeEspaco } from '../tres/espacos';

// Só no `npm run dev`: mostra um espaço 3D em tela cheia (/vistoria/espaco/sala?camera=fundo&q=alta).
export const EspacoVistoria: React.FC = () => {
  const { nome = 'sala' } = useParams();
  const [p] = useSearchParams();
  if (!(nome in ESPACOS)) return <p className="p-6 text-white">Espaço desconhecido.</p>;
  const q = p.get('q') === 'economica' ? 'economica' : p.get('q') === 'alta' ? 'alta' : undefined;
  return (
    <div className="fixed inset-0 bg-black">
      <Espaco3D nome={nome as NomeEspaco} camera={p.get('camera') ?? 'fundo'} qualidade={q} contraste={p.get('contraste') === '1'} respirar={p.get('parado') !== '1'} semPos={p.get('pos') === '0'} />
    </div>
  );
};
export default EspacoVistoria;
