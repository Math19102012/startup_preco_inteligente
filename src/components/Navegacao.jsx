import { useEffect, useRef } from 'react';
import { RODADA } from '../data/premissas.js';
import { pct, reaisCompacto } from '../lib/formato.js';
import { Marca } from './Icone.jsx';

export function Navegacao({ secoes, ativa }) {
  const lista = useRef(null);

  // No celular o menu é uma faixa que rola para o lado: mantém o item ativo visível.
  useEffect(() => {
    const ul = lista.current;
    const item = ul?.querySelector('[aria-current="true"]');
    if (!ul || !item || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: item.offsetLeft - (ul.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' });
  }, [ativa]);

  return (
    <nav className="menu" aria-label="Seções do site">
      <div className="menu__topo">
        <a className="marca" href="#inicio">
          <Marca />
          Preço Inteligente
        </a>
      </div>
      <ol className="menu__lista" ref={lista}>
        {secoes.map((s, i) => (
          <li key={s.id}>
            <a className="menu__link" href={`#${s.id}`} aria-current={ativa === s.id ? 'true' : undefined}>
              <span className="menu__n">{String(i + 1).padStart(2, '0')}</span>
              {s.rotulo}
            </a>
          </li>
        ))}
      </ol>
      <p className="menu__atalho">
        Apresentando? Use as teclas <kbd>1</kbd> a <kbd>{secoes.length}</kbd> para pular entre as seções.
      </p>
      <a className="menu__painel" href="./painel/index.html?demo=1" target="_blank" rel="noreferrer">
        <span>
          <small>Produto no ar</small>
          Abrir o painel do lojista
        </span>
        <span aria-hidden="true">↗</span>
      </a>
      <a className="menu__rodada" href="#investimento">
        <small>Rodada aberta</small>
        <strong>
          {reaisCompacto(RODADA.valorCaptado)} por {pct(RODADA.participacao, 0)}
        </strong>
        <span>Simular o retorno →</span>
      </a>
    </nav>
  );
}
