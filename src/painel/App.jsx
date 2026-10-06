import { useEffect } from 'react';
import { Icone, Marca } from '../components/Icone.jsx';
import { PLANOS } from '../data/premissas.js';
import { reaisCompacto } from '../lib/formato.js';
import { useRota } from './componentes/base.jsx';
import { useLoja } from './estado/loja.jsx';
import { Diagnostico } from './telas/Diagnostico.jsx';
import { Entrada } from './telas/Entrada.jsx';
import { Etiquetas } from './telas/Etiquetas.jsx';
import { Integracoes } from './telas/Integracoes.jsx';
import { MinhaLoja } from './telas/MinhaLoja.jsx';
import { NotaFiscal } from './telas/NotaFiscal.jsx';
import { Produtos } from './telas/Produtos.jsx';
import { VisaoGeral } from './telas/VisaoGeral.jsx';

const TELAS = [
  { id: 'inicio', rotulo: 'Visão geral', icone: 'casa', Componente: VisaoGeral },
  { id: 'precos', rotulo: 'Preços da semana', icone: 'alvo', Componente: Diagnostico },
  { id: 'produtos', rotulo: 'Produtos', icone: 'caixa', Componente: Produtos },
  { id: 'nota', rotulo: 'Nota fiscal', icone: 'documento', Componente: NotaFiscal },
  { id: 'etiquetas', rotulo: 'Etiquetas', icone: 'etiqueta', Componente: Etiquetas },
  { id: 'integracoes', rotulo: 'Integrações', icone: 'plugue', Componente: Integracoes },
  { id: 'loja', rotulo: 'Minha loja', icone: 'ajuste', Componente: MinhaLoja },
];

export function App() {
  const { estado, despachar, resumo } = useLoja();
  const rota = useRota();

  // ?demo=1 (link da apresentação) abre direto a loja de demonstração
  useEffect(() => {
    const busca = new URLSearchParams(window.location.search);
    if (busca.has('demo') && !estado.loja) despachar({ tipo: 'entrar-demonstracao' });
  }, [estado.loja, despachar]);

  if (!estado.loja) return <Entrada />;

  const tela = TELAS.find((t) => t.id === rota.tela) ?? TELAS[0];
  const { Componente } = tela;
  const plano = PLANOS.find((p) => p.id === estado.loja.plano) ?? PLANOS[1];
  const pendentes = estado.produtos.filter((p) => p.etiquetaPendente).length;
  const contadores = { precos: resumo.ajustes, etiquetas: pendentes };

  return (
    <div className="p-app">
      <a className="p-pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <aside className="p-lateral">
        <div className="p-lateral__topo">
          <a className="p-marca" href="#/inicio">
            <Marca tamanho={28} />
            <span>
              Preço Inteligente
              <small>Painel do lojista</small>
            </span>
          </a>
        </div>
        <nav aria-label="Telas do painel">
          <ul className="p-menu">
            {TELAS.map((t) => (
              <li key={t.id}>
                <a href={`#/${t.id}`} aria-current={t.id === tela.id ? 'page' : undefined}>
                  <Icone nome={t.icone} tamanho={19} />
                  <span>{t.rotulo}</span>
                  {contadores[t.id] > 0 && <b className="p-menu__contador">{contadores[t.id]}</b>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-lateral__loja">
          <Icone nome="loja" tamanho={20} />
          <div>
            <strong>{estado.loja.nome}</strong>
            <span>
              {[estado.loja.bairro, estado.loja.cidade].filter(Boolean).join(', ')}
            </span>
            <span className="p-lateral__plano">
              Plano {plano.nome} · {plano.preco ? `${reaisCompacto(plano.preco)}/mês` : 'grátis'}
            </span>
          </div>
        </div>
      </aside>

      <div className="p-principal">
        {estado.loja.demonstracao && (
          <div className="p-faixa-demo">
            <span>
              <b>Loja de demonstração.</b> Mexa à vontade: os dados ficam só neste navegador.
            </span>
            <button type="button" onClick={() => despachar({ tipo: 'sair' })}>
              Cadastrar minha loja
            </button>
          </div>
        )}
        <main id="conteudo" className="p-conteudo" tabIndex={-1}>
          <Componente parametros={rota.parametros} />
        </main>
        <footer className="p-rodape">
          <span>
            Preço Inteligente · protótipo acadêmico. Preço da região simulado, exceto o botijão de gás (dados reais da ANP).
          </span>
          <a href="../index.html">Conhecer a empresa</a>
        </footer>
      </div>
    </div>
  );
}
