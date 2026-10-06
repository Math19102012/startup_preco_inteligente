// Importação do XML da NF-e de compra: atualiza o custo dos itens e cadastra os produtos novos.
import { useRef, useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { pct, reais } from '../../lib/formato.js';
import { Aviso, Cabecalho, CampoReais, dataCurta, dataHora } from '../componentes/base.jsx';
import { itensNotaExemplo, REFERENCIA } from '../dados/catalogo.js';
import { useLoja } from '../estado/loja.jsx';
import { gerarNotaExemplo, lerNotaFiscal } from '../lib/nfe.js';
import { arredondarPreco, precoMinimo } from '../lib/precificacao.js';
import { faixaDaRegiao } from '../lib/regiao.js';
import { formatarCnpj } from '../lib/validacao.js';

// "ARROZ TIPO 1 5 KG" → "Arroz Tipo 1 5 Kg"
const legivel = (s) => s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

export function NotaFiscal() {
  const { estado, despachar } = useLoja();
  const [nota, setNota] = useState(null);
  const [decisoes, setDecisoes] = useState([]);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const arquivo = useRef(null);

  function preparar(xml) {
    setErro(null);
    setResultado(null);
    let lida;
    try {
      lida = lerNotaFiscal(xml);
    } catch (e) {
      setErro(e.message);
      setNota(null);
      return;
    }
    const jaImportada = lida.chave && estado.notas.some((n) => n.chave === lida.chave);
    setNota({ ...lida, jaImportada });
    setDecisoes(
      lida.itens.map((it) => {
        const existente = it.ean ? estado.produtos.find((p) => p.ean === it.ean) : null;
        if (existente) {
          return { item: it.item, acao: 'atualizar', produtoId: existente.id, custo: it.custoUnitario, custoAtual: existente.custo, nome: existente.nome };
        }
        const ref = it.ean ? REFERENCIA.find((r) => r.ean === it.ean) : null;
        const base = { ean: it.ean, nome: ref?.nome ?? legivel(it.descricao), categoria: ref?.categoria ?? 'Mercearia', custo: it.custoUnitario, vendasMes: 20 };
        const faixa = faixaDaRegiao(base, estado.loja);
        const minimo = precoMinimo(it.custoUnitario, estado.config, estado.config.margemMinima);
        // preço inicial: a mediana da região, se cobrir a margem mínima; senão, o mínimo com margem
        const preco = arredondarPreco(Math.max(minimo, faixa ? faixa.mediana : minimo * 1.1), estado.config.finais, 'cima');
        return { item: it.item, acao: 'criar', produto: { ...base, preco } };
      }),
    );
  }

  async function lerArquivo(f) {
    if (!f) return;
    if (!/xml/i.test(f.type) && !f.name.toLowerCase().endsWith('.xml')) {
      setErro('Envie o arquivo .xml da nota (o PDF do DANFE não traz os dados estruturados).');
      return;
    }
    preparar(await f.text());
  }

  const xmlExemplo = () => gerarNotaExemplo(itensNotaExemplo(), { numero: String(48000 + estado.notas.length * 7 + 213) });

  function baixarExemplo() {
    const url = URL.createObjectURL(new Blob([xmlExemplo()], { type: 'application/xml' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'nfe-exemplo-preco-inteligente.xml' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function confirmar() {
    despachar({ tipo: 'aplicar-nota', nota, decisoes: decisoes.filter((d) => d.acao !== 'ignorar') });
    const atualizados = decisoes.filter((d) => d.acao === 'atualizar').length;
    const criados = decisoes.filter((d) => d.acao === 'criar').length;
    const subiram = decisoes.filter((d) => d.acao === 'atualizar' && d.custo > d.custoAtual + 0.005);
    setResultado({ atualizados, criados, subiram });
    setNota(null);
  }

  const muda = (item, dados) => setDecisoes((ds) => ds.map((d) => (d.item === item ? { ...d, ...dados } : d)));

  return (
    <>
      <Cabecalho titulo="Nota fiscal de compra">
        Envie o XML da NF-e que o fornecedor manda por e-mail. O painel lê o custo de cada item (com frete, desconto, IPI e ST),
        atualiza o catálogo e refaz o diagnóstico. A leitura acontece no seu navegador: o arquivo não sai do computador.
      </Cabecalho>

      {resultado && (
        <Aviso tipo="ok">
          Nota importada: {resultado.atualizados} custos atualizados e {resultado.criados} produtos novos.
          {resultado.subiram.length > 0 && (
            <>
              {' '}
              O custo subiu em {resultado.subiram.map((d) => d.nome).join(', ')}.
            </>
          )}{' '}
          <a href="#/precos">Ver o diagnóstico atualizado</a>
        </Aviso>
      )}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      {!nota && (
        <div
          className={arrastando ? 'p-soltar p-soltar--ativo' : 'p-soltar'}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            lerArquivo(e.dataTransfer.files?.[0]);
          }}
        >
          <Icone nome="documento" tamanho={40} />
          <strong>Arraste o XML da nota para cá</strong>
          <span className="p-nota">ou</span>
          <div className="p-acoes p-acoes--centro">
            <button type="button" className="p-botao p-botao--escuro" onClick={() => arquivo.current?.click()}>
              <Icone nome="enviar" tamanho={18} />
              Escolher arquivo
            </button>
            <button type="button" className="p-botao p-botao--tag" onClick={() => preparar(xmlExemplo())}>
              Usar uma nota de exemplo
            </button>
          </div>
          <button type="button" className="p-link" onClick={baixarExemplo}>
            <Icone nome="baixar" tamanho={16} /> Baixar o XML de exemplo
          </button>
          <input
            ref={arquivo}
            type="file"
            accept=".xml,application/xml,text/xml"
            hidden
            onChange={(e) => {
              lerArquivo(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {nota && (
        <section className="p-cartao p-cartao--tabela">
          <header className="p-nota-topo">
            <div>
              <h2>{nota.fornecedor.nome}</h2>
              <span className="p-nota">
                NF-e nº {nota.numero}, série {nota.serie} · emitida em {nota.emissao ? dataCurta(nota.emissao) : '—'}
                {nota.fornecedor.cnpj && ` · CNPJ ${formatarCnpj(nota.fornecedor.cnpj)}`}
              </span>
            </div>
            <strong className="num">{reais(nota.valorTotal)}</strong>
          </header>
          {nota.jaImportada && (
            <div className="p-nota-topo__aviso">
              <Aviso tipo="erro">Esta nota já foi importada antes. Importar de novo só regrava os mesmos custos.</Aviso>
            </div>
          )}
          <div className="p-rolagem">
            <table className="p-tabela">
              <thead>
                <tr>
                  <th>Item da nota</th>
                  <th className="n">Quantidade</th>
                  <th className="n">Custo/unidade</th>
                  <th>O que fazer</th>
                  <th className="n">Preço de venda</th>
                </tr>
              </thead>
              <tbody>
                {nota.itens.map((it) => {
                  const d = decisoes.find((x) => x.item === it.item);
                  const variacao = d.acao === 'atualizar' && d.custoAtual ? d.custo / d.custoAtual - 1 : null;
                  return (
                    <tr key={it.item}>
                      <td className="p-tabela__produto">
                        {d.acao === 'atualizar' ? d.nome : d.produto?.nome ?? legivel(it.descricao)}
                        <small>
                          {it.descricao} · {it.ean ?? 'sem código de barras'}
                        </small>
                      </td>
                      <td className="n num">
                        {it.quantidade} {it.unidade}
                      </td>
                      <td className="n num">
                        {reais(it.custoUnitario)}
                        {variacao !== null && Math.abs(variacao) > 0.0005 && (
                          <small className={variacao > 0 ? 'p-negativo' : 'p-ganho'}>
                            {variacao > 0 ? '+' : ''}
                            {pct(variacao)} vs. {reais(d.custoAtual)}
                          </small>
                        )}
                      </td>
                      <td>
                        <select
                          aria-label={`O que fazer com ${it.descricao}`}
                          value={d.acao}
                          onChange={(e) => muda(it.item, { acao: e.target.value })}
                        >
                          {d.produtoId ? <option value="atualizar">Atualizar custo</option> : <option value="criar">Cadastrar produto novo</option>}
                          <option value="ignorar">Ignorar este item</option>
                        </select>
                      </td>
                      <td className="n">
                        {d.produto && d.acao === 'criar' ? (
                          <CampoReais
                            id={`preco-${it.item}`}
                            aria-label={`Preço de venda de ${d.produto.nome}`}
                            valor={d.produto.preco}
                            onChange={(v) => muda(it.item, { produto: { ...d.produto, preco: v } })}
                          />
                        ) : (
                          <span className="p-nota">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="p-acoes p-nota-rodape">
            <button type="button" className="p-botao p-botao--contorno" onClick={() => setNota(null)}>
              Cancelar
            </button>
            <button type="button" className="p-botao p-botao--tag" onClick={confirmar}>
              <Icone nome="check" tamanho={18} />
              Atualizar catálogo
            </button>
          </footer>
        </section>
      )}

      {estado.notas.length > 0 && (
        <section className="p-cartao p-cartao--tabela">
          <header className="p-cartao__topo p-cartao__topo--tabela">
            <h2>Notas importadas</h2>
          </header>
          <div className="p-rolagem">
            <table className="p-tabela">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Nota</th>
                  <th className="n">Valor</th>
                  <th className="n">Custos atualizados</th>
                  <th className="n">Produtos novos</th>
                  <th>Importada em</th>
                </tr>
              </thead>
              <tbody>
                {estado.notas.map((n) => (
                  <tr key={n.id}>
                    <td>{n.fornecedor}</td>
                    <td className="num">nº {n.numero}</td>
                    <td className="n num">{reais(n.valorTotal)}</td>
                    <td className="n num">{n.atualizados}</td>
                    <td className="n num">{n.criados}</td>
                    <td className="num">{dataHora(n.importadaEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
