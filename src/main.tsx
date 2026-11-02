import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registrarGuardaNoAparelho } from './services/pacotes';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Carregamento por fase: cada nível fica guardado no aparelho depois da primeira visita.
registrarGuardaNoAparelho();
