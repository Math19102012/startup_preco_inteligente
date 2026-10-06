import { useEffect } from 'react';
import { Navegacao } from './components/Navegacao.jsx';
import { useSecaoAtiva } from './hooks/useSecaoAtiva.js';
import { Empresa } from './secoes/Empresa.jsx';
import { Inicio } from './secoes/Inicio.jsx';
import { Investimento } from './secoes/Investimento.jsx';
import { Mercadinho } from './secoes/Mercadinho.jsx';
import { Mercado } from './secoes/Mercado.jsx';
import { Plano } from './secoes/Plano.jsx';
import { Problema } from './secoes/Problema.jsx';
import { Produto } from './secoes/Produto.jsx';
import { Solucao } from './secoes/Solucao.jsx';

const SECOES = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'problema', rotulo: 'O problema' },
  { id: 'solucao', rotulo: 'A solução' },
  { id: 'produto', rotulo: 'O produto' },
  { id: 'empresa', rotulo: 'A empresa' },
  { id: 'mercado', rotulo: 'Mercado' },
  { id: 'mercadinho', rotulo: 'Lucro do mercadinho' },
  { id: 'investimento', rotulo: 'Investimento' },
  { id: 'plano', rotulo: 'Plano de ação' },
];
const IDS = SECOES.map((s) => s.id);

export default function App() {
  const ativa = useSecaoAtiva(IDS);

  // Teclas 1 a 9 levam direto para cada seção (útil na apresentação para a banca).
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      const i = Number(e.key) - 1;
      if (Number.isInteger(i) && i >= 0 && i < IDS.length) {
        document.getElementById(IDS[i])?.scrollIntoView({ behavior: 'smooth' });
        try {
          history.replaceState(null, '', `#${IDS[i]}`);
        } catch {
          // alguns visualizadores não deixam mudar o endereço; a rolagem já basta
        }
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="app">
      <Navegacao secoes={SECOES} ativa={ativa} />
      <main className="conteudo">
        <Inicio />
        <Problema />
        <Solucao />
        <Produto />
        <Empresa />
        <Mercado />
        <Mercadinho />
        <Investimento />
        <Plano />
      </main>
    </div>
  );
}
