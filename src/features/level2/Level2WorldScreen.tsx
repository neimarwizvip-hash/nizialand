import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export const Level2WorldScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activityResults } = useGame();
  const completed = Object.keys(activityResults).filter(id => id.startsWith('n2_') && activityResults[id]?.completed).length;
  const [activityId, setActivityId] = useState<string | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'NISIALAND_LEVEL2_STATION') {
        setActivityId(String(event.data.activityId));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!activityId) return;
    navigate(`/nivel2/patio?atividade=${encodeURIComponent(activityId)}`);
    setActivityId(null);
  }, [activityId, navigate]);

  return (
    <div className="fixed inset-0 bg-sky-300">
      <iframe
        title="Pátio 3D do Nível 2"
        key={completed}
        src={`/prototipos/primeiro-pavimento-3d.html?completed=${completed}`}
        className="h-full w-full border-0"
      />
      <div className="fixed left-3 top-3 z-10 flex gap-2">
        <button type="button" onClick={() => navigate('/nivel2')} className="rounded-xl border-2 border-sky-300 bg-white/95 px-3 py-2 font-black text-blue-900 shadow-lg">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Missão
        </button>
        <button type="button" onClick={() => navigate('/nivel2/patio')} className="rounded-xl border-2 border-amber-600 bg-amber-400 px-3 py-2 font-black text-slate-950 shadow-lg">
          <BookOpen className="mr-1 inline h-4 w-4" /> Atividades de inglês
        </button>
      </div>
    </div>
  );
};
export default Level2WorldScreen;
