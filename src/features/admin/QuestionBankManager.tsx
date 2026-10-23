import React, { useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Download, Upload, BookOpen } from 'lucide-react';
import {
  BankQuestion,
  BUILT_IN_QUESTIONS,
  GRADES,
  GradeId,
  getCustomQuestions,
  isValidQuestion,
  saveCustomQuestions,
  topicsForGrade,
} from '../../data/questionBank';

const emptyForm = { prompt: '', promptPt: '', correct: '', wrong1: '', wrong2: '', wrong3: '', explanation: '' };

// Aba do Painel do Professor para cadastrar questões do Treino livre sem mexer no código.
export const QuestionBankManager: React.FC<{ onLog?: (action: string, details: string) => void }> = ({ onLog }) => {
  const [custom, setCustom] = useState<BankQuestion[]>(() => getCustomQuestions());
  const [grade, setGrade] = useState<GradeId>('8');
  const [topic, setTopic] = useState<string>(topicsForGrade('8')[0].id);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const topics = topicsForGrade(grade);
  const visible = useMemo(
    () => [...custom, ...BUILT_IN_QUESTIONS].filter((x) => x.topic === topic),
    [custom, topic]
  );

  const persist = (list: BankQuestion[]) => {
    setCustom(list);
    saveCustomQuestions(list);
  };

  const changeGrade = (g: GradeId) => {
    setGrade(g);
    setTopic(topicsForGrade(g)[0].id);
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const options = [form.correct, form.wrong1, form.wrong2, form.wrong3].map((o) => o.trim()).filter(Boolean);
    if (!form.prompt.trim() || !form.correct.trim() || options.length < 2) {
      setMessage({ text: 'Preencha a pergunta, a resposta certa e pelo menos uma alternativa errada.', ok: false });
      return;
    }
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
      setMessage({ text: 'As alternativas precisam ser diferentes entre si.', ok: false });
      return;
    }
    const question: BankQuestion = {
      id: `custom-${Date.now()}`,
      grade,
      topic,
      prompt: form.prompt.trim(),
      promptPt: form.promptPt.trim() || undefined,
      options,
      explanation: form.explanation.trim() || `Resposta correta: ${options[0]}.`,
      custom: true,
    };
    persist([question, ...custom]);
    setForm(emptyForm);
    setMessage({ text: 'Questão cadastrada! Ela já aparece no Treino livre neste aparelho.', ok: true });
    onLog?.('QUESTÃO CADASTRADA', `${grade}º/${topic}: ${question.prompt}`);
  };

  const removeQuestion = (id: string) => {
    if (!window.confirm('Apagar esta questão?')) return;
    persist(custom.filter((x) => x.id !== id));
    onLog?.('QUESTÃO REMOVIDA', id);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(custom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nisialand-questoes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const list = (Array.isArray(parsed) ? parsed : []).filter(isValidQuestion) as BankQuestion[];
      const known = new Set(custom.map((x) => x.id));
      const fresh = list.filter((x) => !known.has(x.id)).map((x) => ({ ...x, custom: true }));
      persist([...fresh, ...custom]);
      setMessage({ text: `${fresh.length} questão(ões) importada(s).`, ok: true });
      onLog?.('QUESTÕES IMPORTADAS', `${fresh.length} do arquivo ${file.name}`);
    } catch {
      setMessage({ text: 'Não consegui ler esse arquivo. Use um .json exportado por este painel.', ok: false });
    }
  };

  const input = 'w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400';

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bungee text-sm text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> Banco de Questões do Treino livre
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {BUILT_IN_QUESTIONS.length} questões do jogo + {custom.length} cadastradas por você. As suas ficam salvas neste navegador:
            exporte o arquivo para levar a outro computador.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportJson} disabled={custom.length === 0} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-40">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {GRADES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => changeGrade(g.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${grade === g.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTopic(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${topic === t.id ? 'border-amber-400 text-amber-300 bg-amber-400/10' : 'border-slate-700 text-slate-400 hover:text-white'}`}
          >
            {t.emoji} {t.titlePt}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={addQuestion} className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-2">
          <h4 className="font-bold text-white text-sm mb-1">Nova questão</h4>
          <input className={input} placeholder="Pergunta em inglês (use ___ para lacuna)" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
          <input className={input} placeholder="Tradução ou instrução em português (opcional)" value={form.promptPt} onChange={(e) => setForm({ ...form, promptPt: e.target.value })} />
          <input className={`${input} border-emerald-600`} placeholder="✔ Resposta certa" value={form.correct} onChange={(e) => setForm({ ...form, correct: e.target.value })} />
          <input className={input} placeholder="✘ Alternativa errada 1" value={form.wrong1} onChange={(e) => setForm({ ...form, wrong1: e.target.value })} />
          <input className={input} placeholder="✘ Alternativa errada 2 (opcional)" value={form.wrong2} onChange={(e) => setForm({ ...form, wrong2: e.target.value })} />
          <input className={input} placeholder="✘ Alternativa errada 3 (opcional)" value={form.wrong3} onChange={(e) => setForm({ ...form, wrong3: e.target.value })} />
          <textarea className={input} rows={2} placeholder="Explicação mostrada depois da resposta (opcional)" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          {message && <p className={`text-xs font-bold ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>}
          <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Cadastrar questão
          </button>
          <p className="text-[11px] text-slate-500">O jogo embaralha as alternativas, então a certa não fica sempre na mesma letra.</p>
        </form>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
          <h4 className="font-bold text-white text-sm mb-2">{visible.length} questões neste tópico</h4>
          <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1 text-xs">
            {visible.map((x) => (
              <li key={x.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-slate-200 font-semibold">{x.prompt}</div>
                  <div className="text-emerald-400">✔ {x.options[0]}</div>
                  <div className="text-slate-500">✘ {x.options.slice(1).join(' · ')}</div>
                </div>
                {x.custom ? (
                  <button type="button" onClick={() => removeQuestion(x.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10" title="Apagar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">DO JOGO</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
