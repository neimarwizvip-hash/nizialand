// Área do professor: Teste do 8º ano (comparativos). Soma os acessos de cada aluno (melhor resultado de cada dia)
// e mostra quem da lista de chamada ainda não fez nenhum acesso.
import React, { useMemo } from 'react';
import type { PlayerProfile } from '../../types';
import { alunoNaLista, somarTeste8, TESTE8_ALUNOS, TESTE8_FIM, TESTE8_INICIO, type LinhaTeste8 } from '../../data/teste8';

const quando = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
};

export const PainelTeste8: React.FC<{ players: PlayerProfile[]; resultados: Array<Record<string, unknown>>; semConexao: boolean }> = ({ players, resultados, semConexao }) => {
  const somas = useMemo(() => somarTeste8(resultados), [resultados]);
  const porId = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  const linhas = useMemo(() => {
    const ls: Array<LinhaTeste8 & { nome: string; turma: string; codigo: string; chamada: string }> = [];
    somas.forEach(l => {
      const p = porId.get(l.alunoId);
      const nome = p?.name || p?.displayName || l.alunoId;
      ls.push({ ...l, nome, turma: p?.className ?? '', codigo: p?.playerCode ?? '', chamada: TESTE8_ALUNOS.find(item => alunoNaLista(nome, [item])) ?? '' });
    });
    return ls.sort((a, b) => b.pontos - a.pontos);
  }, [somas, porId]);

  const semAcesso = useMemo(() => TESTE8_ALUNOS.filter(item => !linhas.some(l => l.chamada === item)), [linhas]);
  const dias = useMemo(() => [...new Set(linhas.flatMap(l => Object.keys(l.dias)))].sort(), [linhas]);

  const baixarCsv = () => {
    const cab = ['Aluno', 'Nome na chamada', 'Turma', 'Código', 'Acessos', 'Pontos acumulados', 'Melhor fase', ...dias, 'Último acesso'];
    const corpo = linhas.map(l => [l.nome, l.chamada, l.turma, l.codigo, l.acessos, l.pontos, l.melhorFase, ...dias.map(d => l.dias[d] ?? ''), quando(l.ultimo)]);
    const csv = [cab, ...corpo, ...semAcesso.map(n => ['', n, '805', '', 0, 0, 0, ...dias.map(() => ''), 'sem acesso'])]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'teste8-comparativos.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
        📝 <strong>Teste do 8º ano: Comparatives</strong> (igualdade, superioridade e inferioridade). De {quando(TESTE8_INICIO)} até {quando(TESTE8_FIM)}.
        Cada aluno tem 1 acesso por dia de 15 minutos; vale o melhor resultado de cada dia e os dias somam. Link para os alunos: <code className="text-blue-300">nizialand.pages.dev/teste8</code>
        {semConexao && <p className="mt-2 text-amber-300">Sem conexão com a planilha: os números podem estar desatualizados.</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-300">{linhas.length} alunos com acesso · {semAcesso.length} da chamada sem acesso</span>
        <button type="button" onClick={baixarCsv} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold">Baixar planilha (CSV)</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm text-slate-200">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[11px]">
            <tr>
              <th className="px-3 py-2">#</th><th className="px-3 py-2">Aluno</th><th className="px-3 py-2">Turma</th>
              <th className="px-3 py-2 text-right">Acessos</th><th className="px-3 py-2 text-right">Pontos</th><th className="px-3 py-2 text-right">Melhor fase</th>
              {dias.map(d => <th key={d} className="px-3 py-2 text-right whitespace-nowrap">{d.slice(8, 10)}/{d.slice(5, 7)}</th>)}
              <th className="px-3 py-2">Último</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && <tr><td colSpan={7 + dias.length} className="px-3 py-4 text-slate-400">Nenhum acesso ainda.</td></tr>}
            {linhas.map((l, i) => (
              <tr key={l.alunoId} className="border-t border-slate-800">
                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                <td className="px-3 py-2"><div className="font-semibold">{l.nome}</div>{!l.chamada && <div className="text-[11px] text-amber-300">não achado na chamada</div>}</td>
                <td className="px-3 py-2">{l.turma}</td>
                <td className="px-3 py-2 text-right">{l.acessos}</td>
                <td className="px-3 py-2 text-right font-bold text-white">{l.pontos}</td>
                <td className="px-3 py-2 text-right">{l.melhorFase}</td>
                {dias.map(d => <td key={d} className="px-3 py-2 text-right">{l.dias[d] ?? '–'}</td>)}
                <td className="px-3 py-2 whitespace-nowrap">{quando(l.ultimo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {semAcesso.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs uppercase font-bold text-slate-400 mb-2">Da chamada da 805, ainda sem acesso</p>
          <p className="text-sm text-slate-300 leading-relaxed">{semAcesso.map(n => n.replace('…', '')).join(' · ')}</p>
        </div>
      )}
    </div>
  );
};
