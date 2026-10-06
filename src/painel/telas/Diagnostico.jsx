// Preços da semana: cada item comparado com a região e com o custo real, com sugestão pronta.
import { useEffect, useMemo, useState } from 'react';
import { Etiqueta } from '../../components/Etiqueta.jsx';
import { Icone } from '../../components/Icone.jsx';
import { pct, reais, reais0 } from '../../lib/formato.js';
import { Aviso, Cabecalho, FaixaRegiao, irPara, Janela, SeloStatus } from '../componentes/base.jsx';
import { useLoja } from '../estado/loja.jsx';
import { custoReal, STATUS } from '../lib/precificacao.js';

const FILTROS = [
  { id: 'acao', rotulo: 'Precisam de ajuste' },
  { id: 'prejuizo', rotulo: STATUS.prejuizo.curto },
  { id: 'abaixo', rotulo: STATUS.abaixo.curto },
  { id: 'acima', rotulo: STATUS.acima.curto },
  { id: 'faixa', rotulo: STATUS.faixa.curto },
  { id: 'todos', rotulo: 'Todos' },
];

const passa = (filtro, l) =>
  filtro === 'todos' || (filtro === 'acao' ? l.diagnostico.sugestao !== null : l.diagnostico.status === filtro);

// Barra do preço de venda: compra, perdas, imposto, cartão e o que sobra. Se o custo passa
// do preço, o traço laranja (preço) fica dentro da barra e mostra o tamanho do prejuízo.
function BarraCusto({ partes, preco }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const escala = Math.max(total, preco);
  return (
    <div className="p-custo">
      <div className="p-custo__barra">
        {partes.map((p) => (
          <span key={p.rotulo} className={`p-custo__parte p-custo__parte--${p.id}`} style={{ width: `${(p.valor / escala) * 100}%` }} title={`${p.rotulo}: ${reais(p.valor)}`} />
        ))}
        <span className="p-custo__preco" style={{ left: `${(preco / escala) * 100}%` }} aria-hidden="true" />
      </div>
      <ul className="p-custo__legenda">
        {partes.map((p) => (
          <li key={p.rotulo}>
            <i className={`p-custo__parte--${p.id}`} />
            {p.rotulo}
            <b className="num">{reais(p.valor)}</b>
          </li>
        ))}
        <li>
          <i className="p-custo__marca" />
          Preço de venda
          <b className="num">{reais(preco)}</b>
        </li>
      </ul>
    </div>
  );
}

function Detalhe({ linha, config, onAplicar }) {
  const { produto, faixa, diagnostico: d } = linha;
  const precoAlvo = d.sugestao ?? produto.preco;
  const c = custoReal(produto.custo, precoAlvo, config);
  const partes = [
    { id: 'compra', rotulo: 'Compra', valor: c.compra },
    { id: 'perdas', rotulo: 'Perdas', valor: c.perdas },
    { id: 'imposto', rotulo: 'Imposto', valor: c.impostos },
    { id: 'cartao', rotulo: 'Cartão', valor: c.cartao },
    ...(c.lucro > 0 ? [{ id: 'lucro', rotulo: 'Sobra para a loja', valor: c.lucro }] : []),
  ];
  return (
    <div className="p-detalhe">
      <div className="p-detalhe__topo">
        <SeloStatus status={d.status} />
        <p>{d.justificativa}</p>
      </div>

      <div className="p-detalhe__precos">
        <div>
          <small>Hoje</small>
          <Etiqueta valor={produto.preco} mini />
          <span className="p-nota">margem {d.margemAtual !== null ? pct(d.margemAtual) : '—'}</span>
        </div>
        {d.sugestao !== null && (
          <>
            <Icone nome="seta" tamanho={24} />
            <div>
              <small>Sugestão</small>
              <Etiqueta valor={d.sugestao} mini />
              <span className="p-nota">margem {d.margemNova !== null ? pct(d.margemNova) : '—'}</span>
            </div>
          </>
        )}
      </div>

      <h3>Preço da região</h3>
      {faixa ? (
        <>
          <FaixaRegiao faixa={faixa} preco={produto.preco} sugestao={d.sugestao} status={d.status} largura={360} />
          <dl className="p-numeros">
            <div>
              <dt>Mais barato</dt>
              <dd className="num">{reais(faixa.min)}</dd>
            </div>
            <div>
              <dt>Mediana</dt>
              <dd className="num">{reais(faixa.mediana)}</dd>
            </div>
            <div>
              <dt>Mais caro</dt>
              <dd className="num">{reais(faixa.max)}</dd>
            </div>
            <div>
              <dt>Lojas comparadas</dt>
              <dd className="num">{faixa.amostras}</dd>
            </div>
          </dl>
          <p className="p-nota">Fonte: {faixa.fonte}.</p>
        </>
      ) : (
        <p className="p-nota">Ainda não há coleta deste item na sua região.</p>
      )}

      <h3>Custo real de uma unidade{d.sugestao !== null ? ' no preço sugerido' : ''}</h3>
      <BarraCusto partes={partes} preco={precoAlvo} />
      <dl className="p-numeros">
        <div>
          <dt>Sem prejuízo a partir de</dt>
          <dd className="num">{reais(d.precoSemPrejuizo)}</dd>
        </div>
        <div>
          <dt>Com sua margem mínima ({pct(config.margemMinima, 0)})</dt>
          <dd className="num">{reais(d.precoComMargem)}</dd>
        </div>
        <div>
          <dt>Vendas por mês</dt>
          <dd className="num">{produto.vendasMes}</dd>
        </div>
      </dl>

      {d.sugestao !== null && (
        <button type="button" className="p-botao p-botao--tag p-botao--grande" onClick={() => onAplicar([linha])}>
          Aplicar {reais(d.sugestao)}
          {d.impactoMes > 0 && <span className="p-botao__extra">+{reais0(d.impactoMes)}/mês</span>}
        </button>
      )}
    </div>
  );
}

