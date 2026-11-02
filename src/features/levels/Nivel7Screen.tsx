import React from 'react';
import { PhaseMissionScreen } from './PhaseMissionScreen';
import { LEVEL7 } from '../../content/level7';
import { LEVEL7_CONTENT } from '../../data/level7Content';

// Pacote do Nível 7: baixado só quando o aluno entra no nível (carregamento por fase).
const Nivel7Screen: React.FC = () => <PhaseMissionScreen level={LEVEL7} content={LEVEL7_CONTENT} accent="sky" />;
export default Nivel7Screen;
