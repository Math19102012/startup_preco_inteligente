// Catálogo da loja: cadastro pelo código de barras (Open Food Facts), edição de custo, preço e vendas.
import { useMemo, useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { PLANOS } from '../../data/premissas.js';
import { numero, pct, reais } from '../../lib/formato.js';
import { Aviso, Cabecalho, Campo, CampoReais, Janela, SeloStatus } from '../componentes/base.jsx';
import { useLoja } from '../estado/loja.jsx';
import { diagnosticar } from '../lib/precificacao.js';
import { faixaDaRegiao } from '../lib/regiao.js';
import { eanInterno, eanValido, soDigitos } from '../lib/validacao.js';
import { buscarProdutoPorEan } from '../servicos/apis.js';

const CATEGORIAS = ['Mercearia', 'Bebidas', 'Laticínios', 'Frios', 'Padaria', 'Hortifrúti', 'Limpeza', 'Higiene', 'Gás', 'Outros'];
const NOVO = { ean: '', nome: '', categoria: 'Mercearia', custo: 0, preco: 0, vendasMes: 30, imagem: null };

function Formulario({ inicial, onSalvar, onRemover }) {
  const { estado } = useLoja();
  const [p, setP] = useState(inicial);
  const [busca, setBusca] = useState({ estado: 'parado' });
  const editando = Boolean(inicial.id);
  const muda = (campo, valor) => setP((x) => ({ ...x, [campo]: valor }));

  async function consultarEan() {
    setBusca({ estado: 'buscando' });
    try {
      const r = await buscarProdutoPorEan(p.ean);
      setP((x) => ({ ...x, nome: r.nome, categoria: r.categoria, imagem: r.imagem, marca: r.marca }));
      setBusca({ estado: 'ok', texto: `Encontrado no Open Food Facts em ${r.ms} ms.` });
    } catch (e) {
      setBusca({ estado: 'erro', texto: e.message });
    }
  }

  const ean = soDigitos(p.ean);
  const podeBuscar = eanValido(ean) && !eanInterno(ean);
  const faixa = faixaDaRegiao(p, estado.loja);
  const previa = p.custo > 0 && p.preco > 0 ? diagnosticar(p, faixa, estado.config) : null;
  const valido = p.nome.trim() && p.preco > 0;

  return (
    <form
      className="p-grade-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valido) onSalvar({ ...p, ean: ean || null, nome: p.nome.trim() });
      }}
    >
      <Campo
        id="ean"
        rotulo="Código de barras"
        ajuda={!editando ? 'Digite ou leia com o leitor e clique em Buscar. Teste com 7894900011517.' : undefined}
        erro={ean && !eanValido(ean) ? 'Código inválido: confira o último número.' : undefined}
      >
        <div className="p-linha">
          <input id="ean" inputMode="numeric" value={p.ean ?? ''} onChange={(e) => muda('ean', soDigitos(e.target.value).slice(0, 14))} />
          <button type="button" className="p-botao p-botao--escuro" disabled={!podeBuscar || busca.estado === 'buscando'} onClick={consultarEan}>
            {busca.estado === 'buscando' ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </Campo>
      <div className="p-produto-previa">
        {p.imagem ? <img src={p.imagem} alt="" width="64" height="64" /> : <span aria-hidden="true"><Icone nome="caixa" tamanho={28} /></span>}
      </div>
      {busca.texto && (
        <div className="p-grade-form__inteiro">
          <Aviso tipo={busca.estado === 'ok' ? 'ok' : 'erro'}>{busca.texto}</Aviso>
        </div>
      )}
      <div className="p-grade-form__inteiro">
        <Campo id="nome" rotulo="Nome do produto">
          <input id="nome" value={p.nome} onChange={(e) => muda('nome', e.target.value)} required />
        </Campo>
      </div>
      <Campo id="categoria" rotulo="Categoria">
        <select id="categoria" value={p.categoria} onChange={(e) => muda('categoria', e.target.value)}>
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Campo>
      <Campo id="vendas" rotulo="Vendas por mês" ajuda="Unidades. Vem do caixa quando integrado.">
        <input id="vendas" type="number" min="0" inputMode="numeric" value={p.vendasMes} onChange={(e) => muda('vendasMes', Math.max(0, Number(e.target.value)))} />
      </Campo>
      <Campo id="custo" rotulo="Custo de compra (unidade)">
        <CampoReais id="custo" valor={p.custo} onChange={(v) => muda('custo', v)} />
      </Campo>
      <Campo id="preco" rotulo="Preço na gôndola">
        <CampoReais id="preco" valor={p.preco} onChange={(v) => muda('preco', v)} required />
      </Campo>

      {previa && (
        <div className="p-grade-form__inteiro p-previa">
          <SeloStatus status={previa.status} />
          <span>
            Margem real {pct(previa.margemAtual)} · sem prejuízo a partir de {reais(previa.precoSemPrejuizo)}
            {faixa && ` · região de ${reais(faixa.min)} a ${reais(faixa.max)}`}
          </span>
          {previa.sugestao !== null && (
            <button type="button" className="p-link" onClick={() => muda('preco', previa.sugestao)}>
              Usar sugestão {reais(previa.sugestao)}
            </button>
          )}
        </div>
      )}

      <div className="p-grade-form__inteiro p-acoes">
        {editando && (
          <button type="button" className="p-botao p-botao--perigo" onClick={onRemover}>
            <Icone nome="lixeira" tamanho={17} />
            Remover
          </button>
        )}
        <button type="submit" className="p-botao p-botao--tag" disabled={!valido}>
          {editando ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
      </div>
    </form>
  );
}

export function Produtos() {
  const { estado, despachar, linhas } = useLoja();
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const plano = PLANOS.find((p) => p.id === estado.loja.plano) ?? PLANOS[1];
  const limite = Number(soDigitos(plano.limite));

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return linhas
      .filter((l) => !t || l.produto.nome.toLowerCase().includes(t) || l.produto.ean?.includes(t) || l.produto.categoria?.toLowerCase().includes(t))
      .sort((a, b) => a.produto.nome.localeCompare(b.produto.nome, 'pt-BR'));
  }, [linhas, busca]);

  return (
    <>
      <Cabecalho
        titulo="Produtos"
        acoes={
          <button type="button" className="p-botao p-botao--tag" onClick={() => setEditando(NOVO)}>
            <Icone nome="mais" tamanho={18} />
            Adicionar produto
          </button>
        }
      >
        {numero(estado.produtos.length)} de {numero(limite)} itens do plano {plano.nome}. Custos atualizados pela nota fiscal; vendas por mês vêm do
        caixa quando ele estiver integrado.
      </Cabecalho>

      {estado.produtos.length > limite && (
        <Aviso tipo="erro">
          Seu catálogo passou do limite do plano {plano.nome}. Os itens excedentes não entram no diagnóstico na versão final.{' '}
          <a href="#/loja">Ver planos</a>
        </Aviso>
      )}

      <div className="p-filtros">
        <label className="p-busca">
          <Icone nome="busca" tamanho={18} />
          <span className="sr-only">Buscar produto</span>
          <input type="search" placeholder="Buscar por nome, código ou categoria" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
      </div>

      <div className="p-cartao p-cartao--tabela">
        <div className="p-rolagem">
          <table className="p-tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código</th>
                <th className="n">Custo</th>
                <th className="n">Preço</th>
                <th className="n">Margem real</th>
                <th className="n">Vendas/mês</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(({ produto: p, diagnostico: d }) => (
                <tr key={p.id}>
                  <td className="p-tabela__produto">
                    <span className="p-produto-nome">
                      {p.imagem && <img src={p.imagem} alt="" width="32" height="32" loading="lazy" />}
                      <span>
                        {p.nome}
                        <small>
                          {p.categoria}
                          {p.origem === 'nota' && ' · veio da nota fiscal'}
                          {p.custoAnterior != null && p.custoAnterior !== p.custo && (
                            <> · custo {p.custo > p.custoAnterior ? 'subiu' : 'caiu'} de {reais(p.custoAnterior)}</>
                          )}
                        </small>
                      </span>
                    </span>
                  </td>
                  <td className="num p-micro">{p.ean ?? '—'}</td>
                  <td className="n num">{p.custo ? reais(p.custo) : '—'}</td>
                  <td className="n num">{reais(p.preco)}</td>
                  <td className={`n num${d.margemAtual !== null && d.margemAtual < 0 ? ' p-negativo' : ''}`}>
                    {d.margemAtual !== null ? pct(d.margemAtual) : '—'}
                  </td>
                  <td className="n num">{p.vendasMes}</td>
                  <td>
                    <SeloStatus status={d.status} curto />
                  </td>
                  <td className="n">
                    <button type="button" className="p-icone-botao" aria-label={`Editar ${p.nome}`} onClick={() => setEditando(p)}>
                      <Icone nome="lapis" tamanho={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-vazio">
                    {estado.produtos.length === 0 ? 'Nenhum produto ainda. Adicione pelo código de barras ou importe uma nota fiscal.' : 'Nada encontrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Janela aberta={Boolean(editando)} titulo={editando?.id ? 'Editar produto' : 'Adicionar produto'} onFechar={() => setEditando(null)}>
        {editando && (
          <Formulario
            key={editando.id ?? 'novo'}
            inicial={editando}
            onSalvar={(produto) => {
              despachar({ tipo: 'salvar-produto', produto: { origem: 'manual', ...produto } });
              setEditando(null);
            }}
            onRemover={() => {
              despachar({ tipo: 'remover-produto', id: editando.id });
              setEditando(null);
            }}
          />
        )}
      </Janela>
    </>
  );
}