export function Diagnostico({ parametros }) {
  const { estado, despachar, linhas, resumo } = useLoja();
  const [filtro, setFiltro] = useState(parametros.get('filtro') ?? 'acao');
  const [busca, setBusca] = useState('');
  const [marcados, setMarcados] = useState(() => new Set());
  const [aviso, setAviso] = useState(null);
  const itemAberto = parametros.get('item');

  useEffect(() => {
    if (parametros.get('filtro')) setFiltro(parametros.get('filtro'));
  }, [parametros]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas
      .filter((l) => passa(filtro, l))
      .filter((l) => !termo || l.produto.nome.toLowerCase().includes(termo) || l.produto.ean?.includes(termo))
      .sort(
        (a, b) =>
          STATUS[a.diagnostico.status].ordem - STATUS[b.diagnostico.status].ordem ||
          b.diagnostico.impactoMes - a.diagnostico.impactoMes,
      );
  }, [linhas, filtro, busca]);

  const comSugestao = visiveis.filter((l) => l.diagnostico.sugestao !== null);
  const selecionadas = linhas.filter((l) => marcados.has(l.produto.id) && l.diagnostico.sugestao !== null);
  const ganhoSelecionado = selecionadas.reduce((s, l) => s + Math.max(0, l.diagnostico.impactoMes), 0);
  const aberta = linhas.find((l) => l.produto.id === itemAberto);

  function aplicar(lista) {
    despachar({ tipo: 'aplicar-precos', itens: lista.map((l) => ({ id: l.produto.id, para: l.diagnostico.sugestao })) });
    const ganho = lista.reduce((s, l) => s + Math.max(0, l.diagnostico.impactoMes), 0);
    setAviso(
      `${lista.length} ${lista.length === 1 ? 'preço atualizado' : 'preços atualizados'}${ganho > 0 ? `: +${reais0(ganho)} por mês` : ''}. As etiquetas novas já estão na fila de impressão.`,
    );
    setMarcados(new Set());
    if (itemAberto) irPara('precos', { filtro });
  }

  const alternar = (id) =>
    setMarcados((m) => {
      const n = new Set(m);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const todosMarcados = comSugestao.length > 0 && comSugestao.every((l) => marcados.has(l.produto.id));

  const contagem = (id) =>
    id === 'todos' ? linhas.length : id === 'acao' ? resumo.ajustes : (resumo.contagem[id] ?? 0);

  return (
    <>
      <Cabecalho
        titulo="Preços da semana"
        acoes={
          comSugestao.length > 0 && (
            <button type="button" className="p-botao p-botao--tag" onClick={() => aplicar(comSugestao)}>
              <Icone nome="check" tamanho={18} />
              Aplicar as {comSugestao.length} sugestões
            </button>
          )
        }
      >
        Cada produto comparado com a região e com o custo real. As sugestões já vêm em número de etiqueta.
      </Cabecalho>

      {aviso && (
        <Aviso tipo="ok">
          {aviso} <a href="#/etiquetas">Imprimir agora</a>
        </Aviso>
      )}

      <div className="p-filtros">
        <div className="p-chips" role="group" aria-label="Filtrar por situação">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.rotulo}
              <span className="num">{contagem(f.id)}</span>
            </button>
          ))}
        </div>
        <label className="p-busca">
          <Icone nome="busca" tamanho={18} />
          <span className="sr-only">Buscar produto</span>
          <input type="search" placeholder="Buscar produto ou código" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
      </div>

      <div className="p-cartao p-cartao--tabela">
        <div className="p-rolagem">
          <table className="p-tabela">
            <thead>
              <tr>
                <th className="p-tabela__marca">
                  <input
                    type="checkbox"
                    aria-label="Marcar todos com sugestão"
                    checked={todosMarcados}
                    disabled={comSugestao.length === 0}
                    onChange={() => setMarcados(todosMarcados ? new Set() : new Set(comSugestao.map((l) => l.produto.id)))}
                  />
                </th>
                <th>Produto</th>
                <th className="n">Seu preço</th>
                <th>Região</th>
                <th>Situação</th>
                <th>Sugestão</th>
                <th className="n">Efeito/mês</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => {
                const d = l.diagnostico;
                return (
                  <tr key={l.produto.id} className={marcados.has(l.produto.id) ? 'p-tabela__marcada' : undefined}>
                    <td className="p-tabela__marca">
                      {d.sugestao !== null && (
                        <input
                          type="checkbox"
                          aria-label={`Marcar ${l.produto.nome}`}
                          checked={marcados.has(l.produto.id)}
                          onChange={() => alternar(l.produto.id)}
                        />
                      )}
                    </td>
                    <td className="p-tabela__produto">
                      <button type="button" className="p-link" onClick={() => irPara('precos', { filtro, item: l.produto.id })}>
                        {l.produto.nome}
                      </button>
                      <small>{d.justificativa}</small>
                    </td>
                    <td className="n num">{reais(l.produto.preco)}</td>
                    <td>
                      <FaixaRegiao faixa={l.faixa} preco={l.produto.preco} status={d.status} />
                      {l.faixa && (
                        <span className="p-nota p-micro num">
                          {reais(l.faixa.min)} a {reais(l.faixa.max)}
                          {l.faixa.real && <b className="p-selo-anp">ANP</b>}
                        </span>
                      )}
                    </td>
                    <td>
                      <SeloStatus status={d.status} curto />
                    </td>
                    <td>{d.sugestao !== null ? <Etiqueta valor={d.sugestao} mini /> : <span className="p-nota">Manter</span>}</td>
                    <td className="n num">
                      {d.impactoMes > 0 ? (
                        <strong className="p-ganho">+{reais0(d.impactoMes)}</strong>
                      ) : d.status === 'acima' ? (
                        <span className="p-nota">recupera cliente</span>
                      ) : (
                        <span className="p-nota">—</span>
                      )}
                    </td>
                    <td className="n">
                      {d.sugestao !== null && (
                        <button type="button" className="p-botao p-botao--pequeno" onClick={() => aplicar([l])}>
                          Aplicar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-vazio">
                    {linhas.length === 0 ? (
                      <>
                        Nenhum produto ainda. <a href="#/nota">Importe uma nota fiscal</a> ou <a href="#/produtos">cadastre um produto</a>.
                      </>
                    ) : (
                      'Nenhum item nesta situação.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selecionadas.length > 0 && (
        <div className="p-barra-acao" role="region" aria-label="Itens marcados">
          <span>
            <b>{selecionadas.length}</b> {selecionadas.length === 1 ? 'item marcado' : 'itens marcados'}
            {ganhoSelecionado > 0 && <> · +{reais0(ganhoSelecionado)}/mês</>}
          </span>
          <button type="button" className="p-botao p-botao--tag" onClick={() => aplicar(selecionadas)}>
            Aplicar marcados
          </button>
        </div>
      )}

      <Janela aberta={Boolean(aberta)} titulo={aberta?.produto.nome} onFechar={() => irPara('precos', { filtro })}>
        {aberta && <Detalhe linha={aberta} config={estado.config} onAplicar={aplicar} />}
      </Janela>
    </>
  );
}
