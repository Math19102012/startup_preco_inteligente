import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/figtree';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '../tokens.css';
import '../components/etiqueta.css';
import './painel.css';
import { App } from './App.jsx';
import { ProvedorLoja } from './estado/loja.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProvedorLoja>
      <App />
    </ProvedorLoja>
  </StrictMode>,
);
