import React from 'react';
import { PhaseMissionScreen } from './PhaseMissionScreen';
import { LEVEL8 } from '../../content/level8';
import { LEVEL8_CONTENT } from '../../data/level8Content';

// Pacote do Nível 8: baixado só quando o aluno entra no nível (carregamento por fase).
const Nivel8Screen: React.FC = () => <PhaseMissionScreen level={LEVEL8} content={LEVEL8_CONTENT} accent="teal" />;
export default Nivel8Screen;
