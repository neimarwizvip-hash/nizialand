import React from 'react';
import { PhaseMissionScreen } from './PhaseMissionScreen';
import { LEVEL6 } from '../../content/level6';
import { LEVEL6_CONTENT } from '../../data/level6Content';

// Pacote do Nível 6: baixado só quando o aluno entra no nível (carregamento por fase).
const Nivel6Screen: React.FC = () => <PhaseMissionScreen level={LEVEL6} content={LEVEL6_CONTENT} accent="rose" />;
export default Nivel6Screen;
